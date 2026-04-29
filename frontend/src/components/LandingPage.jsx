import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Sparkles, Music, Play, Mic2, Star, Plus, CheckCircle, Disc,
    ChevronDown, ChevronLeft, ChevronRight, Volume2, Globe, Shield, ShieldCheck, Headphones,
    ArrowRight, MessageSquare, Menu, X, Command, Sliders
} from 'lucide-react';
import CDLoader from './CDLoader';
import LogoIcon from './LogoIcon';
import GenAudiusLogo from './GenAudiusLogo';
import LoginModal from './LoginModal';
import { useLang } from '../i18n/LanguageContext';
import customLogo from '/logo.svg';

/* ─────────────────────────────────────────────
   HERO SLIDESHOW DATA
───────────────────────────────────────────── */
const SLIDES = [
    {
        id: 0,
        tag: 'AI MUSIC ENGINE v2.0',
        title: 'Crea tu Hit',
        titleAccent: 'En Segundos',
        subtitle: 'Convierte un simple prompt en una canción completa con calidad de estudio profesional. El poder de la IA al servicio de tu creatividad.',
        cta: 'Empezar a Crear',
        accent: '#F5A623',
        glow1: 'rgba(245,166,35,0.18)',
        glow2: 'rgba(107,33,212,0.12)',
        icon: Sparkles,
        badge: '🎵 Prompt → Hit en 30s',
        visual: 'waveform',
        bgImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80',
        artistName: 'Danny García',
        artistGenre: 'Dembow / Urban',
        artistStat: '2.4M streams',
    },
    {
        id: 1,
        tag: 'VOCAL ADN BRIDGE',
        title: 'El ADN de',
        titleAccent: 'Los Grandes',
        subtitle: 'Accede a los modelos vocales RVC de los maestros del sonido. Fusiona estilos, clona timbres y crea voces únicas que nunca existieron.',
        cta: 'Explorar ADN',
        accent: '#E91E8C',
        glow1: 'rgba(233,30,140,0.18)',
        glow2: 'rgba(107,33,212,0.12)',
        icon: Mic2,
        badge: '🎤 RVC Models Pro',
        visual: 'dna',
        bgImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1920&q=80',
        artistName: 'Luna Morales',
        artistGenre: 'Reggaeton / R&B',
        artistStat: '8.1M streams',
    },
    {
        id: 2,
        tag: 'MASTERING NEVE / SSL',
        title: 'Sonido de',
        titleAccent: 'Nivel Mundial',
        subtitle: 'Masterización automática con algoritmos entrenados en consolas Neve y SSL. Tu música suena como si saliera de Abbey Road o Electric Lady.',
        cta: 'Ver Studio Pro',
        accent: '#00C9A7',
        glow1: 'rgba(0,201,167,0.15)',
        glow2: 'rgba(107,33,212,0.10)',
        icon: Volume2,
        badge: '🎚️ Neve SSL Engine',
        visual: 'equalizer',
        bgImage: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=1920&q=80',
        artistName: 'Studio Noir',
        artistGenre: 'Electronic / Trap',
        artistStat: '5.7M streams',
    },
    {
        id: 3,
        tag: 'DISTRIBUCIÓN GLOBAL',
        title: 'Tu Música',
        titleAccent: 'Al Mundo',
        subtitle: 'Distribuye en Spotify, Apple Music, YouTube y más de 150 plataformas. Monetiza tu arte desde el primer día con Gen Audius Pro.',
        cta: 'Ver Planes',
        accent: '#6B21D4',
        glow1: 'rgba(107,33,212,0.20)',
        glow2: 'rgba(233,30,140,0.10)',
        icon: Globe,
        badge: '🌍 150+ Plataformas',
        visual: 'globe',
        bgImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&q=80',
        artistName: 'Rave Collective',
        artistGenre: 'House / Techno',
        artistStat: '12M streams',
    },
    {
        id: 4,
        tag: 'TRENDING EN VIVO',
        title: 'Descubre lo',
        titleAccent: 'Más Hot',
        subtitle: 'Explora las creaciones más trending de la comunidad Gen Audius. Escucha, da like y conecta con artistas del futuro.',
        cta: 'Explorar Ahora',
        accent: '#D4AF37',
        glow1: 'rgba(212,175,55,0.18)',
        glow2: 'rgba(107,33,212,0.12)',
        icon: Star,
        badge: '🔥 Top Trending',
        visual: 'waveform',
        bgImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80',
        artistName: 'Community Top',
        artistGenre: 'Trending · Live',
        artistStat: '500+ artistas',
        isExplore: true,
    },
];

