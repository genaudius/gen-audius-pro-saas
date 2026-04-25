import requests
import json

url = "http://localhost:8005/api/music/generate-lyrics"
payload = {
    "theme": "Una historia de éxito desde Santo Domingo hasta el mundo",
    "genre": "Bachata",
    "lang": "es"
}

headers = {
    "Content-Type": "application/json",
    "X-User-ID": "current_user"
}

print(f"[TEST] Enviando peticion a {url}...")
try:
    response = requests.post(url, json=payload, timeout=180)
    print(f"Status: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")
