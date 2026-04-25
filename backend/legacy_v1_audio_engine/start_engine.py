import torch
import numpy as np
import scipy.io.wavfile as wav
from transformers import MusicgenForConditionalGeneration, AutoProcessor
import time

# Usamos el chip MPS (Apple Silicon)
device = "mps" if torch.backends.mps.is_available() else "cpu"
print(f"\n--- GEN AUDIUS ENGINE: M2 PRO (SAFE MODE) ---")

try:
    print("Cargando cerebro musical en modo optimizado...")
    # Usamos float16 para que la GPU no sufra picos de energía
    model = MusicgenForConditionalGeneration.from_pretrained(
        "facebook/musicgen-small", 
        torch_dtype=torch.float16
    ).to(device)
    
    processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
    
    prompt = "Amapiano beat, deep log drum, smooth chords, high fidelity"
    print(f"Generando: '{prompt}'")
    
    inputs = processor(text=[prompt], padding=True, return_tensors="pt").to(device)
    
    start = time.time()
    # Generamos audio sin forzar el sistema
    with torch.no_grad():
        audio_values = model.generate(**inputs, max_new_tokens=256)
    
    # Convertimos de vuelta a float32 para guardar el archivo
    audio_data = audio_values[0, 0].cpu().float().numpy()
    
    # Normalización para que suene perfecto
    if np.abs(audio_data).max() > 0:
        audio_data = audio_data / np.abs(audio_data).max()
    
    wav.write("primer_hit_audius.wav", rate=32000, data=(audio_data * 32767).astype(np.int16))
    
    print(f"\n✅ ¡ESTABILIDAD CONFIRMADA! Tiempo: {time.time() - start:.2f}s")
    print("Archivo creado: 'primer_hit_audius.wav'")

except Exception as e:
    print(f"\n❌ ERROR: {e}")
