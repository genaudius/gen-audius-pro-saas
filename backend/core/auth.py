"""
Gen Audius Pro — Auth Module
=============================
Production-grade auth helpers:
  • bcrypt password hashing (with legacy SHA-256 detection for migration)
  • JWT access tokens (HS256, signed with JWT_SECRET)
  • get_current_user dependency replaces the insecure X-User-ID header
"""

import os
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt
import jwt
from fastapi import HTTPException, Request

logger = logging.getLogger("gen_audius.auth")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_TTL_HOURS = int(os.getenv("ACCESS_TOKEN_TTL_HOURS", "24"))
LEGACY_SALT = "genaudius_salt_2025"  # Old SHA-256 salt — kept ONLY for migration


def get_jwt_secret() -> str:
    """Return JWT_SECRET; fail loudly if missing in production."""
    secret = os.getenv("JWT_SECRET", "")
    env = os.getenv("ENV", "development").lower()
    if not secret:
        if env == "production":
            raise RuntimeError("JWT_SECRET is required in production")
        # Dev fallback — deterministic so dev tokens persist across restarts
        secret = "dev-only-insecure-secret-change-in-production"
        logger.warning("⚠️  [AUTH] Using insecure dev JWT_SECRET. Set JWT_SECRET in .env for production.")
    return secret


# ─── Password Hashing ────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    """Hash a password with bcrypt. Returns string-encoded hash."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def _is_bcrypt_hash(stored: str) -> bool:
    return stored.startswith("$2a$") or stored.startswith("$2b$") or stored.startswith("$2y$")


def _legacy_sha256_hash(password: str) -> str:
    return hashlib.sha256(f"{LEGACY_SALT}{password}".encode()).hexdigest()


def verify_password(plain: str, stored: str) -> bool:
    """
    Verify a password against the stored hash.
    Supports both modern bcrypt and legacy SHA-256 (returns True so caller can rehash).
    """
    if not stored:
        return False
    try:
        if _is_bcrypt_hash(stored):
            return bcrypt.checkpw(plain.encode("utf-8"), stored.encode("utf-8"))
        # Legacy SHA-256
        return _legacy_sha256_hash(plain) == stored
    except Exception as e:
        logger.error(f"verify_password error: {e}")
        return False


def needs_rehash(stored: str) -> bool:
    """Return True if the stored hash uses legacy SHA-256 and should be rehashed."""
    return bool(stored) and not _is_bcrypt_hash(stored) and stored != "firebase_oauth"


# ─── JWT Tokens ──────────────────────────────────────────────────────────────
def create_access_token(user_id: str, email: str = "", role: str = "user") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_TTL_HOURS),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# ─── Auth Dependencies ───────────────────────────────────────────────────────
def _extract_token(request: Request) -> Optional[str]:
    """Extract JWT from Authorization: Bearer <token> header."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip() or None
    # Also accept httpOnly cookie if ever issued
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return cookie_token
    return None


def get_current_user_id(request: Request) -> str:
    """
    Verify JWT and return user_id.
    Backward-compat: if LEGACY_HEADER_AUTH=true, accept X-User-ID (transition only).
    """
    # Cached on request state if previously resolved (e.g., by API key dependency)
    if hasattr(request.state, "user_id") and request.state.user_id:
        return request.state.user_id

    token = _extract_token(request)
    if token:
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            uid = payload["sub"]
            request.state.user_id = uid
            request.state.user_role = payload.get("role", "user")
            return uid
        # Token present but invalid/expired
        raise HTTPException(status_code=401, detail="Token inválido o expirado. Inicia sesión nuevamente.")

    # Legacy fallback (insecure — disable in production)
    if os.getenv("LEGACY_HEADER_AUTH", "false").lower() == "true":
        legacy_uid = request.headers.get("X-User-ID", "").strip()
        if legacy_uid and legacy_uid != "current_user":
            logger.warning(f"⚠️  [AUTH] Legacy X-User-ID accepted for {legacy_uid}. Migrate frontend to JWT.")
            request.state.user_id = legacy_uid
            request.state.user_role = "user"
            return legacy_uid

    raise HTTPException(status_code=401, detail="Autenticación requerida. Inicia sesión.")


def get_current_user_id_optional(request: Request) -> str:
    """Like get_current_user_id but returns 'anonymous' instead of 401."""
    try:
        return get_current_user_id(request)
    except HTTPException:
        return "anonymous"
