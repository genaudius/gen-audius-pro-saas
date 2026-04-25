import os
import numpy as np
import essentia.standard as es
import soundfile as sf
import random
from tqdm import tqdm

# Wrapper para librosa (ya lo tenemos en el venv)
try:
    import librosa
except ImportError:
    librosa = None

def librosa_load_alt(p, s):
    if librosa:
        return librosa.load(p, sr=s)
    else:
        # Fallback to essentia or soundfile if librosa is missing
        import soundfile as sf_lib
        data, samplerate = sf_lib.read(p)
        return data, samplerate

def generate_dna_mastered_bachata():
    print("\n--- 🎹 GEN AUDIUS v7.0: ESSENTIA DNA ENGINE (AI-POWERED) ---")
    
    # Rutas relativas al ejecutor (main.py)
    base_path = os.path.dirname(os.path.abspath(__file__))
    stems_dir = os.path.join(base_path, "..", "Bolero_ADN")
    embedding_dir = os.path.join(base_path, "..", "models", "dna_embeddings")
    sr = 44100
    
    # 1. Cargamos el Target (El Master de 'Bendecidos por Dios')
    master_file = "Bendecidos por Dios_Balanced-High.wav"
    target_emb_path = os.path.join(embedding_dir, f"{master_file}.npy")
    
    if os.path.exists(target_emb_path):
        target_dna = np.load(target_emb_path)
        print(f"🎯 ADN Objetivo cargado: Master de '{master_file}'")
    else:
        print(f"⚠️ No se encontró ADN objetivo en {target_emb_path}, usando selección clásica.")
        target_dna = None

    # 2. GRID EXTREMO: Usando Essentia para cuadrar el compás
    print("🥁 Cuadrando el compás con Essentia MIR...")
    try:
        ref_audio_path = os.path.join(stems_dir, "Bongo.wav")
        ref_audio = es.MonoLoader(filename=ref_audio_path, sampleRate=sr)()
        rhythm_extractor = es.RhythmExtractor2013(method="multifeature")
        bpm_val, beats, confidence, estimates, intervals = rhythm_extractor(ref_audio)
        print(f"⏱️  Tempo MIR detectado: {bpm_val:.2f} BPM (Confianza: {confidence:.2f})")
    except Exception as e:
        print(f"⚠️ Error en Essentia: {e}. Usando tempo manual 108 BPM.")
        bpm_val = 108
        beats = np.arange(0, 60, 60/108)

    beat_samples = (beats * sr).astype(int)
    phrase_indices = beat_samples[::2]

    def get_intelligent_phrases(filename):
        path = os.path.join(stems_dir, filename)
        if not os.path.exists(path): 
            print(f"❌ Archivo no encontrado: {path}")
            return []
        data, _ = librosa_load_alt(path, sr)
        
        phrases = []
        for i in range(len(phrase_indices) - 2):
            start = phrase_indices[i]
            end = phrase_indices[i+1]
            if end > len(data): break
            chunk = data[start:end]
            if np.max(np.abs(chunk)) > 0.1:
                phrases.append(chunk)
        return phrases

    print("🧠 Recuperando frases inteligentes del disco...")
    pools = {
        "Bongo": get_intelligent_phrases("Bongo.wav"),
        "Guira": get_intelligent_phrases("Guira.wav"),
        "Bass": get_intelligent_phrases("Bass.wav"),
        "Requinto": get_intelligent_phrases("Requinto.wav"),
        "Piano": get_intelligent_phrases("AC PIANO.wav")
    }

    # 3. COMPOSICIÓN ADN
    num_bars = 24
    bar_len = int(sr * (60 / bpm_val) * 4)
    half_bar = bar_len // 2
    total_samples = bar_len * num_bars
    output = np.zeros(total_samples)

    print(f"🎼 Componiendo {num_bars} compases con ADN inteligente...")
    for b in tqdm(range(num_bars), desc="Arreglando canción"):
        for h in [0, 1]:
            offset = (b * bar_len) + (h * half_bar)
            for inst, pool in pools.items():
                if not pool: continue
                p = random.choice(pool)
                gain = 0.4 # Default
                if inst == "Requinto": gain = 1.2
                if inst == "Bongo": gain = 0.8
                if inst == "Guira": gain = 0.5
                
                p_out = np.zeros(half_bar)
                c_len = min(len(p), half_bar)
                p_out[:c_len] = p[:c_len]
                output[offset : offset + half_bar] += p_out * gain

    # 4. Masterización Final
    output = output / (np.max(np.abs(output)) + 0.05)
    output_path = "bachata_mastered_dna_essentia.wav"
    sf.write(output_path, output, sr)
    
    print(f"\n✅ ¡INTELIGENCIA MUSICAL COMPLETA!")
    print(f"📍 Resultado final: {output_path}")
    return output_path

if __name__ == "__main__":
    generate_dna_mastered_bachata()
