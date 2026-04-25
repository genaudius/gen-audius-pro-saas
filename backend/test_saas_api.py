import requests
import json

# --- CONFIGURACIÓN DEL CLIENTE EXTERNO ---
API_URL = "http://localhost:8005/api/music/generate-lyrics"
API_KEY = "ga_pNSR-EPeZ5Nx0ErSshBRgcq1JtKCF1LHnLNxadO4yi4"

payload = {
    "theme": "El poder de la IA en la música dominicana",
    "genre": "Bachata Moderna",
    "lang": "es"
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

print(f"📡 [SAAS TEST] Simulando petición de cliente externo...")
print(f"🔑 Usando API KEY: {API_KEY[:10]}...")

try:
    response = requests.post(API_URL, json=payload, headers=headers, timeout=300)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("\n✅ ¡ÉXITO! Respuesta del servidor:")
        print("-" * 30)
        print(data.get("lyrics", "No lyrics returned"))
        print("-" * 30)
    else:
        print(f"❌ Error: {response.text}")

except Exception as e:
    print(f"❌ Fallo en la conexión: {e}")
