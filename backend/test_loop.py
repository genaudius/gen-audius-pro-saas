import requests
import time

base_url = "http://127.0.0.1:8005"
tid = "fea575faec9e1f6f5c579d4e180d1faf"

for i in range(120):
    print(f"Polling {i}")
    try:
        p = requests.get(f"{base_url}/api/music/feed/{tid}")
        print(p.status_code, p.text)
        if '"status":"complete"' in p.text or "failed" in p.text or p.status_code != 200:
            break
    except Exception as e:
        print("EXCEPTION:", e)
        break
    time.sleep(3)
