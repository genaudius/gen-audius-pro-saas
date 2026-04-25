import os
import librosa
import numpy as np
import soundfile as sf
import random
from tqdm import tqdm

def generate_synced_dna_song():
    print("\n--- 🎹 GEN AUDIUS v6.0: GRID-SYNC DNA ENGINE (DANNY GARCIA) ---")
    stems_dir = "Bolero_ADN"
    sr = 44100
    
    # 1. ANALIZAR TEMPO Y BEATS (Fundamental para que 'estén en el compás')
    # Usamos el Bongo como referencia rítmica principal
    ref_path = os.path.join(stems_dir, "Bongo.wav")
    print(f"🥁 Sincronizando cerebro con el pulso de {os.path.basename(ref_path)}...")
    y_ref, _ = librosa.load(ref_path, sr=sr)
    
    # Detectamos el tempo y los pulsos (beats) reales de la grabación
    tempo, beat_frames = librosa.beat.beat_track(y=y_ref, sr=sr)
    beat_samples = librosa.frames_to_samples(beat_frames)
    
    # Aseguramos que el tempo sea un float único
    tempo_val = float(tempo[0]) if isinstance(tempo, np.ndarray) else float(tempo)
    print(f"⏱️  Tempo detectado: {tempo_val:.2f} BPM")
    print(f"📏 Grid de {len(beat_samples)} pulsos musicales identificado.")

    # 2. FUNCIÓN DE EXTRACCIÓN SINCRONIZADA
    def get_synced_chunks(filename):
        path = os.path.join(stems_dir, filename)
        if not os.path.exists(path): return []
        data, _ = librosa.load(path, sr=sr)
        
        chunks = []
        # Extraemos pedazos de 4 beats (1 compás exacto)
        for i in range(0, len(beat_samples) - 4, 4):
            start = beat_samples[i]
            end = beat_samples[i+4]
            chunk = data[start:end]
            # Validamos que el chunk tenga contenido musical
            if np.max(np.abs(chunk)) > 0.1:
                chunks.append(chunk)
        return chunks

    print("🧠 Aprendiendo los compases del disco...")
    # Creamos 'pools' de compases reales sincronizados al beat
    bongo_pool = get_synced_chunks("Bongo.wav")
    guira_pool = get_synced_chunks("Guira.wav")
    bass_pool = get_synced_chunks("Bass.wav")
    requinto_pool = get_synced_chunks("Requinto.wav")
    piano_pool = get_synced_chunks("AC PIANO.wav")

    # 3. COMPOSICIÓN ALEATORIA (Pero amarrada al compás)
    num_bars = 16
    # Usamos una duración promedio de compás para el output final
    avg_bar_len = int(np.mean([len(c) for c in bongo_pool]))
    total_samples = avg_bar_len * num_bars
    output = np.zeros(total_samples)

    print(f"🎼 Generando una canción INÉDITA (Mezclando compases al azar)...")
    
    for bar in range(num_bars):
        offset = bar * avg_bar_len
        
        # Mezclamos los instrumentos con selección aleatoria
        # Cada instrumento recibe una frase diferente del pool de su categoría
        
        def paste_chunk(pool, gain):
            if not pool: return
            p = random.choice(pool)
            # Forzamos que el fragmento tenga exactamente avg_bar_len para que no haya errores de compás
            p_final = np.zeros(avg_bar_len)
            copy_len = min(len(p), avg_bar_len)
            p_final[:copy_len] = p[:copy_len]
            
            nonlocal output
            output[offset : offset + avg_bar_len] += p_final * gain

        # RITMO (Shuffle de compases para crear una canción nueva)
        paste_chunk(bongo_pool, 0.9)
        paste_chunk(guira_pool, 0.6)
        
        # ARMONÍA
        paste_chunk(bass_pool, 1.0)
        
        # MELODÍA Y ADORNOS
        if random.random() > 0.3:
            paste_chunk(requinto_pool, 1.3)
        
        if random.random() > 0.6:
            paste_chunk(piano_pool, 0.5)

    # 4. Masterización Final
    output = output / (np.max(np.abs(output)) + 0.05)
    output_path = "bachata_adn_grid_sync.wav"
    sf.write(output_path, output, sr)
    
    print(f"\n✅ ¡COMPOSICIÓN SINCRONIZADA COMPLETADA!")
    print(f"📍 Archivo final: {output_path}")
    print("Todos los pedazos están alineados al 'Beat' real de tu grabación.")

if __name__ == "__main__":
    generate_synced_dna_song()
