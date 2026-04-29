"""Seed admin + test user with bcrypt-hashed passwords for local testing."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from database import SessionLocal, UserAccount, UserWallet, CreditTransaction
from core.auth import hash_password

USERS = [
    {
        "user_id": "admin_genaudius",
        "email": "genaudius@gmail.com",
        "password": "Admin1234!",
        "username": "GenAudius Admin",
        "role": "admin",
        "plan": "pro",
        "credits": 99999,
    },
    {
        "user_id": "u_demo",
        "email": "demo@genaudius.com",
        "password": "Demo1234!",
        "username": "Demo User",
        "role": "user",
        "plan": "free",
        "credits": 500,
    },
]

db = SessionLocal()
try:
    for u in USERS:
        user = db.query(UserAccount).filter(UserAccount.email == u["email"]).first()
        h = hash_password(u["password"])
        if user:
            user.password_hash = h
            user.role = u["role"]
            user.plan = u["plan"]
            user.is_active = True
            user.is_verified = True
            print(f"♻️  Updated: {u['email']} (role={u['role']})")
        else:
            user = UserAccount(
                user_id=u["user_id"],
                username=u["username"],
                email=u["email"],
                password_hash=h,
                role=u["role"],
                plan=u["plan"],
                is_active=True,
                is_verified=True,
                created_at=datetime.utcnow(),
                failed_attempts=0,
            )
            db.add(user)
            print(f"🆕 Created: {u['email']} (role={u['role']})")

        wallet = db.query(UserWallet).filter(UserWallet.user_id == u["user_id"]).first()
        if not wallet:
            wallet = UserWallet(user_id=u["user_id"], credits=u["credits"], balance=10.0)
            db.add(wallet)
            db.add(CreditTransaction(
                user_id=u["user_id"], amount=u["credits"],
                type_="seed", description="Initial seed credits",
            ))
        else:
            wallet.credits = u["credits"]

    db.commit()
    print("\n✅ Seed complete.")
    print("\nLogin credentials for testing:")
    print("─" * 60)
    for u in USERS:
        print(f"  Email:    {u['email']}")
        print(f"  Password: {u['password']}")
        print(f"  Role:     {u['role']}  ({u['credits']} credits)")
        print("─" * 60)
finally:
    db.close()
