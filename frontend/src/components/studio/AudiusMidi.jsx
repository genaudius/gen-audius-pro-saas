import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Wand2, Sparkles } from 'lucide-react';
import { getAIChordSuggestions } from '../../services/aiService';

/* ── Tiny Web Audio synth for tone preview ── */
function playTone(frequency = 440, type = 'triangle', duration = 0.3) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
        setTimeout(() => ctx.close(), (duration + 0.1) * 1000);
    } catch { }
}

const NOTE_FREQ = {
    'C3': 261.6, 'C#3': 277.2, 'D3': 293.7, 'D#3': 311.1, 'E3': 329.6, 'F3': 349.2, 'F#3': 370.0, 'G3': 392.0, 'G#3': 415.3, 'A3': 440.0, 'A#3': 466.2, 'B3': 493.9,
    'C4': 523.3, 'C#4': 554.4, 'D4': 587.3, 'D#4': 622.3, 'E4': 659.3, 'F4': 698.5, 'F#4': 740.0, 'G4': 784.0, 'G#4': 830.6, 'A4': 880.0, 'A#4': 932.3, 'B4': 987.8,
    'C5': 1046.5, 'C#5': 1108.7, 'D5': 1174.7, 'D#5': 1244.5, 'E5': 1318.5,
};

function playChord(notes) {
    notes.forEach((n, i) => {
        const freq = NOTE_FREQ[n];
        if (freq) setTimeout(() => playTone(freq, 'triangle', 1.2), i * 20);
    });
}

function playDrum(color) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 8);
        const src = ctx.createBufferSource();
        const gain = ctx.createGain();
        const bq = ctx.createBiquadFilter();
        bq.type = 'bandpass';
        bq.frequency.value = color === '#E74C3C' ? 80 : color === '#F39C12' ? 250 : 8000;
        src.buffer = buffer;
        src.connect(bq);
        bq.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        src.start();
        setTimeout(() => ctx.close(), 200);
    } catch { }
}

/* ── Piano Keyboard ── */
const OCTAVES = [3, 4, 5];
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

const NOTE_COLORS = {
    'C': '#D4AF37', 'C#': '#C09A30',
    'D': '#00E5FF', 'D#': '#00CCDD',
    'E': '#9B59B6', 'F': '#E74C3C',
    'F#': '#C0392B', 'G': '#2ECC71',
    'G#': '#27AE60', 'A': '#3498DB',
    'A#': '#2980B9', 'B': '#E67E22',
};

/* ── Piano Roll ── */
const MIDI_PATTERNS = {
    bachata: [
        { note: 'C4', start: 0, dur: 1, vel: 90 },
        { note: 'E4', start: 1, dur: 0.5, vel: 80 },
        { note: 'G4', start: 1.5, dur: 0.5, vel: 75 },
        { note: 'C4', start: 2, dur: 1, vel: 85 },
        { note: 'A3', start: 3, dur: 0.75, vel: 78 },
        { note: 'F4', start: 4, dur: 1, vel: 90 },
        { note: 'G4', start: 5, dur: 0.5, vel: 70 },
        { note: 'E4', start: 5.5, dur: 0.5, vel: 82 },
        { note: 'C4', start: 6, dur: 2, vel: 92 },
    ],
    reggaeton: [
        { note: 'A3', start: 0, dur: 0.5, vel: 100 },
        { note: 'A3', start: 0.5, dur: 0.25, vel: 80 },
        { note: 'A3', start: 1, dur: 0.5, vel: 95 },
        { note: 'G3', start: 1.75, dur: 0.25, vel: 75 },
        { note: 'C4', start: 2, dur: 0.5, vel: 100 },
        { note: 'C4', start: 2.5, dur: 0.25, vel: 80 },
        { note: 'D4', start: 3, dur: 1, vel: 90 },
        { note: 'E4', start: 4, dur: 0.5, vel: 85 },
        { note: 'D4', start: 5, dur: 0.5, vel: 78 },
        { note: 'C4', start: 5.5, dur: 0.5, vel: 90 },
        { note: 'A3', start: 6, dur: 2, vel: 95 },
    ],
};

const NOTE_TO_ROW = { 'B': 0, 'A#': 1, 'A': 2, 'G#': 3, 'G': 4, 'F#': 5, 'F': 6, 'E': 7, 'D#': 8, 'D': 9, 'C#': 10, 'C': 11 };
const ROWS = ['B', 'A#', 'A', 'G#', 'G', 'F#', 'F', 'E', 'D#', 'D', 'C#', 'C'];
const BEATS = Array.from({ length: 16 }, (_, i) => i);

