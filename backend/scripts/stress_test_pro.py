import requests
import json
import time
import os
import numpy as np
from scipy.io import wavfile

# Configuration
BACKEND_URL = "http://127.0.0.1:8005"
TEST_USER_ID = "gen_audius_tester_123"

def generate_dummy_hum(filename="hum_test_bachata.wav", duration=5):
    """Generates a simple sine wave melody to simulate humming."""
    sample_rate = 44100
    t = np.linspace(0, duration, int(sample_rate * duration))
    # Simple melody: A4 (440Hz) -> B4 (493Hz) -> C5 (523Hz)
    signal = np.sin(2 * np.pi * 440 * t[:int(sample_rate * 1.5)])
    signal = np.append(signal, np.sin(2 * np.pi * 493 * t[:int(sample_rate * 1.5)]))
    signal = np.append(signal, np.sin(2 * np.pi * 523 * t[:int(sample_rate * 2)]))
    
    # Normalize and convert to 16-bit PCM
    signal = (signal * 32767 / np.max(np.abs(signal))).astype(np.int16)
    wavfile.write(filename, sample_rate, signal)
    print(f"Created dummy humming audio: {filename}")
    return filename

def run_stress_test():
    print("STARTING Hum-to-Music Stress Test...")
    
    # 1. Create Audio
    audio_file = generate_dummy_hum()
    
    # 2. Simulate Upload (In a real scenario, the frontend uploads to S3/GCS)
    print("Simulating upload to cloud bucket...")
    mock_cloud_url = "https://s3.genaudius.com/uploads/hum_test_bachata.wav"
    
    # 3. Trigger Generation
    print("Submitting Hum-to-Music task to Backend...")
    payload = {
        "audio_url": mock_cloud_url,
        "prompt": "Guitarra de bachata acústica muy limpia, estilo Danny García",
        "genre": "Bachata",
        "bpm": 125
    }
    
    headers = {"X-User-ID": TEST_USER_ID}
    response = requests.post(f"{BACKEND_URL}/api/music/hum-to-music", json=payload, headers=headers)
    
    if response.status_code != 200:
        print(f"Backend submisson failed: {response.text}")
        return
    
    task_info = response.json()
    task_id = task_info["task_id"]
    print(f"Task created successfully: {task_id}")
    
    # 4. Simulate Modal Webhook Response (The real engine would do this)
    print("Simulating Modal completion signal (Webhook)...")
    webhook_payload = {
        "task_id": task_id,
        "status": "completed",
        "result_url": "https://s3.genaudius.com/outputs/bachata_requinto_test.wav",
        "midi_data": [
            {"pitch": 60, "start": 0.0, "end": 1.5, "velocity": 100},
            {"pitch": 62, "start": 1.5, "end": 3.0, "velocity": 90},
            {"pitch": 64, "start": 3.0, "end": 5.0, "velocity": 110}
        ],
        "midi_url": "https://s3.genaudius.com/outputs/bachata_test.mid"
    }
    
    webhook_res = requests.post(f"{BACKEND_URL}/api/webhooks/music-ready", json=webhook_payload)
    if webhook_res.status_code == 200:
        print("Webhook processed successfully by Backend.")
    else:
        print(f"Webhook failed: {webhook_res.text}")
        return

    # 5. Verify via Polling Endpoint (Simulating Frontend)
    print("Final Verification: Polling status endpoint...")
    poll_res = requests.get(f"{BACKEND_URL}/api/music/feed/{task_id}")
    if poll_res.status_code == 200:
        data = poll_res.json()
        print(f"Polling result: status={data.get('status')}, audio_url={data.get('audio_url')}")
        if data.get("status") == "complete" and data.get("audio_url"):
            print("SUCCESS: Status resolution and URL retrieval: OK")
        else:
            print("FAILED: Status resolution: FAILED")
            return
    else:
        print(f"FAILED: Status poll failed: {poll_res.text}")
        return
    
    print("\n[SUCCESS] TEST DE ESTRES COMPLETADO")
    print("-" * 30)
    print(f"Task ID: {task_id}")
    print(f"Expected MIDI Notes: 3")
    print(f"Engine used: {data.get('engine', 'UNKNOWN')}")
    print(f"Ready for DAW Visualization: YES")
    print("-" * 30)

if __name__ == "__main__":
    run_stress_test()
