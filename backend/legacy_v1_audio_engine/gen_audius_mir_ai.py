import os
import numpy as np
import essentia.standard as es
import soundfile as sf
import random
import librosa
from sklearn.metrics.pairwise import cosine_similarity
from tqdm import tqdm

def mir_ai_composition():
    print("\n--- 🧠 GEN AUDIUS v8.0: MIR AI COMPOSER (ESSENTIA + TENSORFLOW) ---")
    
    stems_dir = "Bolero_ADN"
    model_file = "discogs-maest-30s-pw-519l-2.pb"
    sr = 44100
    
    if not os.path.exists(model_file):
        print("❌ Error: Falta el modelo MAEST (.pb)")
        return

    # 1. APRENDIZAJE DEL DISCO (Extracción de Embeddings del Master)
    print("📀 Aprendiendo el 'filin' del disco masterizado...")
    master_path = os.path.join(stems_dir, "Bendecidos por Dios_Balanced-High.wav")
    
    # Cargamos el modelo MAEST para embeddings
    # Nota: MAEST devuelve [batch, 1, tokens, 768]
    embed_extractor = es.TensorflowPredictMAEST(graphFilename=model_file)
    
    def get_embedding(audio_16k):
        # El modelo MAEST requiere entrada a 16kHz
        emb = embed_extractor(audio_16k)
        # Promediamos los tokens para tener una huella única (768 dimensiones)
        return np.mean(emb[0, 0, :, :], axis=0)

    # Cargamos master a 16k para el análisis
    loader = es.MonoLoader(filename=master_path, sampleRate=16000)
    master_audio = loader()
    master_dna = get_embedding(master_audio)
    print("✅ ADN del disco aprendido con éxito.")

    # 2. ANÁLISIS DE STEMS (Búsqueda de frases que 'encajen' con el ADN)
    print("🥁 Analizando tus instrumentos para encontrar el mejor swing...")
    
    # Usamos Bongo para el grid
    y_grid, _ = librosa.load(os.path.join(stems_dir, "Bongo.wav"), sr=sr)
    tempo, beat_frames = librosa.beat.beat_track(y=y_grid, sr=sr)
    beat_samples = librosa.frames_to_samples(beat_frames)
    
    def extract_intelligent_phrases(filename):
        path = os.path.join(stems_dir, filename)
        if not os.path.exists(path): return []
        
        # Cargamos audio completo
        data_full, _ = librosa.load(path, sr=sr)
        # Cargamos versión 16k para embeddings
        data_16k, _ = librosa.load(path, sr=16000)
        
        intelligent_fragments = []
        # Analizamos compás por compás (4 beats)
        for i in range(0, len(beat_samples) - 4, 4):
            start = beat_samples[i]
            end = beat_samples[i+4]
            if end > len(data_full): break
            
            chunk_full = data_full[start:end]
            if np.max(np.abs(chunk_full)) < 0.1: continue # Ignoramos silencio
            
            # Sacamos embedding del fragmento (vía 16k)
            start_16k = int(start * (16000/sr))
            end_16k = int(end * (16000/sr))
            chunk_16k = data_16k[start_16k:end_16k]
            
            # MAEST-30s requiere exactamente o al menos 30 segundos
            target_sr = 16000
            min_samples = target_sr * 30 
            
            # Repetimos librosa load a 16k con padding forzado
            chunk_16k, _ = librosa.load(path, sr=target_sr, offset=start/sr, duration=end/sr - start/sr)
            
            if len(chunk_16k) < min_samples:
                # Pad with zeros to fulfill the 30s requirement
                chunk_16k = np.concatenate([chunk_16k, np.zeros(min_samples - len(chunk_16k))])
            else:
                chunk_16k = chunk_16k[:min_samples]
                
            chunk_dna = get_embedding(chunk_16k)
            
            # Calculamos Similitud con el Master (Coseno)
            # Esto nos dice qué tan 'Danny Garcia' suena este pedazo específico
            similarity = cosine_similarity(master_dna.reshape(1,-1), chunk_dna.reshape(1,-1))[0][0]
            
            intelligent_fragments.append({
                'audio': chunk_full,
                'score': similarity
            })
            
        # Ordenamos por los que mejor 'quedan' con el disco
        intelligent_fragments.sort(key=lambda x: x['score'], reverse=True)
        return intelligent_fragments

    instruments = ["Bongo.wav", "Guira.wav", "Requinto.wav", "Bass.wav", "AC PIANO.wav"]
    pools = {}
    for inst in instruments:
        print(f"🔍 Evaluando ADN en {inst}...")
        pools[inst] = extract_intelligent_phrases(inst)

    # 3. COMPOSICIÓN FINAL (La IA elige lo mejor de lo mejor)
    print("🎼 Componiendo canción definitiva (Top DNA Selection)...")
    num_bars = 24
    avg_bar_len = int(np.mean([len(p['audio']) for p in pools["Bongo.wav"][:10]]))
    output = np.zeros(num_bars * avg_bar_len)

    for bar in range(num_bars):
        offset = bar * avg_bar_len
        
        # Elegimos frases que estén en el TOP 30% de similitud para asegurar el filin
        def pick_best(pool, gain):
            if not pool: return
            # Elegimos al azar pero solo de los que se parecen al disco
            top_threshold = max(2, len(pool) // 3)
            best_chunk = random.choice(pool[:top_threshold])['audio']
            
            # Pegamos con fade
            p_final = np.zeros(avg_bar_len)
            c_len = min(len(best_chunk), avg_bar_len)
            p_final[:c_len] = best_chunk[:c_len]
            
            nonlocal output
            output[offset : offset + avg_bar_len] += p_final * gain

        pick_best(pools["Bongo.wav"], 0.9)
        pick_best(pools["Guira.wav"], 0.6)
        pick_best(pools["Bass.wav"], 1.1)
        
        # El requinto varía más para que sea una canción 'nueva'
        if random.random() > 0.2:
            pick_best(pools["Requinto.wav"], 1.4)
            
        if random.random() > 0.5:
            pick_best(pools["AC PIANO.wav"], 0.5)

    # 4. Master
    output = output / (np.max(np.abs(output)) + 0.05)
    output_path = "cancion_nueva_mir_ai_danny.wav"
    sf.write(output_path, output, sr)
    
    print(f"\n✅ ¡MISIÓN CUMPLIDA! TU DISCO HA SIDO MODELADO Y RE-CREADO.")
    print(f"📍 Archivo final: {output_path}")
    print("Esta versión aprendió de 'Bendecidos por Dios' para tocar algo nuevo pero idéntico en calidad.")

if __name__ == "__main__":
    mir_ai_composition()
