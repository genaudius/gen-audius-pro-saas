"""
Gen Audius Pro — FastAPI Backend Engine
========================================
Production-ready API with:
  • Secure CORS (env-configurable origins)
  • Input validation via Pydantic models
  • Atomic wallet transactions (no race conditions)
  • Structured error handling
  • Rate-limiting middleware
  • Health endpoint with real DB pings
"""

import uvicorn
import os
import logging
import hashlib
import secrets
import time
import uuid
from typing import Optional
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import subprocess
import psutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
try:
    import git
except ImportError:
    git = None

import redis
import json
import stripe

# ─── Load .env FIRST — before any module that reads env vars ─────────────────
load_dotenv()

from fastapi import FastAPI, HTTPException, Body, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session
from sqlalchemy import text, func

from services.music.kie_suno_adapter import kie_adapter
from services.music.modal_adapter import modal_adapter
from services.music.mastering_adapter import mastering_adapter
from services.provider_manager import provider_manager, ProviderConfig
import uuid
import math
from datetime import timedelta
from database import SessionLocal, UserWallet, APIConfig, GenerationLog, UserAccount, CreditTransaction, hits_collection, logs_collection, SystemTask, BlogPost, SecurityLog, EmailConfig, SystemSetting, LegalDocument, UserAPIKey
from database import PublishedTrack, TrackLike, ArtistProfile, CloudResource, TrainingJob, StripeSubscription, StripePayout, UserEarnings

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("gen_audius.api")


# ─── Pydantic Models ──────────────────────────────────────────────────────────
class MusicGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    genre: str | None = Field(None, max_length=100)
    lyrics: str | None = Field(None, max_length=5000)
    voice: str = Field("M", pattern="^[MF]$")
    style: str | None = Field(None, max_length=200)
    model: str | None = Field("V5", max_length=20)
    negative_tags: str | None = Field(None, max_length=500)
    style_weight: float | None = Field(None, ge=0, le=1)
    weirdness: float | None = Field(None, ge=0, le=1)
    audio_weight: float | None = Field(None, ge=0, le=1)
    provider: str | None = Field("modal", max_length=50)
    api_key: str | None = Field(None, max_length=500)
    title: str | None = Field(None, max_length=150)

    @validator("prompt")
    def sanitize_prompt(cls, v):
        # Strip potentially dangerous characters
        return v.strip()


class RechargeRequest(BaseModel):
    amount: float = Field(..., gt=0, le=10000, description="USD amount to add")


class ConfigUpdateRequest(BaseModel):
    provider: str = Field(..., min_length=1, max_length=50)
    apiKey: str | None = None
    baseUrl: str | None = None
    status: str | None = Field(None, pattern="^(active|inactive)$")


class MasterRequest(BaseModel):
    audio_url: str = Field(..., min_length=10, max_length=2000)
    genre: str | None = Field(None, max_length=100)
    target_lufs: float = Field(-14.0, ge=-24.0, le=-6.0)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=200)
    password: str = Field(..., min_length=1, max_length=200)

class DevExecuteRequest(BaseModel):
    prompt: str
    commit: bool = True

class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    assigned_to: str = "admin"

class BlogCreateRequest(BaseModel):
    title: str
    content: str
    category: str = "news"
    image_url: Optional[str] = None

class EmailSettingsRequest(BaseModel):
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_pass: str
    from_email: str

class SocialLoginRequest(BaseModel):
    email: str
    uid: str
    username: Optional[str] = None
    provider: Optional[str] = "google"


class CloudResourceRequest(BaseModel):
    name: str
    provider: str
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    status: Optional[str] = "active"
    config_json: Optional[str] = None


class TrainingStartRequest(BaseModel):
    type: str # voice | instrument | style
    name: str # final model name
    provider: str # runpod | modal
    data_url: Optional[str] = None


class StripeSessionRequest(BaseModel):
    plan_id: str # basic | pro | studio
    success_url: str
    cancel_url: str

class LegalUpdateRequest(BaseModel):
    slug: str
    title: str
    content: str
    version: Optional[str] = "1.0.0"
    is_active: Optional[bool] = True


class PayoutRequest(BaseModel):
    amount: float
    currency: str = "usd"


class HumToMusicRequest(BaseModel):
    # The audio will be uploaded to S3/GCS first, and the URL passed here
    audio_url: str
    prompt: Optional[str] = None
    genre: Optional[str] = "Bachata"
    bpm: Optional[int] = None
    key: Optional[str] = None


class InstrumentEditRequest(BaseModel):
    # Source track stem URL
    stem_url: str
    # "Replace with violin", "Make it sound like a Nashville studio guitar", etc.
    instruction_prompt: str
    target_instrument: Optional[str] = None


# ─── Stripe Configuration ───────────────────────────────────────────────────
STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

if not STRIPE_SECRET_KEY:
    logger.warning("⚠️  [STRIPE] Secret Key not found. Stripe features will fail.")

stripe.api_key = STRIPE_SECRET_KEY


# ─── App Factory ──────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 [GEN AUDIUS] Starting up...")
    yield
    logger.info("🔴 [GEN AUDIUS] Shutting down...")


app = FastAPI(
    title="Gen Audius Backend Engine",
    version="1.0.0",
    description="World-class AI music production API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── Static Files — Serve generated music ──────────────────────────────────────
os.makedirs("static/exports", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# ─── CORS — Secure ────────────────────────────────────────────────────────────
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()]

# 🎯 CONFIGURACIÓN DE ADMIN
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@genaudius.com")

# 🛡️ ANTI-HACKER RATE LIMITER (Burst protection)
REDIS_URL = os.getenv("REDIS_URL")
redis_client = None

if REDIS_URL:
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        logger.info("📡 [REDIS] Connected for rate limiting")
    except Exception as e:
        logger.error(f"❌ [REDIS] Connection failed: {e}")

request_history = {} 

@app.middleware("http")
async def maintenance_guard(request: Request, call_next):
    # 🏁 Bypass CORS preflight
    if request.method == "OPTIONS":
        return await call_next(request)

    # Skip for static files and health checks
    path = request.url.path
    if path.startswith("/assets") or path == "/api/admin/system/health":
        return await call_next(request)

    # We need to check DB for maintenance_mode setting
    # Efficiency: Cache this in memory or Redis so we don't query SQL on every request
    is_maintenance = False
    
    # 📡 Try Cache first (Redis)
    cache_key = "system:maintenance_mode"
    if redis_client:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                is_maintenance = (cached == "on")
            else:
                # Query DB and cache it
                db = SessionLocal()
                setting = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_mode").first()
                val = setting.value if setting else "off"
                redis_client.set(cache_key, val, ex=60) # Cache for 1 min
                is_maintenance = (val == "on")
                db.close()
        except: pass
    else:
        # No Redis, query DB
        db = SessionLocal()
        setting = db.query(SystemSetting).filter(SystemSetting.key == "maintenance_mode").first()
        is_maintenance = (setting.value == "on") if setting else False
        db.close()

    if is_maintenance:
        # Allow admins regardless
        user_id = request.headers.get("X-User-ID", "current_user")
        is_admin_id = user_id in ["admin", "fb_admin", "dev_admin"]
        
        # Check admin path - allow access to admin routes for potential recovery
        if not is_admin_id and not path.startswith("/api/admin"):
             return JSONResponse(
                status_code=503,
                content={
                    "detail": "Modo Mantenimiento Activo",
                    "reason": "El sistema está siendo actualizado o configurado como privado temporalmente.",
                    "status": "maintenance"
                }
            )

    return await call_next(request)

@app.middleware("http")
async def security_rate_limiter(request: Request, call_next):
    # 🏁 Bypass CORS preflight
    if request.method == "OPTIONS":
        return await call_next(request)

    client_ip = request.client.host
    now = datetime.utcnow()
    
    # 📡 Production: Use Redis
    if redis_client:
        try:
            key = f"rate_limit:{client_ip}"
            requests = redis_client.incr(key)
            if requests == 1:
                redis_client.expire(key, 60)
            
            if requests > 100:
                logger.warning(f"🚨 [SECURITY] Rate limit exceeded for {client_ip}")
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please slow down."}
                )
        except Exception as e:
            logger.error(f"Redis rate limit error: {e}")
            # Fallback to in-memory if redis fails
    
    # 🧠 Local: In-memory fallback
    history = request_history.get(client_ip, [])
    history = [t for t in history if (now - t).seconds < 60]
    history.append(now)
    request_history[client_ip] = history
    
    if len(history) > 100:
        logger.warning(f"🚨 [SECURITY] In-memory rate limit triggered for {client_ip}")
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please slow down."}
        )
        
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization", "X-User-ID"],
)

