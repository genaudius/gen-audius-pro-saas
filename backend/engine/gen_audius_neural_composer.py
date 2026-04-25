import os
import pretty_midi
import numpy as np
import glob
import random

# --- 🧠 GEN AUDIUS v18.0: PHRASE-BASED NEURAL COMPOSER ---
# Este motor deja de ver notas individuales y empieza a ver FRASES (Patrones de Danny Garcia)

class GenAudiusNeuralBrain:
    def __init__(self, bpm=108):
        self.bpm = bpm
        self.quarter_note = 60.0 / bpm
        self.bar_len = self.quarter_note * 4
        self.phrase_len = self.bar_len * 2 # Frases de 2 compases
        self.dna_vault = {}
        
    def extract_phrases_from_dna(self, midi_path, instrument_name):
        """Extrae frases de 2 compases manteniendo el ritmo y las notas exactas de Danny"""
        try:
            pm = pretty_midi.PrettyMIDI(midi_path)
            phrases = []
            
            for inst in pm.instruments:
                if inst.is_drum and instrument_name != "Percussion": continue
                
                notes = sorted(inst.notes, key=lambda x: x.start)
                if not notes: continue
                
                # Dividimos el tiempo total en bloques de 'phrase_len'
                last_time = notes[-1].end
                for start_time in np.arange(0, last_time, self.phrase_len):
                    end_time = start_time + self.phrase_len
                    
                    # Filtramos las notas que caen en este bloque de 2 compases
                    phrase_notes = [
                        {
                            'pitch': n.pitch,
                            'start': n.start - start_time,
                            'end': n.end - start_time,
                            'velocity': n.velocity
                        }
                        for n in notes if n.start >= start_time and n.start < end_time
                    ]
                    
                    if len(phrase_notes) > 2: # Solo frases con contenido
                        phrases.append(phrase_notes)
            
            self.dna_vault[instrument_name] = phrases
            print(f"✅ ADN de {instrument_name}: {len(phrases)} frases aprendidas.")
        except Exception as e:
            print(f"⚠️ Error procesando {instrument_name}: {e}")

    def generate_variation(self, phrase, mutation_rate=0.1):
        """Aplica una 'Mutación Neuronal' ligera para crear algo nuevo pero familiar"""
        new_phrase = []
        for n in phrase:
            new_note = n.copy()
            if random.random() < mutation_rate:
                # Mutación Tonal (Mantenemos la escala de Danny)
                new_note['pitch'] += random.choice([-2, -1, 1, 2])
            if random.random() < mutation_rate:
                # Mutación Rítmica (Pequeño swing o delay)
                shift = random.uniform(-0.05, 0.05)
                new_note['start'] = max(0, new_note['start'] + shift)
                new_note['end'] = max(new_note['start'] + 0.05, new_note['end'] + shift)
            new_phrase.append(new_note)
        return new_phrase

    def build_full_production(self, output_path="GEN_AUDIUS_MASTER_HIT_v18.mid"):
        print("\n🎼 Iniciando Producción Maestra (Estructura Gen Audius)...")
        pm = pretty_midi.PrettyMIDI(initial_tempo=self.bpm)
        
        # Tracks Pro Tools
        tracks = {
            "Requinto": pretty_midi.Instrument(program=24, name="Requinto Danny"),
            "Piano": pretty_midi.Instrument(program=0, name="Piano Danny"),
            "Bass": pretty_midi.Instrument(program=33, name="Bass Danny"),
            "Perc": pretty_midi.Instrument(program=0, is_drum=True, name="Bongo Danny")
        }

        # Estructura: Intro (4), Verso (8), Coro (8), Mambo (4), Coro (8), Outro (4)
        structure = [
            ("Intro", 4), ("Verso", 8), ("Coro", 8), 
            ("Verso", 8), ("Coro", 8), ("Mambo", 4), 
            ("Coro", 8), ("Outro", 4)
        ]

        current_time = 0
        
        # Generamos la canción track por track para asegurar sincronización
        for section, bars in structure:
            print(f"🎙️ Produciendo Sección: {section}...")
            section_duration = bars * self.bar_len
            
            for inst_name, track in tracks.items():
                section_time = 0
                while section_time < section_duration:
                    if inst_name in self.dna_vault and self.dna_vault[inst_name]:
                        # Inteligencia de Selección:
                        # En el Coro usamos frases con más notas (más energía)
                        # En el Verso frases más calmadas
                        phrase_pool = self.dna_vault[inst_name]
                        
                        # Selección basada en energía
                        phrase = random.choice(phrase_pool)
                        
                        # Generamos una variación única para esta parte del Hit
                        variation = self.generate_variation(phrase)
                        
                        for n in variation:
                            start = current_time + section_time + n['start']
                            end = current_time + section_time + n['end']
                            
                            # No dejamos que las notas se pasen de la sección
                            if n['start'] < self.phrase_len:
                                track.notes.append(pretty_midi.Note(
                                    velocity=n['velocity'],
                                    pitch=n['pitch'],
                                    start=start,
                                    end=end
                                ))
                    
                    section_time += self.phrase_len
            
            current_time += section_duration

        for t in tracks.values(): pm.instruments.append(t)
        pm.write(output_path)
        print(f"\n✅ CANCIÓN CREADA EXITOSAMENTE!")
        print(f"📍 Archivo Pro Tools: {output_path}")

if __name__ == "__main__":
    brain = GenAudiusNeuralBrain(bpm=108)
    
    # Alimentamos el cerebro con el ADN real del Vault
    vault = "GEN_AUDIUS_DNA_MIDI_ADN"
    brain.extract_phrases_from_dna(f"{vault}/Requinto_basic_pitch.mid", "Requinto")
    brain.extract_phrases_from_dna(f"{vault}/AC PIANO_basic_pitch.mid", "Piano")
    brain.extract_phrases_from_dna(f"{vault}/Bass_basic_pitch.mid", "Bass")
    brain.extract_phrases_from_dna(f"{vault}/Bongo_basic_pitch.mid", "Percussion")
    
    # Componemos el Master Hit
    brain.build_full_production("GEN_AUDIUS_MASTER_HIT_v18.mid")
