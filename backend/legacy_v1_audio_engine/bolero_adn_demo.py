import os
import librosa
import numpy as np
import soundfile as sf
from tqdm import tqdm

def create_real_adn_song():
    print("\n--- 🎹 GEN AUDIUS: MEZCLA REAL ADN (DANNY GARCIA) ---")
    stems_dir = "Bolero_ADN"
    
    # Definimos la prioridad de los instrumentos para la mezcla profesional
    # Estos son los archivos exactos que encontramos en tu carpeta
    instrumentos = [
        ("Bass.wav", 1.1),
        ("Requinto.wav", 1.2),
        ("Bongo.wav", 0.9),
        ("Guira.wav", 0.8),
        ("AC PIANO.wav", 0.7),
        ("Conga.wav", 0.8),
        ("Kit.wav", 0.7),
        ("Timbal.wav", 0.7),
        ("PAD.wav", 0.4),
        ("Segunda Guitarra.wav", 0.9)
    ]
    
    mixed_audio = None
    sample_rate = 44100
    
    # Buscamos la duración más corta de los stems para que la mezcla sea uniforme
    print("🎼 Cargando y balanceando tus instrumentos reales...")
    
    data_list = []
    min_len = float('inf')

    for stem_name, gain in tqdm(instrumentos, desc="Cargando Stems"):
        path = os.path.join(stems_dir, stem_name)
        if os.path.exists(path):
            data, sr = librosa.load(path, sr=sample_rate)
            data = data * gain # Aplicamos el gain individual
            data_list.append(data)
            if len(data) < min_len:
                min_len = len(data)
        else:
            print(f"⚠️  Aviso: No se encontró el stem {stem_name}")

    if not data_list:
        print("❌ Error: No se encontraron stems para mezclar.")
        return

    # Mezclamos los canales
    print(f"🎚️  Sumando instrumentos ({len(data_list)} pistas)...")
    mixed_audio = np.zeros(min_len)
    for data in data_list:
        mixed_audio += data[:min_len]
        
    # Normalización Final (Soft Clipping para evitar distorsión)
    max_val = np.max(np.abs(mixed_audio))
    if max_val > 0:
        mixed_audio = mixed_audio / max_val
    
    output_path = "mix_real_danny_garcia_adn.wav"
    sf.write(output_path, mixed_audio, sample_rate)
    
    print(f"\n✅ ¡MEZCLA REAL COMPLETADA!")
    print(f"📍 Archivo generado: {output_path}")
    print("Esta versión tiene tu swing Bachata/Bolero real, porque eres TÚ tocando.")

if __name__ == "__main__":
    create_real_adn_song()
