import numpy as np
import soundfile as sf
import random
import os
import pretty_midi
import glob
from collections import Counter

# --- 🧠 GEN AUDIUS v16.0 PRO: REAL DNA N-GRAM ENGINE (DANNY GARCIA) ---

# 1. MAPEO DE FRECUENCIAS (Extendido por Danny)
def get_note_freq(note_name):
    try:
        # Usamos pretty_midi para convertir nombres a frecuencias
        pitch = pretty_midi.note_name_to_number(note_name)
        return 440.0 * (2.0 ** ((pitch - 69) / 12.0))
    except:
        return None

# 2. CARGA DE ADN REAL (De tus grabaciones)
def load_real_danny_dna():
    midi_folder = "GEN_AUDIUS_DNA_MIDI_ADN"
    midi_files = glob.glob(os.path.join(midi_folder, "*.mid"))
    
    total_notes = []
    print(f"🧬 Escaneando el Master Vault de Danny Garcia ({len(midi_files)} archivos encontrados)...")
    
    for midi_path in midi_files:
        try:
            pm = pretty_midi.PrettyMIDI(midi_path)
            # Solo cargamos notas de instrumentos melódicos (no percusión para este cerebro)
            for inst in pm.instruments:
                if not inst.is_drum:
                    notes = sorted(inst.notes, key=lambda x: x.start)
                    names = [pretty_midi.note_number_to_name(n.pitch) for n in notes]
                    total_notes.extend(names)
        except Exception as e:
            print(f"⚠️ Error cargando {midi_path}: {e}")
            
    return total_notes

# 3. MENTOR PROBABILÍSTICO (N-Grams)
def predict_next_note_pro(training_notes, current_sequence, n=5):
    if len(current_sequence) < n - 1:
        return random.choice(training_notes) if training_notes else "C4"

    context = tuple(current_sequence[-(n-1):])
    
    possibilities = []
    # Buscamos patrones en los datos reales
    for i in range(len(training_notes) - n + 1):
        gram = tuple(training_notes[i : i + n])
        if gram[:-1] == context:
            possibilities.append(gram[-1])
    
    if not possibilities:
        # Si el patrón es nuevo, intentamos con un contexto más corto (Back-off)
        if n > 2:
            return predict_next_note_pro(training_notes, current_sequence, n - 1)
        return random.choice(training_notes)
    
    # Elegimos lo que Danny tocaría normalmente
    counts = Counter(possibilities)
    
    # Aplicamos "Creatividad Audius" (Temperatura)
    # 90% probabilidad de lo más común, 10% algo libre
    if random.random() > 0.1:
        return counts.most_common(1)[0][0]
    else:
        return random.choice(list(counts.keys()))

# 4. GENERACIÓN AUTOREGRESIVA
def generate_danny_pro_song(training_data, length=64, n=5):
    if not training_data:
        print("❌ Error: No hay ADN real cargado en el sistema.")
        return []

    print(f"🎼 Componiendo canción con ADN real Danny Garcia (Memoria n={n})...")
    
    # Empezamos con una secuencia real de Danny
    start_idx = random.randint(0, len(training_data) - n)
    new_song = training_data[start_idx : start_idx + n - 1]
    
    while len(new_song) < length:
        next_note = predict_next_note_pro(training_data, new_song, n=n)
        new_song.append(next_note)
        
    return new_song

# 5. RENDER MONITOR PRO (Mastering Final)
def render_dna_to_wav(song_notes, filename="GEN_AUDIUS_PRO_NGRAM_REAL.wav"):
    sr = 44100
    bpm = 108
    note_duration = 60.0 / bpm * 0.5 # Corcheas de bolero
    full_audio = []

    print(f"🎹 Renderizando {len(song_notes)} notas con Color Danny Garcia...")
    
    for note in song_notes:
        freq = get_note_freq(note)
        if freq:
            t = np.linspace(0, note_duration, int(sr * note_duration), endpoint=False)
            
            # Onda con armónicos para que suene más a guitarra/instrumento real
            wave = 0.4 * np.sin(2 * np.pi * freq * t) # Fundamental
            wave += 0.2 * np.sin(2 * np.pi * freq * 2 * t) # 2do armónico
            wave += 0.1 * np.sin(2 * np.pi * freq * 3 * t) # 3er armónico
            
            # Envolvente Danny (Attack rápido, Decay suave)
            env = np.exp(-3 * t / note_duration)
            wave *= env
            
            full_audio.extend(wave)
        else:
            full_audio.extend(np.zeros(int(sr * note_duration)))

    audio_data = np.array(full_audio)
    # Master Normalization
    audio_data = audio_data / (np.max(np.abs(audio_data)) + 0.05)
    
    sf.write(filename, audio_data, sr)
    print(f"✅ ¡MASTER CON ADN REAL COMPLETADO!")
    print(f"📍 ESCÚCHALO AQUÍ: {filename}")

if __name__ == "__main__":
    print("\n--- 🧠 GEN AUDIUS v16.0 PRO: MASTER DNA ENGINE ---")
    
    # Alimentamos el cerebro con tus grabaciones reales
    danny_adn_real = load_real_danny_dna()
    
    if danny_adn_real:
        # Generamos una canción que fluye exactamente como tú
        cancion_inal_dna = generate_danny_pro_song(danny_adn_real, length=80, n=5)
        
        # Renderizamos el master
        render_dna_to_wav(cancion_inal_dna)
    else:
        print("⚠️ Por favor, corre primero 'gen_audius_dna_transcriber.py' para extraer tu ADN de los .wav")
