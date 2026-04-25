import os
import shutil

def pack_gen_audius_dna_vault():
    print("🚀 Empaquetando DANNY GARCIA DNA VAULT (Motor Gen Audius v9.0)...")
    
    vault_dir = "GEN_AUDIUS_DNA_VAULT"
    os.makedirs(vault_dir, exist_ok=True)
    
    # ADN clave para transmutación MIDI
    danny_garcia_dna = [
        "AC PIANO.wav",
        "Requinto.wav",
        "Bass.wav",
        "Bongo.wav"
    ]
    
    source_dir = "Bolero_ADN"
    
    for stem in danny_garcia_dna:
        src = os.path.join(source_dir, stem)
        dst = os.path.join(vault_dir, stem)
        if os.path.exists(src):
            print(f"🧬 Asegurando ADN de {stem}...")
            shutil.copy2(src, dst)
        else:
            print(f"⚠️ ADN de {stem} no encontrado")

    print(f"\n✅ ¡MISIÓN CUMPLIDA! El DANNY GARCIA DNA VAULT está listo para alimentar el Motor Gen Audius.")
    print("Sigue las instrucciones en 'GEN_AUDIUS_V9_COMMAND_CENTER.md'.")

if __name__ == "__main__":
    pack_gen_audius_dna_vault()
