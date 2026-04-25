import os
import subprocess
import librosa
import soundfile as sf
import numpy as np

def listen_to_gen_audius_hit():
    print("\n--- 🎧 GEN AUDIUS v14.0: MASTER MONITOR (DANNY GARCIA) ---")
    
    # Rutas de archivos
    midi_path = "GEN_AUDIUS_HIT_DANNY_GARCIA/MIDI/Gen_Audius_Danny_Full_Band_v1.mid"
    vocal_path = "GEN_AUDIUS_PRODUCCION_VOCAL/Canto_Danny-Garcia_Danny_Original.wav"
    sf2_path = "/opt/homebrew/Cellar/fluid-synth/2.5.3/share/fluid-synth/sf2/VintageDreamsWaves-v2.sf2"
    
    output_audio = "GEN_AUDIUS_MIX_MONITOR_DANNY.wav"
    temp_midi_wav = "temp_music.wav"

    # 1. RENDERIZAR MÚSICA MIDI (Usando FluidSynth)
    print("🎹 Renderizando banda de Danny Garcia (MIDI a WAV)...")
    try:
        subprocess.run([
            "fluidsynth", "-ni", "-F", temp_midi_wav, "-r", "44100", sf2_path, midi_path
        ], check=True, capture_output=True)
    except Exception as e:
        print(f"⚠️ Error renderizando música: {e}")
        return

    # 2. MEZCLAR MÚSICA + VOCAL
    print("🎚️ Mezclando Banda y Voz Danny Garcia DNA...")
    
    music, sr_m = librosa.load(temp_midi_wav, sr=44100)
    vocal, sr_v = librosa.load(vocal_path, sr=44100)
    
    # Asegurar que la vocal no sea más larga que la música
    min_len = min(len(music), len(vocal))
    vocal = vocal[:min_len]
    music = music[:min_len]
    
    # Mezcla: Bajamos un poco la música para que destaque Danny
    mix = (music * 0.7) + (vocal * 1.2)
    
    # Normalizamos el Master
    mix = mix / (np.max(np.abs(mix)) + 0.05)
    
    # 3. GUARDAR Y LISTO PARA ESCUCHAR
    sf.write(output_audio, mix, 44100)
    
    # Limpieza
    if os.path.exists(temp_midi_wav):
        os.remove(temp_midi_wav)
        
    print(f"\n✅ ¡MEZCLA DE MONITOR COMPLETADA!")
    print(f"📍 ESCÚCHALO AQUÍ: {output_audio}")
    print("Ya puedes darle play a este archivo .wav directamente en tu Mac.")

if __name__ == "__main__":
    listen_to_gen_audius_hit()
