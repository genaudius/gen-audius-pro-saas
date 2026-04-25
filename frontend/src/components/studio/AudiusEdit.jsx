import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Scissors, Copy, Clipboard, MousePointer, ZoomIn, ZoomOut,
    Volume2, VolumeX, Headphones, Plus, Trash2, ChevronDown,
    Play, Square, SkipBack, SkipForward, Circle, Mic, Music2,
    Sliders, Layers, Wand2, RotateCcw, RotateCw
} from 'lucide-react';

const TOOLS = [
    { id: 'select', icon: MousePointer, label: 'Selección' },
    { id: 'scissors', icon: Scissors, label: 'Cortar' },
    { id: 'copy', icon: Copy, label: 'Copiar' },
    { id: 'paste', icon: Clipboard, label: 'Pegar' },
    { id: 'zoomin', icon: ZoomIn, label: 'Zoom +' },
    { id: 'zoomout', icon: ZoomOut, label: 'Zoom -' },
];

const TRACKS_INIT = [
    { id: 1, name: 'Voz Principal', color: '#D4AF37', type: 'audio', muted: false, solo: false, volume: 80, clips: [{ start: 0, width: 200, label: 'Verso 1' }, { start: 260, width: 160, label: 'Coro' }] },
    { id: 2, name: 'Voz Coros', color: '#00E5FF', type: 'audio', muted: false, solo: false, volume: 65, clips: [{ start: 200, width: 160, label: 'Coro BG' }] },
    { id: 3, name: 'Piano', color: '#9B59B6', type: 'audio', muted: false, solo: false, volume: 72, clips: [{ start: 0, width: 420, label: 'Piano Base' }] },
    { id: 4, name: 'Bajo', color: '#E74C3C', type: 'audio', muted: false, solo: false, volume: 78, clips: [{ start: 0, width: 420, label: 'Linea Bajo' }] },
    { id: 5, name: 'Drum Kit', color: '#2ECC71', type: 'audio', muted: false, solo: false, volume: 85, clips: [{ start: 0, width: 420, label: 'Beat Principal' }] },
    { id: 6, name: 'Percusión', color: '#E67E22', type: 'audio', muted: false, solo: false, volume: 60, clips: [{ start: 30, width: 390, label: 'Congas / Timbales' }] },
    { id: 7, name: 'Guitarra', color: '#3498DB', type: 'audio', muted: false, solo: false, volume: 55, clips: [{ start: 0, width: 200, label: 'Intro Gtr' }, { start: 260, width: 160, label: 'Coro Gtr' }] },
    { id: 8, name: 'FX / Atmos', color: '#1ABC9C', type: 'audio', muted: false, solo: false, volume: 40, clips: [{ start: 200, width: 220, label: 'Ambience' }] },
];

const BEAT_MARKS = Array.from({ length: 32 }, (_, i) => i + 1);

const TrackClip = ({ clip, color }) => (
    <div
        className="absolute top-2 bottom-2 rounded-lg border border-white/10 flex items-center px-2 overflow-hidden cursor-grab select-none"
        style={{
            left: clip.start,
            width: clip.width,
            background: `linear-gradient(135deg, ${color}33, ${color}18)`,
            borderColor: `${color}60`,
        }}
    >
        {/* Fake waveform */}
        <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none">
            {Array.from({ length: Math.floor(clip.width / 4) }).map((_, i) => {
                const h = 20 + Math.random() * 60;
                return (
                    <rect
                        key={i}
                        x={i * 4}
                        y={`${50 - h / 2}%`}
                        width="2"
                        height={`${h}%`}
                        fill={color}
                        opacity="0.6"
                    />
                );
            })}
        </svg>
        <span className="relative text-[9px] font-black tracking-wider text-white/80 uppercase truncate">{clip.label}</span>
    </div>
);

