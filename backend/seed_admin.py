"""
Run inside the backend container:
  docker exec genaudius-backend python3 seed_admin.py
"""
from database import SessionLocal, UserAccount, UserWallet
from datetime import datetime

db = SessionLocal()
try:
    user = db.query(UserAccount).filter(UserAccount.email == 'genaudius@gmail.com').first()
    if not user:
        print("ERROR: usuario genaudius@gmail.com no encontrado en la DB")
    else:
        print(f"Encontrado: {user.user_id} | rol actual: {user.role}")
        user.role = 'admin'
        user.is_active = True
        user.is_verified = True

        wallet = db.query(UserWallet).filter(UserWallet.user_id == user.user_id).first()
        if not wallet:
            wallet = UserWallet(user_id=user.user_id, credits=99999, balance=9999.0)
            db.add(wallet)
            print("Wallet creada con 99999 creditos")
        else:
            wallet.credits = 99999
            wallet.balance = 9999.0
            print(f"Wallet actualizada: 99999 creditos")

        db.commit()
        print("OK — admin + creditos aplicados a genaudius@gmail.com")
finally:
    db.close()
