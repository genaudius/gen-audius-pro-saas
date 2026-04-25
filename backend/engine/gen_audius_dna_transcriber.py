import os
from basic_pitch.inference import predict_and_save
import glob

def transmute_audio_to_midi_dna():
    print("\n--- 🎹 GEN AUDIUS v9.5: DNA MIDI TRANSCRIBER (DANNY GARCIA) ---")
    
    vault_dir = "GEN_AUDIUS_DNA_VAULT"
    # El destino de las transcripciones Danny Garcia
    output_dir = "GEN_AUDIUS_DNA_MIDI_ADN"
    os.makedirs(output_dir, exist_ok=True)
    
    # Buscamos los stems en el Vault
    wav_files = glob.glob(os.path.join(vault_dir, "*.wav"))
    
    if not wav_files:
        print("⚠️ No hay ADN (.wav) en el Vault. Ejecuta 'gen_audius_dna_packager.py' primero.")
        return

    print(f"🧬 Iniciando transmutación de {len(wav_files)} elementos de ADN...")

    for wav_path in wav_files:
        filename = os.path.basename(wav_path)
        print(f"🔍 Transcribiendo {filename} a Notas MIDI...")

        # El modelo ONNX es el más estable en este entorno M2 Pro
        base_path = os.path.dirname(predict_and_save.__code__.co_filename)
        model_path = os.path.join(base_path, "saved_models", "icassp_2022", "nmp.onnx")
        
        # basic-pitch hace una transcripción polifónica robusta (Piano, Guitarra, etc.)
        predict_and_save(
            audio_path_list=[wav_path],
            output_directory=output_dir,
            save_midi=True,
            sonify_midi=False,
            save_model_outputs=False,
            save_notes=False,
            model_or_model_path=model_path,
            midi_tempo=108 # Manteniendo el BPM Gen Audius
        )
        
    print(f"\n✅ ¡TRANSMUTACIÓN EXITOSA!")
    print(f"📍 MIDI ADN guardado en: {output_dir}")
    print("Ya puedes arrastrar estos archivos directamente a tus instrumentos en Pro Tools.")

if __name__ == "__main__":
    transmute_audio_to_midi_dna()
