import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sliders, Activity, Zap, Volume2, TrendingUp, Upload,
    Wand2, CheckCircle, AlertCircle, Undo2, Redo2, Sparkles,
    Settings, Maximize2, History, Info, Trash2, Download, ChevronDown, Lock,
    Play, Pause, SkipBack, SkipForward, FastForward, Rewind
} from 'lucide-react';
import { LogoIcon } from '../BrandLogo';
import { analyzeAndRecommendMastering } from '../../services/aiService';
import { LiveEngine, masterize } from '../../services/audioEngine';
import { useDatabase } from '../../context/DatabaseContext';

/* ── Professional Knob Component ── */
const Knob = ({ label, value, unit = '', min = 0, max = 100, step = 1, onChange, color = '#00E5FF' }) => {
    const knobRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        e.preventDefault(); // Prevent text selection
        setIsDragging(true);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!knobRef.current) return;
        const rect = knobRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;

        // Normalize angle to 0-270 range (starting from bottom-left)
        let normalizedAngle = (angle + 135) % 360;
        if (normalizedAngle < 0) normalizedAngle += 360;
        if (normalizedAngle > 270) return; // Dead zone

        const newValue = min + (normalizedAngle / 270) * (max - min);
        onChange?.(Math.round(newValue / step) * step);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    const normalized = (parseFloat(value) - min) / (max - min);
    const rotation = isNaN(normalized) ? -135 : (normalized * 270) - 135;

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                ref={knobRef}
                onMouseDown={handleMouseDown}
                className="relative group cursor-ns-resize"
            >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#2a3447] to-[#121826] shadow-xl border ${isDragging ? 'border-neon-blue/50' : 'border-white/5'} flex items-center justify-center relative transition-colors`}>
                    <motion.div
                        className="absolute w-1 h-3 rounded-full top-1 bg-neon-blue shadow-[0_0_8px_rgba(0,229,255,0.8)]"
                        style={{ transformOrigin: '50% 150%', rotate: rotation }}
                    />
                    <div className="w-8 h-8 rounded-full bg-[#1b263b] border border-white/10 shadow-inner" />
                </div>
                <div className={`absolute inset-0 rounded-full border border-neon-blue/0 ${isDragging ? 'border-neon-blue/40 scale-110' : 'group-hover:border-neon-blue/20 scale-110'} transition-all`} />
            </div>
            <div className="flex flex-col items-center leading-none">
                <span className="text-[7px] text-white/30 uppercase tracking-[0.2em] mb-1 font-black">{label}</span>
                <span className="text-[10px] font-mono text-white/70">{typeof value === 'number' ? value.toFixed(1) : value}{unit}</span>
            </div>
        </div>
    );
};

