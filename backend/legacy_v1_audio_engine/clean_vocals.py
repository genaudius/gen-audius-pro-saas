import subprocess
import os

def clean_my_voice(input_file):
    print(f"--- GEN AUDIUS VOCAL CLEANER ---")
    if not os.path.exists(input_file):
        print(f"❌ No encuentro el archivo: {input_file}")
        return

    print(f"Limpiando voz y eliminando ruido de fondo...")
    # Usamos demucs para separar la voz (vocal) de todo lo demás (no_vocals)
    cmd = ["demucs", "--two-stems", "vocals", input_file]
    subprocess.run(cmd)
    
    print(f"\n✅ ¡Voz procesada! Busca en la carpeta 'separated' tu voz limpia.")

# CAMBIA 'tu_audio.wav' por el nombre real de tu archivo
clean_my_voice("tu_audio.wav") 
