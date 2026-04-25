import requests
import json

# URL of the Master Studio orchestrator
url = "https://dagrabastudio--gen-audius-master-studio-maestro-orchestrator.modal.run"
payload = {
    "prompt": "una bachata romantica de amor",
    "genre": "Bachata",
    "visual_style": "artistic",
    "task_id": "test_001"
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
