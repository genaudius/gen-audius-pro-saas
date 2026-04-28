"""
Gen Audius Pro — Wallet & Earnings Router
==========================================
Endpoints: /api/user/wallet, /api/user/recharge, /api/user/earnings, /api/user/payout
"""
import logging
import os
from datetime import datetime

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import UserWallet, UserAccount, UserEarnings, StripePayout
from deps import get_db, get_user_id, get_user_id_optional
from schemas import RechargeRequest, PayoutRequest

logger = logging.getLogger("gen_audius.wallet_router")

router = APIRouter(prefix="/api/user", tags=["Wallet"])


@router.get("/wallet")
async def get_wallet(request: Request, db: Session = Depends(get_db)):
    user_id = get_user_id_optional(request)
    if user_id == "anonymous":
        return {"user_id": "anonymous", "credits": 0, "balance": 0.0, "daily_bonus_granted": False}

    wallet = db.query(UserWallet).filter(UserWallet.user_id == user_id).first()
    if not wallet:
        wallet = UserWallet(user_id=user_id, credits=100, balance=10.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    today = datetime.utcnow().date()
    if wallet.updated_at.date() < today:
        bonus = 100
        wallet.credits += bonus
        wallet.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(wallet)
        logger.info(f"🎁 [WALLET] Daily bonus of {bonus} credits granted to {user_id}")

    return {
        "user_id": wallet.user_id,
        "credits": wallet.credits,
        "balance": wallet.balance,
        "updated_at": wallet.updated_at.isoformat() if wallet.updated_at else None,
        "daily_bonus_granted": wallet.updated_at.date() == today,
    }


@router.post("/recharge")
async def recharge_wallet(payload: RechargeRequest, request: Request, db: Session = Depends(get_db)):
    user_id = get_user_id(request)
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


@router.get("/earnings")
async def get_user_earnings(request: Request, db: Session = Depends(get_db)):
    user_id = get_user_id(request)
    earnings = db.query(UserEarnings).filter(UserEarnings.user_id == user_id).first()
    if not earnings:
        return {"current_balance": 0.0, "total_earned": 0.0, "payouts": []}
    payouts = (
        db.query(StripePayout)
        .filter(StripePayout.user_id == user_id)
        .order_by(StripePayout.created_at.desc())
        .all()
    )
    return {
        "current_balance": earnings.current_balance,
        "total_earned": earnings.total_earned,
        "payouts": payouts,
    }


@router.post("/payout")
async def request_payout(req: PayoutRequest, request: Request, db: Session = Depends(get_db)):
    user_id = get_user_id(request)
    user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
    earnings = db.query(UserEarnings).filter(UserEarnings.user_id == user_id).first()

    if not earnings or earnings.current_balance < req.amount:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    if not user or not user.stripe_connect_id:
        raise HTTPException(status_code=400, detail="Debes configurar tu cuenta de Stripe Connect para recibir pagos")

    if not os.getenv("STRIPE_SECRET_KEY"):
        raise HTTPException(status_code=503, detail="Stripe not configured")
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

    try:
        transfer = stripe.Transfer.create(
            amount=int(req.amount * 100),
            currency=req.currency,
            destination=user.stripe_connect_id,
            metadata={"user_id": user_id},
        )
        earnings.current_balance -= req.amount
        payout = StripePayout(
            user_id=user_id,
            stripe_transfer_id=transfer.id,
            amount=req.amount,
            status="paid",
        )
        db.add(payout)
        db.commit()
        return {"status": "success", "transfer_id": transfer.id}
    except Exception as e:
        logger.error(f"Error Payout: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
