from database import SessionLocal, UserAccount, UserWallet
import hashlib
from datetime import datetime

def hash_password(password: str) -> str:
    return hashlib.sha256(f"genaudius_salt_2025{password}".encode()).hexdigest()

db = SessionLocal()
email = "admin@genaudius.com"
user = db.query(UserAccount).filter(UserAccount.email == email).first()

if not user:
    new_user = UserAccount(
        user_id="admin_test",
        username="Admin",
        email=email,
        password_hash=hash_password("admin123"),
        is_active=True,
        is_verified=True,
        role="admin",
        plan="pro"
    )
    db.add(new_user)
    
    # Add wallet
    wallet = UserWallet(user_id="admin_test", credits=10000, balance=500.0)
    db.add(wallet)
    
    db.commit()
    print("Admin user created successfully!")
else:
    # Update password and role to ensure it works
    user.password_hash = hash_password("admin123")
    user.role = "admin"
    db.commit()
    print("Admin user already exists. Password updated to admin123.")
