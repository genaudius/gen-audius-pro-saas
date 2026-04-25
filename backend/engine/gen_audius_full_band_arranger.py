import os
import pretty_midi
import random
import numpy as np
import glob

def compose_gen_audius_full_band(num_variations=5):
    print("\n--- 🧠 GEN AUDIUS v11.0: FULL BAND ARRENGER (DANNY GARCIA DNA) ---")
    
    midi_adn_dir = "GEN_AUDIUS_DNA_MIDI_ADN"
    output_dir = "GEN_AUDIUS_ARREGLOS_COMPLETOS"
    os.makedirs(output_dir, exist_ok=True)
    
    bpm = 108
    quarter_note = 60.0 / bpm
    bar_duration = quarter_note * 4
    total_bars = 32 # Canción de ~1:11 minutos

    # 1. CARGA DE ADN (Cerebros por Instrumento)
    def load_dna_pool(name_pattern):
        files = glob.glob(os.path.join(midi_adn_dir, f"{name_pattern}*.mid"))
        if not files: return []
        pm = pretty_midi.PrettyMIDI(files[0])
        pool = []
        for inst in pm.instruments:
            pool.extend(inst.notes)
        return pool

    print("🧬 Extrayendo ADN de la Vault...")
    pools = {
        "Requinto": load_dna_pool("Requinto"),
        "Piano": load_dna_pool("AC PIANO"),
        "Bass": load_dna_pool("Bass"),
        "Percusion": load_dna_pool("Bongo")
    }

    # 2. GENERACIÓN DE ARREGLO MULTI-TRACK
    for v in range(num_variations):
        pm_full = pretty_midi.PrettyMIDI(initial_tempo=bpm)
        
        # DEFINICIÓN DE INSTRUMENTOS (Canales Pro Tools)
        tracks = {
            "Requinto": pretty_midi.Instrument(program=24, name="Requinto Danny"), # Acoustic Guitar (Nylon)
            "Piano": pretty_midi.Instrument(program=0, name="Piano Moderno"),     # Acoustic Grand Piano
            "Bass": pretty_midi.Instrument(program=33, name="Bajo Sabor"),       # Electric Bass (Finger)
            "Percusion": pretty_midi.Instrument(program=0, is_drum=True, name="Bongo/Guira Grid") # Drum Kit
        }

        print(f"🎼 Arreglando Variación Danny Garcia Full Band v{v+1}...")

        # Algoritmo de Coherencia Musical
        # El Bajo y el Piano definen la estructura, el Requinto 'fustiga' y la Percusión amarra.
        
        current_time = 0
        while current_time < bar_duration * total_bars:
            # Determinamos si es una sección de adorno o base
            is_accent = (int(current_time / bar_duration) % 4 == 3) # Cada 4 compases hay un 'mambo' o adorno
            
            # --- BASS (El Tumbao) ---
            if pools["Bass"]:
                note = random.choice(pools["Bass"])
                # El bajo suele tocar en Negras con puntillo / Síncopa bachatera
                dur = random.choice([0.75, 1.0]) * quarter_note
                tracks["Bass"].notes.append(pretty_midi.Note(
                    velocity=random.randint(80, 110),
                    pitch=note.pitch,
                    start=current_time,
                    end=current_time + dur
                ))

            # --- PIANO (El Montuno/Acompañamiento) ---
            if pools["Piano"]:
                # Generamos un acorde o arpegio basado en el ADN
                for _ in range(random.randint(1, 3)):
                    note = random.choice(pools["Piano"])
                    tracks["Piano"].notes.append(pretty_midi.Note(
                        velocity=random.randint(60, 90),
                        pitch=note.pitch,
                        start=current_time,
                        end=current_time + quarter_note
                    ))

            # --- REQUINTO (La Melodía Protagonista) ---
            if pools["Requinto"]:
                # El requinto toca más notas y más rápido
                req_offset = 0
                while req_offset < quarter_note:
                    note = random.choice(pools["Requinto"])
                    dur = random.choice([0.25, 0.5]) * quarter_note # Corcheas/Semicorcheas
                    tracks["Requinto"].notes.append(pretty_midi.Note(
                        velocity=random.randint(90, 127),
                        pitch=note.pitch,
                        start=current_time + req_offset,
                        end=current_time + req_offset + dur
                    ))
                    req_offset += dur

            # --- PERCUSIÓN (El Golpe) ---
            # Mapeo básico de MIDI Drums para que Pro Tools lo entienda
            if pools["Percusion"]:
                # Kick (36) y Snare/Side (37/38) para el ritmo
                tracks["Percusion"].notes.append(pretty_midi.Note(velocity=100, pitch=36, start=current_time, end=current_time + 0.1))
                tracks["Percusion"].notes.append(pretty_midi.Note(velocity=90, pitch=42, start=current_time + 0.5 * quarter_note, end=current_time + 0.6))

            current_time += quarter_note # Avanzamos negra por negra

        # Consolidamos tracks en el MIDI definitivo
        for inst in tracks.values():
            pm_full.instruments.append(inst)

        # Exportación PRO
        filename = f"Gen_Audius_Danny_Full_Band_v{v+1}.mid"
        filepath = os.path.join(output_dir, filename)
        pm_full.write(filepath)
        print(f"✅ Arreglo Completo v{v+1} guardado.")

    print(f"\n✨ ¡ORQUESTA GEN AUDIUS LISTA!")
    print(f"📍 Encuentra tus arreglos de Danny Garcia en: {output_dir}")
    print("Cada archivo tiene 4 pistas separadas. Arrástralas a tu sesión de Pro Tools.")

if __name__ == "__main__":
    compose_gen_audius_full_band()
