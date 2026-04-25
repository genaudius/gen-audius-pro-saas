import os
import librosa
import numpy as np
import soundfile as sf
import random
from tqdm import tqdm

def compose_new_bachata_from_dna():
    print("\n--- 🎹 GEN AUDIUS v5.0: COMPOSICIÓN INTELIGENTE (CEREBROS DE ADN) ---")
    stems_dir = "Bolero_ADN"
    sr = 44100
    bpm = 108 
    
    # 1. Cargamos las frases aprendidas de cada "Cerebro"
    bar_samples = int(sr * (60 / bpm) * 4)
    half_bar = bar_samples // 2

    def get_dna_phrases(filename, length):
        path = os.path.join(stems_dir, filename)
        if not os.path.exists(path): return []
        data, _ = librosa.load(path, sr=sr)
        phrases = [data[i : i+length] for i in range(0, len(data)-length, length) if np.max(np.abs(data[i:i+length])) > 0.15]
        return phrases

    print("🧠 Recuperando frases de los Cerebros Instrumentales...")
    # Requinto (Frases de adornos y punteos)
    requinto_pool = get_dna_phrases("Requinto.wav", half_bar)
    # Bongo (Frases de martillo y cortes)
    bongo_pool = get_dna_phrases("Bongo.wav", half_bar)
    # Bajo (Tumbao bachatero)
    bass_pool = get_dna_phrases("Bass.wav", half_bar)
    # Güira (Acompañamiento)
    guira_pool = get_dna_phrases("Guira.wav", half_bar)

    # 2. COMPOSICIÓN: Estructura Musical Nueva
    num_bars = 16
    total_samples = bar_samples * num_bars
    output = np.zeros(total_samples)

    print("🎼 Componiendo una canción NUEVA pero con tu ejecución real...")
    
    for bar in range(num_bars):
        # Para que sea una CANCIÓN DISTINTA, forzamos variaciones por compás
        # Elegimos frases al azar pero las mantenemos por compás para coherencia
        for h in [0, 1]:
            offset = (bar * bar_samples) + (h * half_bar)
            
            # Percusión (Siempre presente)
            if bongo_pool:
                # Cambiamos frase de bongo cada compás para que "toque" distinto
                p = random.choice(bongo_pool)
                output[offset : offset+len(p)] += p * 0.9
            
            if guira_pool:
                p = random.choice(guira_pool)
                output[offset : offset+len(p)] += p * 0.6
                
            # Bajo (Sincronizado)
            if bass_pool:
                p = random.choice(bass_pool)
                output[offset : offset+len(p)] += p * 1.0
                
            # Requinto (Fraseo dinámico)
            # En los compases impares, el requinto hace más "adornos"
            if requinto_pool:
                prob = 0.8 if bar % 2 == 0 else 0.4
                if random.random() < prob:
                    p = random.choice(requinto_pool)
                    output[offset : offset+len(p)] += p * 1.2

    # 3. Masterización Final
    print("✨ Consolidando la mezcla de ADN...")
    output = output / (np.max(np.abs(output)) + 0.05)
    
    output_path = "nueva_bachata_maestria_adn.wav"
    sf.write(output_path, output, sr)
    
    print(f"\n✅ ¡VÍCTORIA! CANCIÓN NUEVA COMPLETADA.")
    print(f"📍 Archivo: {output_path}")
    print("Esta versión usa tu MANO REAL para componer música que NUNCA habías grabado.")

if __name__ == "__main__":
    compose_new_bachata_from_dna()
