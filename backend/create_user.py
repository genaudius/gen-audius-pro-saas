import sys
import os
import uuid
import hashlib
from core.auth import hash_password as _bcrypt_hash
from datetime import datetime

# Path to the backend directory to import database.py
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, UserAccount, UserWallet, Base, engine

def _hash_password(password: str, salt: str = "genaudius_salt_2025") -> str:
    """Now uses bcrypt; salt arg ignored (kept for backward compat)."""
    return _bcrypt_hash(password)

def create_specific_user():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user_email = "genaudius@gmail.com"
        user_pass = "@@##Odg4383@"
        user_name = "genaudius"
        
        # 1. Check if user already exists
        user = db.query(UserAccount).filter(UserAccount.email == user_email).first()
        if not user:
            user_id = str(uuid.uuid4())
            user = UserAccount(
                user_id=user_id,
                username=user_name,
                email=user_email,
                password_hash=_hash_password(user_pass),
                is_active=True,
                is_verified=True,
                role="admin", # Making it admin for easier testing
                plan="enterprise",
                created_at=datetime.utcnow()
            )
            db.add(user)
            print(f"[SUCCESS] User {user_email} created with ID {user_id}")
            
            # 2. Add wallet with credits
            wallet = UserWallet(
                user_id=user_id,
                credits=100000,
                balance=1000.0,
                updated_at=datetime.utcnow()
            )
            db.add(wallet)
            print(f"[WALLET] Wallet provisioned with 100,000 credits")
        else:
            print(f"[INFO] User {user_email} already exists. Updating credentials...")
            user.password_hash = _hash_password(user_pass)
            user.role = "admin"
            user.plan = "enterprise"
            
        db.commit()
        print("[DATABASE] Transaction committed successfully.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during user creation: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_specific_user()