/* ── Mode Button ── */
const ModeButton = ({ label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${active
            ? 'bg-neon-blue text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]'
            : 'bg-white/5 text-white/40 hover:text-white/70'
            }`}
    >
        {label}
    </button>
);

/* ── Spectral Wave Visualizer ── */
const SpectralWave = ({ active }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let frame;
        let offset = 0;

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            if (active) {
                // Background Glow
                const grad = ctx.createLinearGradient(0, 0, 0, h);
                grad.addColorStop(0, 'rgba(0, 229, 255, 0.05)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.moveTo(0, h);
                for (let x = 0; x <= w; x++) {
                    const i = x / w;
                    const y = h * 0.7 - Math.sin(x * 0.01 + offset) * 10
                        - Math.sin(x * 0.02 - offset * 0.5) * 5
                        - (Math.random() * 2);
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.fill();

                // Line
                ctx.beginPath();
                ctx.strokeStyle = '#00E5FF';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00E5FF';
                ctx.moveTo(0, h * 0.7);
                for (let x = 0; x <= w; x++) {
                    const y = h * 0.7 - Math.sin(x * 0.01 + offset) * 10
                        - Math.sin(x * 0.02 - offset * 0.5) * 5
                        - (Math.random() * 2);
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
                offset += 0.05;
            } else {
                // Static flat line
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                ctx.moveTo(0, h * 0.7);
                ctx.lineTo(w, h * 0.7);
                ctx.stroke();
            }
            frame = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(frame);
    }, [active]);

    return <canvas ref={canvasRef} width={800} height={180} className="w-full h-full" />;
};

// ── New Brand Wave Component ──
const MultiColorWave = () => (
    <div className="absolute inset-0 flex items-center justify-center opacity-40">
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-full h-full border-b-2"
                style={{
                    borderColor: i === 0 ? '#FFD700' : i === 1 ? '#9b59b6' : '#3498db',
                    borderRadius: '100%',
                    filter: i === 0 ? 'blur(20px)' : 'blur(40px)',
                    zIndex: -i
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0, -5, 0],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                    duration: 4 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        ))}
        {/* The "M" styled central frequency */}
        <div className="w-[80%] h-48 relative overflow-hidden">
            <motion.svg
                viewBox="0 0 800 200"
                className="w-full h-full"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#9b59b6" />
                        <stop offset="100%" stopColor="#3498db" />
                    </linearGradient>
                </defs>
                <motion.path
                    d="M0,100 C150,50 250,150 400,100 C550,50 650,150 800,100"
                    fill="none"
                    stroke="url(#brandGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        strokeWidth: [8, 12, 8]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.svg>
        </div>
    </div>
);

const AudiusMaster = () => {
    const { saveProject, addToHistory, deleteFromHistory, history: dbHistory } = useDatabase();
    const [userPlan, setUserPlan] = useState('free'); // 'free' | 'standard' | 'pro'
    const [isBypass, setIsBypass] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMasterized, setIsMasterized] = useState(false);
    const [mode, setMode] = useState('Balanced');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioBuffer, setAudioBuffer] = useState(null);
    const [aiProfile, setAiProfile] = useState(null);
    const [statusText, setStatusText] = useState('');
    const [fileName, setFileName] = useState('');
    const [masteringParams, setMasteringParams] = useState({
        presence: 48,
        stereoWidth: 110,
        ceiling: -0.1,
        exciter: 45,
        tape: 30,
        loudness: 'Medium'
    });
    const [isGainMatch, setIsGainMatch] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    // Undo/Redo Stack
    const [historyStack, setHistoryStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const pushToStack = (params) => {
        setHistoryStack(prev => [...prev, params].slice(-20));
        setRedoStack([]);
    };

    const handleUndo = () => {
        if (historyStack.length === 0) return;
        const prev = historyStack[historyStack.length - 1];
        setRedoStack(r => [...r, masteringParams]);
        setHistoryStack(h => h.slice(0, -1));
        setMasteringParams(prev);
        if (engineRef.current) engineRef.current.updateParams(prev);
    };

    const handleRedo = () => {
        if (redoStack.length === 0) return;
        const next = redoStack[redoStack.length - 1];
        setHistoryStack(h => [...h, masteringParams]);
        setRedoStack(r => r.slice(0, -1));
        setMasteringParams(next);
        if (engineRef.current) engineRef.current.updateParams(next);
    };

    useEffect(() => {
        // Apply Mode Presets
        let presets = {};
        if (mode === 'Warm') {
            presets = { eqLow: 2.5, eqHigh: -1.5, sat: 25, comp: 3.0 };
        } else if (mode === 'Balanced') {
            presets = { eqLow: 0.5, eqHigh: 0.5, sat: 15, comp: 2.5 };
        } else if (mode === 'Open') {
            presets = { eqLow: -1.0, eqHigh: 3.5, sat: 10, comp: 2.0 };
        }

        setMasteringParams(prev => {
            const next = { ...prev, ...presets };
            if (engineRef.current && engineRef.current.updateParams) {
                engineRef.current.updateParams(next);
            }
            return next;
        });
    }, [mode]);

    const fileRef = useRef(null);
    const engineRef = useRef(new LiveEngine());
    const animationRef = useRef(null);
    const lastTimeRef = useRef(performance.now());

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (engineRef.current) engineRef.current.destroy();
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // Playback loop for progress bar
    const updateProgress = () => {
        if (!engineRef.current || !engineRef.current.ctx) return;

        const now = performance.now();
        const dt = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        if (isPlaying) {
            setCurrentTime(prev => {
                const next = prev + dt;
                if (next >= duration) {
                    setIsPlaying(false);
                    engineRef.current.stop();
                    return duration;
                }
                return next;
            });
        }
        animationRef.current = requestAnimationFrame(updateProgress);
    };

    useEffect(() => {
        lastTimeRef.current = performance.now();
        if (isPlaying) {
            animationRef.current = requestAnimationFrame(updateProgress);
        } else {
            cancelAnimationFrame(animationRef.current);
        }
        return () => cancelAnimationFrame(animationRef.current);
    }, [isPlaying, duration]);

    const handlePlayPause = () => {
        if (!audioBuffer) return;
        if (isPlaying) {
            engineRef.current.stop();
            setIsPlaying(false);
        } else {
            const chain = aiProfile?.chain || {};
            engineRef.current.init(audioBuffer, chain).then(() => {
                engineRef.current.play(currentTime);
                setIsPlaying(true);
            });
        }
    };

    const handleSeek = (time) => {
        const newTime = Math.max(0, Math.min(time, duration));
        setCurrentTime(newTime);
        if (isPlaying) {
            engineRef.current.stop();
            const chain = { ...aiProfile?.chain, ...masteringParams };
            engineRef.current.init(audioBuffer, chain).then(() => {
                engineRef.current.play(newTime);
            });
        }
    };

    const handleRewind = () => handleSeek(currentTime - 10);
    const handleFastForward = () => handleSeek(currentTime + 10);

    const updateParam = (key, val) => {
        if (masteringParams[key] === val) return;
        pushToStack(masteringParams);
        setMasteringParams(prev => {
            const next = { ...prev, [key]: val };
            if (engineRef.current && engineRef.current.updateParams) {
                engineRef.current.updateParams(next);
            }
            return next;
        });
    };

    const toggleBypass = () => {
        setIsBypass(prev => !prev);
        if (engineRef.current && engineRef.current.setBypass) {
            engineRef.current.setBypass(!isBypass);
        }
    };

    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('audio/')) return;
        setIsAnalyzing(true);
        setStatusText('Analizando señal...');
        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = await audioCtx.decodeAudioData(arrayBuffer);

            // Artificial delay for LANDR-like feeling
            await new Promise(r => setTimeout(r, 1500));

            const profile = analyzeAndRecommendMastering(buffer);
            setAiProfile(profile);
            setAudioBuffer(buffer);
            setFileName(file.name);
            setDuration(buffer.duration);
            setStatusText('✅ Análisis Completo');
            setIsMasterized(true);

            // Save to Local DB (Original)
            const projectData = {
                type: 'mastering',
                name: file.name,
                profile: profile,
                duration: buffer.duration,
                status: 'original'
            };
            saveProject(projectData);
            addToHistory({ ...projectData, title: `${file.name} (Original)`, timestamp: new Date().toISOString() });

            // Initialize engine with buffer
            await engineRef.current.init(buffer, profile);
        } catch (e) {
            console.error(e);
            setStatusText('❌ Error en análisis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col h-full text-white select-none relative overflow-hidden" style={{ background: '#030816' }}>
            
            {/* bg_texture.png — Dark luxury studio background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.28]" style={{ backgroundImage: 'url("/assets/brand/bg_texture.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
            </div>

            {/* Background animated gradients */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(107,33,212,0.2),transparent_70%)]" />
                <div className="absolute bottom-0 h-1/2 w-full bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            {/* ── LANDR style Header ── */}
            <header className="flex items-center justify-between px-8 py-4 bg-[#121826]/40 border-b border-white/5 backdrop-blur-md shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-lg font-black tracking-tighter uppercase text-white/90">GEN <span className="text-white">Mastering</span></h1>
                        <p className="text-[8px] font-bold tracking-[0.4em] text-white/40 uppercase leading-none">Studio Engine Pro</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleUndo}
                            disabled={historyStack.length === 0}
                            className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white disabled:opacity-10"
                        >
                            <Undo2 size={16} />
                        </button>
                        <button 
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                            className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white disabled:opacity-10"
                        >
                            <Redo2 size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center gap-2 p-2 rounded-full transition-all ${showHistory ? 'text-neon-blue bg-neon-blue/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        <History size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Historial</span>
                    </button>

                    <button
                        disabled={!audioBuffer || isProcessing}
                        onClick={async () => {
                            if (!audioBuffer) return;
                            setIsProcessing(true);
                            setStatusText('Renderizando Master...');
                            try {
                                const { wavBlob } = await masterize(audioBuffer, aiProfile.chain);
                                const url = URL.createObjectURL(wavBlob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `GEN-Master-${Date.now()}.wav`;
                                a.click();
                                setStatusText('✅ Master Exportado');

                                // Add Master to History
                                addToHistory({
                                    type: 'mastering_export',
                                    title: `${fileName} (Masterizado)`,
                                    status: 'mastered',
                                    timestamp: new Date().toISOString()
                                });
                            } catch (e) {
                                setStatusText('❌ Error en render');
                            } finally {
                                setIsProcessing(false);
                            }
                        }}
                        className="px-10 py-2.5 bg-gradient-brand text-black font-black rounded-full uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-[0_0_30px_rgba(155,89,182,0.4)] disabled:opacity-30 disabled:scale-100"
                    >
                        {isProcessing ? 'Procesando...' : 'Exportar Master'}
                    </button>

                    <div className="flex items-center gap-1 border border-white/10 rounded-full px-4 py-1.5 bg-white/5">
                        <button 
                            onClick={() => setIsGainMatch(!isGainMatch)}
                            className={`text-[10px] font-bold px-2 transition-all ${isGainMatch ? 'text-neon-blue' : 'text-white/40 hover:text-white'}`}
                        >
                            Gain Match
                        </button>
                        <div className="w-px h-3 bg-white/10 mx-1" />
                        <button
                            onClick={toggleBypass}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all uppercase ${isBypass ? 'bg-red-500/20 text-red-500' : 'text-white/40 hover:text-white'}`}
                        >
                            {isBypass ? 'Bypass On' : 'Bypass'}
                        </button>
                    </div>

                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 transition-colors ${showSettings ? 'text-neon-blue' : 'text-white/20 hover:text-white'}`}
                    >
                        <Settings size={18} />
                    </button>
                </div>
            </header>

            {/* ── Main Workspace ── */}
            <div className="flex-1 flex overflow-hidden relative z-10">

                {/* Session History Sidebar */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 300, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-[#07090F] border-r border-white/5 flex flex-col overflow-hidden shrink-0"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase">Sesiones Recientes</h3>
                                <select 
                                    value={userPlan} 
                                    onChange={(e) => setUserPlan(e.target.value)}
                                    className="bg-transparent text-[8px] font-black uppercase text-neon-blue border border-neon-blue/20 rounded px-1 group-hover:border-neon-blue transition-colors outline-none cursor-pointer"
                                >
                                    <option value="free" className="text-black bg-white">FREE</option>
                                    <option value="standard" className="text-black bg-white">STD</option>
                                    <option value="pro" className="text-black bg-white">PRO</option>
                                </select>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {(dbHistory || []).filter(h => h.type?.includes('mastering')).reverse().map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => {
                                            if (item.status === 'original' || item.profile) {
                                                setAiProfile(item.profile);
                                                setFileName(item.name || item.title);
                                                setDuration(item.duration);
                                                setIsMasterized(true);
                                                // If we had the actual buffer, we'd set it here.
                                                // For now, we at least restore the UI state.
                                                setStatusText(`Sesión cargada: ${item.title}`);
                                            }
                                        }}
                                        className="p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors group relative cursor-pointer"
                                    >
                                        
                                        {/* Action buttons (Trash) */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteFromHistory(item.id); }}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-500/20 text-white/20 hover:text-red-500 transition-all z-10"
                                        >
                                            <Trash2 size={10} />
                                        </button>

                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${item.status === 'original' ? 'text-amber-500/80' : 'text-neon-blue'}`}>
                                                {item.status === 'original' ? 'Original Source' : 'Masterized Version'}
                                            </span>
                                            <span className="text-[7px] text-white/20">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-[11px] font-bold text-white/80 truncate mb-3">{item.title || item.name}</div>
                                        
                                        {/* Download Flow based on Plan */}
                                        <div className="flex items-center gap-3 border-t border-white/5 pt-2">
                                            <div className="relative group/format">
                                                <button className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-neon-blue transition-colors">
                                                    <Download size={10} />
                                                    Formatos
                                                    <ChevronDown size={8} />
                                                </button>
                                                
                                                {/* Format Dropdown */}
                                                <div className="absolute bottom-full left-0 mb-2 w-32 bg-[#121826] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/format:opacity-100 group-hover/format:visible transition-all p-1 z-50">
                                                    {/* MP3 (Free) */}
                                                    <button className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors group/item">
                                                        <span className="text-[9px] font-bold text-white/60 group-hover/item:text-white">MP3 128kbps</span>
                                                        <span className="text-[7px] font-black text-green-500">FREE</span>
                                                    </button>
                                                    
                                                    {/* MP3 HD (Standard) */}
                                                    <button className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors group/item ${userPlan === 'free' ? 'opacity-40' : ''}`}>
                                                        <span className="text-[9px] font-bold text-white/60 group-hover/item:text-white">MP3 320kbps</span>
                                                        {userPlan === 'free' ? <Lock size={8} className="text-white/20" /> : <span className="text-[7px] font-black text-neon-blue">HQ</span>}
                                                    </button>

                                                    {/* WAV (Pro) */}
                                                    <button className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors group/item ${userPlan !== 'pro' ? 'opacity-40' : ''}`}>
                                                        <span className="text-[9px] font-bold text-white/60 group-hover/item:text-white">WAV Lossless</span>
                                                        {userPlan !== 'pro' ? <Lock size={8} className="text-white/20" /> : <span className="text-[7px] font-black text-violet-400">PRO</span>}
                                                    </button>

                                                    {/* HI-WAV (Pro+) */}
                                                    <button className={`w-full flex items-center justify-between px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors group/item ${userPlan !== 'pro' ? 'opacity-40' : ''}`}>
                                                        <span className="text-[9px] font-bold text-white/60 group-hover/item:text-white">HI-WAV 24bit</span>
                                                        {userPlan !== 'pro' ? <Lock size={8} className="text-white/20" /> : <span className="text-[7px] font-black text-brand-violet">STUDIO</span>}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="h-2 w-px bg-white/5" />
                                            
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1 h-1 rounded-full ${userPlan === 'pro' ? 'bg-green-500' : userPlan === 'standard' ? 'bg-blue-500' : 'bg-white/20'}`} />
                                                <span className="text-[7px] font-black uppercase text-white/20">Plan: {userPlan}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                <div className="flex-1 flex flex-col items-center">
                    {!audioBuffer && !isAnalyzing ? (
                        /* Empty State - Dropzone */
                        <div className="flex-1 w-full flex items-center justify-center p-8">
                            <label className="w-full max-w-2xl aspect-video border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-neon-blue/50 transition-colors bg-white/5 hover:bg-white/10 group relative overflow-hidden">
                                <MultiColorWave />
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-neon-blue/10 flex items-center justify-center mb-6 text-neon-blue group-hover:scale-110 transition-transform">
                                        <Upload size={32} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-2 uppercase tracking-widest">Sube tu Mix</h2>
                                    <p className="text-white/40 text-sm font-medium">Arrastra un archivo WAV/MP3 o haz clic para explorar</p>
                                    <p className="text-white/20 text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">Max 15 min • Estéreo • 44.1kHz+</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="audio/*"
                                    onChange={(e) => handleFile(e.target.files[0])}
                                />
                            </label>
                        </div>
                    ) : isAnalyzing ? (
                        /* Analyzing State */
                        <div className="flex-1 w-full flex flex-col items-center justify-center">
                            <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 rounded-full border-2 border-neon-blue/20 border-t-neon-blue"
                                />
                                <LogoIcon className="w-16 h-16 text-neon-blue animate-pulse" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-widest mb-2 text-neon-blue drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">AI Master Engine</h2>
                            <p className="text-white/40 font-mono text-sm">{statusText}</p>
                            
                            <div className="w-64 h-1 bg-white/5 rounded-full mt-8 overflow-hidden">
                                <motion.div 
                                    className="h-full bg-neon-blue"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                            </div>
                        </div>
                    ) : (
                        /* Master UI */
                        <div className="w-full flex-1 flex flex-col min-h-0">
                            {/* Visualizer Top Bar */}
                            <div className="h-48 border-b border-white/5 relative bg-[#07090F] overflow-hidden shrink-0">
                                {/* Frequency grid lines */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
                                
                                <div className="absolute inset-0 opacity-80" style={{ filter: isBypass ? 'grayscale(100%) opacity(50%)' : 'none' }}>
                                    <SpectralWave active={isPlaying} />
                                </div>
                                
                                <div className="absolute top-4 left-4 flex gap-4">
                                    <div className="bg-black/80 backdrop-blur border border-white/10 px-4 py-2 rounded-lg flex items-center gap-3">
                                        <LogoIcon className={isBypass ? 'text-white/20' : 'text-neon-blue'} />
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Status</div>
                                            <div className={`text-xs font-bold ${isBypass ? 'text-white/40' : 'text-white'}`}>{isBypass ? 'Bypassed' : 'Masterizing'}</div>
                                        </div>
                                    </div>
                                    <div className="bg-black/80 backdrop-blur border border-white/10 px-4 py-2 rounded-lg flex flex-col justify-center">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Active Profile</div>
                                        <div className="text-xs font-bold text-neon-blue flex items-center gap-1">
                                            <Sparkles size={12} /> {aiProfile?.name || 'GEN Master 1'}
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                                    <div className="text-[10px] uppercase font-black tracking-widest text-white/20">LUFS (Int)</div>
                                    <div className={`text-xl font-black font-mono ${isBypass ? 'text-white/40' : 'text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]'}`}>
                                        {isBypass ? '-14.0' : '-8.5'}
                                    </div>
                                </div>
                            </div>

                            {/* Transport Controls (Daw style) */}
                            <div className="px-8 py-3 bg-[#0B0F19] border-b border-white/5 flex items-center justify-between shrink-0">
                                {/* Time Display */}
                                <div className="font-mono text-xl font-bold tracking-wider text-neon-blue drop-shadow-[0_0_5px_rgba(0,229,255,0.3)] w-24">
                                    {formatTime(currentTime)}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleSeek(0)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                                        <SkipBack size={18} className="fill-white" />
                                    </button>
                                    <button onClick={handleRewind} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                                        <Rewind size={18} className="fill-white" />
                                    </button>
                                    <button 
                                        onClick={handlePlayPause}
                                        className="w-14 h-14 rounded-full flex items-center justify-center bg-neon-blue text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                                    >
                                        {isPlaying ? <Pause size={24} className="fill-black" /> : <Play size={24} className="fill-black translate-x-0.5" />}
                                    </button>
                                    <button onClick={handleFastForward} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                                        <FastForward size={18} className="fill-white" />
                                    </button>
                                    <button onClick={() => handleSeek(duration)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                                        <SkipForward size={18} className="fill-white" />
                                    </button>
                                </div>

                                {/* Progress Bar Mini */}
                                <div className="flex items-center gap-4 w-64">
                                    <div 
                                        className="flex-1 h-3 bg-black rounded-full overflow-hidden cursor-pointer relative border border-white/10 group"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const percent = (e.clientX - rect.left) / rect.width;
                                            handleSeek(percent * duration);
                                        }}
                                    >
                                        <div 
                                            className="h-full bg-neon-blue shadow-[0_0_10px_rgba(0,229,255,0.5)] border-r border-[#fff]"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        />
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="font-mono text-xs text-white/40">{formatTime(duration)}</div>
                                </div>
                            </div>

                            {/* Center Panel (Knobs & Modes) */}
                            <div className="flex-1 flex min-h-0">
                                
                                {/* IA Modes */}
                                <div className="w-48 border-r border-white/5 bg-[#07090F] p-6 flex flex-col gap-8 overflow-y-auto">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">Color</h3>
                                        <div className="flex flex-col gap-3">
                                            <ModeButton label="Warm" active={mode === 'Warm'} onClick={() => setMode('Warm')} />
                                            <ModeButton label="Balanced" active={mode === 'Balanced'} onClick={() => setMode('Balanced')} />
                                            <ModeButton label="Open" active={mode === 'Open'} onClick={() => setMode('Open')} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">Loudness</h3>
                                        <div className="flex flex-col gap-3">
                                            <ModeButton label="Low (-14)" active={masteringParams.loudness === 'Low'} onClick={() => updateParam('loudness', 'Low')} />
                                            <ModeButton label="Medium (-10)" active={masteringParams.loudness === 'Medium'} onClick={() => updateParam('loudness', 'Medium')} />
                                            <ModeButton label="High (-8)" active={masteringParams.loudness === 'High'} onClick={() => updateParam('loudness', 'High')} />
                                        </div>
                                    </div>
                                </div>

                                {/* Mastering Rack */}
                                <div className="flex-1 p-8 grid grid-cols-4 gap-8 overflow-y-auto bg-[#0A0D14]">
                                    
                                    {/* EQ Section */}
                                    <div className="col-span-1 bg-[#121826]/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><Zap size={100} /></div>
                                        <div className="flex items-center gap-2 mb-8">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Dynamic EQ</h3>
                                        </div>
                                        <div className="flex flex-col gap-8 items-center relative z-10">
                                            <Knob label="Low" value={masteringParams.eqLow} min={-6} max={6} step={0.1} unit="dB" onChange={v => updateParam('eqLow', v)} />
                                            <Knob label="Mid" value={masteringParams.eqMid} min={-6} max={6} step={0.1} unit="dB" onChange={v => updateParam('eqMid', v)} />
                                            <Knob label="High" value={masteringParams.eqHigh} min={-6} max={6} step={0.1} unit="dB" onChange={v => updateParam('eqHigh', v)} />
                                        </div>
                                    </div>

                                    {/* Dynamics Section */}
                                    <div className="col-span-1 bg-[#121826]/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><Activity size={100} /></div>
                                        <div className="flex items-center gap-2 mb-8">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Dynamics</h3>
                                        </div>
                                        <div className="flex flex-col gap-8 items-center relative z-10">
                                            <Knob label="Compress" value={masteringParams.comp} min={1} max={10} step={0.1} unit=":1" onChange={v => updateParam('comp', v)} />
                                            <Knob label="Punch" value={masteringParams.presence} min={0} max={100} step={1} unit="%" onChange={v => updateParam('presence', v)} />
                                            <Knob label="De-Ess" value={masteringParams.deessAmount} min={0} max={100} step={1} unit="%" onChange={v => updateParam('deessAmount', v)} />
                                        </div>
                                    </div>

                                    {/* Color Section */}
                                    <div className="col-span-1 bg-[#121826]/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><Wand2 size={100} /></div>
                                        <div className="flex items-center gap-2 mb-8">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Harmonics</h3>
                                        </div>
                                        <div className="flex flex-col gap-8 items-center relative z-10">
                                            <Knob label="Saturation" value={masteringParams.sat} min={0} max={100} step={1} unit="%" onChange={v => updateParam('sat', v)} />
                                            <Knob label="Exciter" value={masteringParams.exciter} min={0} max={100} step={1} unit="%" onChange={v => updateParam('exciter', v)} />
                                            <Knob label="Tape" value={masteringParams.tape} min={0} max={100} step={1} unit="%" onChange={v => updateParam('tape', v)} />
                                        </div>
                                    </div>

                                    {/* Stereo & Limiter */}
                                    <div className="col-span-1 bg-[#121826]/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><Volume2 size={100} /></div>
                                        <div className="flex items-center gap-2 mb-8">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em]">Final Stage</h3>
                                        </div>
                                        <div className="flex flex-col gap-8 items-center relative z-10">
                                            <Knob label="Width" value={masteringParams.stereoWidth} min={0} max={200} step={1} unit="%" onChange={v => updateParam('stereoWidth', v)} />
                                            <Knob label="Ceiling" value={masteringParams.ceiling} min={-1} max={0} step={0.1} unit="dB" onChange={v => updateParam('ceiling', v)} />
                                            <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                                                <div className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1.5">Limiter Status</div>
                                                <div className="text-xs font-bold text-green-400">ENGAGED</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudiusMaster;
