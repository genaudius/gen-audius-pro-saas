import sys
import os
import uuid
import hashlib
from core.auth import hash_password as _bcrypt_hash
from datetime import datetime

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, UserAccount, UserWallet, Base, engine

def _hash_password(password: str, salt: str = "genaudius_salt_2025") -> str:
    # Now uses bcrypt; salt arg ignored (kept for backward compat)
    return _bcrypt_hash(password)

def seed_superadmin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        email = "admin@genaudius.com"
        password = "@@##Odg483@"
        username = "superadmin"
        
        # Check if exists
        user = db.query(UserAccount).filter(UserAccount.email == email).first()
        if not user:
            user_id = str(uuid.uuid4())
            user = UserAccount(
                user_id=user_id,
                username=username,
                email=email,
                password_hash=_hash_password(password),
                is_active=True,
                plan="enterprise",
                created_at=datetime.utcnow()
            )
            db.add(user)
            print(f"✅ User {email} created with ID {user_id}")
            
            # Add wallet with plenty of credits
            wallet = UserWallet(
                user_id=user_id,
                credits=999999,
                balance=9999.0
            )
            db.add(wallet)
            print(f"💰 Wallet provisioned for superadmin")
        else:
            print(f"⚠️ User {email} already exists. Updating password and plan...")
            user.password_hash = _hash_password(password)
            user.plan = "enterprise"
            
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating superadmin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_superadmin()
