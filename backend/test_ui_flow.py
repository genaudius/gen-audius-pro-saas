import requests
import time
import sys

base_url = "http://127.0.0.1:8005"

payload = {
    "prompt": "bachata romantica de amor",
    "genre": "Bachata",
    "style": "Energetic",
    "lyrics": "",
    "voice": "M",
    "provider": "kie",
    "title": "Bachata"
}

print("-> Starting Generation")
r = requests.post(f"{base_url}/api/music/generate", json=payload, headers={"X-User-ID": "current_user"})
print("Status:", r.status_code)
try:
    res = r.json()
    print("Res:", res)
except:
    print("Text:", r.text)
    sys.exit(1)

if not res.get("success"):
    sys.exit(1)

tasks = res.get("tasks", [])
if not tasks:
    print("No tasks")
    sys.exit(1)

for t in tasks:
    tid = t["task_id"]
    print(f"-> Polling {tid}")
    p = requests.get(f"{base_url}/api/music/feed/{tid}")
    print("Poll Status:", p.status_code)
    print("Poll Res:", p.text)
