import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Zap, Download, Music, Mic, Layers, 
    Activity, CheckCircle2, AlertCircle, FileAudio 
} from 'lucide-react';

const StemExtractModal = ({ isOpen, onClose, audioFile }) => {
    const [status, setStatus] = useState('idle'); // idle, processing, complete
    const [progress, setProgress] = useState(0);

    const STREAMS = [
        { id: 'vocals', label: 'Vocales', icon: Mic, color: '#00E5FF' },
        { id: 'drums', label: 'Batería', icon: Activity, color: '#FF0055' },
        { id: 'bass', label: 'Bajo', icon: Layers, color: '#D4AF37' },
        { id: 'other', label: 'Otros / Inst', icon: Music, color: '#9B59B6' },
    ];

    const startExtraction = () => {
        setStatus('processing');
        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setStatus('complete');
            }
            setProgress(p);
        }, 400);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-neon-blue/5 to-brand-violet/5">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white group-hover:text-neon-blue transition-colors">Separación Pro ADN</h3>
                                <p className="text-[10px] text-white/40 uppercase tracking-tighter mt-0.5">Voz • Batería • Bajo • Otros</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8">
                        {status === 'idle' && (
                            <div className="text-center py-10 space-y-6">
                                <div className="max-w-md mx-auto p-6 rounded-3xl border border-dashed border-white/10 bg-white/2">
                                    <FileAudio size={48} className="mx-auto text-white/10 mb-4" />
                                    <h3 className="text-lg font-bold text-white/80">{audioFile?.name || 'Vocal_Stem_2026.wav'}</h3>
                                    <p className="text-xs text-white/30 truncate mt-2">48kHz // 24-bit PCM // 3:45</p>
                                </div>
                                <p className="text-sm text-white/40 max-w-sm mx-auto">
                                    Nuestra IA procesará tu pista para separar las vocales, batería y bajos con calidad de estudio.
                                </p>
                                <button 
                                    onClick={startExtraction}
                                    className="px-10 py-4 bg-neon-blue text-black font-black rounded-2xl uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)]"
                                >
                                    Comenzar Separación
                                </button>
                            </div>
                        )}

                        {status === 'processing' && (
                            <div className="py-10 space-y-12">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black uppercase text-neon-blue tracking-tighter">Procesando Redes Neuronales...</span>
                                        <span className="text-2xl font-black text-white">{Math.floor(progress)}%</span>
                                    </div>
                                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            className="h-full bg-gradient-to-r from-neon-blue via-brand-cyan to-brand-violet"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {STREAMS.map((s, i) => {
                                        const isDone = progress > (i + 1) * 25;
                                        return (
                                            <div key={s.id} className={`p-4 rounded-2xl border transition-all ${isDone ? 'border-white/10 bg-white/5' : 'border-white/5 opacity-40'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white/5" style={{ color: s.color }}>
                                                        <s.icon size={16} />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-white/80">{s.label}</span>
                                                    {isDone && <CheckCircle2 size={12} className="ml-auto text-green-500" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {status === 'complete' && (
                            <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Separación Exitosa</h3>
                                    <p className="text-sm text-white/40 mt-1 uppercase tracking-widest">4 archivos listos para descargar</p>
                                </div>

                                <div className="space-y-3">
                                    {STREAMS.map(s => (
                                        <div key={s.id} className="p-4 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-xl bg-black/40" style={{ color: s.color }}>
                                                    <s.icon size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-black uppercase text-white/80">{s.label}</div>
                                                    <div className="text-[9px] text-white/20">WAV 48kHz (7.4 MB)</div>
                                                </div>
                                            </div>
                                            <button className="p-3 rounded-xl bg-neon-blue/10 text-neon-blue opacity-40 group-hover:opacity-100 hover:bg-neon-blue hover:text-black transition-all">
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={onClose}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white/60 font-black rounded-2xl uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
                                >
                                    Finalizar Sesión
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer Warning */}
                    <div className="px-8 py-6 bg-black/40 border-t border-white/5 flex items-center gap-3">
                        <AlertCircle size={14} className="text-[#D4AF37]" />
                        <span className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Los archivos generados son para uso exclusivo del poseedor de la licencia Gen Audius Pro.</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default StemExtractModal;