/* ─────────────────────────────────────────────
   ANIMATED VISUAL COMPONENTS
───────────────────────────────────────────── */
const WaveformVisual = ({ accent }) => (
    <div className="flex items-center justify-center gap-1 h-32">
        {[...Array(40)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ height: [`${10 + Math.random() * 20}%`, `${40 + Math.random() * 60}%`, `${10 + Math.random() * 20}%`] }}
                transition={{ duration: 1.2 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.04, ease: 'easeInOut' }}
                className="w-1.5 rounded-full"
                style={{ background: `linear-gradient(to top, ${accent}40, ${accent})` }}
            />
        ))}
    </div>
);

const DNAVisual = ({ accent }) => (
    <div className="relative h-32 flex items-center justify-center overflow-hidden">
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{ background: accent, left: `${10 + i * 11}%` }}
                animate={{ y: ['-30px', '30px', '-30px'], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
            />
        ))}
        {[...Array(8)].map((_, i) => (
            <motion.div
                key={`b${i}`}
                className="absolute w-3 h-3 rounded-full"
                style={{ background: '#6B21D4', left: `${10 + i * 11}%` }}
                animate={{ y: ['30px', '-30px', '30px'], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }}
            />
        ))}
        <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }} />
        </div>
    </div>
);

const EqualizerVisual = ({ accent }) => (
    <div className="flex items-end justify-center gap-2 h-32 pb-2">
        {[65, 80, 45, 90, 55, 75, 40, 85, 60, 70, 50, 95].map((h, i) => (
            <motion.div
                key={i}
                className="w-4 rounded-t-sm"
                style={{ background: `linear-gradient(to top, ${accent}60, ${accent})` }}
                animate={{ height: [`${h * 0.4}%`, `${h}%`, `${h * 0.6}%`, `${h}%`] }}
                transition={{ duration: 1.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
            />
        ))}
    </div>
);

const GlobeVisual = ({ accent }) => (
    <div className="relative h-32 flex items-center justify-center">
        <motion.div
            className="w-24 h-24 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: `${accent}40` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
            <div className="w-16 h-16 rounded-full border" style={{ borderColor: `${accent}60` }} />
        </motion.div>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                    background: accent,
                    left: `calc(50% + ${Math.cos(deg * Math.PI / 180) * 48}px)`,
                    top: `calc(50% + ${Math.sin(deg * Math.PI / 180) * 48}px)`,
                }}
                animate={{ scale: [0.5, 1.5, 0.5], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
        ))}
    </div>
);

const SlideVisual = ({ visual, accent }) => {
    if (visual === 'waveform') return <WaveformVisual accent={accent} />;
    if (visual === 'dna') return <DNAVisual accent={accent} />;
    if (visual === 'equalizer') return <EqualizerVisual accent={accent} />;
    if (visual === 'globe') return <GlobeVisual accent={accent} />;
    return null;
};

