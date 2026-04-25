import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Headphones, Plus, ChevronDown, Sliders } from 'lucide-react';

const CHANNELS = [
    { id: 1, name: 'VOZ PRIN.', color: '#D4AF37', volume: 80, pan: -10, muted: false, solo: false, sends: { reverb: 40, delay: 20 }, eq: [0, 3, -2, 0, 4] },
    { id: 2, name: 'VOZ COR.', color: '#00E5FF', volume: 68, pan: 15, muted: false, solo: false, sends: { reverb: 60, delay: 15 }, eq: [0, 0, 2, 3, 0] },
    { id: 3, name: 'PIANO', color: '#9B59B6', volume: 72, pan: -20, muted: false, solo: false, sends: { reverb: 30, delay: 10 }, eq: [-3, 0, 0, 2, 5] },
    { id: 4, name: 'BAJO', color: '#E74C3C', volume: 82, pan: 0, muted: false, solo: false, sends: { reverb: 10, delay: 5 }, eq: [4, 2, -1, 0, 0] },
    { id: 5, name: 'KICK', color: '#2ECC71', volume: 88, pan: 0, muted: false, solo: false, sends: { reverb: 5, delay: 0 }, eq: [5, 0, -3, 0, 0] },
    { id: 6, name: 'SNARE', color: '#F39C12', volume: 75, pan: 0, muted: false, solo: false, sends: { reverb: 50, delay: 25 }, eq: [0, 2, 0, 4, 2] },
    { id: 7, name: 'HI-HAT', color: '#1ABC9C', volume: 60, pan: 20, muted: false, solo: false, sends: { reverb: 15, delay: 10 }, eq: [0, 0, 0, 0, 6] },
    { id: 8, name: 'PERC', color: '#E67E22', volume: 55, pan: -25, muted: false, solo: false, sends: { reverb: 35, delay: 20 }, eq: [0, 0, 3, 0, 0] },
    { id: 9, name: 'GUITAR', color: '#3498DB', volume: 58, pan: 30, muted: false, solo: false, sends: { reverb: 25, delay: 30 }, eq: [0, -2, 2, 0, 3] },
    { id: 10, name: 'FX', color: '#8E44AD', volume: 42, pan: 0, muted: false, solo: false, sends: { reverb: 80, delay: 60 }, eq: [0, 0, 0, 2, 5] },
    { id: 11, name: 'BUS VERB', color: '#16A085', volume: 65, pan: 0, muted: false, solo: false, sends: { reverb: 0, delay: 0 }, eq: [0, 0, 0, 2, 4] },
    { id: 12, name: 'MASTER', color: '#D4AF37', volume: 90, pan: 0, muted: false, solo: false, sends: { reverb: 0, delay: 0 }, eq: [0, 0, 0, 0, 0] },
];

const EQ_BANDS = ['80', '250', '1k', '4k', '12k'];

