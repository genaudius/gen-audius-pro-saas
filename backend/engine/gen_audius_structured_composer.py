import os
import pretty_midi
import random
import numpy as np
import glob
from collections import Counter

# --- 🎼 GEN AUDIUS v17.0: STRUCTURED SONG ENGINE (DANNY GARCIA) ---

class GenAudiusSongEngine:
    def __init__(self, bpm=108):
        self.bpm = bpm
        self.quarter_note = 60.0 / bpm
        self.bar_len = self.quarter_note * 4
        self.vault_path = "GEN_AUDIUS_DNA_MIDI_ADN"
        self.dna_bank = {"Requinto": [], "Piano": [], "Bass": [], "Bongo": []}
        
    def learn_dna(self):
        print("🧬 Analizando ADN para detectar frases y estructuras realistas...")
        files = glob.glob(os.path.join(self.vault_path, "*.mid"))
        for f in files:
            name = os.path.basename(f)
            pm = pretty_midi.PrettyMIDI(f)
            for inst in pm.instruments:
                # Extraemos 'motivos' (secuencias de 4-8 notas con su ritmo relativo)
                notes = sorted(inst.notes, key=lambda x: x.start)
                if not notes: continue
                
                # Agrupamos en frases de aproximadamente 1 o 2 compases
                phrases = []
                current_phrase = []
                last_start = notes[0].start
                
                for n in notes:
                    rel_start = n.start - last_start
                    # Si el espacio es muy grande, empezamos frase nueva
                    if rel_start > self.bar_len * 2:
                        if current_phrase: phrases.append(current_phrase)
                        current_phrase = []
                        last_start = n.start
                    
                    current_phrase.append({
                        'pitch': n.pitch,
                        'duration': n.end - n.start,
                        'offset': n.start - last_start,
                        'velocity': n.velocity
                    })
                    
                if current_phrase: phrases.append(current_phrase)
                
                # Clasificamos el ADN
                if "Requinto" in name: self.dna_bank["Requinto"].extend(phrases)
                elif "PIANO" in name: self.dna_bank["Piano"].extend(phrases)
                elif "Bass" in name: self.dna_bank["Bass"].extend(phrases)
                elif "Bongo" in name: self.dna_bank["Bongo"].extend(phrases)

    def compose_song(self, output_name="Gen_Audius_Song_v17.mid"):
        print("🎼 Componiendo estructura de canción (Verso-Coro-Mambo)...")
        pm = pretty_midi.PrettyMIDI(initial_tempo=self.bpm)
        
        # Canales Danny Garcia
        tracks = {
            "Requinto": pretty_midi.Instrument(program=24, name="Requinto Danny"),
            "Piano": pretty_midi.Instrument(program=0, name="Piano Danny"),
            "Bass": pretty_midi.Instrument(program=33, name="Bass Danny"),
            "Perc": pretty_midi.Instrument(program=0, is_drum=True, name="Percussion Danny")
        }

        # ESTRUCTURA DE LA CANCIÓN: Intro(4), Verso(8), Coro(8), Verso(8), Coro(8), Mambo(4), Coro(8), Outro(4)
        structure = [
            ("Intro", 4), ("Verso", 8), ("Coro", 8), ("Verso", 8), 
            ("Coro", 8), ("Mambo", 4), ("Coro", 8), ("Outro", 4)
        ]

        current_time = 0
        
        # Mantenemos frases consistentes para Verso y Coro para crear Identidad
        leitmotifs = {
            "Verso_Req": random.choice(self.dna_bank["Requinto"][:10]) if self.dna_bank["Requinto"] else [],
            "Coro_Req": random.choice(self.dna_bank["Requinto"][-10:]) if self.dna_bank["Requinto"] else [],
            "Bass_Line": random.choice(self.dna_bank["Bass"]) if self.dna_bank["Bass"] else []
        }

        for section_name, num_bars in structure:
            print(f"   ⮑  Sección: {section_name} ({num_bars} compases)")
            section_duration = num_bars * self.bar_len
            
            # Poblamos la sección
            for bar in range(num_bars):
                bar_offset = current_time + (bar * self.bar_len)
                
                # Elegimos frases basadas en la sección
                if section_name == "Coro":
                    req_phrase = leitmotifs["Coro_Req"]
                    vel_factor = 1.2 # El coro suena más fuerte
                else:
                    req_phrase = leitmotifs["Verso_Req"]
                    vel_factor = 0.9

                # Escribir Requinto
                for n_info in req_phrase:
                    if n_info['offset'] >= self.bar_len: continue # No nos salimos del compás
                    start = bar_offset + n_info['offset']
                    note = pretty_midi.Note(
                        velocity=min(127, int(n_info['velocity'] * vel_factor)),
                        pitch=n_info['pitch'],
                        start=start,
                        end=start + n_info['duration']
                    )
                    tracks["Requinto"].notes.append(note)

                # Escribir Bajo (Consistente con la frase del bajo)
                if leitmotifs["Bass_Line"]:
                    for n_info in leitmotifs["Bass_Line"]:
                        if n_info['offset'] >= self.bar_len: continue
                        tracks["Bass"].notes.append(pretty_midi.Note(
                            velocity=90, pitch=n_info['pitch'],
                            start=bar_offset + n_info['offset'],
                            end=bar_offset + n_info['offset'] + n_info['duration']
                        ))

                # Escribir Percusión (Patrón rítmico fijo para el 'compás')
                for beat in range(4):
                    tracks["Perc"].notes.append(pretty_midi.Note(
                        velocity=100, pitch=36, # Kick
                        start=bar_offset + (beat * self.quarter_note),
                        end=bar_offset + (beat * self.quarter_note) + 0.1
                    ))

            current_time += section_duration

        for track in tracks.values(): pm.instruments.append(track)
        
        output_path = os.path.join("GEN_AUDIUS_COMPOSICIONES_ORIGINALES", output_name)
        pm.write(output_path)
        print(f"\n✅ ¡CANCIÓN COMPLETA ESTRUCTURADA CREADA!")
        print(f"📍 Archivo final (Arrastra esto a Pro Tools): {output_path}")

if __name__ == "__main__":
    print("\n--- 🎼 GEN AUDIUS v17.0: SONG STRUCTURE COMPOSER ---")
    engine = GenAudiusSongEngine(bpm=108)
    engine.learn_dna()
    engine.compose_song(output_name="CANCION_DANNY_GARCIA_FINAL_PRO_STRUCTURE.mid")
