import requests
import json
import os
from dotenv import load_dotenv

# Load env from backend
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

BASE_URL = os.getenv("MODAL_API_URL", "https://dagrabastudio--gen-audius-saas-core-fastapi-app.modal.run")
TOKEN_ID = "ak-iS5tmkHUKb26JuYgbCCyr3"

test_variants = [
    {"name": "Local .env Key", "key": os.getenv("MODAL_API_KEY")},
    {"name": "Token ID (ak-...)", "key": TOKEN_ID},
    {"name": "Dev Fallback", "key": "DEV_MODE_ACTIVE"},
    {"name": "Empty Header", "key": None},
    {"name": "Lower case Header", "key": TOKEN_ID.lower()},
]

def test_auth():
    print(f"--- DIAGNOSTIC TEST: Modal Auth at {BASE_URL} ---")
    
    payload = {
        "task_id": "diag_test_001",
        "prompt": "Test generation",
        "task_type": "Generation"
    }

    for variant in test_variants:
        headers = {"Content-Type": "application/json"}
        if variant["key"]:
            headers["X-GenAudius-Key"] = variant["key"]
        
        print(f"\n[TRYING] {variant['name']} (Key: {variant['key']})")
        try:
            response = requests.post(
                f"{BASE_URL}/v1/generate", 
                json=payload, 
                headers=headers,
                timeout=10
            )
            print(f"[RESULT] Status: {response.status_code}")
            if response.status_code == 200:
                print(f"SUCCESS! This is the correct key.")
                if "task_id" in response.text:
                   print(f"Data: {response.text}")
            else:
                print(f"FAILED. Response: {response.text}")
        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    test_auth()
