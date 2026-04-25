import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, Pause, Square, SkipBack, Music, Layers, 
    Settings, Download, Plus, Trash2, Sliders, 
    Activity, Volume2, Move, Scissors, MousePointer2,
    Search, FolderOpen, Save, Share2, Zap, Sparkles,
    ChevronRight, ChevronDown, List, Book, Terminal,
    Database
} from 'lucide-react';
import { GenAudioEngine } from './core/GenAudioEngine';
import StemExtractModal from '../StemExtractModal';

/* --- Professional DAW Components --- */

const TrackHeader = ({ track, onSelect, active, onUpdate }) => (
    <div 
        onClick={() => onSelect(track.id)}
        className={`flex h-20 border-b border-white/5 transition-all group ${active ? 'bg-white/5' : 'hover:bg-white/2'}`}
    >
        <div className={`w-1 shadow-lg ${active ? 'bg-neon-blue' : 'bg-transparent group-hover:bg-white/10'}`} />
        <div className="flex-1 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-white/30">{track.type}</span>
                    <input 
                        type="text" 
                        value={track.name} 
                        onChange={(e) => onUpdate(track.id, { name: e.target.value })}
                        className="bg-transparent text-[11px] font-bold text-white/80 border-none outline-none focus:text-neon-blue transition-colors w-24"
                    />
                </div>
                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:text-red-500 rounded"><Trash2 size={10} /></button>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <div 
                        className="h-full bg-neon-blue/40" 
                        style={{ width: `${track.volume * 100}%` }} 
                    />
                </div>
                <div className="flex gap-1">
                    <button className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-white/40 hover:bg-white/10">M</button>
                    <button className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-white/40 hover:bg-white/10">S</button>
                </div>
            </div>
        </div>
    </div>
);

