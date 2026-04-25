import requests
import json

# URL of the SaaS Core app
url = "https://dagrabastudio--gen-audius-saas-core-fastapi-app.modal.run/v1/generate"
payload = {
    "prompt": "una bachata romantica de amor",
    "task_id": "test_saas_001",
    "task_type": "Generation"
}
headers = {
    "Content-Type": "application/json",
    "X-GenAudius-Key": "ak-iS5tmkHUKb26JuYgbCCyr3"
}

print(f"Testing POST to {url}...")
try:
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
