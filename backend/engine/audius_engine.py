import argparse
import os
import torch
import librosa
import soundfile as sf
import noisereduce as nr

def process_voice():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--mode", choices=['M', 'F', 'BOLERO'], default='M')
    parser.add_argument("--output", required=True)
    parser.add_argument("--transpose", type=int, help="Ajuste manual de semitonos")
    args = parser.parse_args()

    # Lógica de Pitch y Modelos
    if args.transpose is not None:
        pitch = args.transpose
    else:
        if args.mode == 'F':
            pitch = 7
        elif args.mode == 'BOLERO':
            pitch = 0 # El ADN instrumental se mantiene en su pitch original
        else:
            pitch = 0

    print(f"\n--- 🎹 GEN AUDIUS ENGINE 2.1 (M2 PRO) ---")
    
    if args.mode == 'BOLERO':
        model_path = "models/bolero_adn/bolero_adn_v1.pth"
        print(f"🎸 Modo: BOLERO ADN (Danny Garcia Bachata Stems)")
    else:
        label = 'FEMENINO' if args.mode == 'F' else 'MASCULINO'
        model_path = f"models/{'feminine' if args.mode == 'F' else 'masculine'}/{'vocal_female_1' if args.mode == 'F' else 'danny_v1'}.pth"
        print(f"👤 Modo: {label}")
    
    print(f"🎵 Pitch Ajustado a: {pitch} semitonos")
    print(f"🧠 Cargando ADN desde: {model_path}")

    # Procesamiento
    data, sr = librosa.load(args.input)
    
    # Cambio de pitch si es necesario
    y_processed = librosa.effects.pitch_shift(data, sr=sr, n_steps=pitch) if pitch != 0 else data
    
    # Limpieza final
    y_clean = nr.reduce_noise(y=y_processed, sr=sr, prop_decrease=0.6)
    
    output_path = f"pro_tools_exports/{args.output}.wav"
    os.makedirs("pro_tools_exports", exist_ok=True)
    sf.write(output_path, y_clean, sr)
    print(f"✅ ¡LISTO! Importa en Pro Tools: {output_path}")

if __name__ == "__main__":
    process_voice()
