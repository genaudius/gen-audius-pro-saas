from database import SessionLocal, APIConfig
import sys

def activate_modal():
    db = SessionLocal()
    try:
        m = db.query(APIConfig).filter(APIConfig.provider == 'MODAL').first()
        if not m:
            print("Creating new MODAL config...")
            m = APIConfig(provider='MODAL')
            db.add(m)
        
        m.status = 'active'
        m.api_key = 'ak-iS5tmkHUKb26JuYgbCCyr3'
        m.endpoint = 'https://dagrabastudio--gen-audius-saas-core-fastapi-app.modal.run'
        
        db.commit()
        print("✅ MODAL ACTIVADO EN LOCAL")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    activate_modal()
