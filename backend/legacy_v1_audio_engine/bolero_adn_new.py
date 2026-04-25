import os
import librosa
import numpy as np
import soundfile as sf
from tqdm import tqdm

def create_rearranged_adn_song():
    print("\n--- 🎹 GEN AUDIUS: RE-ARREGLO DE ADN (DANNY GARCIA) ---")
    stems_dir = "Bolero_ADN"
    sample_rate = 44100
    
    # Lista de instrumentos para el re-arreglo
    ritmo_stems = ["Bongo.wav", "Guira.wav", "Kit.wav", "Timbal.wav", "Conga.wav"]
    base_stems = ["Bass.wav", "Segunda Guitarra.wav", "AC PIANO.wav"]
    lead_stems = ["Requinto.wav", "PAD.wav"]
    
    # Definimos dos secciones diferentes para alternar y crear una "nueva canción"
    # Sección A: Del segundo 20 al 30
    # Sección B: Del segundo 45 al 55
    secciones = [
        (int(sample_rate * 20), int(sample_rate * 10)), # (start, duration)
        (int(sample_rate * 45), int(sample_rate * 10))
    ]
    
    final_output = []
    
    print("🛠️  Slicing y re-ordenando tus instrumentos reales...")
    
    # Construimos una estructura simple: A -> B -> A
    for start, duration in secciones * 2: # Repetimos para crear un loop de 20 seg
        mixed_section = np.zeros(duration)
        
        # 1. Ritmo (Mantenemos el groove sólido)
        for rs in ritmo_stems:
            path = os.path.join(stems_dir, rs)
            if os.path.exists(path):
                data, _ = librosa.load(path, sr=sample_rate, offset=start/sample_rate, duration=duration/sample_rate)
                mixed_section += data[:duration] * 0.8
        
        # 2. Base (Armonía)
        for bs in base_stems:
            path = os.path.join(stems_dir, bs)
            if os.path.exists(path):
                data, _ = librosa.load(path, sr=sample_rate, offset=start/sample_rate, duration=duration/sample_rate)
                mixed_section += data[:duration] * 0.9
        
        # 3. Lead (Melodía de Requinto protagonista)
        for ls in lead_stems:
            path = os.path.join(stems_dir, ls)
            if os.path.exists(path):
                data, _ = librosa.load(path, sr=sample_rate, offset=start/sample_rate, duration=duration/sample_rate)
                gain = 1.3 if "Requinto" in ls else 0.5
                mixed_section += data[:duration] * gain
                
        final_output.append(mixed_section)

    # Concadenamos todos los fragmentos
    full_audio = np.concatenate(final_output)
    
    # Normalización con limitador suave para evitar picos
    max_val = np.max(np.abs(full_audio))
    if max_val > 0:
        full_audio = full_audio / max_val
    
    output_path = "nueva_cancion_adn_rearranged.wav"
    sf.write(output_path, full_audio, sample_rate)
    
    print(f"\n✅ ¡NUEVO ARREGLO GENERADO!")
    print(f"📍 Escritura completada: {output_path}")
    print("Esta es una estructura A-B-A-B creada re-ordenando tus propios instrumentos.")

if __name__ == "__main__":
    create_rearranged_adn_song()