const AudiusEdit = () => {
    const [activeTool, setActiveTool] = useState('select');
    const [tracks, setTracks] = useState(TRACKS_INIT);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playhead, setPlayhead] = useState(40);
    const [bpm, setBpm] = useState(96);
    const [selectedPlugin, setSelectedPlugin] = useState(null);

    const toggleMute = (id) => setTracks(t => t.map(tr => tr.id === id ? { ...tr, muted: !tr.muted } : tr));
    const toggleSolo = (id) => setTracks(t => t.map(tr => tr.id === id ? { ...tr, solo: !tr.solo } : tr));

    return (
        <div className="flex flex-col h-full bg-[#0A0E1A] text-white select-none">

            {/* ── TOP TOOLBAR ── */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#0D1220] border-b border-white/5 shrink-0">

                {/* Transport */}
                <div className="flex items-center gap-1 bg-black/40 rounded-xl px-3 py-1.5 border border-white/5">
                    <button onClick={() => setPlayhead(0)} className="p-1.5 rounded hover:bg-white/5"><SkipBack size={14} /></button>
                    <button
                        onClick={() => setIsPlaying(p => !p)}
                        className={`p-1.5 rounded-lg font-black transition-all ${isPlaying ? 'bg-[#E74C3C] text-white' : 'bg-neon-blue text-black'}`}
                    >
                        {isPlaying ? <Square size={14} /> : <Play size={14} />}
                    </button>
                    <button className="p-1.5 rounded hover:bg-white/5 text-red-400"><Circle size={14} /></button>
                    <button className="p-1.5 rounded hover:bg-white/5"><SkipForward size={14} /></button>
                </div>

                {/* BPM */}
                <div className="flex items-center gap-2 bg-black/40 rounded-xl px-3 py-1.5 border border-white/5">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest">BPM</span>
                    <input
                        type="number"
                        value={bpm}
                        onChange={e => setBpm(Number(e.target.value))}
                        className="w-12 bg-transparent text-gold-bronz font-black text-sm text-center focus:outline-none"
                    />
                </div>

                {/* Timecode */}
                <div className="bg-black/60 rounded-xl px-4 py-1.5 border border-white/5 font-mono text-sm text-neon-blue tracking-widest">
                    01:00:00:00
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10" />

                {/* Edit Tools */}
                <div className="flex items-center gap-1 bg-black/40 rounded-xl px-2 py-1 border border-white/5">
                    {TOOLS.map(tool => (
                        <button
                            key={tool.id}
                            title={tool.label}
                            onClick={() => setActiveTool(tool.id)}
                            className={`p-1.5 rounded transition-all ${activeTool === tool.id ? 'bg-neon-blue/20 text-neon-blue' : 'text-white/40 hover:text-white'}`}
                        >
                            <tool.icon size={14} />
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-white/10" />

                {/* Undo/Redo */}
                <button className="p-1.5 rounded text-white/40 hover:text-white transition-all"><RotateCcw size={14} /></button>
                <button className="p-1.5 rounded text-white/40 hover:text-white transition-all"><RotateCw size={14} /></button>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">Audius Edit</span>
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                </div>
            </div>

            {/* ── MAIN AREA ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── TRACK HEADERS ── */}
                <div className="w-52 shrink-0 border-r border-white/5 overflow-y-auto bg-[#0D1220]">
                    {/* Ruler filler */}
                    <div className="h-8 border-b border-white/5 bg-[#080C18] flex items-center px-3">
                        <span className="text-[9px] text-white/20 tracking-widest uppercase">Pista</span>
                    </div>

                    {tracks.map(tr => (
                        <div key={tr.id} className="h-16 border-b border-white/5 flex items-center px-3 gap-2 group hover:bg-white/3 transition-colors">
                            {/* Color dot */}
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tr.color }} />

                            {/* Name */}
                            <span className="text-[11px] font-semibold truncate flex-1 text-white/80 group-hover:text-white">{tr.name}</span>

                            {/* Controls */}
                            <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => toggleMute(tr.id)}
                                    className={`p-1 rounded text-[10px] font-black transition-all ${tr.muted ? 'text-amber-400 bg-amber-400/10' : 'text-white/30 hover:text-white'}`}
                                    title="Mute"
                                >
                                    M
                                </button>
                                <button
                                    onClick={() => toggleSolo(tr.id)}
                                    className={`p-1 rounded text-[10px] font-black transition-all ${tr.solo ? 'text-neon-blue bg-neon-blue/10' : 'text-white/30 hover:text-white'}`}
                                    title="Solo"
                                >
                                    S
                                </button>
                            </div>

                            {/* Volume mini */}
                            <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden shrink-0">
                                <div className="h-full rounded-full" style={{ width: `${tr.volume}%`, backgroundColor: tr.solo ? '#00E5FF' : tr.muted ? '#555' : tr.color }} />
                            </div>
                        </div>
                    ))}

                    <button className="w-full h-10 flex items-center justify-center gap-2 text-[10px] text-white/30 hover:text-neon-blue hover:bg-neon-blue/5 transition-all border-t border-white/5">
                        <Plus size={12} /> Añadir Pista
                    </button>
                </div>

                {/* ── TIMELINE ── */}
                <div className="flex-1 overflow-auto bg-[#080C18]">
                    {/* Ruler */}
                    <div className="h-8 border-b border-white/5 flex items-end relative bg-[#0A0E1A] sticky top-0 z-10">
                        {BEAT_MARKS.map(b => (
                            <div key={b} className="absolute bottom-0 flex flex-col items-center" style={{ left: (b - 1) * 52 + 14 }}>
                                <span className="text-[8px] text-white/20 mb-1">{b}</span>
                                <div className={`w-px ${b % 4 === 1 ? 'h-4 bg-white/20' : 'h-2 bg-white/8'}`} />
                            </div>
                        ))}
                        {/* Playhead */}
                        <div
                            className="absolute top-0 bottom-0 w-px bg-neon-blue z-20"
                            style={{ left: playhead + 14 }}
                        >
                            <div className="w-3 h-3 bg-neon-blue rotate-45 -translate-x-1 -translate-y-0.5 absolute top-0" />
                        </div>
                    </div>

                    {/* Clips */}
                    {tracks.map(tr => (
                        <div
                            key={tr.id}
                            className={`h-16 border-b border-white/5 relative transition-opacity ${tr.muted ? 'opacity-30' : ''}`}
                            style={{ minWidth: '1700px' }}
                        >
                            <div className="absolute inset-y-0" style={{ left: 14 }}>
                                {tr.clips.map((clip, ci) => (
                                    <TrackClip key={ci} clip={clip} color={tr.color} />
                                ))}
                            </div>
                            {/* Beat grid */}
                            {BEAT_MARKS.map(b => (
                                <div
                                    key={b}
                                    className={`absolute top-0 bottom-0 w-px ${b % 4 === 1 ? 'bg-white/5' : 'bg-white/2'}`}
                                    style={{ left: (b - 1) * 52 + 14 }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── BOTTOM PLUGIN RACK ── */}
            <div className="h-40 border-t border-white/5 bg-[#0A0E1A] flex gap-4 px-4 py-3 shrink-0 overflow-x-auto">
                {['EQ Audius', 'Comp Pro', 'Reverb Hall', 'Delay Tape', 'Saturator'].map((plugin, i) => (
                    <motion.div
                        key={plugin}
                        whileHover={{ scale: 1.02, y: -2 }}
                        onClick={() => setSelectedPlugin(plugin)}
                        className={`shrink-0 w-44 rounded-2xl border p-3 cursor-pointer transition-all ${selectedPlugin === plugin
                            ? 'border-neon-blue bg-neon-blue/5 shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                            : 'border-white/5 bg-white/3 hover:border-white/15'
                            }`}
                    >
                        <div className="text-[9px] font-black tracking-[0.3em] text-white/40 uppercase mb-1">{['EQ', 'COMP', 'REVERB', 'DELAY', 'SAT'][i]}</div>
                        <div className="text-xs font-bold text-white truncate">{plugin}</div>
                        {/* Mini knobs */}
                        <div className="flex gap-2 mt-3">
                            {[...Array(3)].map((_, k) => (
                                <div key={k} className="flex flex-col items-center gap-1">
                                    <div className="w-6 h-6 rounded-full border border-white/15 bg-black/40 flex items-center justify-center">
                                        <div className="w-0.5 h-2.5 bg-neon-blue rounded-full" style={{ transform: `rotate(${-120 + k * 60}deg)`, transformOrigin: 'bottom center' }} />
                                    </div>
                                    <span className="text-[6px] text-white/20 uppercase">{['Freq', 'Gain', 'Q'][k]}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {/* Add Plugin */}
                <div className="shrink-0 w-28 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neon-blue/40 hover:text-neon-blue text-white/20 transition-all">
                    <Plus size={20} />
                    <span className="text-[9px] uppercase tracking-widest font-black">Plugin</span>
                </div>
            </div>
        </div>
    );
};

export default AudiusEdit;