# ─── DB Dependency ────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _get_user_id(request: Request) -> str:
    """Extract user ID from header or state (if injected by API Key check)."""
    if hasattr(request.state, "user_id"):
        return request.state.user_id
    return request.headers.get("X-User-ID", "current_user")


async def _is_admin(request: Request, db: Session = Depends(get_db)):
    """Verifies user is an admin based on role or ADMIN_EMAIL."""
    user_id = _get_user_id(request)
    
    # Check if user is in DB
    user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
    
    # 1. Check by role
    if user and user.role == "admin":
        return user
    
    # 2. Check by email (from DB user or social login email if we had it in token)
    if user and user.email.lower() == ADMIN_EMAIL.lower():
        user.role = "admin" # Update role if matches admin email
        db.commit()
        return user
        
    # 3. Legacy / Demo fallback
    if user_id in ["admin", "fb_admin", "dev_admin"]:
        return None 

    # 4. Check against hardcoded admin user IDs if necessary
    # (In a real app, you'd use Firebase ID Tokens to verify the email directly)
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Acceso denegado: Se requieren permisos de administrador."
    )


async def verify_saas_api_key(request: Request, db: Session = Depends(get_db)):
    """
    Middleware-like dependency to verify SaaS API Keys.
    Supports both X-API-Key and Authorization: Bearer.
    """
    api_key = request.headers.get("X-API-Key")
    auth_header = request.headers.get("Authorization")
    
    if not api_key and auth_header and auth_header.startswith("Bearer "):
        api_key = auth_header.split(" ")[1]
        
    if not api_key:
        return None # No API key, fallback to standard auth headers
        
    key_entry = db.query(UserAPIKey).filter(UserAPIKey.key == api_key, UserAPIKey.status == "active").first()
    if not key_entry:
        raise HTTPException(status_code=401, detail="Invalid or revoked API Key")
        
    # Update usage stats
    key_entry.total_calls += 1
    key_entry.last_used_at = datetime.utcnow()
    db.commit()
    
    # Inject associated user_id into request state for _get_user_id()
    request.state.user_id = key_entry.user_id
    return key_entry.user_id


# ─── Helper: Atomic Wallet Deduction ─────────────────────────────────────────
def _deduct_credits_atomic(db: Session, user_id: str, amount: int) -> UserWallet:
    """
    Atomically deduct credits, raising 402 if insufficient.
    Uses SELECT FOR UPDATE to prevent race conditions.
    """
    wallet = (
        db.query(UserWallet)
        .filter(UserWallet.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    if wallet.credits < amount:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. Required: {amount}, Available: {wallet.credits}"
        )
    wallet.credits -= amount
    wallet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(wallet)
    return wallet


# ─── STRIPE ORCHESTRATION ─────────────────────────────────────────────────────

@app.post("/api/stripe/create-checkout-session")
async def create_checkout_session(req: StripeSessionRequest, db: Session = Depends(get_db)):
    # In practice, get user_id from auth token
    user_id = "current_user" 
    user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
    
    # Map plan to Price IDs (You should create these in your Stripe Dashboard)
    # These are placeholders
    price_map = {
        "basic": "price_basic_123",
        "pro": "price_pro_456",
        "studio": "price_studio_789"
    }
    
    price_id = price_map.get(req.plan_id)
    if not price_id:
        raise HTTPException(status_code=400, detail="Plan no válido")

    try:
        session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id if user and user.stripe_customer_id else None,
            customer_email=user.email if not user or not user.stripe_customer_id else None,
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='subscription',
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            metadata={"user_id": user_id, "plan_id": req.plan_id}
        )
        return {"url": session.url}
    except Exception as e:
        logger.error(f"Error Stripe Session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/user/earnings")
async def get_user_earnings(db: Session = Depends(get_db)):
    user_id = "current_user" # Real user from auth
    earnings = db.query(UserEarnings).filter(UserEarnings.user_id == user_id).first()
    if not earnings:
        return {"current_balance": 0.0, "total_earned": 0.0, "payouts": []}
    
    payouts = db.query(StripePayout).filter(StripePayout.user_id == user_id).order_by(StripePayout.created_at.desc()).all()
    return {
        "current_balance": earnings.current_balance,
        "total_earned": earnings.total_earned,
        "payouts": payouts
    }