const ChannelStrip = ({ ch, onToggleMute, onToggleSolo, onVolumeChange }) => {
    const isMaster = ch.name === 'MASTER';
    return (
        <div className={`flex flex-col items-center gap-2 w-[72px] shrink-0 rounded-2xl border p-2 transition-all ${ch.solo
                ? 'border-neon-blue bg-neon-blue/5'
                : isMaster
                    ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5'
                    : 'border-white/5 bg-[#0D1220] hover:border-white/15'
            }`}>

            {/* Channel Name */}
            <span className="text-[9px] font-black tracking-widest text-white/50 uppercase truncate w-full text-center">{ch.name}</span>

            {/* Mini EQ visual */}
            <div className="w-full h-10 flex items-end gap-px bg-black/30 rounded-lg px-1 overflow-hidden">
                {ch.eq.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div
                            className="w-full rounded-t-sm"
                            style={{
                                height: `${50 + val * 4}%`,
                                backgroundColor: val > 0 ? ch.color : '#E74C3C',
                                opacity: 0.7,
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Pan knob */}
            <div className="flex flex-col items-center gap-0.5">
                <div
                    className="w-7 h-7 rounded-full border border-white/15 bg-black/50 relative"
                    title={`Pan: ${ch.pan > 0 ? 'R' : ch.pan < 0 ? 'L' : 'C'}${Math.abs(ch.pan)}`}
                >
                    <div
                        className="absolute w-0.5 h-2.5 rounded-full bg-white/70 top-1 left-1/2 -translate-x-1/2 origin-bottom"
                        style={{ transform: `rotate(${ch.pan * 1.2}deg) translateX(-50%)` }}
                    />
                    {/* Center dot */}
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                        <div className="w-1 h-1 rounded-full bg-neon-blue" />
                    </div>
                </div>
                <span className="text-[7px] text-white/20">PAN</span>
            </div>

            {/* M / S buttons */}
            <div className="flex gap-1">
                <button
                    onClick={() => onToggleMute(ch.id)}
                    className={`w-7 h-5 rounded text-[8px] font-black transition-all ${ch.muted ? 'bg-amber-400/80 text-black' : 'bg-white/5 text-white/30 hover:text-white'
                        }`}
                >M</button>
                <button
                    onClick={() => onToggleSolo(ch.id)}
                    className={`w-7 h-5 rounded text-[8px] font-black transition-all ${ch.solo ? 'bg-neon-blue text-black' : 'bg-white/5 text-white/30 hover:text-white'
                        }`}
                >S</button>
            </div>

            {/* Sends */}
            {!isMaster && (
                <div className="w-full space-y-1">
                    {Object.entries(ch.sends).map(([bus, val]) => (
                        <div key={bus} className="flex items-center gap-1">
                            <span className="text-[6px] text-white/20 uppercase w-6 shrink-0">{bus.slice(0, 3)}</span>
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: ch.color, opacity: 0.7 }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Volume Fader */}
            <div className="flex flex-col items-center gap-1 flex-1 justify-end">
                <div className="relative h-24 w-4 flex items-center justify-center">
                    {/* Track */}
                    <div className="absolute w-1 h-full bg-black/50 rounded-full border border-white/5" />
                    {/* Level indicator */}
                    <div
                        className="absolute bottom-0 w-1 rounded-full transition-all"
                        style={{ height: `${ch.volume}%`, backgroundColor: ch.muted ? '#444' : ch.color, opacity: ch.muted ? 0.3 : 0.8 }}
                    />
                    {/* Fader handle */}
                    <div
                        className="absolute w-7 h-3 bg-[#1E2A40] border border-white/20 rounded cursor-grab shadow-lg"
                        style={{ bottom: `calc(${ch.volume}% - 6px)` }}
                    >
                        <div className="absolute inset-x-1 top-1/2 h-px bg-white/30" />
                    </div>
                </div>
                {/* dB readout */}
                <span className="text-[8px] font-mono text-white/40">
                    {ch.volume === 0 ? '-∞' : `${Math.round((ch.volume / 100) * 12 - 12)}dB`}
                </span>
            </div>

            {/* VU Meter */}
            <div className="flex gap-0.5 h-16">
                {[0, 1].map(c => (
                    <div key={c} className="w-2 bg-black/40 rounded-sm overflow-hidden flex flex-col-reverse gap-px p-px">
                        {Array.from({ length: 16 }).map((_, i) => {
                            const level = Math.floor((ch.volume / 100) * 16);
                            const lit = i < level;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 rounded-sm transition-all"
                                    style={{
                                        backgroundColor: lit
                                            ? i > 12 ? '#E74C3C' : i > 9 ? '#F39C12' : ch.color
                                            : 'rgba(255,255,255,0.04)',
                                        opacity: lit ? 0.9 + Math.random() * 0.1 : 1,
                                    }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AudiusMix = () => {
    const [channels, setChannels] = useState(CHANNELS);
    const [selectedBus, setSelectedBus] = useState('reverb');

    const toggleMute = (id) => setChannels(c => c.map(ch => ch.id === id ? { ...ch, muted: !ch.muted } : ch));
    const toggleSolo = (id) => setChannels(c => c.map(ch => ch.id === id ? { ...ch, solo: !ch.solo } : ch));

    const buses = ['REVERB BUS', 'DELAY BUS', 'COMP BUS', 'PARALLEL BUS'];

    return (
        <div className="flex flex-col h-full bg-[#080C18] text-white overflow-hidden">

            {/* Top Bar */}
            <div className="flex items-center gap-4 px-4 py-2 bg-[#0A0E1A] border-b border-white/5 shrink-0">
                <span className="text-[10px] font-black text-white/30 tracking-[0.4em] uppercase">Mix Audius — Console View</span>
                <div className="flex gap-2 ml-auto">
                    {buses.map(b => (
                        <button
                            key={b}
                            onClick={() => setSelectedBus(b.split(' ')[0].toLowerCase())}
                            className={`text-[8px] tracking-widest uppercase font-black px-3 py-1 rounded-full transition-all border ${selectedBus === b.split(' ')[0].toLowerCase()
                                    ? 'bg-neon-blue text-black border-neon-blue'
                                    : 'border-white/5 text-white/30 hover:border-white/15 hover:text-white'
                                }`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* Master EQ / Master FX strip */}
            <div className="flex items-center gap-4 px-4 py-3 bg-[#0D1220] border-b border-white/5 shrink-0 overflow-x-auto">
                <span className="text-[9px] text-white/30 uppercase tracking-widest shrink-0">MASTER CHAIN</span>
                {['EQ Master', 'Comp Bus', 'Limiter', 'Stereo Width', 'Tape Sat'].map((fx, i) => (
                    <div key={fx} className="flex items-center gap-2 bg-black/30 rounded-xl px-3 py-2 border border-white/5 shrink-0">
                        <span className="text-[9px] font-bold text-white/60 uppercase">{fx}</span>
                        <div className="w-px h-4 bg-white/5" />
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, k) => (
                                <div key={k} className="w-5 h-5 rounded-full border border-white/10 bg-black/40 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-0.5 h-3 bg-[#D4AF37] rounded-full" style={{ transform: `rotate(${-120 + (i + k) * 40}deg)` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mixer Console */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-2 h-full px-4 py-4 items-end min-w-max">
                    {channels.map(ch => (
                        <ChannelStrip
                            key={ch.id}
                            ch={ch}
                            onToggleMute={toggleMute}
                            onToggleSolo={toggleSolo}
                        />
                    ))}
                    {/* Add channel */}
                    <div className="w-[72px] shrink-0 h-48 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neon-blue/30 text-white/20 hover:text-neon-blue transition-all">
                        <Plus size={16} />
                        <span className="text-[8px] uppercase tracking-widest">Canal</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudiusMix;
