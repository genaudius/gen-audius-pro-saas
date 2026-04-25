import os
import pretty_midi
import random
import numpy as np
import glob

def compose_danny_garcia_variations(num_variations=5):
    print("\n--- 🧠 GEN AUDIUS v10.0: MASTER COMPOSER (DANNY GARCIA) ---")
    
    midi_adn_dir = "GEN_AUDIUS_DNA_MIDI_ADN"
    output_dir = "GEN_AUDIUS_COMPOSICIONES_ORIGINALES"
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Cargamos el ADN de Requinto (Melodía) y Piano (Armonía)
    requinto_adn = glob.glob(os.path.join(midi_adn_dir, "Requinto*.mid"))
    piano_adn = glob.glob(os.path.join(midi_adn_dir, "AC PIANO*.mid"))
    
    if not requinto_adn:
        print("⚠️ No hay MIDI ADN de Requinto. Ejecuta 'gen_audius_dna_transcriber.py' primero.")
        return

    print(f"🧬 Analizando ADN de Requinto: {os.path.basename(requinto_adn[0])}")
    pm_req = pretty_midi.PrettyMIDI(requinto_adn[0])
    
    # Extraemos todas las notas del Requinto para nuestro "Cerebro Danny Garcia"
    notes_pool = []
    for instrument in pm_req.instruments:
        notes_pool.extend(instrument.notes)
    
    if not notes_pool:
        print("⚠️ No se detectaron notas en el ADN. El audio estaba muy vacío.")
        return

    # 2. GENERACIÓN DE VARIACIONES
    bpm = 108
    quarter_note = 60.0 / bpm
    bar_duration = quarter_note * 4

    print(f"🎼 Generando {num_variations} Composiciones Danny Garcia Originales...")

    for i in range(num_variations):
        # Creamos un nuevo objeto MIDI
        pm_variacion = pretty_midi.PrettyMIDI(initial_tempo=bpm)
        # Creamos un instrumento (Piano de Pro Tools por defecto)
        inst = pretty_midi.Instrument(program=0) 
        
        # Algoritmo de 'Danny Shuffle':
        # Reordenamos las frases melódicas manteniendo la coherencia rítmica básica
        # Generamos 16 compases
        current_time = 0
        while current_time < bar_duration * 16:
            # Elegimos un pedazo de ADN (una nota o secuencia corta)
            sample_note = random.choice(notes_pool)
            
            # Duración aleatoria pero 'en el compás' (corchea, negra, etc)
            durations = [0.25, 0.5, 1.0] # Corchea, Negra, etc
            duration = random.choice(durations) * quarter_note
            
            # Nueva nota basada en el ADN
            new_note = pretty_midi.Note(
                velocity=random.randint(60, 100),
                pitch=sample_note.pitch, # Mantenemos el tono de Danny
                start=current_time,
                end=current_time + duration
            )
            
            inst.notes.append(new_note)
            current_time += duration
            
            # Espacio aleatorio (silencio)
            if random.random() > 0.8:
                current_time += 0.25 * quarter_note

        pm_variacion.instruments.append(inst)
        
        # Exportación definitiva
        filename = f"Gen_Audius_Danny_Original_v{i+1}.mid"
        filepath = os.path.join(output_dir, filename)
        pm_variacion.write(filepath)
        print(f"✅ Composición v{i+1} creada: {filename}")

    print(f"\n✨ ¡COSECHA DE ADN COMPLETADA!")
    print(f"📍 Encuentra tus 5 variaciones en: {output_dir}")
    print("Ya puedes usarlas con tus pianos y guitarras en Pro Tools.")

if __name__ == "__main__":
    compose_danny_garcia_variations()
