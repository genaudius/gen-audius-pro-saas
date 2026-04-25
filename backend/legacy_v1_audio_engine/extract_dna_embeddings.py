import os
import numpy as np
import essentia.standard as es
import glob
from tqdm import tqdm

def extract_embeddings():
    print("\n--- 🧠 GEN AUDIUS: EXTRACCIÓN DE EMBEDDINGS (ESSENTIA MAEST) ---")
    
    model_file = "discogs-maest-30s-pw-519l-2.pb"
    stems_dir = "Bolero_ADN"
    output_dir = "models/dna_embeddings"
    os.makedirs(output_dir, exist_ok=True)

    if not os.path.exists(model_file):
        print(f"❌ Error: No se encontró el modelo {model_file}")
        return

    # Cargamos el extractor de TensorFlow (MAEST)
    # MAEST está optimizado para 16kHz
    loader = es.MonoLoader(sampleRate=16000)
    # TensorflowPredictMAEST es el que pidió el usuario
    # Requiere el archivo .pb
    model = es.TensorflowPredictMAEST(graphFilename=model_file)

    wav_files = glob.glob(os.path.join(stems_dir, "*.wav"))
    
    print(f"🔍 Analizando {len(wav_files)} archivos de tu disco...")

    for wav_path in tqdm(wav_files, desc="Procesando Stems"):
        try:
            filename = os.path.basename(wav_path)
            # 1. Cargar audio (Essentia requiere MonoLoader para MAEST)
            audio = es.MonoLoader(filename=wav_path, sampleRate=16000)()
            
            # 2. Extraer Embeddings (La huella digital musical)
            embeddings = model(audio)
            
            # 3. Guardar en formato numpy para el generador
            np_save_path = os.path.join(output_dir, f"{filename}.npy")
            np.save(np_save_path, embeddings)
            
        except Exception as e:
            print(f"⚠️ Error en {wav_path}: {e}")

    print(f"\n✅ ¡ADN EXTRAÍDO! Huellas digitales guardadas en {output_dir}")
    print("El sistema ahora sabe CÓMO suena tu disco a nivel atómico.")

if __name__ == "__main__":
    extract_embeddings()
