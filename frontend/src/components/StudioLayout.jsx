import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, Home, Cpu, Library, Box, Sliders, ChevronRight, Zap, 
    Save, Download, LayoutGrid, ShieldCheck, User, Music, Shuffle, 
    SkipBack, SkipForward, Repeat, Play, Pause, Volume2, MoreHorizontal, Heart, CreditCard
} from 'lucide-react';
import PageDAW from './v3/PageDAW';
import PageMasteringV3 from './v3/PageMasteringV3';
import { LogoVertical } from './GenAudiusLogo';
import ProviderStatusBar from './ProviderStatusBar';

const STUDIO_FLOWS = [
    {
        id: 'daw',
        label: 'Gen Studio Pro',
        sublabel: 'Estación de Producción',
        icon: Box,
        color: '#6B21D4',
        component: PageDAW,
    },
    {
        id: 'master',
        label: 'Audius Master',
        sublabel: 'Masterización Pro',
        icon: TrendingUp,
        color: '#E91E8C',
        component: PageMasteringV3,
    }
];

const StudioLayout = ({ currentView, setCurrentView, children }) => {
    const [activeFlow, setActiveFlow] = useState('daw');
    const { 
        currentTrack, isPlaying, progress, duration, currentTime, 
        volume, setVolume, togglePlay, seek, formatTime 
    } = usePlayer();

    React.useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'SWITCH_TO_MASTER') {
                setActiveFlow('master');
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const current = STUDIO_FLOWS.find(f => f.id === activeFlow);
    const ActiveComponent = current?.component;

    // Nav items with brand colors — now includes Explorar + Admin
    const navItems = [
        { id: 'home',     label: 'Inicio',     icon: Home,         activeColor: '#F5A623', glow: 'rgba(245,166,35,0.15)' },
        { id: 'generate', label: 'Generar',    icon: Cpu,          activeColor: '#E91E8C', glow: 'rgba(233,30,140,0.15)' },
        { id: 'library',  label: 'Librería',   icon: Library,      activeColor: '#6B21D4', glow: 'rgba(107,33,212,0.15)' },
        { id: 'studio',   label: 'Studio Pro', icon: Sliders,      activeColor: '#00C9A7', glow: 'rgba(0,201,167,0.15)' },
        { id: 'explore',  label: 'Explorar',   icon: LayoutGrid,   activeColor: '#D4AF37', glow: 'rgba(212,175,55,0.15)' },
        { id: 'plans',    label: 'Subscribe',  icon: CreditCard,   activeColor: '#9b87f5', glow: 'rgba(155,135,245,0.15)' },
        { id: 'profile',  label: 'Mi Perfil',  icon: User,         activeColor: '#00C9A7', glow: 'rgba(0,201,167,0.15)' },
        { id: 'admin',    label: 'Admin',      icon: ShieldCheck,  activeColor: '#E91E8C', glow: 'rgba(233,30,140,0.12)' },
    ];

    return (
        <div
            className="flex h-screen overflow-hidden bg-[#030816] text-white"
            style={{
                backgroundImage: 'url("/assets/brand/bg_texture.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >

            {/* ── STUDIO SIDEBAR ── */}
            <div
                className="w-60 shrink-0 border-r border-white/5 flex flex-col py-4 px-3 gap-2 z-10"
                style={{ background: 'rgba(5,7,14,0.96)', backdropFilter: 'blur(24px)' }}
            >

                {/* ── BRAND LOGO — Bigger with inline SVG waves ── */}
                <div className="px-1 mb-3 flex flex-col items-center">
                    <div
                        className="relative w-full flex items-center justify-center"
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(45,218,189,0.07) 0%, rgba(107,33,212,0.05) 50%, transparent 100%)',
                            borderRadius: '20px',
                            padding: '14px 8px 10px',
                        }}
                    >
                        <img 
                            src="/assets/brand/sidebar_logo.png" 
                            alt="Gen Audius Pro" 
                            style={{ height: '70px', width: 'auto', filter: 'drop-shadow(0 0 15px rgba(107,33,212,0.3))' }} 
                        />
                    </div>
                </div>

                {/* Divider — brand gradient */}
                <div
                    className="w-full h-px mb-1"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(45,218,189,0.4), rgba(107,33,212,0.4), rgba(233,30,140,0.3), transparent)' }}
                />

                {/* Try Free / Get Credits Button (Mureka style) */}
                <div className="px-1 mb-4">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-xl font-bold text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg"
                    style={{ 
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%)',
                        boxShadow: '0 4px 15px rgba(238, 90, 90, 0.25)'
                    }}
                  >
                    <Zap size={14} fill="white" />
                    Obtén Créditos
                  </motion.button>
                </div>

                {/* ── MAIN NAVIGATION ── */}
                <nav className="flex flex-col gap-1 mb-1 px-1">
                    <span className="text-[7px] text-white/20 tracking-[0.4em] uppercase px-2 mb-1.5">Navegación</span>
                    {navItems.map(item => {
                        const isActive = currentView === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => setCurrentView(item.id)}
                                whileHover={{ x: 3, scale: 1.01 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative overflow-hidden"
                                style={isActive ? {
                                    backgroundColor: item.glow,
                                    border: `1px solid ${item.activeColor}35`,
                                    boxShadow: `0 0 16px ${item.activeColor}18, inset 0 0 12px ${item.activeColor}08`,
                                } : {
                                    border: '1px solid transparent',
                                }}
                            >
                                {/* Active left accent bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-accent"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                                        style={{ background: item.activeColor }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}

                                {/* Icon container */}
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                    style={{
                                        background: isActive
                                            ? `${item.activeColor}18`
                                            : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${isActive ? item.activeColor + '30' : 'rgba(255,255,255,0.06)'}`,
                                    }}
                                >
                                    <item.icon
                                        size={13}
                                        style={{ color: isActive ? item.activeColor : 'rgba(255,255,255,0.3)' }}
                                    />
                                </div>

                                {/* Label */}
                                <span
                                    className="text-[11px] font-black tracking-widest uppercase flex-1"
                                    style={{ color: isActive ? item.activeColor : 'rgba(255,255,255,0.4)' }}
                                >
                                    {item.label}
                                </span>

                                {/* Active chevron */}
                                {isActive && (
                                    <ChevronRight
                                        size={10}
                                        style={{ color: item.activeColor, opacity: 0.6 }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div
                    className="w-full h-px my-1"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(107,33,212,0.25), rgba(233,30,140,0.2), transparent)' }}
                />

                {/* ── STUDIO FLOW TABS — only when in studio view ── */}
                <AnimatePresence>
                    {currentView === 'studio' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-1.5 mb-1 overflow-hidden"
                        >
                            <span className="text-[7px] text-white/20 tracking-[0.4em] uppercase px-2 mb-0.5">Flujos de Trabajo</span>
                            {STUDIO_FLOWS.map(flow => {
                                const isActive = activeFlow === flow.id;
                                return (
                                    <motion.button
                                        key={flow.id}
                                        onClick={() => setActiveFlow(flow.id)}
                                        whileHover={{ x: 3 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border"
                                        style={isActive ? {
                                            backgroundColor: `${flow.color}10`,
                                            borderColor: `${flow.color}30`,
                                            boxShadow: `0 0 16px ${flow.color}15`,
                                        } : { borderColor: 'rgba(255,255,255,0.05)' }}
                                    >
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                            style={{
                                                backgroundColor: isActive ? `${flow.color}20` : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${isActive ? flow.color + '50' : 'rgba(255,255,255,0.05)'}`,
                                            }}
                                        >
                                            <flow.icon size={13} style={{ color: isActive ? flow.color : 'rgba(255,255,255,0.3)' }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className="text-[10px] font-black truncate"
                                                style={{ color: isActive ? flow.color : 'rgba(255,255,255,0.4)' }}
                                            >
                                                {flow.label}
                                            </div>
                                            <div className="text-[8px] text-white/20 truncate">{flow.sublabel}</div>
                                        </div>
                                        {isActive && <ChevronRight size={9} style={{ color: flow.color, opacity: 0.6 }} />}
                                    </motion.button>
                                );
                            })}

                            <div
                                className="w-full h-px mt-1"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(107,33,212,0.2), transparent)' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── PROJECT INFO ── */}
                <div
                    className="px-3 py-3 rounded-xl border mb-2"
                    style={{ background: 'rgba(107,33,212,0.04)', borderColor: 'rgba(107,33,212,0.12)' }}
                >
                    <div className="flex items-center gap-1.5 mb-2">
                        <Zap size={8} style={{ color: '#F5A623' }} />
                        <div className="text-[7px] text-white/25 uppercase tracking-[0.4em]">Proyecto Activo</div>
                    </div>
                    <div className="text-[11px] font-bold text-white/60">Studio Session v1.0</div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-[8px] text-white/25">96 BPM</span>
                        <div className="w-px h-3 bg-white/10" />
                        <span className="text-[8px] text-white/25">4/4</span>
                        <div className="w-px h-3 bg-white/10" />
                        <span className="text-[8px] text-white/25">48kHz</span>
                    </div>
                </div>

                {/* ── PROVIDER STATUS ── */}
                <div className="px-1 mb-2">
                    <div className="text-[7px] text-white/20 tracking-[0.4em] uppercase mb-1.5 px-1">API Chain</div>
                    <div
                        style={{
                            padding: '6px 8px',
                            borderRadius: '10px',
                            background: 'rgba(0,229,255,0.03)',
                            border: '1px solid rgba(0,229,255,0.08)',
                        }}
                    >
                        <ProviderStatusBar />
                    </div>
                </div>

                {/* ── PREMIER CARD (Mureka style) ── */}
                <div className="px-1 mb-4">
                    <div 
                        className="p-4 rounded-2xl relative overflow-hidden group"
                        style={{ 
                            background: 'linear-gradient(180deg, #2D1D57 0%, #1A1133 100%)',
                            border: '1px solid rgba(155, 135, 245, 0.2)'
                        }}
                    >
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center shadow-lg">
                                <ShieldCheck size={12} className="text-white" />
                            </div>
                            <span className="font-black text-[10px] tracking-widest uppercase text-white">Hazte Premier</span>
                        </div>
                        <p className="text-[9px] text-white/40 leading-relaxed mb-3">
                            Libera todo el poder del ADN Audius con acceso ilimitado.
                        </p>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-2 bg-[#F5A623] text-[#030816] font-black text-[9px] tracking-[0.1em] uppercase rounded-lg hover:bg-[#FFB945] transition-colors"
                        >
                            Subir Nivel
                        </motion.button>
                        
                        {/* Glow effect */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#7C3AED]/20 blur-3xl rounded-full" />
                    </div>
                </div>
            </div>

            {/* ── MAIN CONTENT ── */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#030816] relative">
                <div className="flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
                    {currentView === 'studio' ? (
                        <AnimatePresence>
                            <motion.div
                                key={activeFlow}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="h-full absolute inset-0 w-full"
                            >
                                {ActiveComponent && <ActiveComponent />}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        children
                    )}
                </div>

                {/* ── GLOBAL PLAYER BAR (Mureka Style) ── */}
                <AnimatePresence>
                    {currentTrack && (
                        <motion.div 
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="h-20 bg-[#1A1820] border-t border-white/5 flex items-center px-6 shrink-0 z-20"
                            style={{ backdropFilter: 'blur(20px)' }}
                        >
                            {/* Song Info */}
                            <div className="flex items-center gap-4 w-1/4 min-w-0">
                                <div className="w-12 h-12 bg-[#2a2830] rounded-xl flex items-center justify-center shrink-0 border border-white/5 overflow-hidden">
                                    {currentTrack?.imageUrl ? (
                                        <img src={currentTrack.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <Music size={24} className="text-gray-600" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">
                                        {(currentTrack.prompt || currentTrack.title || 'Canción sin título')}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                        {(currentTrack.type || 'ADN GEN')}
                                    </p>
                                </div>
                            </div>

                            {/* Transport Controls */}
                            <div className="flex-1 flex flex-col items-center">
                                <div className="flex items-center gap-6 mb-2">
                                    <button className="text-gray-500 hover:text-white transition-colors"><Shuffle size={14} /></button>
                                    <button className="text-gray-500 hover:text-white transition-colors"><SkipBack size={18} /></button>
                                    <motion.button 
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={togglePlay}
                                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black shadow-xl"
                                    >
                                        {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" className="ml-1" />}
                                    </motion.button>
                                    <button className="text-gray-500 hover:text-white transition-colors"><SkipForward size={18} /></button>
                                    <button className="text-gray-500 hover:text-white transition-colors"><Repeat size={14} /></button>
                                </div>
                                <div className="flex items-center gap-3 w-full max-w-lg">
                                    <span className="text-[10px] text-gray-500 font-bold tabular-nums w-8 text-right">
                                        {formatTime(currentTime)}
                                    </span>
                                    <div 
                                        className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden cursor-pointer relative"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const x = e.clientX - rect.left;
                                            seek((x / rect.width) * 100);
                                        }}
                                    >
                                        <div 
                                            className="h-full bg-gradient-to-r from-[#9b87f5] to-[#735fd4] rounded-full transition-all duration-100" 
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-bold tabular-nums w-8 text-left">
                                        {formatTime(duration)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions & Volume */}
                            <div className="flex items-center gap-5 w-1/4 justify-end">
                                <button className="text-gray-500 hover:text-[#9b87f5] transition-colors"><Heart size={18} /></button>
                                <button className="text-gray-500 hover:text-white transition-colors"><Download size={18} /></button>
                                <div className="flex items-center gap-3 ml-2 group relative">
                                    <Volume2 size={16} className="text-gray-500 group-hover:text-white" />
                                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden cursor-pointer">
                                        <input 
                                            type="range" min="0" max="1" step="0.01"
                                            value={volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="w-full h-full opacity-0 absolute cursor-pointer"
                                        />
                                        <div 
                                            className="h-full bg-gray-500 group-hover:bg-[#9b87f5]" 
                                            style={{ width: `${volume * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <button className="text-gray-500 hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudioLayout;