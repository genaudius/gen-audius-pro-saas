"""
Gen Audius Pro — Shared Dependencies
=====================================
Reusable FastAPI dependencies and helpers used across routers.
"""
import os
import logging
from datetime import datetime

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from database import SessionLocal, UserAccount, UserWallet, UserAPIKey
from core.auth import get_current_user_id, get_current_user_id_optional

logger = logging.getLogger("gen_audius.deps")

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "genaudius@gmail.com")


# ─── DB Session ──────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── User identity (JWT-validated) ───────────────────────────────────────────
def get_user_id(request: Request) -> str:
    return get_current_user_id(request)


def get_user_id_optional(request: Request) -> str:
    return get_current_user_id_optional(request)


# ─── Admin guard ─────────────────────────────────────────────────────────────
async def require_admin(request: Request, db: Session = Depends(get_db)) -> UserAccount:
    """Verifies user is an admin based on role or ADMIN_EMAIL."""
    user_id = get_user_id(request)
    user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()

    if user and user.role == "admin":
        return user

    if user and user.email and user.email.lower() == ADMIN_EMAIL.lower():
        user.role = "admin"
        db.commit()
        return user

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Acceso denegado: Se requieren permisos de administrador.",
    )


# ─── SaaS API Key auth (alternative to JWT) ──────────────────────────────────
async def verify_saas_api_key(request: Request, db: Session = Depends(get_db)):
    """
    Middleware-like dependency to verify SaaS API Keys.
    Supports both X-API-Key and Authorization: Bearer <api_key>.
    Falls back gracefully if absent (other deps will then enforce JWT).
    """
    api_key = request.headers.get("X-API-Key")
    auth_header = request.headers.get("Authorization", "")

    # Only treat Authorization as API key if it does NOT decode as a JWT
    if not api_key and auth_header.startswith("Bearer "):
        candidate = auth_header.split(" ", 1)[1].strip()
        # JWTs have two dots; SaaS keys typically don't
        if candidate.count(".") != 2:
            api_key = candidate

    if not api_key:
        return None

    key_entry = (
        db.query(UserAPIKey)
        .filter(UserAPIKey.key == api_key, UserAPIKey.status == "active")
        .first()
    )
    if not key_entry:
        raise HTTPException(status_code=401, detail="Invalid or revoked API Key")

    key_entry.total_calls += 1
    key_entry.last_used_at = datetime.utcnow()
    db.commit()

    request.state.user_id = key_entry.user_id
    return key_entry.user_id


# ─── Atomic credit deduction ─────────────────────────────────────────────────
def deduct_credits_atomic(db: Session, user_id: str, amount: int) -> UserWallet:
    """
    Atomically deduct credits, raising 402 if insufficient.
    Uses SELECT FOR UPDATE to prevent race conditions.
    Auto-provisions wallet with 100 credits if it doesn't exist.
    """
    wallet = (
        db.query(UserWallet)
        .filter(UserWallet.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not wallet:
        wallet = UserWallet(user_id=user_id, credits=100, balance=10.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    if wallet.credits < amount:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. Required: {amount}, Available: {wallet.credits}",
        )
    wallet.credits -= amount
    wallet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(wallet)
    return wallet
