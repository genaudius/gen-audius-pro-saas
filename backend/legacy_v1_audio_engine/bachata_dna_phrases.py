import os
import librosa
import numpy as np
import soundfile as sf
import random
from tqdm import tqdm

def generate_phrase_bachata():
    print("\n--- 🎹 GEN AUDIUS v4.0: MOTOR DE FRASES (DNA PHRASE ENGINE) ---")
    stems_dir = "Bolero_ADN"
    sr = 44100
    bpm = 108 # Ajustado a tu tempo real
    
    # Duración de un compás de 4 tiempos en muestras (aprox 2.2 seg)
    bar_samples = int(sr * (60 / bpm) * 4)
    # Usamos segmentos de 2 tiempos para dar más variedad al arreglo
    phrase_len = bar_samples // 2

    def extract_phrases(filename, length_samples):
        path = os.path.join(stems_dir, filename)
        if not os.path.exists(path): 
            print(f"⚠️  No se encontró el stem {filename}")
            return []
            
        print(f"🔍 Extrayendo frases reales de: {filename}...")
        data, _ = librosa.load(path, sr=sr)
        
        # Cortamos el stem en pedazos exactos basados en la rítmica
        phrases = []
        for i in range(0, len(data) - length_samples, length_samples):
            chunk = data[i : i + length_samples]
            # Solo guardamos frases con volumen real (evitamos silencios)
            if np.max(np.abs(chunk)) > 0.1:
                phrases.append(chunk)
        return phrases

    # Analizamos tus instrumentos reales por frases
    bongo_phrases = extract_phrases("Bongo.wav", phrase_len)
    guira_phrases = extract_phrases("Guira.wav", phrase_len)
    bass_phrases = extract_phrases("Bass.wav", phrase_len)
    requinto_phrases = extract_phrases("Requinto.wav", phrase_len)
    piano_phrases = extract_phrases("AC PIANO.wav", phrase_len)

    # 3. COMPOSITOR: Ensamblamos el arreglo nuevo de forma musical
    num_phrases = 32 # 16 compases aprox
    total_samples = phrase_len * num_phrases
    output = np.zeros(total_samples)

    print(f"🎼 Construyendo nueva composición con tus frases reales ({num_phrases} bloques)...")
    for i in range(num_phrases):
        offset = i * phrase_len
        
        # Mezcla rítmica (Bongo + Guira siempre caminan)
        if bongo_phrases:
            p = random.choice(bongo_phrases)
            output[offset : offset + len(p)] += p * 0.9
        
        if guira_phrases:
            p = random.choice(guira_phrases)
            output[offset : offset + len(p)] += p * 0.6
            
        # Bajo (El soporte)
        if bass_phrases:
            p = random.choice(bass_phrases)
            output[offset : offset + len(p)] += p * 1.0
            
        # Requinto (La voz líder, melodía nueva pero con tu swing)
        if requinto_phrases and random.random() > 0.3:
            p = random.choice(requinto_phrases)
            output[offset : offset + len(p)] += p * 1.2
            
        # Piano (Relleno armónico ocasional)
        if piano_phrases and random.random() > 0.6:
            p = random.choice(piano_phrases)
            output[offset : offset + len(p)] += p * 0.5

    # 4. Masterización Final
    print("✨ Limpiando y masterizando el nuevo arreglo...")
    max_val = np.max(np.abs(output))
    if max_val > 0:
        # Normalización con headroom de seguridad
        output = output / (max_val + 0.05)
    
    output_path = "bachata_infinita_phrases.wav"
    sf.write(output_path, output, sr)
    
    print(f"\n✅ ¡ARREGLO DE FRASES TERMINADO!")
    print(f"📍 Archivo: {output_path}")
    print("Esta versión mantiene tu swing real porque usa frases completas de tu ejecución.")

if __name__ == "__main__":
    generate_phrase_bachata()
