from database import SessionLocal, UserWallet
from datetime import datetime

db = SessionLocal()
user_id = "current_user"

wallet = db.query(UserWallet).filter(UserWallet.user_id == user_id).first()

if not wallet:
    print(f"🆕 Creando billetera para {user_id}...")
    wallet = UserWallet(user_id=user_id, credits=1000, updated_at=datetime.utcnow())
    db.add(wallet)
else:
    print(f"💰 Recargando billetera de {user_id} (+1000 créditos)...")
    wallet.credits += 1000
    wallet.updated_at = datetime.utcnow()

db.commit()
print(f"✅ Éxito. Créditos actuales: {wallet.credits}")
db.close()
