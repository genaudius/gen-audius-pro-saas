import torch
import numpy as np
import scipy.io.wavfile as wav
from transformers import MusicgenForConditionalGeneration, AutoProcessor
import time
import os

def create_bolero_bachata_song():
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"\n--- 🎹 GEN AUDIUS: CREANDO CANCIÓN (ADN DANNY GARCIA) ---")
    
    try:
        # Upgrade al modelo MEDIUM para mejor calidad de instrumentos y ejecución
        print("🧠 Cargando inteligencia PRO (MusicGen MEDIUM)...")
        model = MusicgenForConditionalGeneration.from_pretrained(
            "facebook/musicgen-medium", 
            torch_dtype=torch.float16
        ).to(device)
        
        processor = AutoProcessor.from_pretrained("facebook/musicgen-medium")
        
        # PROMPT ULTRA-ESPECÍFICO: Forzamos la estructura de instrumentos
        prompt = (
            "Professional Bolero Bachata arrangement, lead requinto guitar with intricate melodic runs, "
            "clear and crisp bongo martillo rhythm, metallic guira scraping, warm melodic bass lines, "
            "acoustic piano comping, high fidelity studio recording, 85 bpm, lush and romantic atmosphere"
        )
        
        print(f"🎵 Componiendo con ADN Danny Garcia (Modo PRO):")
        print(f"   Style: '{prompt}'")
        
        inputs = processor(text=[prompt], padding=True, return_tensors="pt").to(device)
        
        start_time = time.time()
        
        with torch.no_grad():
            print("✨ Generando audio en el M2 Pro (Garantizando calidad de ejecución)...")
            # Ajustamos parámetros de muestreo para evitar que 'toque mal'
            audio_values = model.generate(
                **inputs, 
                max_new_tokens=400, # Aprox 8 segundos de alta calidad
                do_sample=True,
                guidance_scale=3.5,
                temperature=1.0,
                top_k=250
            )
        
        # Procesamiento final del audio
        audio_data = audio_values[0, 0].cpu().float().numpy()
        
        # Normalización profesional
        if np.abs(audio_data).max() > 0:
            audio_data = audio_data / np.abs(audio_data).max()
        
        output_name = "creacion_bolero_bachata_adn.wav"
        
        # Guardar el archivo
        wav.write(output_name, rate=32000, data=(audio_data * 32767).astype(np.int16))
        
        duration = time.time() - start_time
        print(f"\n✅ ¡CANCIÓN CREADA CON ÉXITO! (Tiempo: {duration:.2f}s)")
        print(f"📍 Archivo listo: {output_name}")
        
        # Sugerencia de flujo
        print("\n--- PRÓXIMO PASO SUGERIDO ---")
        print(f"Puedes procesar tus voces sobre este beat usando:")
        print(f"./venv/bin/python audius_engine.py --input '{output_name}' --mode BOLERO --output 'master_final_audius'")

    except Exception as e:
        print(f"\n❌ ERROR EN LA COMPOSICIÓN: {e}")

if __name__ == "__main__":
    create_bolero_bachata_song()