const VirtualSynth = ({ activeNote }) => {
    const pads = [
        { name: 'PIANO', color: '#D4AF37' },
        { name: 'BASS', color: '#00E5FF' },
        { name: 'LEAD', color: '#9B59B6' },
        { name: 'PAD', color: '#2ECC71' },
        { name: 'ARPG', color: '#E74C3C' },
        { name: 'CHOIR', color: '#3498DB' },
    ];
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {pads.map(p => (
                <button
                    key={p.name}
                    className="px-3 py-1.5 rounded-xl border text-[9px] font-black tracking-widest uppercase transition-all hover:scale-105"
                    style={{ borderColor: `${p.color}50`, color: p.color, backgroundColor: `${p.color}10` }}
                >
                    {p.name}
                </button>
            ))}
        </div>
    );
};

const DrumPads = () => {
    const [active, setActive] = useState(null);
    const pads = [
        { name: 'KICK', color: '#E74C3C' }, { name: 'SNARE', color: '#F39C12' },
        { name: 'HH CL', color: '#2ECC71' }, { name: 'HH OP', color: '#1ABC9C' },
        { name: 'CLAP', color: '#9B59B6' }, { name: 'CONGA', color: '#D4AF37' },
        { name: 'TIMBAL', color: '#3498DB' }, { name: 'BONGO', color: '#E67E22' },
        { name: 'RIM', color: '#00E5FF' }, { name: 'COWB', color: '#C0392B' },
        { name: 'CRASH', color: '#8E44AD' }, { name: 'RIDE', color: '#27AE60' },
        { name: 'TOM HI', color: '#D35400' }, { name: 'TOM LO', color: '#16A085' },
        { name: 'FX 1', color: '#2C3E50' }, { name: 'FX 2', color: '#7F8C8D' },
    ];
    return (
        <div className="grid grid-cols-4 gap-2">
            {pads.map((p, i) => (
                <motion.button
                    key={p.name}
                    whileTap={{ scale: 0.92 }}
                    onMouseDown={() => { setActive(i); playDrum(p.color); }}
                    onMouseUp={() => setActive(null)}
                    className="h-14 rounded-xl border-2 flex items-center justify-center text-[9px] font-black tracking-widest uppercase transition-all cursor-pointer"
                    style={{
                        borderColor: active === i ? p.color : `${p.color}30`,
                        backgroundColor: active === i ? `${p.color}30` : `${p.color}08`,
                        color: p.color,
                        boxShadow: active === i ? `0 0 20px ${p.color}50` : 'none',
                    }}
                >
                    {p.name}
                </motion.button>
            ))}
        </div>
    );
};

