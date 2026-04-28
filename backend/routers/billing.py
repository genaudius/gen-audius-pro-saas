"""
Gen Audius Pro — Billing Router
================================
Endpoints: /api/stripe/*  (Checkout sessions and webhook)
"""
import os
import logging
from datetime import datetime, timedelta

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import UserAccount, StripeSubscription
from deps import get_db, get_user_id
from schemas import StripeSessionRequest

logger = logging.getLogger("gen_audius.billing_router")

router = APIRouter(prefix="/api/stripe", tags=["Billing"])


def _stripe_secret() -> str:
    key = os.getenv("STRIPE_SECRET_KEY", "")
    return key


@router.post("/create-checkout-session")
async def create_checkout_session(req: StripeSessionRequest, request: Request, db: Session = Depends(get_db)):
    user_id = get_user_id(request)
    user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    secret = _stripe_secret()
    if not secret:
        raise HTTPException(status_code=503, detail="Stripe not configured")
    stripe.api_key = secret

    price_map = {
        "basic": os.getenv("STRIPE_PRICE_BASIC", ""),
        "pro": os.getenv("STRIPE_PRICE_PRO", ""),
        "studio": os.getenv("STRIPE_PRICE_STUDIO", ""),
    }
    price_id = price_map.get(req.plan_id)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"Plan '{req.plan_id}' no válido o sin Price ID configurado")

    try:
        session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id if user.stripe_customer_id else None,
            customer_email=user.email if not user.stripe_customer_id else None,
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode='subscription',
            success_url=req.success_url,
            cancel_url=req.cancel_url,
            metadata={"user_id": user_id, "plan_id": req.plan_id},
        )
        return {"url": session.url}
    except Exception as e:
        logger.error(f"Error Stripe Session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Stripe Webhook receiver. Verified via STRIPE_WEBHOOK_SECRET in production."""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    env_name = os.getenv("ENV", "development").lower()

    if not webhook_secret:
        if env_name == "production":
            logger.error("🚨 [STRIPE] Webhook secret missing in production — refusing event")
            raise HTTPException(status_code=503, detail="Webhook not configured")
        logger.warning("⚠️  [STRIPE] Webhook secret not configured. Skipping verification (DEV ONLY).")
        try:
            event = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON")
    else:
        if not _stripe_secret():
            raise HTTPException(status_code=503, detail="Stripe not configured")
        stripe.api_key = _stripe_secret()
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception as e:
            logger.error(f"⚠️  [STRIPE] Webhook verification failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))

    event_type = event['type']
    data_object = event['data']['object']

    if event_type == 'checkout.session.completed':
        user_id = data_object.get('metadata', {}).get('user_id')
        plan_id = data_object.get('metadata', {}).get('plan_id')

        if user_id and plan_id:
            user = db.query(UserAccount).filter(UserAccount.user_id == user_id).first()
            if user:
                user.subscription_status = "active"
                user.subscription_id = data_object.get('subscription')
                user.stripe_customer_id = data_object.get('customer')
                new_sub = StripeSubscription(
                    user_id=user_id,
                    stripe_sub_id=data_object.get('subscription'),
                    plan_id=plan_id,
                    status="active",
                    current_period_end=datetime.utcnow() + timedelta(days=32),
                )
                db.add(new_sub)
                db.commit()
                logger.info(f"💰 [STRIPE] Sub activated: {user_id} -> {plan_id}")

    elif event_type == 'customer.subscription.deleted':
        stripe_sub_id = data_object.get('id')
        user = db.query(UserAccount).filter(UserAccount.subscription_id == stripe_sub_id).first()
        if user:
            user.subscription_status = "inactive"
            db.commit()
            logger.info(f"❌ [STRIPE] Sub ended: {user.user_id}")

    return {"status": "received"}
