import requests
payload = {
    "prompt": "bachata romantica",
    "genre": "Bachata",
    "lyrics": "Ay mi amor",
    "voice": "M",
    "provider": "modal"
}
try:
    res = requests.post("http://localhost:8005/api/music/generate", json=payload, headers={"X-User-ID": "current_user"})
    print("Status:", res.status_code)
    try:
        print("JSON:", res.json())
    except:
        print("TEXT:", res.text)
except Exception as e:
    print("Exception:", e)