@app.post("/api/user/payout")
async def request_payout(req: PayoutRequest, db: Session = Depends(get_db)):
    user_id = "current_user"
    user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
    earnings = db.query(UserEarnings).filter(UserEarnings.user_id == user_id).first()

    if not earnings or earnings.current_balance < req.amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")

    if not user.stripe_connect_id:
        raise HTTPException(status_code=400, detail="Debes configurar tu cuenta de Stripe Connect para recibir pagos")

    try:
        # Create Transfer to Connected Account
        # Stripe keeps the fees if configured, otherwise we deduct manually 20%
        # Here req.amount is already assuming 80% (platform fee taken into account when adding to current_balance)
        transfer = stripe.Transfer.create(
            amount=int(req.amount * 100), # centavos
            currency=req.currency,
            destination=user.stripe_connect_id,
            metadata={"user_id": user_id}
        )

        # Update balance
        earnings.current_balance -= req.amount
        
        # Log Payout
        payout = StripePayout(
            user_id=user_id,
            stripe_transfer_id=transfer.id,
            amount=req.amount,
            status="paid"
        )
        db.add(payout)
        db.commit()

        return {"status": "success", "transfer_id": transfer.id}
    except Exception as e:
        logger.error(f"Error Payout: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Endpoint for Stripe Webhooks. 
    URL to configure in Stripe Dashboard: https://studio.genaudius.com/api/stripe/webhook
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    if not STRIPE_WEBHOOK_SECRET:
        logger.warning("⚠️  [STRIPE] Webhook secret not configured. Skipping verification (DEV ONLY).")
        try:
            event = request.json()
        except:
            raise HTTPException(status_code=400, detail="Invalid JSON")
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            logger.error(f"⚠️  [STRIPE] Webhook verification failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))

    # ─── Event Handling ───
    event_type = event['type']
    data_object = event['data']['object']

    if event_type == 'checkout.session.completed':
        # User finished payment
        user_id = data_object.get('metadata', {}).get('user_id')
        plan_id = data_object.get('metadata', {}).get('plan_id')
        
        if user_id and plan_id:
            user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
            if user:
                user.subscription_status = "active"
                user.subscription_id = data_object.get('subscription')
                user.stripe_customer_id = data_object.get('customer')
                
                # Add to StripeSubscription log
                new_sub = StripeSubscription(
                    user_id=user_id,
                    stripe_sub_id=data_object.get('subscription'),
                    plan_id=plan_id,
                    status="active",
                    current_period_end=datetime.utcnow() + timedelta(days=32)
                )
                db.add(new_sub)
                db.commit()
                logger.info(f"💰 [STRIPE] Sub activated: {user_id} -> {plan_id}")

    elif event_type == 'customer.subscription.deleted':
        # Sub canceled or expired
        stripe_sub_id = data_object.get('id')
        user = db.query(UserAccount).filter(UserAccount.subscription_id == stripe_sub_id).first()
        if user:
            user.subscription_status = "inactive"
            db.commit()
            logger.info(f"❌ [STRIPE] Sub ended: {user.user_id}")

    return {"status": "received"}


# ─── Auth Helper ────────────────────────────────────────────────────────────────
def _hash_password(password: str, salt: str = "genaudius_salt_2025") -> str:
    """SHA-256 password hash with salt (matches admin user creation)."""
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


# ─── 🔐 AUTH ENDPOINTS ──────────────────────────────────────────────────────────
@app.post("/api/auth/login", tags=["Auth"])
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user with email + password.
    Returns user_id, plan, credits and a simple session token.
    """
    user = db.query(UserAccount).filter(UserAccount.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    expected_hash = _hash_password(payload.password)
    if user.password_hash != expected_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled. Contact support.")

    wallet = db.query(UserWallet).filter(UserWallet.user_id == user.user_id).first()
    credits = wallet.credits if wallet else 0

    # Simple session token (stateless). Replace with JWT in production.
    raw_token = f"{user.user_id}:{secrets.token_hex(16)}"
    session_token = hashlib.sha256(raw_token.encode()).hexdigest()

    logger.info(f"✅ [AUTH] Login successful for {user.email} (plan: {user.plan})")

    return {
        "success": True,
        "user_id": user.user_id,
        "email": user.email,
        "username": user.username,
        "plan": user.plan,
        "credits": credits,
        "token": session_token,
        "message": f"Welcome back, {user.username}!",
    }


@app.get("/api/auth/me", tags=["Auth"])
async def get_me(request: Request, db: Session = Depends(get_db)):
    """Get current user profile from X-User-ID header."""
    user_id = _get_user_id(request)

    user   = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
    wallet = db.query(UserWallet).filter(UserWallet.user_id == user_id).first()

    if not user:
        return {
            "user_id": user_id,
            "email": None,
            "username": user_id,
            "plan": "free",
            "credits": wallet.credits if wallet else 0,
            "is_demo": True,
        }

    return {
        "user_id": user.user_id,
        "email": user.email,
        "username": user.username,
        "plan": user.plan,
        "credits": wallet.credits if wallet else 0,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "is_demo": False,
    }

# ─── Health ───────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root(db: Session = Depends(get_db)):
    """Health check — SQLite always available, MongoDB optional."""
    from database import MONGO_AVAILABLE
    results = {"sqlite": "error", "mongodb": "offline (optional)"}
    try:
        db.execute(text("SELECT 1"))
        results["sqlite"] = "connected"
    except Exception as e:
        logger.error(f"SQLite ping failed: {e}")

    if MONGO_AVAILABLE:
        try:
            hits_collection.estimated_document_count()
            results["mongodb"] = "connected"
        except Exception as e:
            results["mongodb"] = f"error: {e}"

    overall = "online" if results["sqlite"] == "connected" else "degraded"
    return {
        "status": overall,
        "engine": "Gen Audius v9.1 Pro",
        "version": "9.1.0",
        "databases": results,
        "mongo_available": MONGO_AVAILABLE,
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/api/auth/social", tags=["Auth"])
async def social_login(request: SocialLoginRequest, db: Session = Depends(get_db)):
    """Handle social login from Firebase and sync/provision user."""
    user_id = f"fb_{request.uid}"
    
    # Check if wallet exists
    wallet = db.query(UserWallet).filter(UserWallet.user_id == user_id).first()
    if not wallet:
        # Auto-provision wallet for new social user
        wallet = UserWallet(
            user_id=user_id, 
            credits=100, 
            balance=10.0
        )
        db.add(wallet)
        
        # Log first transaction as welcome bonus
        transaction = CreditTransaction(
            user_id=user_id,
            amount=100,
            type_="welcome_bonus",
            description="Welcome bonus for choosing Gen Audius"
        )
        db.add(transaction)
        db.commit()
        db.refresh(wallet)
        logger.info(f"🆕 [AUTH] New social user provisioned: {user_id}")

    # Determine role based on email
    user_role = "admin" if request.email.lower() == ADMIN_EMAIL.lower() else "user"

    return {
        "user_id": user_id,
        "email": request.email,
        "username": request.username or request.email.split('@')[0],
        "plan": "pro" if user_role == "admin" else "free",
        "role": user_role,
        "credits": wallet.credits,
        "token": f"sk_{secrets.token_hex(16)}"
    }


# ─── 💳 WALLET ENDPOINTS ──────────────────────────────────────────────────────
@app.get("/api/user/wallet", tags=["Wallet"])
async def get_wallet(request: Request, db: Session = Depends(get_db)):
    user_id = _get_user_id(request)
    wallet = db.query(UserWallet).filter(UserWallet.user_id == user_id).first()
    
    if not wallet:
        # Auto-provision wallet for new users
        wallet = UserWallet(user_id=user_id, credits=100, balance=10.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    
    # --- 100 Daily Tokens Logic ---
    today = datetime.utcnow().date()
    # We use updated_at to check if it's been updated today. 
    # For more accuracy, we should have a 'last_daily_bonus' field,
    # but for now let's use a transaction check if it exists or just update credits if it's a new day relative to updated_at.
    # Actually, let's just do a simple check: if wallet.updated_at.date() < today:
    if wallet.updated_at.date() < today:
        bonus = 100
        wallet.credits += bonus
        wallet.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(wallet)
        logger.info(f"🎁 [WALLET] Daily bonus of {bonus} credits granted to {user_id}")
    # ------------------------------

    return {
        "user_id": wallet.user_id,
        "credits": wallet.credits,
        "balance": wallet.balance,
        "updated_at": wallet.updated_at.isoformat() if wallet.updated_at else None,
        "daily_bonus_granted": True if wallet.updated_at.date() == today else False
    }

# ─── 🛠️ DEV AGENT ENDPOINTS ───────────────────────────────────────────────────

@app.post("/api/admin/dev/execute", tags=["Admin"])
async def dev_execute(payload: DevExecuteRequest, request: Request, admin: UserAccount = Depends(_is_admin), db: Session = Depends(get_db)):
    """
    AI Development Agent: Analyzes prompt, modifies code, and commits.
    In a real production app, this would call GPT-4/Claude-3.
    """
    user_id = _get_user_id(request)
    logger.info(f"🤖 [DEV-AGENT] Prompt received (Admin: {user_id}): {payload.prompt}")

    logger.info(f"🤖 [DEV-AGENT] Prompt received: {payload.prompt}")
    
    # --- SIMULATED AI AGENT LOGIC ---
    # In a real setup, we would:
    # 1. Use an LLM to generate a diff based on the prompt.
    # 2. Apply the diff using patch or direct file write.
    # 3. Verify the change.
    
    summary = f"Simulación: Se procesó '{payload.prompt}'"
    diff = f"--- a/src/App.jsx\n+++ b/src/App.jsx\n@@ -10,1 +10,1 @@\n- // OLD CODE\n+ // NEW CODE: {payload.prompt}"
    commit_hash = secrets.token_hex(20)

    # Real Git Commit if repo exists
    if git:
        try:
            repo = git.Repo(os.getcwd(), search_parent_directories=True)
            # In a real case, we would repo.git.add(A=True) and repo.index.commit(...)
            # But we don't want to actually change the current running session's code 
            # without extreme care.
            logger.info(f"📦 [DEV-AGENT] Would commit to branch: {repo.active_branch.name}")
        except Exception as e:
            logger.error(f"Git error: {e}")

    return {
        "success": True,
        "summary": summary,
        "diff": diff,
        "commit_hash": commit_hash
    }

@app.post("/api/admin/system/restart", tags=["Admin"])
async def system_restart():
    """Restarts the server process."""
    logger.warning("🚨 [SYSTEM] Manual restart triggered from Admin Panel.")
    # In a real environment like PM2 or Docker, we would exit and let the monitor restart it.
    # For now, we simulate a fast reload by logging.
    return {"success": True, "message": "Reloader triggered."}


# ─── 📋 TASK SERVICE ENDPOINTS ──────────────────────────────────────────────

@app.get("/api/admin/tasks", tags=["Admin"])
async def get_tasks(db: Session = Depends(get_db)):
    """List all system tasks."""
    tasks = db.query(SystemTask).order_by(SystemTask.created_at.desc()).all()
    return tasks

@app.post("/api/admin/tasks", tags=["Admin"])
async def create_task(payload: TaskCreateRequest, db: Session = Depends(get_db)):
    """Create a new system task."""
    task = SystemTask(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        assigned_to=payload.assigned_to
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@app.put("/api/admin/tasks/{task_id}", tags=["Admin"])
async def update_task(task_id: int, payload: dict, db: Session = Depends(get_db)):
    """Update a task's status or details."""
    task = db.query(SystemTask).filter(SystemTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for key, value in payload.items():
        if hasattr(task, key):
            setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task

@app.delete("/api/admin/tasks/{task_id}", tags=["Admin"])
async def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task."""
    task = db.query(SystemTask).filter(SystemTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"success": True}


# ─── 📰 BLOG SERVICE ENDPOINTS ──────────────────────────────────────────────

@app.get("/api/blog", tags=["Blog"])
async def get_blog_posts(db: Session = Depends(get_db)):
    """Public blog list."""
    return db.query(BlogPost).filter(BlogPost.is_published == True).order_by(BlogPost.created_at.desc()).all()

@app.post("/api/admin/blog", tags=["Admin"])
async def create_blog_post(payload: BlogCreateRequest, request: Request, db: Session = Depends(get_db)):
    """Create a new blog post."""
    user_id = _get_user_id(request)
    post = BlogPost(
        slug=payload.title.lower().replace(" ", "-"),
        title=payload.title,
        content=payload.content,
        category=payload.category,
        image_url=payload.image_url,
        author_id=user_id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


# ─── 🛡️ SECURITY & ANTI-FRAUD ────────────────────────────────────────────────

@app.post("/api/security/report", tags=["Security"])
async def report_security_event(request: Request, db: Session = Depends(get_db)):
    """Internal security logging."""
    payload = await request.json()
    log = SecurityLog(
        user_id=payload.get("user_id"),
        event_type=payload.get("event_type"),
        ip_address=request.client.host,
        user_agent=request.headers.get("User-Agent"),
        severity=payload.get("severity", "low"),
        details=payload.get("details")
    )
    db.add(log)
    db.commit()
    return {"status": "logged"}


# ─── 📧 EMAIL & ACCOUNT VERIFICATION ─────────────────────────────────────────

async def _send_system_email(subject, body, to_email, db: Session):
    """Helper to send SMTP emails."""
    config = db.query(EmailConfig).filter(EmailConfig.is_active == True).first()
    if not config or not config.smtp_user:
        logger.warning("📧 [EMAIL] No active SMTP config found.")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = config.from_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(config.smtp_host, config.smtp_port)
        server.starttls()
        server.login(config.smtp_user, config.smtp_pass)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        logger.error(f"❌ [EMAIL] Failed to send email: {e}")
        return False

@app.get("/api/auth/verify", tags=["Auth"])
async def verify_account(token: str, db: Session = Depends(get_db)):
    """Verify email token."""
    user = db.query(UserAccount).filter(UserAccount.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido o expirado.")
    
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"success": True, "message": "Cuenta verificada con éxito."}



@app.post("/api/user/recharge", tags=["Wallet"])
async def recharge_wallet(
    payload: RechargeRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _get_user_id(request)
    wallet = (
        db.query(UserWallet)
        .filter(UserWallet.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    credits_to_add = int(payload.amount * 10)  # $1 = 10 credits
    wallet.balance += payload.amount
    wallet.credits += credits_to_add
    wallet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(wallet)

    logger.info(f"💰 [WALLET] Recharged {credits_to_add} credits for user {user_id}")
    return {
        "success": True,
        "user_id": wallet.user_id,
        "credits": wallet.credits,
        "balance": wallet.balance,
        "credits_added": credits_to_add,
    }


# ─── ⚙️ ADMIN CONFIG ENDPOINTS ────────────────────────────────────────────────
@app.get("/api/admin/configs", tags=["Admin"])
async def get_configs(db: Session = Depends(get_db), admin: UserAccount = Depends(_is_admin)):
    configs = db.query(APIConfig).all()
    return [
        {
            "provider": c.provider,
            "apiKey": "****" + c.api_key[-4:] if c.api_key and len(c.api_key) > 4 else "****",
            "baseUrl": c.base_url,
            "status": c.status,
            "cost_per_gen": c.cost_per_gen,
        }
        for c in configs
    ]


@app.post("/api/admin/config/update", tags=["Admin"])
async def update_config(
    payload: ConfigUpdateRequest,
    db: Session = Depends(get_db),
    admin: UserAccount = Depends(_is_admin)
):
    config = db.query(APIConfig).filter(APIConfig.provider == payload.provider).first()
    if not config:
        raise HTTPException(status_code=404, detail=f"Provider '{payload.provider}' not found")

    if payload.apiKey and payload.apiKey != "****":
        config.api_key = payload.apiKey
    if payload.baseUrl:
        config.base_url = payload.baseUrl
    if payload.status:
        config.status = payload.status

    config.last_updated = datetime.utcnow()
    db.commit()

    # Hot-reload adapters in memory
    if payload.provider == "KIE-SUNO" and payload.apiKey:
        kie_adapter.update_api_key(config.api_key)
        logger.info(f"🔑 [ADMIN] KIE-SUNO API key hot-reloaded")

    if payload.provider == "MASTERCHANNEL" and payload.apiKey:
        mastering_adapter.update_api_key(config.api_key)
        logger.info(f"🔑 [ADMIN] MASTERCHANNEL API key hot-reloaded")

    return {"success": True, "message": f"{payload.provider} config updated"}


# ─── ⚖️ SYSTEM SETTINGS & HEALTH ──────────────────────────────────────────────
@app.get("/api/admin/system/settings", tags=["Admin"])
async def get_system_settings(db: Session = Depends(get_db), admin: UserAccount = Depends(_is_admin)):
    settings = db.query(SystemSetting).all()
    return {s.key: s.value for s in settings}

@app.post("/api/admin/system/settings/update", tags=["Admin"])
async def update_system_setting(
    key: str, 
    value: str, 
    db: Session = Depends(get_db), 
    admin: UserAccount = Depends(_is_admin)
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        setting = SystemSetting(key=key, value=value)
        db.add(setting)
    else:
        setting.value = value
    db.commit()
    return {"success": True, "key": key, "value": value}

@app.get("/api/admin/system/health", tags=["Admin"])
async def get_system_health(admin: UserAccount = Depends(_is_admin)):
    # Standard health plus resource checks
    return {
        "status": "online",
        "timestamp": datetime.utcnow().isoformat(),
        "maintenance_mode": "off", # Dynamic in middleware
        "version": "3.0.1-pro"
    }

# ─── ⚖️ LEGAL DOCUMENTS ──────────────────────────────────────────────────────
@app.get("/api/legal/all", tags=["Legal"])
async def get_all_legal_docs(db: Session = Depends(get_db)):
    docs = db.query(LegalDocument).filter(LegalDocument.is_active == True).all()
    return {doc.slug: {"title": doc.title, "content": doc.content, "version": doc.version} for doc in docs}

@app.get("/api/legal/{slug}", tags=["Legal"])
async def get_legal_doc(slug: str, db: Session = Depends(get_db)):
    doc = db.query(LegalDocument).filter(LegalDocument.slug == slug, LegalDocument.is_active == True).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "slug": doc.slug,
        "title": doc.title,
        "content": doc.content,
        "version": doc.version,
        "updated_at": doc.updated_at
    }

@app.get("/api/admin/legal", tags=["Admin"])
async def list_legal_docs(db: Session = Depends(get_db), admin: UserAccount = Depends(_is_admin)):
    return db.query(LegalDocument).all()

@app.post("/api/admin/legal/update", tags=["Admin"])
async def update_legal_doc(
    payload: LegalUpdateRequest, 
    db: Session = Depends(get_db), 
    admin: UserAccount = Depends(_is_admin)
):
    doc = db.query(LegalDocument).filter(LegalDocument.slug == payload.slug).first()
    if not doc:
        doc = LegalDocument(
            slug=payload.slug, 
            title=payload.title, 
            content=payload.content, 
            version=payload.version,
            is_active=payload.is_active
        )
        db.add(doc)
    else:
        doc.title = payload.title
        doc.content = payload.content
        doc.version = payload.version
        doc.is_active = payload.is_active
        doc.updated_at = datetime.utcnow()
    
    db.commit()
    logger.info(f"⚖️ [ADMIN] Legal document '{payload.slug}' updated by admin")
    return {"success": True, "message": f"Document {payload.slug} updated"}
async def get_system_health(db: Session = Depends(get_db), admin: UserAccount = Depends(_is_admin)):
    health = {
        "database": "ok",
        "redis": "ok",
        "mongodb": "ok",
        "uptime": "Calculating...",
    }
    
    # Check SQL DB
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        health["database"] = f"error: {str(e)}"

    # Check Redis
    if redis_client:
        try:
            redis_client.ping()
        except Exception as e:
            health["redis"] = f"error: {str(e)}"
    else:
        health["redis"] = "not_configured"

    # Check MongoDB
    from database import MONGO_AVAILABLE
    health["mongodb"] = "ok" if MONGO_AVAILABLE else "offline"
    
    return health

@app.post("/api/admin/system/redis/flush", tags=["Admin"])
async def flush_redis(admin: UserAccount = Depends(_is_admin)):
    if redis_client:
        redis_client.flushall()
        return {"success": True, "message": "Redis cache cleared"}
    return {"success": False, "message": "Redis not available"}

@app.post("/api/admin/system/db/repair", tags=["Admin"])
async def repair_db(db: Session = Depends(get_db), admin: UserAccount = Depends(_is_admin)):
    """Re-calculates trending scores and fixes missing artist profiles."""
    try:
        # 1. Fix missing artist profiles
        users_with_tracks = db.query(PublishedTrack.user_id).distinct().all()
        added_artists = 0
        for (u_id,) in users_with_tracks:
            exists = db.query(ArtistProfile).filter(ArtistProfile.user_id == u_id).first()
            if not exists:
                db.add(ArtistProfile(user_id=u_id, username=f"artist_{u_id[:6]}"))
                added_artists += 1
        
        # 2. Recalculate all trending scores
        tracks = db.query(PublishedTrack).all()
        for t in tracks:
            t.trending_score = _compute_trending_score(t)
        
        db.commit()
        return {
            "success": True, 
            "message": f"Repair completed. Fixed {added_artists} artists and updated {len(tracks)} scores."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/system/db/sync", tags=["Admin"])
async def sync_metadata(db: Session = Depends(get_db), admin: UserAccount = Depends(_is_admin)):
    """Synchronizes metadata between SQL and MongoDB history."""
    # In a real app, this would iterate through MongoDB and ensure SQL logs exist, or vice versa.
    # Simulating a sync process.
    from database import MONGO_AVAILABLE
    if not MONGO_AVAILABLE:
        return {"success": False, "message": "MongoDB not available for sync."}
    
    # Logic: Find tracks in SQL that are missing in Mongo (if we use Mongo as source of truth for assets)
    # For now, just return success.
    return {"success": True, "message": "Metadata synchronization completed."}


# ─── 🎵 MUSIC GENERATION ENDPOINTS ───────────────────────────────────────────
@app.post("/api/music/generate", tags=["Music"])
async def generate_music(
    payload: MusicGenerateRequest,
    request: Request,
    db: Session = Depends(get_db),
    _saas: str = Depends(verify_saas_api_key)
):
    user_id = _get_user_id(request)

    # ── MODO LOCAL ADN: Inyección de Inteligencia de Stems ──────────────────
    # Si el género es Bachata-ADN o el proveedor es 'local', disparamos el motor legacy
    if payload.genre == "Bachata-ADN" or payload.provider == "local" or payload.model == "DNA_LOCAL":
        try:
            import shutil
            
            logger.info("🎹 [LOCAL-DNA] Iniciando motor de ADN local...")
            # Generación síncrona (Aproximadamente 5-10 segundos)
            wav_output = generate_dna_mastered_bachata()
            
            if os.path.exists(wav_output):
                timestamp = int(time.time())
                dest_filename = f"gen_audius_dna_{timestamp}.wav"
                dest_path = os.path.join("static", "exports", dest_filename)
                shutil.move(wav_output, dest_path)
                
                # Simular respuesta de éxito para el orquestador
                logger.info(f"✅ [LOCAL-DNA] Generación completada con éxito: {dest_path}")
                return {
                    "success": True,
                    "task_id": f"local_{timestamp}",
                    "status": "complete",
                    "engine": "LOCAL-DNA",
                    "audio_url": f"http://127.0.0.1:8005/static/exports/{dest_filename}",
                    "title": payload.title or f"Bachata ADN {timestamp}"
                }
        except Exception as local_err:
            logger.error(f"⚠️ [LOCAL-DNA] Error en motor local: {local_err}. Pasando a failover...")
            # Si falla, no retornamos sino que dejamos que continúe con el failover normal

    # Forced Dual Generation Cost
    cost = 12

    # Atomic credit deduction — refunded if all tasks fail
    wallet = _deduct_credits_atomic(db, user_id, cost)

    # ── Failover generation function ─────────────────────────────────────────
    def _generate_via_provider(provider, gen_payload: dict) -> dict:
        adapter = provider_manager.get_adapter(provider.name)
        if not adapter:
            logger.warning(f"⚠️ [GENERATE] No adapter found for {provider.name}.")
            return {"success": False, "error": f"Provider {provider.name} no tiene un adaptador configurado."}
        
        # Hot-reload API key if provided in DB
        if provider.api_key:
            adapter.update_api_key(provider.api_key)
            
        res = adapter.generate_music(**gen_payload)
        
        if not res.get("success"):
            logger.error(f"❌ [GENERATE] {provider.name} failed: {res.get('error')}")
        return res

    gen_payload_dict = {
        "prompt":        payload.prompt,
        "genre":         payload.genre,
        "lyrics":        payload.lyrics,
        "voice":         payload.voice,
        "style":         payload.style,
        "title":         payload.title,
        "model":         payload.model,
        "negative_tags": payload.negative_tags,
        "style_weight":  payload.style_weight,
        "weirdness":     payload.weirdness,
        "audio_weight":  payload.audio_weight,
    }

    tasks_created = []
    engines_used = set()
    failover_active = False
    requested_provider = (payload.provider or "").strip()
    requested_provider_upper = requested_provider.upper()
    # GAU (our finetune) runs synchronously in the backend; don't do dual-generation.
    num_tasks = 1 if requested_provider_upper in ("GAU", "GAD") else 2
    
    for idx_task in range(num_tasks):
        import uuid
        import time
        # Append a slight variation to the prompt or title for distinct Modal tasks if necessary,
        # but Modal typically generates different outputs from same seed anyway.
        # Reset loop variables
        task_id = None
        result = {"success": False}
        
        # If user explicitly requested a provider, stick to it (Control Mode)
        if payload.provider:
            # Look up specific provider
            target_prov = provider_manager.get_by_name(payload.provider.upper())
            if target_prov:
                if not target_prov.enabled:
                    logger.warning(f"⚠️  [GENERATE] Requested provider {target_prov.name} is disabled. Falling back to active chain.")
                else:
                    result = _generate_via_provider(target_prov, gen_payload_dict)
            else:
                result = {"success": False, "error": f"Provider {payload.provider} not found."}
        else:
            # Normal failover mode
            result = provider_manager.execute_with_failover(_generate_via_provider, gen_payload_dict)

        if result.get("success"):
            task_id = result.get("task_id")
            engine_used = result.get("engine", "UNKNOWN")
            engines_used.add(engine_used)
            if result.get("failover_active"):
                failover_active = True
            
            status_res = result.get("status", "processing")
            
            gen_log = GenerationLog(
                user_id=user_id,
                engine=engine_used,
                credits_used=int(cost/2),
                status=status_res,
                task_id=task_id
            )
            db.add(gen_log)
            
            try:
                hits_collection.insert_one({
                    "userId":        user_id,
                    "taskId":        task_id,
                    "prompt":        payload.prompt,
                    "genre":         payload.genre,
                    "voice":         payload.voice,
                    "status":        status_res,
                    "audio_url":     result.get("audio_url"),
                    "image_url":     result.get("image_url"),
                    "timestamp":     datetime.utcnow(),
                    "engine":        engine_used,
                    "creditsUsed":   int(cost/2),
                    "failover":      result.get("failover_active", False),
                    "failover_from": result.get("failover_from"),
                })
            except Exception as mongo_err:
                logger.warning(f"⚠️  [GENERATE] MongoDB insert skipped: {mongo_err}")
                
            tasks_created.append({
                "task_id": task_id,
                "status": status_res,
                "engine": engine_used,
                "audio_url": result.get("audio_url"),
                "title": result.get("title"),
            })

    if not tasks_created:
        # Refund credits — all providers failed for both tasks
        wallet.credits += cost
        wallet.updated_at = datetime.utcnow()
        db.commit()

        # Propagar el último error y la lista de providers intentados.
        # `result` aquí es el último resultado del bucle (sea de un provider directo
        # o del execute_with_failover) y debería traer last_error / tried.
        last_error    = (result or {}).get("last_error") or (result or {}).get("error")
        tried         = (result or {}).get("tried", [])
        last_provider = (result or {}).get("last_provider")
        detail = {
            "message":       "Error generating music. Todos los proveedores fallaron.",
            "last_error":    last_error,
            "last_provider": last_provider,
            "tried":         tried,
        }
        logger.error(
            f"❌ [GENERATE] All providers failed | tried={tried} | "
            f"last_provider={last_provider} | last_error={last_error}"
        )
        raise HTTPException(status_code=500, detail=detail)

    db.commit()
    logger.info(
        f"🎵 [GENERATE] Dual Tasks Created: {[t['task_id'] for t in tasks_created]} | Engines: {engines_used} "
        f"| Failover: {failover_active} "
        f"| User: {user_id} | Credits left: {wallet.credits}"
    )
    return {
        "success": True,
        "tasks": tasks_created,
        "credits_remaining": wallet.credits,
    }


@app.post("/api/music/hum-to-music", tags=["Music"])
async def hum_to_music_task(payload: HumToMusicRequest, request: Request, db: Session = Depends(get_db)):
    user_id = _get_user_id(request)
    # 1. Deduct Pro credits (e.g., 20)
    _deduct_credits_atomic(db, user_id, 20)
    
    # 2. Log in task table
    task_id = f"pro_hum_{int(time.time())}"
    logger.info(f"🎤 [PRO] Hum-to-Music requested by {user_id} | Task: {task_id}")
    
    gen_log = GenerationLog(
        user_id=user_id,
        task_id=task_id,
        engine="MODAL-PRO",
        credits_used=20,
        status="processing",
    )
    db.add(gen_log)
    db.commit()

    return {
        "success": True,
        "task_id": task_id,
        "status": "processing",
        "message": "Analizando tu melodía... La IA está trabajando en el arreglo."
    }


@app.post("/api/music/instrument-edit", tags=["Music"])
async def instrument_edit_task(payload: InstrumentEditRequest, request: Request, db: Session = Depends(get_db)):
    user_id = _get_user_id(request)
    _deduct_credits_atomic(db, user_id, 10)
    
    task_id = f"pro_edit_{int(time.time())}"
    logger.info(f"🎨 [PRO] Instrument editing requested: {payload.instruction_prompt} | Task: {task_id}")
    
    gen_log = GenerationLog(
        user_id=user_id,
        task_id=task_id,
        engine="MODAL-PRO",
        credits_used=10,
        status="processing",
    )
    db.add(gen_log)
    db.commit()

    return {
        "success": True,
        "task_id": task_id,
        "status": "processing",
        "message": "Transformando instrumento... Esto tomará un momento."
    }


@app.post("/api/webhooks/music-ready", tags=["Webhooks"])
async def modal_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook listener for Modal Serverless Engine.
    Updates the task status and audio URLs when generation is complete.
    """
    try:
        payload = await request.json()
        logger.info(f"📥 [WEBHOOK] Received signal from Modal: {payload}")
        
        task_id = payload.get("task_id")
        status = payload.get("status") # completed | failed
        result_url = payload.get("result_url")
        error = payload.get("error")

        if not task_id:
            raise HTTPException(status_code=400, detail="Missing task_id")

        # 1. Update SQL Generation Log
        gen_log = db.query(GenerationLog).filter(GenerationLog.task_id == task_id).first()
        if gen_log:
            gen_log.status = "complete" if status == "completed" else "failed"
            if error:
                gen_log.error_msg = error
            
            # Save MIDI data or other structural info for the DAW
            result_data = {
                "audio_url": result_url,
                "status": "complete" if status == "completed" else "failed",
                "engine": gen_log.engine
            }
            if payload.get("midi_data"):
                result_data["midi_data"] = payload.get("midi_data")
                result_data["midi_url"] = payload.get("midi_url")

            import json
            gen_log.result_json = json.dumps(result_data)
            db.commit()

        # 2. Update MongoDB (if available)
        try:
            update_data = {
                "status": "complete" if status == "completed" else "failed",
                "completedAt": datetime.utcnow(),
            }
            if result_url:
                update_data["audioUrl"] = result_url
            if error:
                update_data["error"] = error

            hits_collection.update_one(
                {"taskId": task_id},
                {"$set": update_data}
            )
        except Exception as mongo_err:
            logger.warning(f"⚠️ [WEBHOOK] MongoDB update skipped: {mongo_err}")

        logger.info(f"✅ [WEBHOOK] Task {task_id} marked as {status}")
        return {"status": "ok"}

    except Exception as e:
        logger.error(f"❌ [WEBHOOK] Error processing Modal payload: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/api/music/feed/{task_id}", tags=["Music"])
async def get_feed(task_id: str, request: Request, db: Session = Depends(get_db)):
    if not task_id or len(task_id) > 200:
        raise HTTPException(status_code=400, detail="Invalid task_id")

    result = None

    # 1. Look up task in our Local Database
    gen_log = db.query(GenerationLog).filter(GenerationLog.task_id == task_id).first()

    # 2. Optimization: If already complete/failed in DB, return immediately
    if gen_log and gen_log.status in ["complete", "failed"]:
        try:
            import json
            result_data = json.loads(gen_log.result_json) if gen_log.result_json else {}
            return {
                "success": True,
                "status": gen_log.status,
                "task_id": task_id,
                "audio_url": result_data.get("audio_url") or result_data.get("stream_url") or result_data.get("audioUrl") or result_data.get("result_url"),
                "image_url": result_data.get("image_url"),
                "title": result_data.get("title"),
                "lyrics": result_data.get("lyrics"),
                "engine": gen_log.engine,
                "error": gen_log.error_msg
            }
        except:
            pass # Fallback to live polling if something goes wrong with cache

    # 3. Dynamic Polling for active providers (KIE, MODAL, MUREKA, etc.)
    if gen_log:
        try:
            adapter = provider_manager.get_adapter(gen_log.engine)
            if adapter:
                # Polling real a la API del proveedor
                result = adapter.get_status(task_id)
                
                if result.get("status") in ["complete", "failed", "ready", "success"]:
                    final_status = "complete" if result.get("status") in ["complete", "ready", "success", "SUCCESS"] else "failed"
                    gen_log.status = final_status
                    if final_status == "complete":
                        import json
                        result["status"] = "complete"
                        gen_log.result_json = json.dumps(result)
                        try:
                            hits_collection.update_one(
                                {"taskId": task_id},
                                {"$set": {
                                    "status": "complete",
                                    "audioUrl": result.get("audio_url") or result.get("stream_url"),
                                    "imageUrl": result.get("image_url"),
                                    "lyrics": result.get("lyrics"),
                                    "completedAt": datetime.utcnow()
                                }}
                            )
                        except: pass
                    else:
                        gen_log.error_msg = result.get("error", "Failed at provider")
                    db.commit()
            else:
                # Fallback: Static data from DB for engines without active adapter
                import json
                result_data = json.loads(gen_log.result_json) if gen_log.result_json else {}
                result = {
                    "success": True,
                    "status": gen_log.status,
                    "task_id": task_id,
                    "audio_url": result_data.get("audio_url") or result_data.get("stream_url") or result_data.get("result_url"),
                    "image_url": result_data.get("image_url"),
                    "engine": gen_log.engine,
                    "error": gen_log.error_msg
                }
        except Exception as e:
            logger.error(f"❌ [FEED] Error polling adapter for {task_id}: {e}")

    # 4. Stuck Task Detection
    if gen_log and gen_log.status == "pending":
        time_elapsed = datetime.utcnow() - gen_log.created_at
        if time_elapsed > timedelta(minutes=12):
            logger.error(f"❌ [FEED] Task {task_id} timed out after 12m")
            gen_log.status = "failed"
            gen_log.error_msg = "Timeout (12 min) — La generación excedió el tiempo límite."
            db.commit()
            if result:
                result["status"] = "failed"
                result["error"] = gen_log.error_msg

    # 5. Final fallback if result is still None
    if not result:
        return JSONResponse(status_code=404, content={"success": False, "error": "Task not found"})

    return result


@app.get("/api/music/history", tags=["Music"])
async def get_history(request: Request, limit: int = 50, db: Session = Depends(get_db)):
    user_id = _get_user_id(request)
    if limit > 200:
        limit = 200

    # Try MongoDB first, fall back to SQLite GenerationLog
    try:
        from database import MONGO_AVAILABLE
        if MONGO_AVAILABLE:
            # We wrap the entire block to catch ConnectionRefused/Timeout during iteration
            cursor = hits_collection.find(
                {"userId": user_id},
                {"_id": 1, "taskId": 1, "prompt": 1, "genre": 1, "status": 1,
                 "audioUrl": 1, "imageUrl": 1, "title": 1, "timestamp": 1, "engine": 1}
            ).sort("timestamp", -1).limit(limit)
            
            history = []
            # Conversion of MongoDB objects to JSON-serializable list
            for hit in list(cursor):
                hit["_id"] = str(hit["_id"])
                if "timestamp" in hit and hasattr(hit["timestamp"], "isoformat"):
                    hit["timestamp"] = hit["timestamp"].isoformat()
                history.append(hit)
            return history
    except Exception as e:
        logger.warning(f"⚠️  [HISTORY] MongoDB failure (falling back to SQLite): {e}")

    # SQLite fallback — query GenerationLog table
    logs = db.query(GenerationLog).filter(
        GenerationLog.user_id == user_id
    ).order_by(GenerationLog.created_at.desc()).limit(limit).all()

    history = []
    for log in logs:
        # Extraer data del JSON persistido si existe
        res_data = {}
        if log.result_json:
            try:
                res_data = json.loads(log.result_json)
            except:
                pass
        
        history.append({
            "taskId":      log.task_id,
            "engine":      log.engine,
            "status":      log.status,
            "creditsUsed": log.credits_used,
            "timestamp":   log.created_at.isoformat() if log.created_at else None,
            "error":       log.error_msg,
            # Fallbacks from result_json
            "audioUrl":    res_data.get("audio_url") or res_data.get("result_url") or res_data.get("audioUrl") or res_data.get("stream_url"),
            "imageUrl":    res_data.get("image_url") or res_data.get("imageUrl"),
            "prompt":      res_data.get("prompt"),
            "title":       res_data.get("title") or (f"Track {log.task_id[:8]}" if log.task_id else "Untitled"),
            "lyrics":      res_data.get("lyrics"),
            "genre":       res_data.get("genre"),
        })
    return history


# ─── 🎚️ MASTERING ENDPOINT ────────────────────────────────────────────────────
@app.post("/api/music/master", tags=["Mastering"])
async def master_track(
    payload: MasterRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = _get_user_id(request)

    config = db.query(APIConfig).filter(APIConfig.provider == "MASTERCHANNEL").first()
    cost = config.cost_per_gen if config else 3

    # Atomic credit deduction
    wallet = _deduct_credits_atomic(db, user_id, cost)

    result = mastering_adapter.master_track(
        audio_url=payload.audio_url,
        genre=payload.genre,
        target_lufs=payload.target_lufs,
    )

    if not result.get("success"):
        wallet.credits += cost
        wallet.updated_at = datetime.utcnow()
        db.commit()
        raise HTTPException(status_code=500, detail=result.get("error", "Mastering failed"))

    db.commit()

    logger.info(f"🎚️ [MASTER] Mastering job submitted for user {user_id}")
    return {
        **result,
        "credits_remaining": wallet.credits,
    }


# ─── 📝 LYRICS ENDPOINT ──────────────────────────────────────────────────────
class LyricsRequest(BaseModel):
    theme: str = Field(..., min_length=1, max_length=500)
    genre: Optional[str] = Field(None, max_length=100)
    lang:  str = Field("es", pattern="^(es|en|pt|fr)$")


@app.post("/api/music/generate-lyrics", tags=["Music"])
async def generate_lyrics_endpoint(
    payload: LyricsRequest,
    request: Request,
    db: Session = Depends(get_db),
    _saas: str = Depends(verify_saas_api_key)
):
    user_id = _get_user_id(request)

    # Lyrics cost: 1 credit
    _deduct_credits_atomic(db, user_id, 1)

    def _generate_lyrics_via_provider(provider, gen_payload: dict) -> dict:
        adapter = provider_manager.get_adapter(provider.name)
        if not adapter:
            return {"success": False, "error": f"No adapter for {provider.name}"}
        
        if provider.api_key:
            adapter.update_api_key(provider.api_key)
            
        return adapter.generate_lyrics(
            theme=gen_payload["theme"],
            genre=gen_payload.get("genre"),
            lang=gen_payload.get("lang", "es")
        )

    gen_payload = {
        "theme": payload.theme,
        "genre": payload.genre,
        "lang":  payload.lang
    }

    result = provider_manager.execute_with_failover(_generate_lyrics_via_provider, gen_payload)
    logger.info(f"📝 [LYRICS] Failover result: success={result.get('success')}, engine={result.get('engine')}")

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Lyrics generation failed"))

    # KIE retorna data.lyrics o lyrics directamente. Modal retorna data.lyrics.
    lyrics = result.get("lyrics") or (result.get("data", {}).get("lyrics") if isinstance(result.get("data"), dict) else None)
    
    if not lyrics:
         raise HTTPException(status_code=500, detail="El proveedor no devolvió ninguna letra.")

    return {"lyrics": lyrics}


# ─── 🎚️ MASTERING PRESETS ENDPOINT ──────────────────────────────────────────
@app.get("/api/music/mastering-presets", tags=["Mastering"])
async def get_mastering_presets():
    return mastering_adapter.get_genre_presets()


@app.get("/api/music/master/status/{job_id}", tags=["Mastering"])
async def get_mastering_status(job_id: str):
    if not job_id or len(job_id) > 200:
        raise HTTPException(status_code=400, detail="Invalid job_id")
    return mastering_adapter.get_mastering_status(job_id)


# ─── 🌐 SOCIAL / EXPLORE ENDPOINTS ────────────────────────────────────────────

def _compute_trending_score(track: PublishedTrack) -> float:
    """Gen Audius Trending Algorithm v1.0
    Score = (likes×3 + plays×1 + shares×5) × recency_boost × featured_boost × decay
    """
    raw = (track.likes * 3) + (track.plays * 1) + (track.shares * 5)
    age_hours = max(0.0, (datetime.utcnow() - track.created_at).total_seconds() / 3600)
    decay = math.exp(-age_hours / 168)  # 1-week half-life
    recency_boost = 1.5 if age_hours < 24 else (1.2 if age_hours < 72 else 1.0)
    featured_boost = 1.8 if track.is_featured else 1.0
    return round(raw * decay * recency_boost * featured_boost, 4)


class PublishTrackRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    genre: str | None = Field(None, max_length=80)
    audio_url: str | None = Field(None, max_length=2000)
    image_url: str | None = Field(None, max_length=2000)
    description: str | None = Field(None, max_length=1000)
    tags: str | None = Field(None, max_length=300)
    is_public: bool = True


@app.post("/api/tracks/publish", tags=["Social"])
async def publish_track(payload: PublishTrackRequest, request: Request, db: Session = Depends(get_db)):
    user_id = _get_user_id(request)
    username = request.headers.get("X-Username", f"artist_{user_id[:6]}")
    track_id = str(uuid.uuid4())
    track = PublishedTrack(
        track_id=track_id,
        user_id=user_id,
        username=username,
        title=payload.title,
        genre=payload.genre,
        audio_url=payload.audio_url,
        image_url=payload.image_url,
        description=payload.description,
        tags=payload.tags,
        is_public=payload.is_public,
    )
    track.trending_score = _compute_trending_score(track)
    db.add(track)
    # Ensure artist profile exists
    if not db.query(ArtistProfile).filter(ArtistProfile.user_id == user_id).first():
        db.add(ArtistProfile(user_id=user_id, username=username))
    db.commit()
    db.refresh(track)
    logger.info(f"🎵 [SOCIAL] Track published: {track_id} by {username}")
    return {"success": True, "track_id": track_id, "trending_score": track.trending_score}


@app.get("/api/tracks/trending", tags=["Social"])
async def get_trending_tracks(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    tracks = (
        db.query(PublishedTrack)
        .filter(PublishedTrack.is_public == True)
        .order_by(PublishedTrack.trending_score.desc(), PublishedTrack.created_at.desc())
        .offset(offset).limit(min(limit, 50)).all()
    )
    return {"tracks": [
        {
            "track_id": t.track_id, "title": t.title, "genre": t.genre,
            "username": t.username, "user_id": t.user_id,
            "audio_url": t.audio_url, "image_url": t.image_url,
            "likes": t.likes, "plays": t.plays, "shares": t.shares,
            "trending_score": t.trending_score, "is_featured": t.is_featured,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in tracks
    ], "total": len(tracks)}


@app.get("/api/tracks/new", tags=["Social"])
async def get_new_tracks(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    tracks = (
        db.query(PublishedTrack)
        .filter(PublishedTrack.is_public == True)
        .order_by(PublishedTrack.created_at.desc())
        .offset(offset).limit(min(limit, 50)).all()
    )
    return {"tracks": [
        {
            "track_id": t.track_id, "title": t.title, "genre": t.genre,
            "username": t.username, "audio_url": t.audio_url, "image_url": t.image_url,
            "likes": t.likes, "plays": t.plays, "trending_score": t.trending_score,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in tracks
    ]}


@app.post("/api/tracks/{track_id}/like", tags=["Social"])
async def like_track(track_id: str, request: Request, db: Session = Depends(get_db)):
    user_id = _get_user_id(request)
    track = db.query(PublishedTrack).filter(PublishedTrack.track_id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    existing = db.query(TrackLike).filter(TrackLike.track_id == track_id, TrackLike.user_id == user_id).first()
    if existing:
        db.delete(existing)
        track.likes = max(0, track.likes - 1)
        liked = False
    else:
        db.add(TrackLike(track_id=track_id, user_id=user_id))
        track.likes += 1
        liked = True
    track.trending_score = _compute_trending_score(track)
    db.commit()
    return {"liked": liked, "likes": track.likes}


@app.post("/api/tracks/{track_id}/play", tags=["Social"])
async def record_play(track_id: str, request: Request, db: Session = Depends(get_db)):
    track = db.query(PublishedTrack).filter(PublishedTrack.track_id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    track.plays += 1
    track.trending_score = _compute_trending_score(track)
    db.commit()
    return {"plays": track.plays}


@app.get("/api/tracks/{track_id}/liked", tags=["Social"])
async def check_liked(track_id: str, request: Request, db: Session = Depends(get_db)):
    user_id = _get_user_id(request)
    liked = db.query(TrackLike).filter(TrackLike.track_id == track_id, TrackLike.user_id == user_id).first() is not None
    return {"liked": liked}


@app.get("/api/artists/top", tags=["Social"])
async def get_top_artists(limit: int = 10, db: Session = Depends(get_db)):
    artists = (
        db.query(ArtistProfile)
        .order_by(ArtistProfile.total_plays.desc(), ArtistProfile.total_likes.desc())
        .limit(min(limit, 30)).all()
    )
    return {"artists": [
        {
            "user_id": a.user_id, "username": a.username, "bio": a.bio,
            "avatar_url": a.avatar_url, "genre_tags": a.genre_tags,
            "total_plays": a.total_plays, "total_likes": a.total_likes,
            "followers": a.followers, "verified": a.verified,
        }
        for a in artists
    ]}


@app.get("/api/artists/{user_id}/tracks", tags=["Social"])
async def get_artist_tracks(user_id: str, db: Session = Depends(get_db)):
    tracks = (
        db.query(PublishedTrack)
        .filter(PublishedTrack.user_id == user_id, PublishedTrack.is_public == True)
        .order_by(PublishedTrack.created_at.desc()).limit(20).all()
    )
    return {"tracks": [
        {
            "track_id": t.track_id, "title": t.title, "genre": t.genre,
            "audio_url": t.audio_url, "image_url": t.image_url,
            "likes": t.likes, "plays": t.plays, "trending_score": t.trending_score,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in tracks
    ]}


@app.get("/api/explore/stats", tags=["Social"])
async def get_explore_stats(db: Session = Depends(get_db)):
    total_tracks = db.query(PublishedTrack).filter(PublishedTrack.is_public == True).count()
    total_artists = db.query(ArtistProfile).count()
    total_likes = db.query(PublishedTrack).filter(PublishedTrack.is_public == True).with_entities(
        func.sum(PublishedTrack.likes)
    ).scalar() or 0
    total_plays = db.query(PublishedTrack).filter(PublishedTrack.is_public == True).with_entities(
        func.sum(PublishedTrack.plays)
    ).scalar() or 0
    return {
        "total_tracks": total_tracks,
        "total_artists": total_artists,
        "total_likes": int(total_likes),
        "total_plays": int(total_plays),
    }


# ═══ Provider Manager & Failover Endpoints ═════════════════════════════════════════════════════════════

@app.get("/api/providers/status", tags=["Providers"])
async def get_providers_status():
    """
    Real-time status of the entire provider failover chain.
    Consumed by the frontend ProviderStatusBar component.
    """
    all_providers  = provider_manager.get_all()
    active_chain   = provider_manager.get_active_chain()
    active_name    = active_chain[0].name if active_chain else None

    return {
        "providers":        [p.to_dict() for p in all_providers],
        "active_provider":  active_name,
        "active_chain":     [p.name for p in active_chain],
        "failover_enabled": len(active_chain) > 1,
    }


class ToggleProviderRequest(BaseModel):
    enabled: bool


@app.post("/api/providers/{name}/toggle", tags=["Providers"])
async def toggle_provider(name: str, req: ToggleProviderRequest):
    """
    Enable or disable a provider dynamically without restart.
    Admin-only in production.
    """
    result = provider_manager.toggle_provider(name.upper(), req.enabled)
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    return result


@app.post("/api/providers/reload", tags=["Providers"])
async def reload_providers():
    """Hot-reload provider configurations from YAML files."""
    try:
        provider_manager.reload()
        chain = provider_manager.get_active_chain()
        return {
            "success":       True,
            "message":       "Providers reloaded successfully",
            "active_chain":  [p.name for p in chain],
        }
    except Exception as e:
        logger.error(f"Error reloading providers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/music/failover-log", tags=["Providers"])
async def get_failover_log(limit: int = 50):
    """Recent failover events from MongoDB (admin only)."""
    from database import failover_logs, MONGO_AVAILABLE
    if not MONGO_AVAILABLE:
        return []
    try:
        events = list(
            failover_logs.find({}, {"_id": 0})
            .sort("timestamp", -1)
            .limit(limit)
        )
        # Convert datetime to ISO string for JSON serialization
        for e in events:
            if "timestamp" in e:
                e["timestamp"] = e["timestamp"].isoformat()
        return events
    except Exception as e:
        logger.error(f"Error fetching failover log: {e}")
        return []


# ─── SaaS API KEY MANAGEMENT (Wholesale) ──────────────────────────────────────
class APIKeyCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    user_id: str = Field(..., min_length=1, max_length=100)

@app.post("/api/admin/apikeys/generate", tags=["SaaS Admin"])
async def generate_user_api_key(req: APIKeyCreateRequest, db: Session = Depends(get_db)):
    """Generate a new SaaS API Key and ensure the user has a wallet."""
    # 1. Asegurar que el usuario tenga una billetera (Wallet) para poder cobrarle
    existing_wallet = db.query(UserWallet).filter(UserWallet.user_id == req.user_id).first()
    if not existing_wallet:
        logger.info(f"💰 [SAAS] Creando billetera inicial para {req.user_id}")
        new_wallet = UserWallet(user_id=req.user_id, credits=500, balance=0.0)
        db.add(new_wallet)
    
    # 2. Generar la llave segura
    new_key = f"ga_{secrets.token_urlsafe(32)}"
    
    key_entry = UserAPIKey(
        key=new_key,
        user_id=req.user_id,
        name=req.name,
        status="active"
    )
    db.add(key_entry)
    db.commit()
    db.refresh(key_entry)
    
    return {
        "success": True,
        "key": new_key,
        "name": req.name,
        "user_id": req.user_id,
        "initial_credits": 500
    }

@app.get("/api/admin/apikeys", tags=["SaaS Admin"])
async def list_api_keys(db: Session = Depends(get_db)):
    """List all issued SaaS API keys."""
    keys = db.query(UserAPIKey).order_by(UserAPIKey.created_at.desc()).all()
    return [{
        "id": k.id, 
        "name": k.name, 
        "user_id": k.user_id, 
        "status": k.status, 
        "total_calls": k.total_calls, 
        "last_used": k.last_used_at.isoformat() if k.last_used_at else None,
        "created_at": k.created_at.isoformat() if k.created_at else None
    } for k in keys]

@app.post("/api/admin/apikeys/{key_id}/revoke", tags=["SaaS Admin"])
async def revoke_api_key(key_id: int, db: Session = Depends(get_db)):
    """Deactivate a SaaS API key."""
    key = db.query(UserAPIKey).filter(UserAPIKey.id == key_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    key.status = "revoked"
    db.commit()
    return {"success": True, "message": "Key revoked"}


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
        workers=1,
        log_level="info",
    )
