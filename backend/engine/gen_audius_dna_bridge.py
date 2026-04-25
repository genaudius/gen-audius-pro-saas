import os
import pretty_midi
import glob

def midi_to_note_list(midi_path):
    """Convierte un archivo MIDI en una lista de nombres de notas (C4, D#4, etc.)"""
    pm = pretty_midi.PrettyMIDI(midi_path)
    note_names = []
    
    # Extraemos todas las notas de todos los instrumentos en orden cronológico
    all_notes = []
    for instrument in pm.instruments:
        all_notes.extend(instrument.notes)
    
    # Ordenar por tiempo de inicio
    all_notes.sort(key=lambda x: x.start)
    
    for note in all_notes:
        name = pretty_midi.note_number_to_name(note.pitch)
        note_names.append(name)
        
    return note_names

def update_ngram_with_real_dna():
    print("🧬 Extrayendo ADN melódico real de Danny Garcia...")
    
    midi_folder = "GEN_AUDIUS_DNA_MIDI_ADN"
    midi_files = glob.glob(os.path.join(midi_folder, "*.mid"))
    
    real_training_data = []
    for f in midi_files:
        print(f"📄 Procesando {os.path.basename(f)}...")
        real_training_data.extend(midi_to_note_list(f))
    
    if not real_training_data:
        print("⚠️ No se encontró ADN real. Asegúrate de correr 'gen_audius_dna_transcriber.py' primero.")
        return training_data # Fallback to previous hardcoded data if any (or we'll just fail gracefully)

    print(f"✅ Se han aprendido {len(real_training_data)} transiciones reales de Danny Garcia.")
    return real_training_data

# Este bloque se usará para inyectar los datos en el nuevo script
