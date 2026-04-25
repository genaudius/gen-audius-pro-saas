import os
import librosa
import numpy as np
import soundfile as sf
import random
from tqdm import tqdm

def generate_infinite_bachata():
    print("\n--- 🎹 GEN AUDIUS: MOTOR DE COMPOSICIÓN INFINITA (ADN DANNY) ---")
    stems_dir = "Bolero_ADN"
    sr = 44100
    
    # 1. Función para extraer "HITS" (Notas/Golpes individuales) basada en Onsets
    def extract_notes(filename, top_n=25):
        path = os.path.join(stems_dir, filename)
        if not os.path.exists(path): 
            print(f"⚠️  No se encontró el stem {filename}")
            return []
            
        print(f"🔍 Analizando ataques (onsets) en: {filename}...")
        data, _ = librosa.load(path, sr=sr)
        
        # Detectamos los inicios de nota (onsets)
        onset_frames = librosa.onset.onset_detect(y=data, sr=sr, hop_length=512, backtrack=True)
        onset_samples = librosa.frames_to_samples(onset_frames, hop_length=512)
        
        samples = []
        # Extraemos fragmentos de audio basados en los onsets
        for i in range(len(onset_samples) - 1):
            start = onset_samples[i]
            end = onset_samples[i+1]
            # Limitamos la duración máxima de la muestra para evitar ruidos largos (0.5 seg max)
            max_dur = int(sr * 0.5)
            end = min(end, start + max_dur)
            
            sample = data[start:end]
            if np.max(np.abs(sample)) > 0.05: # Solo muestras con volumen real
                samples.append(sample)
                
        if not samples: return []
        
        # Seleccionamos una muestra aleatoria para el "pool"
        return random.sample(samples, min(len(samples), top_n))

    # 2. Preparamos el "Instrumental" (Tus sonidos como muestras)
    print("🧠 Extrayendo ADN musical...")
    bongo_hits = extract_notes("Bongo.wav", 20)
    guira_hits = extract_notes("Guira.wav", 20)
    requinto_notes = extract_notes("Requinto.wav", 40)
    bass_notes = extract_notes("Bass.wav", 15)
    piano_notes = extract_notes("AC PIANO.wav", 15)

    # 3. COMPOSITOR PRO: Polifonía y Envolventes (4/4 Bachata)
    print("🎼 Orquestando con polifonía y desvanecimientos suaves...")
    duration_secs = 30
    total_samples = sr * duration_secs
    output = np.zeros(total_samples)
    
    bpm = 108 # Más calmo, más Bolero
    step_size = int(sr * (60 / bpm) / 4) # 1/16 note
    
    def play_sample(sample, start_pos, vol=1.0):
        if sample is None or len(sample) == 0: return
        # Aplicamos un fade-out suave de 50ms para evitar clics
        fade_len = min(len(sample), int(sr * 0.05))
        fade_curve = np.linspace(1.0, 0.0, fade_len)
        proc_sample = np.copy(sample)
        proc_sample[-fade_len:] *= fade_curve
        
        end_pos = min(start_pos + len(proc_sample), total_samples)
        write_len = end_pos - start_pos
        output[start_pos:end_pos] += proc_sample[:write_len] * vol

    print(f"🎚️  Engine: Polyphonic DNA Mixer | BPM: {bpm}")

    for step in range(0, total_samples - int(sr*2), step_size):
        m_step = (step // step_size) % 16
        beat = (m_step // 4) + 1
        
        # A. GÜIRA (Swing continuo con dinámica)
        if guira_hits:
            vel = 0.5 if m_step % 2 == 0 else 0.3
            play_sample(random.choice(guira_hits), step, vel)
            
        # B. BONGO (Martillo Bachatero Real)
        if bongo_hits:
            # Acento fuerte en el 4to tiempo
            if beat == 4 and m_step % 4 == 0:
                play_sample(random.choice(bongo_hits), step, 1.0)
            # Golpes fantasmas y apoyos
            elif m_step in [0, 4, 8, 12]: 
                play_sample(random.choice(bongo_hits), step, 0.7)
            elif m_step in [2, 6, 10, 14]:
                play_sample(random.choice(bongo_hits), step, 0.4)
            
        # C. BAJO (Síncopa de Tierra: 1 y 3 con decay largo)
        if bass_notes:
            if m_step == 0 or m_step == 8:
                play_sample(random.choice(bass_notes), step, 1.1)
            
        # D. REQUINTO (Fraseo Melódico Espaciado)
        if requinto_notes:
            # Solo permitimos notas en ciertos puntos del compás para que tenga lógica bachatera
            if m_step in [0, 3, 7, 11] and random.random() > 0.4:
                play_sample(random.choice(requinto_notes), step, 1.2)
            # Arpegio rápido ocasional
            elif m_step % 2 != 0 and random.random() > 0.8:
                play_sample(random.choice(requinto_notes), step, 0.6)

        # E. PIANO (Llenado armónico)
        if piano_notes and m_step == 0 and random.random() > 0.5:
            play_sample(random.choice(piano_notes), step, 0.5)

    # 4. Finalización: Normalización Inteligente
    print("✨ Realizando el Glue Mix final...")
    if np.max(np.abs(output)) > 0:
        output = output / (np.max(np.abs(output)) + 0.05)
    
    output_path = "bachata_dna_infinite_v3.wav"
    sf.write(output_path, output, sr)
    
    print(f"\n✅ ¡MÚSICA FLUYENDO!")
    print(f"📍 Escucha la v3.0: {output_path}")
    print("He añadido polifonía y fade-outs para que los instrumentos 'jalen' de forma orgánica.")

if __name__ == "__main__":
    generate_infinite_bachata()