const Timeline = ({ tracks, currentTime, duration, onSeek }) => {
    return (
        <div className="relative flex-1 overflow-x-auto overflow-y-hidden select-none custom-scrollbar bg-[#050810]">
            {/* Playhead Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100%] pointer-events-none" />
            
            {/* Tracks Viewport */}
            <div className="min-w-[5000px] h-full relative">
                {tracks.map((t, i) => (
                    <div key={t.id} className="h-20 border-b border-white/5 relative bg-white/1">
                        {/* Regions would go here */}
                        <div className="absolute top-2 bottom-2 left-[400px] w-[600px] rounded-lg bg-gradient-to-r from-neon-blue/20 to-brand-violet/20 border border-white/10 backdrop-blur-sm flex items-center px-3 group cursor-move">
                            <span className="text-[9px] font-black uppercase text-white/40">{t.name} Clip</span>
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between px-1">
                                <div className="w-1 h-full bg-white/20 cursor-ew-resize" />
                                <div className="w-1 h-full bg-white/20 cursor-ew-resize" />
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Playhead Line */}
                <div 
                    className="absolute top-0 bottom-0 w-px bg-neon-blue shadow-[0_0_10px_rgba(0,229,255,0.8)] z-10 transition-transform duration-75"
                    style={{ transform: `translateX(${currentTime * 100}px)` }}
                />
            </div>
        </div>
    );
};

const GenDAW = () => {
    const [engine] = useState(() => new GenAudioEngine());
    const [tracks, setTracks] = useState([
        { id: '1', name: 'Synth Wave', type: 'midi', volume: 0.8 },
        { id: '2', name: 'Beat Loop', type: 'audio', volume: 0.6 },
        { id: '3', name: 'Bassline', type: 'midi', volume: 0.9 },
    ]);
    const [activeTrack, setActiveTrack] = useState('1');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [tempo, setTempo] = useState(128);
    const [showBrowser, setShowBrowser] = useState(true);
    const [isStemModalOpen, setIsStemModalOpen] = useState(false);
    
    // --- Hum-to-Music Recording States ---
    const [isRecording, setIsRecording] = useState(false);
    const [recordStatus, setRecordStatus] = useState('idle'); // idle | countdown | recording | processing
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const recorderRef = useRef(null);
    const micRef = useRef(null);

    useEffect(() => {
        // We initialize engine on first interaction to comply with browser audio policies
    }, []);

    const startHumToMusic = async () => {
        await engine.init();
        setRecordStatus('countdown');
        let count = 3;
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                startActualRecording();
            }
        }, 1000);
    };

    const startActualRecording = async () => {
        try {
            const { mic, recorder } = await engine.startRecording();
            micRef.current = mic;
            recorderRef.current = recorder;
            setIsRecording(true);
            setRecordStatus('recording');
            
            // Auto-stop after 30 seconds for MVP
            setTimeout(() => {
                if (isRecording) stopHumToMusic();
            }, 30000);
        } catch (err) {
            console.error("Recording failed:", err);
            setRecordStatus('idle');
        }
    };

    const stopHumToMusic = async () => {
        setIsRecording(false);
        setRecordStatus('processing');
        
        const blob = await engine.stopRecording(recorderRef.current, micRef.current);
        setRecordedBlob(blob);
        
        // Simulation of Cloud Upload & Modal Processing
        console.log("📤 Uploading hum pattern to S3/GCS...", blob);
        
        setTimeout(() => {
            setRecordStatus('idle');
            // Here we would receive the MIDI/Audio from the server
            alert("✨ ¡Magia completada! Tu melodía ha sido procesada y enviada a Modal. Pronto aparecerá en tu timeline.");
        }, 3000);
    };

    const togglePlay = () => {
        if (!isPlaying) engine.start();
        else engine.stop();
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="flex flex-col h-full text-white select-none relative" style={{ background: '#030810' }}>
            {/* bg_texture.png — Dark luxury DAW background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.22]" style={{ backgroundImage: 'url("/assets/brand/bg_texture.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
            
            {/* --- Project Header / Toolbar --- */}
            <header className="h-14 border-b border-white/5 bg-[#07090F]/80 backdrop-blur flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Gen DAW <span className="text-neon-blue font-black">v2.0</span></span>
                    </div>

                    <div className="h-6 w-px bg-white/5" />

                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-1.5 rounded-full">
                        <button onClick={() => setCurrentTime(0)} className="text-white/40 hover:text-white transition-colors p-1"><SkipBack size={16} /></button>
                        <button 
                            onClick={togglePlay}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-neon-blue text-black'}`}
                        >
                            {isPlaying ? <Square size={14} className="fill-current" /> : <Play size={14} className="fill-current" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4 px-4 h-8 bg-white/2 rounded-lg border border-white/5">
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-white/20 tracking-widest uppercase">Tempo</span>
                            <span className="text-xs font-mono font-bold text-neon-blue">{tempo}</span>
                        </div>
                        <div className="w-px h-1/2 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-[7px] font-black text-white/20 tracking-widest uppercase">Key</span>
                            <span className="text-xs font-mono font-bold text-white/80">C MIN</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => window.postMessage({ type: 'SWITCH_TO_MASTER' }, '*')}
                        className="flex items-center gap-2 px-5 py-2 rounded-full border border-brand-violet/20 bg-brand-violet/5 hover:bg-brand-violet/10 text-brand-violet transition-all group"
                    >
                        <Sparkles size={14} className="group-hover:animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">IA Mastering</span>
                    </button>
                    
                    <button className="p-2 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-all text-white/60">
                        <Save size={16} />
                    </button>
                    
                    <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-neon-blue text-black font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,229,255,0.3)]">
                        <Download size={14} />
                        Exportar
                    </button>
                </div>
            </header>

            {/* --- Main Workspace Area --- */}
            <main className="flex-1 flex overflow-hidden">
                
                {/* Left Sidebar - Browser */}
                <aside className="w-64 border-r border-white/5 bg-[#07090F] flex flex-col shrink-0">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex gap-4">
                            <button className="text-xs font-black uppercase text-neon-blue border-b border-neon-blue pb-1">Bancos</button>
                            <button className="text-xs font-black uppercase text-white/20 hover:text-white transition-colors pb-1">Loops</button>
                        </div>
                        <FolderOpen size={14} className="text-white/20" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <div className="flex flex-col items-center justify-center h-full text-white/20 opacity-50 p-6 text-center">
                            <Layers size={32} className="mb-4 text-neon-blue/40" />
                            <p className="text-[10px] uppercase font-black tracking-widest leading-relaxed">Arrastra tus Stems o Beats de Gen Audius aquí</p>
                        </div>
                    </div>

                    {/* AI Production Suite */}
                    <div className="p-4 bg-neon-blue/5 border-t border-neon-blue/10 space-y-3">
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-neon-blue mb-1">Ecosistema Pro</h4>
                        
                        <button 
                            onClick={startHumToMusic}
                            disabled={recordStatus !== 'idle'}
                            className={`w-full flex items-center justify-between p-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)] ${
                                recordStatus === 'recording' ? 'bg-red-500 text-white animate-pulse' : 
                                recordStatus === 'processing' ? 'bg-brand-violet text-white' :
                                'bg-white/5 text-white/80 hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            {recordStatus === 'idle' && (
                                <>
                                    Tararea tu idea
                                    <Activity size={12} className="text-neon-blue" />
                                </>
                            )}
                            {recordStatus === 'countdown' && `Iniciando en ${countdown}...`}
                            {recordStatus === 'recording' && (
                                <>
                                    Grabando... (Click para parar)
                                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                                </>
                            )}
                            {recordStatus === 'processing' && "Procesando IA..."}
                        </button>

                        <button 
                            onClick={() => setIsStemModalOpen(true)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-neon-blue text-black font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(0,229,255,0.2)]"
                        >
                            Extraer Stems
                            <Zap size={12} className="fill-current" />
                        </button>
                    </div>
                </aside>

                {/* Center - Arranger View */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Time Ruler */}
                    <div className="h-8 border-b border-white/5 bg-[#0B0F19] flex pointer-events-none">
                        <div className="w-48 shrink-0 border-r border-white/5" />
                        <div className="flex-1 overflow-hidden flex relative">
                            {[...Array(50)].map((_, i) => (
                                <div key={i} className="min-w-[400px] border-r border-white/5 px-2 text-[8px] text-white/20 flex items-center font-mono">
                                    {String(i + 1).padStart(2, '0')}:01:000
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex min-h-0">
                        {/* Track Headers Sidebar */}
                        <div className="w-48 border-r border-white/5 bg-[#07090F] flex flex-col shrink-0">
                            {tracks.map(t => (
                                <TrackHeader 
                                    key={t.id} 
                                    track={t} 
                                    active={activeTrack === t.id}
                                    onSelect={setActiveTrack}
                                    onUpdate={(id, update) => setTracks(prev => prev.map(t => t.id === id ? { ...t, ...update } : t))}
                                />
                            ))}
                            <button className="p-4 flex items-center justify-center text-white/20 hover:text-neon-blue transition-colors border-b border-white/2">
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Timeline / Arranger Area */}
                        <Timeline 
                            tracks={tracks} 
                            currentTime={currentTime} 
                            duration={300} 
                            onSeek={setCurrentTime}
                        />
                    </div>

                    {/* Bottom Panel - Mixer / Effects */}
                    <div className="h-64 border-t border-white/5 bg-[#07090F] flex flex-col overflow-hidden">
                        <div className="h-10 border-b border-white/5 flex items-center px-6 gap-6">
                            <button className="text-[10px] font-black uppercase text-neon-blue bg-neon-blue/10 px-3 py-1 rounded-full">Mezclador</button>
                            <button className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors">Editor MIDI</button>
                            <button className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors">Efectos Master</button>
                        </div>
                        
                        <div className="flex-1 flex p-6 gap-6 overflow-x-auto custom-scrollbar">
                            {tracks.map(t => (
                                <div key={t.id} className={`w-20 shrink-0 flex flex-col items-center gap-3 p-2 rounded-2xl ${activeTrack === t.id ? 'bg-white/5' : 'bg-transparent'}`}>
                                    <div className="flex-1 w-2 bg-black/40 rounded-full relative overflow-hidden border border-white/5">
                                        <div 
                                            className="absolute bottom-0 w-full bg-gradient-to-t from-neon-blue to-brand-cyan shadow-[0_0_10px_rgba(0,229,255,0.4)]" 
                                            style={{ height: `${t.volume * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[8px] font-bold text-white/40 uppercase rotate-90 w-12 text-center mt-2 truncate">{t.name}</span>
                                    <div className="text-[9px] font-mono text-white/60">{(t.volume * -48).toFixed(1)}</div>
                                </div>
                            ))}

                            <div className="w-px bg-white/5 mx-4" />

                            {/* Master Fader */}
                            <div className="w-24 shrink-0 flex flex-col items-center gap-3 p-2 rounded-2xl bg-brand-violet/5 border border-brand-violet/10">
                                <div className="flex-1 w-3 bg-black/40 rounded-full relative overflow-hidden border border-white/5">
                                    <div 
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-brand-violet to-purple-400 shadow-[0_0_10px_rgba(155,89,182,0.4)]" 
                                        style={{ height: '75%' }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-brand-violet uppercase">Master</span>
                                <div className="text-[10px] font-mono text-brand-violet font-bold">-6.2</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Properties / FX Chain */}
                <aside className="w-72 border-l border-white/5 bg-[#07090F] flex flex-col shrink-0">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Propiedades de Pista</span>
                        <Settings size={14} className="text-white/20" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        <div>
                            <h5 className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20 mb-4">Inserto de Efectos</h5>
                            <div className="space-y-2">
                                <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between group hover:border-neon-blue/30 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Zap size={14} className="text-neon-blue" />
                                        <span className="text-[11px] font-bold text-white/80">Pro Reverb V2</span>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                </div>
                                <div className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <Terminal size={14} />
                                        <span className="text-[11px] font-bold">Añadir Efecto...</span>
                                    </div>
                                    <Plus size={12} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h5 className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20 mb-4">Parámetros de Instrumento</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center relative bg-black/40">
                                        <div className="absolute top-1 w-1 h-3 bg-neon-blue rounded-full rotate-45" style={{ transformOrigin: '50% 150%' }} />
                                    </div>
                                    <span className="text-[8px] font-bold text-white/30 uppercase mt-2">Cutoff</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center relative bg-black/40">
                                        <div className="absolute top-1 w-1 h-3 bg-brand-violet rounded-full -rotate-12" style={{ transformOrigin: '50% 150%' }} />
                                    </div>
                                    <span className="text-[8px] font-bold text-white/30 uppercase mt-2">Resonance</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-brand-violet/5 border-t border-brand-violet/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={14} className="text-brand-violet" />
                            <span className="text-[11px] font-black uppercase text-white/60">Análisis Estéreo</span>
                        </div>
                        <div className="h-16 w-full flex items-end gap-1">
                            {[...Array(20)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="flex-1 bg-brand-violet/40 rounded-t-sm" 
                                    style={{ height: `${Math.random() * 100}%` }} 
                                />
                            ))}
                        </div>
                    </div>
                </aside>
            </main>

            <StemExtractModal 
                isOpen={isStemModalOpen} 
                onClose={() => setIsStemModalOpen(false)} 
                audioFile={{ name: 'Vocal_Recording_48k.wav' }}
            />
        </div>
    );
};

export default GenDAW;
