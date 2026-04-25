import os
import subprocess

folder_path = "mi-voz"
output_base = "voces-limpias"

if not os.path.exists(folder_path):
    print(f"❌ Danny, no encuentro la carpeta '{folder_path}'")
else:
    files = [f for f in os.listdir(folder_path) if f.endswith('.wav')]
    print(f"--- GEN AUDIUS BATCH CLEANER ---")
    print(f"Encontrados {len(files)} audios. Iniciando limpieza...")

    for file in files:
        input_file = os.path.join(folder_path, file)
        print(f"\n✨ Procesando: {file}")
        # Usamos demucs para dejar la voz impecable
        cmd = ["demucs", "--two-stems", "vocals", "-o", output_base, input_file]
        subprocess.run(cmd)

    print(f"\n✅ ¡TRABAJO TERMINADO! Revisa la carpeta '{output_base}'")
