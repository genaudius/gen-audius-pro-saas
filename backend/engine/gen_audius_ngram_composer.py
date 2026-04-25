import numpy as np
import soundfile as sf
import random
import os
import time
from collections import Counter

# --- 🧠 GEN AUDIUS v15.0: N-GRAM AUTOREGRESSIVE ENGINE (DANNY GARCIA DNA) ---

# 1. MAPEO DE FRECUENCIAS (ADN Tonal)
note_frequencies = {
    'C4': 261.63, 'C#4': 277.18, 'Db4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'Gb4': 369.99,
    'G4': 392.00, 'G#4': 415.30, 'Ab4': 415.30, 'A4': 440.00, 'A#4': 466.16,
    'Bb4': 466.16, 'B4': 493.88, 'Am4': 220.00, 'Bm4': 246.94, 'C5': 523.25,
    'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
    'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
}

# 2. CONJUNTO DE ENTRENAMIENTO (Diferentes canciones de Danny Garcia)
# Twinkle Twinkle como base de estructura
twinkle_twinkle_notes = [
    'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4',
    'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4',
    'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4',
    'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4',
    'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4',
    'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'
]

# Puedes añadir más canciones aquí para que la IA aprenda más variaciones
cancion_custom = [
    'C4', 'C4', 'D4', 'C4', 'F4', 'E4', 'C4', 'C4', 'D4', 'C4', 'G4', 'F4',
    'C4', 'C4', 'C4', 'A4', 'F4', 'E4', 'D4', 'A#4', 'A#4', 'A4', 'F4', 'G4', 'F4'
]

training_data = twinkle_twinkle_notes + cancion_custom

# 3. MOTOR DE PREDICCIÓN N-GRAM
def get_ngrams(sequence, n):
    return [tuple(sequence[i:i+n]) for i in range(len(sequence)-n+1)]

def predict_next_note(training_notes, current_sequence, n=4):
    """
    Predice la siguiente nota basa en los últimos (n-1) elementos.
    """
    if len(current_sequence) < n - 1:
        return random.choice(list(note_frequencies.keys()))

    # Tomamos el contexto actual (las últimas n-1 notas)
    context = tuple(current_sequence[-(n-1):])
    
    # Buscamos todos los n-gramas en el entrenamiento que empiecen con este contexto
    ngrams = get_ngrams(training_notes, n)
    possibilities = [gram[-1] for gram in ngrams if gram[:-1] == context]
    
    if not possibilities:
        # Si la secuencia es nueva, devolvemos una nota al azar del entrenamiento
        return random.choice(training_notes)
    
    # Elegimos la más frecuente o usamos pesos probabilísticos
    counts = Counter(possibilities)
    most_common = counts.most_common(1)[0][0]
    
    # Añadimos un poco de aleatoriedad controlada (Stochastic prediction)
    if random.random() > 0.8:
        return random.choice(list(counts.keys()))
    
    return most_common

# 4. GENERADOR AUTOREGRESIVO GEN AUDIUS
def generate_ngram_song(training_notes, initial_sequence, length=42, n=4):
    print(f"🎼 Generando canción autoregresiva (Contexto n={n})...")
    new_song = list(initial_sequence)
    
    while len(new_song) < length:
        next_note = predict_next_note(training_notes, new_song, n=n)
        new_song.append(next_note)
        
    return new_song

# 5. RENDERIZER SINUSOIDAL (Para escuchar sin Pro Tools)
def render_song_to_wav(song_notes, filename="gen_audius_ngram_output.wav"):
    sr = 44100
    duration_per_note = 0.45 # Segundos
    full_audio = []

    print(f"🎹 Renderizando {len(song_notes)} notas a audio sinusoidal...")
    
    for note in song_notes:
        freq = note_frequencies.get(note)
        if freq:
            t = np.linspace(0, duration_per_note, int(sr * duration_per_note), endpoint=False)
            # Generamos onda senoidal pura para el DNAMonitor
            wave = 0.5 * np.sin(2 * np.pi * freq * t)
            
            # Aplicamos un pequeño fade out para evitar clicks
            fade = np.linspace(1.0, 0.0, len(wave))**2
            wave *= fade
            
            full_audio.extend(wave)
        else:
            # Silencio si la nota no existe
            full_audio.extend(np.zeros(int(sr * duration_per_note)))

    sf.write(filename, np.array(full_audio), sr)
    print(f"✅ Canción exportada: {filename}")

if __name__ == "__main__":
    print("\n--- 🧠 GEN AUDIUS v15.0: N-GRAM PROBABILITY ENGINE ---")
    
    # Secuencia inicial Danny Garcia
    secuencia_inicial = ['C4', 'C4', 'G4', 'G4']
    
    # Generamos la nueva canción basada en probabilidades
    nueva_cancion = generate_ngram_song(training_data, secuencia_inicial, length=60, n=5)
    
    print(f"🎵 Secuencia Generada: {nueva_cancion}")
    
    # Renderizamos para escuchar
    render_song_to_wav(nueva_cancion, "GEN_AUDIUS_NGRAM_DANNY.wav")
