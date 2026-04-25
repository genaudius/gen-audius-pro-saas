/**
 * Gen Audius Pro — CD Loader (Design System v10 — Dark Luxury Wave)
 * ==================================================
 * Premium loading experience with logo color palette:
 *  - Spinning vinyl record with holographic grooves
 *  - Real-time progress bar synced to polling
 *  - Animated waveform equalizer bars (orange/violet/magenta)
 *  - Stage-based status messages
 *  - Brand laser read point
 *  - Multi-layer ambient glow system
 */

import { motion, AnimatePresence } from 'framer-motion';
import LogoIcon from './LogoIcon';

// ── Equalizer Bar ──────────────────────────────────────────────────────────────
const EQBar = ({ delay, height, color }) => (
    <motion.div
        className="w-[3px] rounded-full"
        style={{ height, background: color }}
        animate={{ scaleY: [1, 0.2, 0.7, 0.1, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
);

// ── Stage labels ───────────────────────────────────────────────────────────────
const STAGES = [
    { min: 0,  max: 15,  label: 'Inicializando Motor IA',    sub: 'Connecting to Gen Audius Engine...' },
    { min: 15, max: 35,  label: 'Componiendo Estructura',    sub: 'Analyzing musical DNA...' },
    { min: 35, max: 60,  label: 'Produciendo Instrumentos',  sub: 'Building stems & layers...' },
    { min: 60, max: 80,  label: 'Sintetizando Voz',          sub: 'Rendering vocal performance...' },
    { min: 80, max: 95,  label: 'Masterizando Track',        sub: 'Applying final polish...' },
    { min: 95, max: 100, label: 'Hit Finalizado',            sub: 'Your track is ready...' },
];

const getStage = (progress) =>
    STAGES.find(s => progress >= s.min && progress <= s.max) || STAGES[STAGES.length - 1];

// ── Vinyl Groove Ring ──────────────────────────────────────────────────────────
const GrooveRing = ({ index }) => {
    const inset = (index + 1) * 11;
    const opacity = 0.04 + index * 0.015;
    return (
        <div
            className="absolute rounded-full border border-white pointer-events-none"
            style={{ inset: `${inset}px`, opacity }}
        />
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const CDLoader = ({ loading, status = 'processing', progress = 0 }) => {
    const stage = getStage(progress);
    const isComplete = progress >= 100 || status === 'complete';

    // EQ bars with alternating brand colors
    const eqBars = [
        { delay: 0,    height: 24, color: '#F5A623' },
        { delay: 0.15, height: 36, color: '#6B21D4' },
        { delay: 0.3,  height: 18, color: '#E91E8C' },
        { delay: 0.1,  height: 42, color: '#F5A623' },
        { delay: 0.25, height: 28, color: '#00C9A7' },
        { delay: 0.05, height: 38, color: '#6B21D4' },
        { delay: 0.35, height: 20, color: '#E91E8C' },
        { delay: 0.2,  height: 32, color: '#F5A623' },
    ];

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    key="cd-loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-[#030816]/96 backdrop-blur-2xl"
                >
                    {/* ── Multi-layer ambient glow ── */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Orange glow — primary */}
                        <motion.div
                            animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.10, 0.05] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
                            style={{ background: '#F5A623' }}
                        />
                        {/* Violet glow */}
                        <motion.div
                            animate={{ scale: [1.1, 1, 1.1], opacity: [0.04, 0.08, 0.04] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
                            style={{ background: '#6B21D4' }}
                        />
                        {/* Magenta corner accent */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[80px]"
                            style={{ background: 'rgba(233,30,140,0.06)' }} />
                        {/* Cyan corner accent */}
                        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full blur-[80px]"
                            style={{ background: 'rgba(0,201,167,0.05)' }} />
                    </div>

                    {/* ── Content ── */}
                    <div className="flex flex-col items-center gap-10 relative z-10">

                        {/* ── The Vinyl Record ── */}
                        <div className="relative">
                            {/* Outer pulse rings — brand colors */}
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0, 0.15] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                                className="absolute -inset-12 rounded-full border"
                                style={{ borderColor: 'rgba(245,166,35,0.35)' }}
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0, 0.1] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
                                className="absolute -inset-6 rounded-full border"
                                style={{ borderColor: 'rgba(107,33,212,0.25)' }}
                            />

                            {/* Main spinning disc */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: isComplete ? 8 : 2.5, repeat: Infinity, ease: 'linear' }}
                                className="w-44 h-44 rounded-full relative flex items-center justify-center"
                                style={{
                                    background: 'radial-gradient(circle at 30% 30%, #1a2035 0%, #0a0d18 50%, #050810 100%)',
                                    boxShadow: '0 0 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(107,33,212,0.04), 0 0 0 1px rgba(255,255,255,0.04)',
                                }}
                            >
                                {/* Vinyl grooves */}
                                {[...Array(7)].map((_, i) => <GrooveRing key={i} index={i} />)}

                                {/* Holographic shimmer — brand colors */}
                                <motion.div
                                    animate={{ rotate: -360, opacity: [0.03, 0.07, 0.03] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-4 rounded-full pointer-events-none"
                                    style={{
                                        background: 'conic-gradient(from 0deg, transparent 0%, rgba(245,166,35,0.10) 20%, transparent 40%, rgba(107,33,212,0.08) 60%, transparent 80%)',
                                    }}
                                />

                                {/* Center label with logo */}
                                <div className="relative w-[68px] h-[68px] rounded-full flex items-center justify-center z-10"
                                    style={{
                                        background: 'radial-gradient(circle, #111827 0%, #080c16 100%)',
                                        boxShadow: '0 0 0 2px rgba(255,255,255,0.04), 0 0 20px rgba(107,33,212,0.15)',
                                    }}
                                >
                                    <img src="/assets/brand/icon.png" alt="Logo" className="w-10 h-10 object-contain relative z-20" />
                                    <motion.div
                                        animate={{ opacity: [0.3, 0.8, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 blur-[12px] rounded-full"
                                        style={{ background: 'rgba(245,166,35,0.12)' }}
                                    />
                                </div>

                                {/* Orange laser read point */}
                                <motion.div
                                    animate={{
                                        opacity: [1, 0.3, 1],
                                        scale: [1, 1.4, 1],
                                        boxShadow: [
                                            '0 0 8px #F5A623, 0 0 20px rgba(245,166,35,0.5)',
                                            '0 0 4px #F5A623, 0 0 10px rgba(245,166,35,0.2)',
                                            '0 0 8px #F5A623, 0 0 20px rgba(245,166,35,0.5)',
                                        ],
                                    }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    className="absolute top-7 right-7 w-2.5 h-2.5 rounded-full"
                                    style={{ background: '#F5A623' }}
                                />
                            </motion.div>
                        </div>

                        {/* ── Equalizer Bars ── */}
                        <div className="flex items-end gap-1 h-12">
                            {eqBars.map((bar, i) => (
                                <EQBar key={i} delay={bar.delay} height={bar.height} color={bar.color} />
                            ))}
                        </div>

                        {/* ── Status & Progress ── */}
                        <div className="space-y-5 text-center w-72">
                            {/* Stage label */}
                            <div className="space-y-1">
                                <motion.h3
                                    key={stage.label}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[11px] font-black tracking-[0.5em] uppercase"
                                    style={{ color: isComplete ? '#F5A623' : '#E91E8C' }}
                                >
                                    {stage.label}
                                </motion.h3>
                                <motion.p
                                    key={stage.sub}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[9px] font-bold text-white/25 tracking-widest uppercase"
                                >
                                    {stage.sub}
                                </motion.p>
                            </div>

                            {/* Progress bar */}
                            <div className="relative">
                                <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        className="h-full rounded-full relative overflow-hidden"
                                        style={{
                                            background: isComplete
                                                ? 'linear-gradient(90deg, #F5A623, #E8621A)'
                                                : 'linear-gradient(90deg, #F5A623, #6B21D4, #E91E8C)',
                                            boxShadow: isComplete
                                                ? '0 0 12px rgba(245,166,35,0.6)'
                                                : '0 0 12px rgba(233,30,140,0.5)',
                                        }}
                                    >
                                        {/* Shimmer effect */}
                                        <motion.div
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                            className="absolute inset-0 w-1/3 bg-white/20 blur-sm"
                                        />
                                    </motion.div>
                                </div>

                                {/* Progress percentage */}
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[8px] font-black text-white/20 tracking-widest uppercase">
                                        Gen Audius Engine
                                    </span>
                                    <motion.span
                                        key={Math.floor(progress)}
                                        initial={{ scale: 1.2, opacity: 0.6 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-[10px] font-black tabular-nums"
                                        style={{ color: isComplete ? '#F5A623' : '#E91E8C' }}
                                    >
                                        {Math.floor(Math.max(0, Math.min(100, progress)))}%
                                    </motion.span>
                                </div>
                            </div>

                            {/* Step indicators */}
                            <div className="flex justify-center gap-2">
                                {STAGES.slice(0, 5).map((s, i) => {
                                    const isActive   = progress >= s.min && progress <= s.max;
                                    const isDone     = progress > s.max;
                                    const dotColors  = ['#F5A623', '#6B21D4', '#E91E8C', '#00C9A7', '#F5A623'];
                                    return (
                                        <motion.div
                                            key={i}
                                            animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                                            style={{
                                                backgroundColor: isDone ? '#F5A623' : isActive ? dotColors[i] : 'rgba(255,255,255,0.1)',
                                                boxShadow: isActive ? `0 0 8px ${dotColors[i]}CC` : 'none',
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Security Badge ── */}
                        <motion.div
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="flex items-center gap-2 px-5 py-2 rounded-full border bg-white/[0.02]"
                            style={{ borderColor: 'rgba(107,33,212,0.15)' }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00C9A7' }} />
                            <span className="text-[8px] font-black text-white/25 tracking-[0.15em] uppercase">
                                Stitch Ledger Secured · KIE-SUNO Active
                            </span>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CDLoader;
