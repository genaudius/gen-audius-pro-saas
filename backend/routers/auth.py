"""
Gen Audius Pro — Auth Router
=============================
Endpoints: /api/auth/*
"""
import os
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import UserAccount, UserWallet, CreditTransaction
from core.auth import (
    hash_password,
    verify_password,
    needs_rehash,
    create_access_token,
)
from deps import get_db, get_user_id
from schemas import LoginRequest, SocialLoginRequest

logger = logging.getLogger("gen_audius.auth_router")

router = APIRouter(prefix="/api/auth", tags=["Auth"])

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "genaudius@gmail.com")


@router.post("/login")
async def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email + password. Returns a JWT.
    Auto-migrates legacy SHA-256 hashes to bcrypt on successful login."""
    user = db.query(UserAccount).filter(UserAccount.email == payload.email.lower()).first()
    if not user:
        user = (
            db.query(UserAccount)
            .filter(func.lower(UserAccount.email) == payload.email.lower())
            .first()
        )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled. Contact support.")

    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(payload.password)
        db.commit()
        logger.info(f"🔄 [AUTH] Password rehashed to bcrypt for {user.email}")

    wallet = db.query(UserWallet).filter(UserWallet.user_id == user.user_id).first()
    credits = wallet.credits if wallet else 0

    user.last_login = datetime.utcnow()
    user.failed_attempts = 0
    db.commit()

    token = create_access_token(user_id=user.user_id, email=user.email, role=user.role or "user")
    logger.info(f"✅ [AUTH] Login successful for {user.email} (plan: {user.plan})")

    return {
        "success": True,
        "user_id": user.user_id,
        "email": user.email,
        "username": user.username,
        "plan": user.plan,
        "role": user.role,
        "credits": credits,
        "token": token,
        "token_type": "Bearer",
        "message": f"Welcome back, {user.username}!",
    }


@router.get("/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    """Get current user profile (validates JWT)."""
    user_id = get_user_id(request)
    user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
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


@router.post("/social")
async def social_login(request: SocialLoginRequest, db: Session = Depends(get_db)):
    """Handle social login from Firebase and sync/provision user."""
    user_id = f"fb_{request.uid}"
    is_admin = request.email.lower() == ADMIN_EMAIL.lower()
    user_role = "admin" if is_admin else "user"

    user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
    if not user:
        user = UserAccount(
            user_id=user_id,
            username=request.username or request.email.split('@')[0],
            email=request.email,
            password_hash="firebase_oauth",
            role=user_role,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        logger.info(f"🆕 [AUTH] New social user created: {user_id} ({request.email})")
    else:
        if is_admin and user.role != "admin":
            user.role = "admin"

    wallet = db.query(UserWallet).filter(UserWallet.user_id == user_id).first()
    if not wallet:
        credits = 99999 if is_admin else 100
        wallet = UserWallet(user_id=user_id, credits=credits, balance=10.0)
        db.add(wallet)
        db.add(CreditTransaction(
            user_id=user_id, amount=credits,
            type_="welcome_bonus", description="Welcome bonus",
        ))
        logger.info(f"💰 [AUTH] Wallet provisioned for {user_id}: {credits} credits")

    db.commit()
    db.refresh(wallet)

    token = create_access_token(user_id=user_id, email=request.email, role=user_role)

    return {
        "user_id": user_id,
        "email": request.email,
        "username": request.username or request.email.split('@')[0],
        "plan": "pro" if user_role == "admin" else "free",
        "role": user_role,
        "credits": wallet.credits,
        "token": token,
        "token_type": "Bearer",
    }


@router.get("/verify")
async def verify_account(token: str, db: Session = Depends(get_db)):
    """Verify email token."""
    user = db.query(UserAccount).filter(UserAccount.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido o expirado.")

    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"success": True, "message": "Cuenta verificada con éxito."}