const SoundBankBrowser = () => {
    const [selected, setSelected] = useState(null);
    const categories = {
        '🎹 Piano & Keys': ['Steinway Grand', 'Yamaha C7', 'Rhodes Mk1', 'Wurlitzer 200', 'Hammond B3'],
        '🎸 Strings': ['Kontakt Orch.', 'LASS Strings', 'Spitfire Str.', 'Violin Solo'],
        '🎺 Brass': ['Trumpet Warm', 'Trombone Big', 'French Horn', 'Brass Section'],
        '🥁 Drums': ['ADpak Latin', 'BFD3 Jazz', 'Superior Snap', 'Timbalero Kit'],
        '🎵 Samples': ['Vocal Chops', 'Clave Pack', 'Piano Fills', 'Bassline Loops'],
        '🌊 Synths': ['Serum Lead', 'Massive Pad', 'Retrologue Bass', 'FM8 Bell'],
    };

    return (
        <div className="h-full overflow-y-auto space-y-3 pr-1 scrollbar-hide">
            {Object.entries(categories).map(([cat, items]) => (
                <div key={cat}>
                    <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] mb-1.5">{cat}</div>
                    <div className="space-y-0.5">
                        {items.map(item => (
                            <button
                                key={item}
                                onClick={() => setSelected(item)}
                                className={`w-full text-left text-[10px] px-3 py-1.5 rounded-lg transition-all ${selected === item
                                    ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30'
                                    : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                                    }`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AudiusMidi = () => {
    const [activePattern, setActivePattern] = useState('bachata');
    const [notes, setNotes] = useState(MIDI_PATTERNS.bachata);
    const [isPlaying, setIsPlaying] = useState(false);
    const [tab, setTab] = useState('piano');
    const [aiChords, setAiChords] = useState(getAIChordSuggestions('bachata'));
    const [isGeneratingChords, setIsGeneratingChords] = useState(false);

    const loadPattern = (key) => {
        setActivePattern(key);
        setNotes(MIDI_PATTERNS[key] || MIDI_PATTERNS.bachata);
        // Refresh chord suggestions for this genre
        setAiChords(getAIChordSuggestions(key));
    };

    const handleAIGenerate = async () => {
        setIsGeneratingChords(true);
        await new Promise(r => setTimeout(r, 800)); // simulate analysis
        setAiChords(getAIChordSuggestions(activePattern));
        setIsGeneratingChords(false);
    };

    const noteRow = (noteStr) => {
        const base = noteStr.replace(/[0-9]/g, '');
        const octave = parseInt(noteStr.replace(/[^0-9]/g, ''));
        const baseRow = NOTE_TO_ROW[base] ?? 0;
        return (4 - octave) * 12 + baseRow;
    };

    const CELL_W = 40;
    const ROW_H = 18;
    const totalRows = ROWS.length * 3; // 3 octaves

    return (
        <div className="flex h-full bg-[#080C18] text-white overflow-hidden">

            {/* ── Left: Sound Bank Browser ── */}
            <div className="w-52 shrink-0 border-r border-white/5 bg-[#0A0E1A] flex flex-col">
                <div className="px-3 py-2 border-b border-white/5">
                    <span className="text-[9px] font-black tracking-[0.3em] text-white/30 uppercase">Banco de Sonidos</span>
                </div>
                <div className="flex-1 overflow-hidden p-3">
                    <SoundBankBrowser />
                </div>
            </div>

            {/* ── Center: Piano Roll + Drum Pads ── */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Toolbar */}
                <div className="flex items-center gap-3 px-4 py-2 bg-[#0A0E1A] border-b border-white/5 shrink-0">
                    {/* Pattern selector */}
                    {Object.keys(MIDI_PATTERNS).map(k => (
                        <button
                            key={k}
                            onClick={() => loadPattern(k)}
                            className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full transition-all ${activePattern === k
                                ? 'bg-gold-bronz text-black'
                                : 'text-white/30 hover:text-white border border-white/5 hover:border-white/20'
                                }`}
                        >
                            {k}
                        </button>
                    ))}

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    <button
                        onClick={() => setIsPlaying(p => !p)}
                        className={`p-1.5 rounded-lg transition-all ${isPlaying ? 'bg-[#E74C3C] text-white' : 'bg-neon-blue text-black'}`}
                    >
                        {isPlaying ? <Square size={12} /> : <Play size={12} />}
                    </button>

                    <button
                        onClick={handleAIGenerate}
                        disabled={isGeneratingChords}
                        className="flex items-center gap-1 px-3 py-1.5 bg-neon-blue/10 border border-neon-blue/30 rounded-full text-[9px] font-black text-neon-blue hover:bg-neon-blue/20 transition-all disabled:opacity-50"
                    >
                        {isGeneratingChords ? <Sparkles size={10} className="animate-spin" /> : <Wand2 size={10} />}
                        AI Generate
                    </button>

                    <div className="ml-auto flex gap-1">
                        {[{ id: 'piano', label: '🎹 Piano Roll' }, { id: 'drums', label: '🥁 Drum Pads' }].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`text-[9px] font-black tracking-widest px-3 py-1.5 rounded-full transition-all ${tab === t.id
                                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                                    : 'text-white/30 hover:text-white'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === 'piano' ? (
                    <div className="flex flex-1 overflow-hidden">
                        {/* Mini Keyboard */}
                        <div className="w-16 shrink-0 border-r border-white/5 bg-[#0D1220] overflow-y-auto scrollbar-hide">
                            <div className="h-8 border-b border-white/5" />
                            {OCTAVES.slice().reverse().flatMap(oct => ROWS.map(note => (
                                <div
                                    key={`${note}${oct}`}
                                    className="flex items-center justify-end pr-2"
                                    style={{
                                        height: ROW_H,
                                        backgroundColor: note.includes('#') ? '#0A0E1A' : '#111827',
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    }}
                                >
                                    <span className="text-[7px] font-bold" style={{ color: NOTE_COLORS[note] }}>
                                        {note.includes('#') ? '♯' : ''}{note.replace('#', '')}{oct}
                                    </span>
                                </div>
                            )))}
                        </div>

                        {/* Note Grid */}
                        <div className="flex-1 overflow-auto bg-[#080C18]">
                            {/* Ruler */}
                            <div className="h-8 border-b border-white/5 bg-[#0A0E1A] flex sticky top-0 z-10">
                                {BEATS.map(b => (
                                    <div key={b} style={{ width: CELL_W }} className="flex flex-col items-center justify-end border-r border-white/5">
                                        {b % 4 === 0 && <span className="text-[8px] text-white/20 mb-1">{Math.floor(b / 4) + 1}</span>}
                                        <div className={`w-px ${b % 4 === 0 ? 'h-4 bg-white/20' : 'h-2 bg-white/5'}`} />
                                    </div>
                                ))}
                            </div>

                            {/* Rows */}
                            <div className="relative" style={{ width: BEATS.length * CELL_W, height: totalRows * ROW_H }}>
                                {/* Grid lines */}
                                {Array.from({ length: totalRows }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute left-0 right-0"
                                        style={{
                                            top: i * ROW_H,
                                            height: ROW_H,
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            backgroundColor: ROWS[i % 12].includes('#') ? 'rgba(0,0,0,0.3)' : 'transparent',
                                        }}
                                    />
                                ))}
                                {/* Beat grid */}
                                {BEATS.map(b => (
                                    <div key={b} className="absolute top-0 bottom-0 w-px border-r border-white/5" style={{ left: b * CELL_W }} />
                                ))}

                                {/* Notes */}
                                {notes.map((n, i) => {
                                    const row = noteRow(n.note);
                                    const clampedRow = Math.min(Math.max(row, 0), totalRows - 1);
                                    const noteBase = n.note.replace(/[0-9]/g, '');
                                    return (
                                        <motion.div
                                            key={i}
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            className="absolute rounded-md flex items-center px-1 overflow-hidden cursor-pointer"
                                            style={{
                                                left: n.start * CELL_W,
                                                width: Math.max(n.dur * CELL_W - 2, 10),
                                                top: clampedRow * ROW_H + 2,
                                                height: ROW_H - 4,
                                                backgroundColor: `${NOTE_COLORS[noteBase] ?? '#00E5FF'}CC`,
                                                boxShadow: `0 0 8px ${NOTE_COLORS[noteBase] ?? '#00E5FF'}60`,
                                                transformOrigin: 'left',
                                            }}
                                        >
                                            <span className="text-[7px] font-black text-black/70 truncate">{n.note}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6">
                        <DrumPads />
                    </div>
                )}
            </div>

            {/* ── Right: Virtual Instrument / Synth ── */}
            <div className="w-52 shrink-0 border-l border-white/5 bg-[#0A0E1A] flex flex-col">
                <div className="px-3 py-2 border-b border-white/5">
                    <span className="text-[9px] font-black tracking-[0.3em] text-white/30 uppercase">Instrumento</span>
                </div>
                <div className="flex-1 p-3 space-y-4">
                    <VirtualSynth />

                    {/* Mini Arpeggiator */}
                    <div className="glass rounded-xl border border-white/5 p-3 space-y-2">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Arpeggiator</span>
                        <div className="flex gap-2">
                            {['UP', 'DOWN', 'RAND'].map(m => (
                                <button key={m} className="flex-1 py-1 rounded text-[7px] font-black border border-white/5 text-white/30 hover:border-neon-blue/30 hover:text-neon-blue transition-all">
                                    {m}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[7px] text-white/20">
                                <span>Rate</span><span>1/16</span>
                            </div>
                            <input type="range" className="w-full accent-neon-blue" defaultValue={75} />
                        </div>
                    </div>

                    {/* Chord Memory — AI Powered */}
                    <div className="glass rounded-xl border border-white/5 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Acordes IA</span>
                            <Wand2 size={8} className="text-neon-blue" />
                        </div>
                        {aiChords.map(chord => (
                            <button
                                key={chord.name}
                                onClick={() => playChord(chord.notes)}
                                className="w-full text-left py-1 px-2 rounded hover:bg-neon-blue/10 hover:text-neon-blue text-white/40 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-mono font-black group-hover:text-neon-blue">{chord.name}</span>
                                    <span className="text-[7px] text-white/20 group-hover:text-neon-blue/50">{chord.mood}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudiusMidi;