/* ─────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────── */
const LandingPage = ({ onStartCreating, onLoginSuccess }) => {
    const { t } = useLang();
    const [isSimulating, setIsSimulating] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const autoPlayRef = useRef(null);

    // Auto-advance slideshow
    useEffect(() => {
        if (!isAutoPlaying) return;
        autoPlayRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(autoPlayRef.current);
    }, [isAutoPlaying, currentSlide]);

    const goToSlide = (idx) => {
        setCurrentSlide(idx);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const prevSlide = () => goToSlide((currentSlide - 1 + SLIDES.length) % SLIDES.length);
    const nextSlide = () => goToSlide((currentSlide + 1) % SLIDES.length);

    const handleStart = () => {
        const userId = localStorage.getItem('ga_user_id');
        if (userId) {
            setIsSimulating(true);
            setTimeout(() => { setIsSimulating(false); onStartCreating(); }, 1200);
        } else {
            setShowLoginModal(true);
        }
    };

    const handleLoginSuccess = (userData) => {
        // App.handleLoginSuccess already handles sessionUser + navigation.
        // We only show the brief simulation animation here.
        setIsSimulating(true);
        setTimeout(() => setIsSimulating(false), 500);
        if (onLoginSuccess) onLoginSuccess(userData);
    };

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const slide = SLIDES[currentSlide];

    return (
        <div className="relative min-h-screen bg-[#030816] overflow-x-hidden">
            <CDLoader loading={isSimulating} status="Validating Stitch Connection..." progress={65} />

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLoginSuccess}
            />

            {/* ── BACKGROUND ── */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Artist background image — Ken Burns effect */}
                <AnimatePresence mode="wait">
                    {slide.bgImage && (
                        <motion.div
                            key={`bg-${currentSlide}`}
                            initial={{ opacity: 0, scale: 1.08 }}
                            animate={{ opacity: 1, scale: 1.0 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 1.8, ease: 'easeOut' }}
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("${slide.bgImage}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center top',
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Dark overlay — almost transparent to keep some contrast but allow brightness */}
                <div className="absolute inset-0" style={{ background: 'rgba(3,8,22,0.1)' }} />

                {/* Texture overlay — disabled for better clarity as requested */}
                {/* 
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url("/assets/brand/bg_texture.png")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        mixBlendMode: 'overlay',
                    }}
                /> 
                */}

                {/* Color glows per slide */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`glow-${currentSlide}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[200px]"
                            style={{ background: slide.glow1, opacity: 0.3 }}
                        />
                        <div
                            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[180px]"
                            style={{ background: slide.glow2, opacity: 0.2 }}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '80px 80px',
                    }}
                />
            </div>

            {/* ── NAVBAR ── */}
            <nav
                className="relative z-50 w-full px-8 flex items-center justify-between border-b border-white/5"
                style={{
                    height: '80px',
                    background: 'rgba(3,8,22,0.65)',
                    backdropFilter: 'blur(24px)',
                }}
            >
                {/* Logo — Gen Audius inline SVG, grande */}
                <div
                    className="flex items-center cursor-pointer group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <img 
                        src={customLogo} 
                        alt="Gen Audius Logo" 
                        className="h-32 md:h-44 w-auto transition-all group-hover:opacity-90 hover:scale-105 drop-shadow-xl"
                    />
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {[
                        { label: 'Crear', id: 'crear', action: handleStart },
                        { label: 'Studio', id: 'studio-section' },
                        { label: 'Planes', id: 'planes' },
                        { label: 'ADN', id: 'adn' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => item.action ? item.action() : scrollTo(item.id)}
                            className="relative text-[11px] font-black tracking-[0.25em] text-white/40 hover:text-white transition-all uppercase group"
                        >
                            {item.label}
                            <span
                                className="absolute -bottom-1 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                                style={{ background: slide.accent }}
                            />
                        </button>
                    ))}
                    <button
                        onClick={handleStart}
                        className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border"
                        style={{
                            borderColor: `${slide.accent}50`,
                            color: slide.accent,
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = `${slide.accent}15`;
                            e.currentTarget.style.borderColor = slide.accent;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = `${slide.accent}50`;
                        }}
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </nav>

            <main className="relative z-10">

                {/* ══════════════════════════════════════════
                    HERO SLIDESHOW
                ══════════════════════════════════════════ */}
                <section id="crear" className="relative min-h-[92vh] flex flex-col">

                    {/* Slide Content */}
                    <div className="flex-1 flex items-center">
                        <div className="max-w-7xl mx-auto w-full px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">

                            {/* LEFT — Text */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`text-${currentSlide}`}
                                    initial={{ opacity: 0, x: -40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 40 }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className="space-y-8"
                                >
                                    {/* Tag */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="w-8 h-px"
                                            style={{ background: slide.accent }}
                                        />
                                        <span
                                            className="text-[10px] font-black tracking-[0.4em] uppercase"
                                            style={{ color: slide.accent }}
                                        >
                                            {slide.tag}
                                        </span>
                                    </motion.div>

                                    {/* Headline */}
                                    <div className="space-y-2">
                                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                                            {slide.title}
                                        </h1>
                                        <h1
                                            className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]"
                                            style={{
                                                background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}99)`,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}
                                        >
                                            {slide.titleAccent}
                                        </h1>
                                    </div>

                                    {/* Subtitle */}
                                    <p className="text-lg text-white/50 leading-relaxed max-w-lg font-medium">
                                        {slide.subtitle}
                                    </p>

                                    {/* Badge */}
                                    <div
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black tracking-widest border"
                                        style={{
                                            borderColor: `${slide.accent}30`,
                                            background: `${slide.accent}08`,
                                            color: slide.accent,
                                        }}
                                    >
                                        {slide.badge}
                                    </div>

                                    {/* Artist Info Card */}
                                    {slide.artistName && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-2xl border w-fit"
                                            style={{
                                                background: `${slide.accent}0d`,
                                                borderColor: `${slide.accent}25`,
                                                backdropFilter: 'blur(10px)',
                                            }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                                                style={{
                                                    background: `linear-gradient(135deg, ${slide.accent}40, rgba(107,33,212,0.4))`,
                                                    border: `1px solid ${slide.accent}40`,
                                                    color: slide.accent,
                                                }}
                                            >
                                                {slide.artistName.charAt(0)}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[11px] font-black text-white/90 leading-none">{slide.artistName}</span>
                                                <span className="text-[9px] text-white/40 leading-none">{slide.artistGenre}</span>
                                            </div>
                                            <div
                                                className="ml-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider"
                                                style={{ background: `${slide.accent}20`, color: slide.accent }}
                                            >
                                                {slide.artistStat}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* CTA Buttons */}
                                    <div className="flex items-center gap-4 pt-2">
                                        <motion.button
                                            whileHover={{ scale: 1.04 }}
                                            whileTap={{ scale: 0.96 }}
                                            onClick={() => {
                                                if (slide.isExplore) {
                                                    if (onStartCreating) onStartCreating('explore');
                                                } else {
                                                    handleStart();
                                                }
                                            }}
                                            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black shadow-2xl transition-all"
                                            style={{
                                                background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
                                                boxShadow: `0 20px 60px ${slide.accent}40`,
                                            }}
                                        >
                                            {slide.cta}
                                            <ArrowRight size={18} />
                                        </motion.button>

                                        <button
                                            onClick={handleStart}
                                            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white/40 border border-white/10 hover:border-white/20 hover:text-white/60 transition-all"
                                        >
                                            <Play size={14} />
                                            Ver Demo
                                        </button>
                                    </div>

                                    {/* Trust badges */}
                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex items-center gap-2 text-white/20">
                                            <ShieldCheck size={13} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Stitch Secured</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/20">
                                            <Globe size={13} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Global Export</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white/20">
                                            <Star size={13} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Pro Quality</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* RIGHT — Visual Card */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`visual-${currentSlide}`}
                                    initial={{ opacity: 0, scale: 0.9, x: 40 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: -40 }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className="relative"
                                >
                                    {/* Main Card */}
                                    <div
                                        className="relative rounded-[2.5rem] p-8 overflow-hidden"
                                        style={{
                                            background: 'rgba(7,9,20,0.6)',
                                            border: `1px solid ${slide.accent}20`,
                                            boxShadow: `0 40px 120px ${slide.accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
                                            backdropFilter: 'blur(20px)',
                                        }}
                                    >
                                        {/* Glow inside card */}
                                        <div
                                            className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none"
                                            style={{ background: `${slide.accent}20` }}
                                        />

                                        {/* Card Header */}
                                        <div className="flex items-center justify-between mb-6 relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                                    style={{
                                                        background: `${slide.accent}15`,
                                                        border: `1px solid ${slide.accent}30`,
                                                    }}
                                                >
                                                    <slide.icon size={18} style={{ color: slide.accent }} />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Gen Audius AI</div>
                                                    <div className="text-[8px] text-white/20 uppercase tracking-widest">{slide.tag}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <motion.div
                                                    animate={{ opacity: [1, 0.3, 1] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ background: slide.accent }}
                                                />
                                                <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: slide.accent }}>
                                                    Live
                                                </span>
                                            </div>
                                        </div>

                                        {/* Animated Visual */}
                                        <div className="relative z-10 my-4">
                                            <SlideVisual visual={slide.visual} accent={slide.accent} />
                                        </div>

                                        {/* Card Footer Stats */}
                                        <div className="grid grid-cols-3 gap-3 mt-6 relative z-10">
                                            {[
                                                { label: 'Calidad', value: '24-bit' },
                                                { label: 'Latencia', value: '< 30s' },
                                                { label: 'Formatos', value: 'WAV/MP3' },
                                            ].map(stat => (
                                                <div
                                                    key={stat.label}
                                                    className="text-center py-3 rounded-xl"
                                                    style={{
                                                        background: `${slide.accent}08`,
                                                        border: `1px solid ${slide.accent}15`,
                                                    }}
                                                >
                                                    <div className="text-sm font-black" style={{ color: slide.accent }}>{stat.value}</div>
                                                    <div className="text-[8px] text-white/30 uppercase tracking-widest mt-0.5">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Floating badge */}
                                    <motion.div
                                        animate={{ y: [-6, 6, -6] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-black shadow-xl"
                                        style={{ background: slide.accent }}
                                    >
                                        ✦ NEW
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* ── SLIDESHOW CONTROLS ── */}
                    <div className="relative z-20 pb-12 flex flex-col items-center gap-6">

                        {/* Slide dots + arrows */}
                        <div className="flex items-center gap-6">
                            {/* Prev */}
                            <button
                                onClick={prevSlide}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Dots */}
                            <div className="flex items-center gap-3">
                                {SLIDES.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goToSlide(i)}
                                        className="relative transition-all duration-500"
                                    >
                                        <motion.div
                                            animate={{
                                                width: i === currentSlide ? 32 : 8,
                                                opacity: i === currentSlide ? 1 : 0.3,
                                            }}
                                            transition={{ duration: 0.4 }}
                                            className="h-2 rounded-full"
                                            style={{ background: i === currentSlide ? s.accent : 'rgba(255,255,255,0.3)' }}
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Next */}
                            <button
                                onClick={nextSlide}
                                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="w-64 h-px bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                key={`progress-${currentSlide}`}
                                initial={{ width: '0%' }}
                                animate={{ width: isAutoPlaying ? '100%' : '0%' }}
                                transition={{ duration: 5, ease: 'linear' }}
                                className="h-full rounded-full"
                                style={{ background: slide.accent }}
                            />
                        </div>

                        {/* Slide counter */}
                        <div className="flex items-center gap-2 text-white/20">
                            <span className="text-[10px] font-black" style={{ color: slide.accent }}>
                                0{currentSlide + 1}
                            </span>
                            <span className="text-[10px]">/</span>
                            <span className="text-[10px] font-black">0{SLIDES.length}</span>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    STATS BAR
                ══════════════════════════════════════════ */}
                <section className="relative z-10 border-y border-white/5" style={{ background: 'rgba(7,9,20,0.6)', backdropFilter: 'blur(20px)' }}>
                    <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '100K+', label: 'Canciones Creadas', color: '#F5A623' },
                            { value: '50K+', label: 'Artistas Activos', color: '#E91E8C' },
                            { value: '150+', label: 'Plataformas', color: '#00C9A7' },
                            { value: '24/7', label: 'Studio Online', color: '#6B21D4' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center space-y-1">
                                <div className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                                <div className="text-[9px] font-black text-white/30 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    SECTION STUDIO
                ══════════════════════════════════════════ */}
                <section id="studio-section" className="max-w-7xl mx-auto py-40 px-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] rounded-full blur-[200px] pointer-events-none"
                        style={{ background: 'rgba(107,33,212,0.06)' }} />

                    <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-px bg-[#00C9A7]" />
                                    <span className="text-[10px] font-black text-[#00C9A7] tracking-[0.4em] uppercase">Phase 2 // Studio Engine</span>
                                </div>
                                <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white leading-[0.9]">
                                    Produce tu Hit<br />
                                    <span style={{ color: '#00C9A7' }}>En Segundos</span>
                                </h2>
                            </div>
                            <p className="text-lg text-white/40 leading-relaxed">
                                Nuestra interfaz de chat inteligente entiende tu visión musical. Ya sea un{' '}
                                <span className="text-[#F5A623]">Dembow con piano melancólico</span> o un solo de guitarra épico,
                                Gen Audius lo convierte en realidad usando el ADN de los maestros.
                            </p>

                            <ul className="space-y-4 pt-4">
                                {[
                                    { text: 'Prompt-to-Audio Engine v2.0', color: '#F5A623' },
                                    { text: 'Extracción Automática de Stems', color: '#E91E8C' },
                                    { text: 'Mastering Digital Neve/SSL', color: '#00C9A7' },
                                    { text: 'Exportación MIDI 24-bit', color: '#6B21D4' },
                                ].map(item => (
                                    <li key={item.text} className="flex items-center gap-4">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                                        >
                                            <CheckCircle size={10} style={{ color: item.color }} />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-white/60">{item.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={handleStart}
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-black"
                                style={{
                                    background: 'linear-gradient(135deg, #00C9A7, #00C9A799)',
                                    boxShadow: '0 20px 60px rgba(0,201,167,0.3)',
                                }}
                            >
                                Abrir Studio Pro
                                <ArrowRight size={18} />
                            </motion.button>
                        </div>

                        {/* Demo Chat Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="rounded-[2.5rem] p-8 relative overflow-hidden"
                            style={{
                                background: 'rgba(7,9,20,0.7)',
                                border: '1px solid rgba(0,201,167,0.15)',
                                boxShadow: '0 40px 120px rgba(0,201,167,0.08)',
                            }}
                        >
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none"
                                style={{ background: 'rgba(0,201,167,0.12)' }} />

                            <div className="space-y-5 relative z-10">
                                {/* User message */}
                                <div className="flex gap-3">
                                    <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-black text-white/40 shrink-0">
                                        YOU
                                    </div>
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-xs italic text-white/40">
                                        Crea un dembow con piano melancólico y un bajo profundo de 808...
                                    </div>
                                </div>

                                {/* AI Response */}
                                <div className="flex gap-3">
                                    <LogoIcon className="w-9 h-9 shrink-0" />
                                    <div
                                        className="flex-1 rounded-2xl rounded-tl-none p-5 space-y-4"
                                        style={{
                                            background: 'rgba(0,201,167,0.05)',
                                            borderLeft: '3px solid #00C9A7',
                                            border: '1px solid rgba(0,201,167,0.15)',
                                            borderLeftWidth: '3px',
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-[#00C9A7] uppercase tracking-widest">Gen Audius AI</span>
                                            <motion.span
                                                animate={{ opacity: [1, 0.3, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="text-[8px] text-[#00C9A7] uppercase font-bold"
                                            >
                                                ● Generando...
                                            </motion.span>
                                        </div>
                                        <div className="h-12 flex items-center gap-0.5">
                                            {[...Array(32)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: ['20%', '80%', '20%'] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05 }}
                                                    className="flex-1 rounded-full"
                                                    style={{ background: `linear-gradient(to top, rgba(0,201,167,0.2), #00C9A7)` }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 text-[9px] text-white/30 font-bold uppercase tracking-widest">
                                            <span>BPM: 96</span>
                                            <span>•</span>
                                            <span>Key: Am</span>
                                            <span>•</span>
                                            <span>Dembow</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    SECTION ADN
                ══════════════════════════════════════════ */}
                <section id="adn" className="relative py-40 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(180deg, transparent, rgba(233,30,140,0.04), transparent)' }} />

                    <div className="max-w-7xl mx-auto px-8 relative z-10">
                        <div className="text-center mb-20 space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-12 h-px bg-[#E91E8C]" />
                                <span className="text-[10px] font-black text-[#E91E8C] tracking-[0.4em] uppercase">Vocal ADN Bridge</span>
                                <div className="w-12 h-px bg-[#E91E8C]" />
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
                                El ADN de <span style={{ color: '#E91E8C' }}>Los Grandes</span>
                            </h2>
                            <p className="text-lg text-white/40 max-w-2xl mx-auto">
                                Modelos RVC entrenados con el timbre y estilo de los maestros del sonido. Fusiona, clona y crea voces únicas.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { name: 'Reggaeton Pro', genre: 'Urbano / Trap', color: '#F5A623', icon: '🎤' },
                                { name: 'Salsa Clásica', genre: 'Tropical / Latin', color: '#E91E8C', icon: '🎺' },
                                { name: 'R&B Soul', genre: 'Soul / Neo-Soul', color: '#6B21D4', icon: '🎵' },
                                { name: 'Dembow 808', genre: 'Dembow / Dancehall', color: '#00C9A7', icon: '🥁' },
                                { name: 'Pop Electrónico', genre: 'EDM / Synth-Pop', color: '#F5A623', icon: '⚡' },
                                { name: 'Bachata Fusion', genre: 'Bachata / Fusion', color: '#E91E8C', icon: '🎸' },
                            ].map((model, i) => (
                                <motion.div
                                    key={model.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="p-6 rounded-2xl cursor-pointer transition-all"
                                    style={{
                                        background: 'rgba(7,9,20,0.8)',
                                        border: `1px solid ${model.color}20`,
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = `${model.color}50`;
                                        e.currentTarget.style.boxShadow = `0 20px 60px ${model.color}15`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = `${model.color}20`;
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                            style={{ background: `${model.color}10`, border: `1px solid ${model.color}20` }}
                                        >
                                            {model.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white">{model.name}</div>
                                            <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{model.genre}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${60 + i * 7}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1.5, delay: i * 0.1 }}
                                                className="h-full rounded-full"
                                                style={{ background: model.color }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-black" style={{ color: model.color }}>{60 + i * 7}%</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    SECTION PLANES
                ══════════════════════════════════════════ */}
                <section id="planes" className="max-w-6xl mx-auto py-40 px-8">
                    <div className="text-center mb-20 space-y-4">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-12 h-px bg-[#F5A623]" />
                            <span className="text-[10px] font-black text-[#F5A623] tracking-[0.4em] uppercase">Membership Plans</span>
                            <div className="w-12 h-px bg-[#F5A623]" />
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
                            Escala tu <span style={{ color: '#F5A623' }}>Creatividad</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Free Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[2.5rem] flex flex-col items-center text-center space-y-8"
                            style={{
                                background: 'rgba(7,9,20,0.8)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}
                        >
                            <div
                                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <Music size={32} className="text-white/20" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tight text-white">Estudio Gratis</h3>
                                <p className="text-xs text-white/30 uppercase tracking-widest font-black mt-1">Prueba el motor básico</p>
                                <div className="text-4xl font-black text-white mt-4">$0<span className="text-lg text-white/30">/mes</span></div>
                            </div>
                            <ul className="space-y-3 w-full">
                                {['3 Canciones por día', 'Calidad MP3 Standard', 'Sin exportación de Stems', 'Acceso básico al Studio'].map(feat => (
                                    <li key={feat} className="flex items-center gap-3 text-white/40">
                                        <CheckCircle size={12} className="text-white/20 shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleStart}
                                className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60 transition-all"
                            >
                                Registrarse Gratis
                            </button>
                        </motion.div>

                        {/* Pro Plan */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15 }}
                            className="p-10 rounded-[2.5rem] flex flex-col items-center text-center space-y-8 relative overflow-hidden"
                            style={{
                                background: 'rgba(7,9,20,0.95)',
                                border: '2px solid rgba(212,175,55,0.4)',
                                boxShadow: '0 40px 120px rgba(212,175,55,0.12)',
                            }}
                        >
                            {/* Top badge */}
                            <div
                                className="absolute top-0 right-0 px-6 py-2 text-black text-[9px] font-black uppercase tracking-[0.3em]"
                                style={{ background: '#D4AF37', borderBottomLeftRadius: '1rem' }}
                            >
                                ✦ Ultra Pro
                            </div>
                            <div
                                className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none"
                                style={{ background: 'rgba(212,175,55,0.08)' }}
                            />

                            <div
                                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                                style={{
                                    background: 'rgba(212,175,55,0.1)',
                                    border: '1px solid rgba(212,175,55,0.3)',
                                    boxShadow: '0 0 40px rgba(212,175,55,0.15)',
                                }}
                            >
                                <Zap size={32} style={{ color: '#D4AF37' }} />
                            </div>
                            <div>
                                <h3
                                    className="text-3xl font-black uppercase tracking-tight"
                                    style={{
                                        background: 'linear-gradient(135deg, #D4AF37, #F5E27A, #D4AF37)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    Gen Audius Pro
                                </h3>
                                <p className="text-xs font-black uppercase tracking-widest mt-1" style={{ color: '#D4AF37' }}>Control Total del ADN</p>
                                <div className="text-4xl font-black text-white mt-4">
                                    $29<span className="text-lg text-white/30">/mes</span>
                                </div>
                            </div>
                            <ul className="space-y-3 w-full">
                                {[
                                    'Generaciones Ilimitadas',
                                    'Exportación MIDI y Stems 24-bit',
                                    'Modelos RVC de Maestros',
                                    'Mastering Neve/SSL Pro',
                                    'Distribución en 150+ Plataformas',
                                    'Acceso a Studio A Admin',
                                ].map(feat => (
                                    <li key={feat} className="flex items-center gap-3 text-white/70">
                                        <CheckCircle size={12} style={{ color: '#D4AF37' }} className="shrink-0" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={handleStart}
                                className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm text-black transition-all hover:brightness-110"
                                style={{
                                    background: 'linear-gradient(135deg, #D4AF37, #F5E27A)',
                                    boxShadow: '0 20px 60px rgba(212,175,55,0.3)',
                                }}
                            >
                                Go Pro Now ✦
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    FOOTER
                ══════════════════════════════════════════ */}
                <footer className="relative pt-32 pb-16 px-8 border-t border-white/5 overflow-hidden"
                    style={{ background: 'rgba(3,5,12,0.98)' }}>
                    <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 opacity-[0.02] pointer-events-none">
                        <Disc size={700} className="animate-spin-slow" />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-4 gap-16 mb-20">
                        <div className="col-span-1 md:col-span-2 space-y-8">
                            <img
                                src="/assets/brand/sidebar_logo.png"
                                alt="Gen Audius"
                                className="object-contain opacity-90 hover:opacity-100 transition-all"
                                style={{ height: '120px', width: 'auto', maxWidth: '320px' }}
                            />
                            <p className="max-w-sm text-white/30 text-sm leading-relaxed">
                                Redefiniendo la producción musical con inteligencia artificial y el alma de los maestros del sonido.
                                Únete a la nueva era del hit making.
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { icon: '📌', label: 'Pinterest' },
                                    { icon: '▶️', label: 'YouTube' },
                                    { icon: '🎵', label: 'TikTok' },
                                    { icon: '📱', label: 'Instagram' },
                                ].map((social) => (
                                    <button
                                        key={social.label}
                                        title={social.label}
                                        className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 transition-all text-sm"
                                    >
                                        {social.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h4 className="text-[10px] font-black text-white/20 tracking-widest uppercase">Servicios</h4>
                            <ul className="space-y-3">
                                {['AI Studio Engine', 'Vocal ADN Bridge', 'Stem Extraction', 'Mastering Neve IA'].map(item => (
                                    <li key={item}>
                                        <button
                                            onClick={() => scrollTo('studio-section')}
                                            className="text-xs font-bold text-white/40 hover:text-[#00C9A7] transition-colors"
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-5">
                            <h4 className="text-[10px] font-black text-white/20 tracking-widest uppercase">Compañía</h4>
                            <ul className="space-y-3">
                                {['Sobre Nosotros', 'Términos Legales', 'Privacidad', 'Soporte Stitch'].map(item => (
                                    <li key={item}>
                                        <button className="text-xs font-bold text-white/40 hover:text-[#F5A623] transition-colors">
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">© 2026 GEN AUDIUS LLC — TODOS LOS DERECHOS RESERVADOS</p>
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(212,175,55,0.3)' }}>
                            La tecnología al servicio del sentimiento musical
                        </p>
                    </div>
                </footer>

                {/* ══════════════════════════════════════════
                    FAQ SECTION
                ══════════════════════════════════════════ */}
                <section id="faq" className="max-w-4xl mx-auto py-40 px-8">
                    <div className="text-center space-y-4 mb-20">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-12 h-px bg-[#D4AF37]" />
                            <span className="text-[11px] font-black text-[#D4AF37] tracking-[0.5em] uppercase">{t('faq.title')}</span>
                            <div className="w-12 h-px bg-[#D4AF37]" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Preguntas <span className="text-[#D4AF37]">Frecuentes</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {(t('faq.items') || []).map((item, idx) => (
                            <FAQItem key={idx} question={item.q} answer={item.a} />
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════
                    FOOTER
                ══════════════════════════════════════════ */}
                <footer className="border-t border-white/5 py-20 px-8" style={{ background: 'rgba(5,7,14,0.4)' }}>
                    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                        <div className="space-y-6">
                            <img src={customLogo} alt="Gen Audius" className="h-20 w-auto opacity-80" />
                            <p className="text-[11px] text-white/30 leading-relaxed uppercase tracking-widest">
                                GEN AUDIUS LLC © 2026<br />
                                {t('footer.tagline')}
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Legal</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-[11px] text-white/40 hover:text-[#D4AF37] transition-all uppercase tracking-widest">{t('legal.tosTitle')}</a></li>
                                <li><a href="#" className="text-[11px] text-white/40 hover:text-[#D4AF37] transition-all uppercase tracking-widest">{t('legal.privacyTitle')}</a></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Social</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-[11px] text-white/40 hover:text-[#E91E8C] transition-all uppercase tracking-widest">Instagram</a></li>
                                <li><a href="#" className="text-[11px] text-white/40 hover:text-[#6B21D4] transition-all uppercase tracking-widest">Discord</a></li>
                                <li><a href="#" className="text-[11px] text-white/40 hover:text-[#00C9A7] transition-all uppercase tracking-widest">X (Twitter)</a></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Status</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00C9A7] animate-pulse" />
                                <span className="text-[10px] font-black text-[#00C9A7] uppercase tracking-widest">All Systems Operational</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

/* ─────────────────────────────────────────────
   FAQ ITEM COMPONENT
───────────────────────────────────────────── */
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div 
            className="rounded-2xl border transition-all overflow-hidden"
            style={{ 
                background: 'rgba(255,255,255,0.02)', 
                borderColor: isOpen ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)'
            }}
        >
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
            >
                <span className="text-sm font-bold text-white/90 tracking-wide">{question}</span>
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <Plus size={16} style={{ color: '#D4AF37' }} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="px-6 pb-6 text-xs text-white/40 leading-relaxed font-medium">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LandingPage;