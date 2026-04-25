import os
import sys
import argparse
import torch
import librosa
import soundfile as sf
import numpy as np
import noisereduce as nr
from datetime import datetime

# Importación hipotética del core RVC (Danny, asegúrate de tener el repo RVC en el path o esta carpeta)
# Si no lo tienes, este script servirá de orquestador y aplicará el procesamiento previo/posterior.
try:
    # Intento de cargar componentes estándar de RVC si están en el sistema
    # from vc_infer_pipeline import VC 
    pass
except ImportError:
    print("⚠️  Aviso: Módulos de RVC Core no detectados. El script funcionará como procesador de Audio + Pipeline.")

def run_inference(input_path, gender):
    # 1. Configuración de Dispositivo (MPS para M2 Pro)
    if torch.backends.mps.is_available():
        device = torch.device("mps")
        print(f"🚀 Usando GPU (MPS) en Mac Mini M2 Pro")
    else:
        device = torch.device("cpu")
        print(f"⚠️  MPS no disponible, usando CPU")

    # 2. Configuración Dinámica por Género
    if gender.upper() == 'F':
        model_path = "models/feminine/vocal_female_1.pth"
        transpose = 12  # Una octava arriba
        print(f"👩 Modo FEMENINO: Cargando {model_path} (Transpose: +12)")
    else:
        model_path = "models/masculine/danny_v1.pth"
        transpose = 0
        print(f"👨 Modo MASCULINO: Cargando {model_path} (Transpose: 0)")

    # 3. Crear carpeta de salida
    output_dir = "outputs"
    os.makedirs(output_dir, exist_ok=True)

    # 4. Carga de Audio de Entrada
    print(f"📁 Cargando audio: {input_path}")
    audio, sr = librosa.load(input_path, sr=None)

    # 5. Pre-procesamiento: Pitch Shift (Si es para modo F, ajustamos el tono antes o durante el RVC)
    if transpose != 0:
        print(f"🎵 Aplicando transpose de {transpose} semitonos...")
        audio = librosa.effects.pitch_shift(audio, sr=sr, n_steps=transpose)

    # 6. Placeholder para Vocal Swap (RVC)
    # Aquí es donde el modelo .pth entra en acción.
    # Como el core de RVC es un conjunto de scripts externos,
    # Danny debe asegurarse de que este bloque llame a su 'infer_pack'.
    print(f"🧠 Simulando procesamiento RVC con modelo {os.path.basename(model_path)}...")
    # NOTA: En una implementación real, aquí llamaríamos a:
    # result_audio = vc.pipeline(model_path, audio, device=device, ...)
    result_audio = audio # Por ahora mantenemos el audio procesado con el pitch shift
    
    # 7. Post-procesamiento: Limpieza de Ruido (noisereduce)
    print(f"✨ Limpiando ruido final...")
    reduced_noise_audio = nr.reduce_noise(y=result_audio, sr=sr, prop_decrease=0.8)

    # 8. Guardar Resultado
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"rvc_{gender.lower()}_{os.path.basename(input_path)}"
    output_path = os.path.join(output_dir, output_filename)
    
    sf.write(output_path, reduced_noise_audio, sr)
    print(f"✅ ¡Proceso terminado! Archivo guardado en: {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gen Audius - RVC Inference (M2 Pro)")
    parser.add_argument("--input", type=str, required=True, help="Ruta al archivo .wav de entrada")
    parser.add_argument("--gender", type=str, choices=['M', 'F'], default='M', help="Género del modelo (M o F)")
    
    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"❌ Error: El archivo de entrada '{args.input}' no existe.")
        sys.exit(1)

    run_inference(args.input, args.gender)
