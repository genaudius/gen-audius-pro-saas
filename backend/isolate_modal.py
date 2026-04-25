import sys
import os
from sqlalchemy import text

# Path to the backend directory
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, APIConfig, engine

def isolate_modal_provider():
    db = SessionLocal()
    try:
        # 1. Deactivate all music providers except MODAL and MASTERCHANNEL (mastering)
        db.query(APIConfig).filter(APIConfig.provider != "MODAL", APIConfig.provider != "MASTERCHANNEL").update({"status": "inactive"})
        print("[INFO] Deactivated all other music generation providers.")
        
        # 2. Ensure MODAL is active and has priority 1
        modal = db.query(APIConfig).filter(APIConfig.provider == "MODAL").first()
        if not modal:
            # If not seeded yet, create it
            modal = APIConfig(
                provider="MODAL",
                api_key=os.getenv("MODAL_API_KEY", "ak-iS5tmkHUKb26JuYgbCCyr3"),
                base_url=os.getenv("MODAL_API_URL", "https://dagrabastudio--gen-audius-saas-core-fastapi-app.modal.run"),
                status="active",
                priority=1,
                cost_per_gen=10,
                display_name="Gen Audius (Modal GPU)"
            )
            db.add(modal)
            print("[SUCCESS] Created MODAL provider entry.")
        else:
            modal.status = "active"
            modal.priority = 1
            modal.api_key = os.getenv("MODAL_API_KEY", modal.api_key)
            modal.base_url = os.getenv("MODAL_API_URL", modal.base_url)
            print("[SUCCESS] MODAL set as primary active provider (Priority 1).")
            
        db.commit()
        print("[SUCCESS] Database isolation complete. MODAL is now the only active engine.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error isolating provider: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    isolate_modal_provider()
