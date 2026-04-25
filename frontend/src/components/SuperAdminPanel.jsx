/**
 * SuperAdminPanel — Gen Audius Pro
 * =================================
 * Sub-admin panel with access to ALL components and flows.
 * Sections: Dashboard, Users, Tracks, Artists, API Config, Logs, Stats, Components
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, Music, Star, Settings, Activity,
    BarChart3, Cpu, Database, Key, Globe, Zap, TrendingUp,
    ShieldCheck, Eye, Edit, Trash2, RefreshCw, Download,
    CheckCircle, XCircle, AlertTriangle, Terminal, Code,
    Palette, Layers, Box, Radio, Sliders, Headphones,
    ChevronRight, ChevronDown, ArrowUpRight, Flame, Wallet, DollarSign
} from 'lucide-react';

/* ── Mock data for dashboard ── */
const useDashboardData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch_data = async () => {
            try {
                const [statsRes, tracksRes, artistsRes] = await Promise.all([
                    fetch('/api/backend/api/explore/stats'),
                    fetch('/api/backend/api/tracks/trending?limit=5'),
                    fetch('/api/backend/api/artists/top?limit=5'),
                ]);
                const [stats, tracks, artists] = await Promise.all([
                    statsRes.ok ? statsRes.json() : {},
                    tracksRes.ok ? tracksRes.json() : {},
                    artistsRes.ok ? artistsRes.json() : {},
                ]);
                setData({ stats, tracks: tracks.tracks || [], artists: artists.artists || [] });
            } catch {
                setData({
                    stats: { total_tracks: 47, total_artists: 12, total_likes: 3200, total_plays: 28000 },
                    tracks: [],
                    artists: [],
                });
            } finally {
                setLoading(false);
            }
        };
        fetch_data();
    }, []);

    return { data, loading, refresh: () => { setLoading(true); } };
};

/* ── Metric Card ── */
const MetricCard = ({ icon: Icon, label, value, subValue, color, trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border relative overflow-hidden group"
        style={{
            background: `${color}08`,
            borderColor: `${color}18`,
        }}
        whileHover={{ scale: 1.02, y: -2 }}
    >
        <div
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
            style={{ background: color, transform: 'translate(30%, -30%)' }}
        />
        <div className="flex items-center justify-between mb-3">
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
                <Icon size={16} style={{ color }} />
            </div>
            {trend && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                    {trend}
                </span>
            )}
        </div>
        <div className="text-2xl font-black text-white leading-none">{value}</div>
        <div className="text-[9px] text-white/30 mt-1 uppercase tracking-wider">{label}</div>
        {subValue && <div className="text-[10px] text-white/50 mt-0.5">{subValue}</div>}
    </motion.div>
);

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
    const configs = {
        active: { color: '#00C9A7', label: 'Activo', icon: CheckCircle },
        inactive: { color: 'rgba(255,255,255,0.3)', label: 'Inactivo', icon: XCircle },
        degraded: { color: '#F5A623', label: 'Degradado', icon: AlertTriangle },
        error: { color: '#EF4444', label: 'Error', icon: XCircle },
    };
    const c = configs[status] || configs.inactive;
    return (
        <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${c.color}15`, color: c.color }}>
            <c.icon size={8} />
            {c.label}
        </span>
    );
};

/* ── Section: Dashboard ── */
const SectionDashboard = ({ data, loading }) => {
    const [systemStatus, setSystemStatus] = useState('checking');

    useEffect(() => {
        fetch('/api/backend/', { signal: AbortSignal.timeout(4000) })
            .then(r => r.ok ? setSystemStatus('active') : setSystemStatus('degraded'))
            .catch(() => setSystemStatus('inactive'));
    }, []);

    const metrics = [
        { icon: Music, label: 'Tracks Publicados', value: data?.stats?.total_tracks || 0, color: '#E91E8C', trend: '+12%' },
        { icon: Users, label: 'Artistas', value: data?.stats?.total_artists || 0, color: '#6B21D4', trend: '+8%' },
        { icon: Headphones, label: 'Total Plays', value: data?.stats?.total_plays ? `${(data.stats.total_plays/1000).toFixed(1)}k` : '0', color: '#00C9A7', trend: '+24%' },
        { icon: Star, label: 'Total Likes', value: data?.stats?.total_likes ? `${(data.stats.total_likes/1000).toFixed(1)}k` : '0', color: '#F5A623', trend: '+18%' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white">Dashboard General</h2>
                    <p className="text-[11px] text-white/30 mt-0.5">Vista general del sistema Gen Audius Pro</p>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge status={systemStatus} />
                    <span className="text-[10px] text-white/30">Backend API</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
            </div>

            {/* System Health */}
            <div
                className="p-5 rounded-2xl border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={14} style={{ color: '#00C9A7' }} />
                    <h3 className="text-[12px] font-black text-white/80 uppercase tracking-wider">Estado del Sistema</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { name: 'FastAPI Backend', status: systemStatus },
                        { name: 'SQLite/PostgreSQL', status: 'active' },
                        { name: 'KIE.AI Adapter', status: 'active' },
                        { name: 'Mastering Engine', status: 'active' },
                    ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span className="text-[9px] text-white/50">{s.name}</span>
                            <StatusBadge status={s.status} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Tracks */}
            {data?.tracks?.length > 0 && (
                <div className="p-5 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Flame size={14} style={{ color: '#D4AF37' }} />
                        <h3 className="text-[12px] font-black text-white/80 uppercase tracking-wider">Top Trending Tracks</h3>
                    </div>
                    {data.tracks.slice(0, 5).map((t, i) => (
                        <div key={t.track_id} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <span className="text-[10px] text-white/20 w-4">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-black text-white/80 truncate">{t.title}</div>
                                <div className="text-[9px] text-white/30">{t.username} · {t.genre}</div>
                            </div>
                            <span className="text-[9px] font-black text-[#D4AF37]">{t.trending_score?.toFixed(0)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── Section: API Config ── */
const SectionAPIConfig = () => {
    const [configs, setConfigs] = useState([]);
    const [editingProvider, setEditingProvider] = useState(null);
    const [editForm, setEditForm] = useState({ provider: '', status: '', cost: 0, api_key: '' });
    const [loading, setLoading] = useState(false);

    const fetchConfigs = async () => {
        try {
            const response = await fetch('/api/backend/api/admin/configs');
            if (response.ok) {
                const data = await response.json();
                setConfigs(data.configs || []);
            }
        } catch (error) {
            console.error('Error fetching configs:', error);
        }
    };

    const handleEdit = (config) => {
        setEditingProvider(config.provider);
        setEditForm({
            provider: config.provider,
            status: config.status,
            cost: config.cost_per_gen || config.cost,
            api_key: config.api_key || ''
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/backend/api/admin/config/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: editForm.provider,
                    apiKey: editForm.api_key,
                    status: editForm.status
                })
            });
            if (response.ok) {
                await fetchConfigs();
                setEditingProvider(null);
            }
        } catch (error) {
            console.error('Error saving config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingProvider(null);
        setEditForm({ provider: '', status: '', cost: 0, api_key: '' });
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-white">Configuración API</h2>
                <p className="text-[11px] text-white/30 mt-0.5">Gestión de proveedores de IA y API keys</p>
            </div>
            <div className="space-y-3">
                {configs.map((c, i) => (
                    <motion.div
                        key={c.provider}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-2xl border"
                        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                        {editingProvider === c.provider ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-white/30 uppercase">Proveedor</label>
                                        <input
                                            type="text"
                                            value={editForm.provider}
                                            onChange={(e) => setEditForm({...editForm, provider: e.target.value})}
                                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[12px] focus:outline-none focus:border-[#6B21D4]"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/30 uppercase">Costo (CRD)</label>
                                        <input
                                            type="number"
                                            value={editForm.cost}
                                            onChange={(e) => setEditForm({...editForm, cost: parseInt(e.target.value)})}
                                            className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[12px] focus:outline-none focus:border-[#6B21D4]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/30 uppercase">API Key</label>
                                    <input
                                        type="text"
                                        value={editForm.api_key}
                                        onChange={(e) => setEditForm({...editForm, api_key: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[12px] focus:outline-none focus:border-[#6B21D4]"
                                        placeholder="Ingresa la API key"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/30 uppercase">Estado</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                        className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[12px] focus:outline-none focus:border-[#6B21D4]"
                                    >
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex-1 px-3 py-2 rounded-lg text-[11px] font-black text-white transition-all hover:scale-105 disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #6B21D4, #E91E8C)' }}
                                    >
                                        {loading ? 'Guardando...' : 'Guardar'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-3 py-2 rounded-lg text-[11px] font-black text-white/50 hover:text-white transition-all hover:bg-white/5"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(107,33,212,0.15)', border: '1px solid rgba(107,33,212,0.25)' }}>
                                        <Key size={14} style={{ color: '#6B21D4' }} />
                                    </div>
                                    <div>
                                        <div className="text-[12px] font-black text-white/80">{c.provider}</div>
                                        <div className="text-[9px] text-white/30 font-mono">
                                            {c.api_key ? `${c.api_key.substring(0, 4)}${'•'.repeat(c.api_key.length - 4)}` : '••••••••••••'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] text-white/30">{c.cost_per_gen || c.cost} créditos</span>
                                    <StatusBadge status={c.status} />
                                    <button 
                                        onClick={() => handleEdit(c)}
                                        className="text-white/20 hover:text-white/50 transition-colors"
                                    >
                                        <Edit size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

/* ── Section: Components Explorer ── */
const SectionComponents = ({ onNavigate }) => {
    const components = [
        { id: 'landing', label: 'LandingPage', desc: 'Hero slideshow, navbar, pricing, CTA', icon: Globe, color: '#F5A623', view: 'home' },
        { id: 'studio', label: 'StudioLayout', desc: 'Sidebar nav, brand logo, studio flows', icon: Sliders, color: '#6B21D4', view: 'studio' },
        { id: 'explore', label: 'ExploreView', desc: 'Trending tracks, artists, genres', icon: TrendingUp, color: '#D4AF37', view: 'explore' },
        { id: 'generate', label: 'PageCreatorV3', desc: 'AI music generation, prompt UI', icon: Cpu, color: '#E91E8C', view: 'generate' },
        { id: 'library', label: 'Library/DAW', desc: 'Track library, playback, management', icon: Music, color: '#00C9A7', view: 'library' },
        { id: 'admin', label: 'AdminPanel', desc: 'System config, credits, API management', icon: Settings, color: '#6B21D4', view: 'admin' },
        { id: 'daw', label: 'GenDAW Studio', desc: 'Full DAW: mixer, tracks, arrangement', icon: Box, color: '#E91E8C', view: 'studio' },
        { id: 'master', label: 'AudiusMaster', desc: 'Mastering engine, presets, export', icon: Radio, color: '#00C9A7', view: 'studio' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-white">Explorador de Componentes</h2>
                <p className="text-[11px] text-white/30 mt-0.5">Acceso rápido a todos los componentes y flujos del sistema</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {components.map((comp, i) => (
                    <motion.div
                        key={comp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden"
                        style={{
                            background: `${comp.color}06`,
                            borderColor: `${comp.color}15`,
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        onClick={() => onNavigate && onNavigate(comp.view)}
                    >
                        <div
                            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
                            style={{ background: comp.color, transform: 'translate(40%, -40%)' }}
                        />
                        <div className="flex items-start gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${comp.color}15`, border: `1px solid ${comp.color}25` }}
                            >
                                <comp.icon size={16} style={{ color: comp.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-[12px] font-black text-white/80">{comp.label}</span>
                                    <ArrowUpRight size={12} style={{ color: comp.color, opacity: 0.6 }} className="group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-[10px] text-white/35 mt-0.5">{comp.desc}</div>
                                <div className="mt-2 flex items-center gap-1">
                                    <span className="text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider" style={{ background: `${comp.color}15`, color: comp.color }}>
                                        {comp.view}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

/* ── Section: Logs ── */
const SectionLogs = () => {
    const [logs, setLogs] = useState([
        { time: new Date().toISOString(), level: 'INFO', msg: 'Backend API iniciado correctamente' },
        { time: new Date(Date.now() - 60000).toISOString(), level: 'INFO', msg: 'Gen Audius Trending Algorithm v1.0 cargado' },
        { time: new Date(Date.now() - 120000).toISOString(), level: 'INFO', msg: 'SQLite database inicializada (dev mode)' },
        { time: new Date(Date.now() - 180000).toISOString(), level: 'WARN', msg: 'MongoDB no disponible — usando SQLite-only mode' },
        { time: new Date(Date.now() - 240000).toISOString(), level: 'INFO', msg: 'KIE.AI adapter configurado' },
        { time: new Date(Date.now() - 300000).toISOString(), level: 'INFO', msg: 'MasterChannel adapter iniciado' },
    ]);

    const levelColors = { INFO: '#00C9A7', WARN: '#F5A623', ERROR: '#EF4444', DEBUG: '#6B21D4' };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white">Logs del Sistema</h2>
                    <p className="text-[11px] text-white/30 mt-0.5">Registro de eventos en tiempo real</p>
                </div>
                <button
                    onClick={() => {}}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-white/10 text-white/40 hover:border-white/20 hover:text-white/60 transition-all"
                >
                    <RefreshCw size={10} />
                    Refrescar
                </button>
            </div>
            <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: 'rgba(3,5,10,0.8)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
                <div
                    className="px-4 py-2 border-b flex items-center gap-2"
                    style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                >
                    <Terminal size={12} style={{ color: '#00C9A7' }} />
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">gen_audius.backend</span>
                </div>
                <div className="p-4 space-y-1.5 font-mono max-h-80 overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i} className="flex items-start gap-3 text-[10px]">
                            <span className="text-white/20 shrink-0">{new Date(log.time).toLocaleTimeString()}</span>
                            <span className="font-black shrink-0 w-10" style={{ color: levelColors[log.level] || '#fff' }}>{log.level}</span>
                            <span className="text-white/60">{log.msg}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ── Section: Tracks ── */
const SectionTracks = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/backend/api/tracks/trending?limit=20')
            .then(r => r.ok ? r.json() : { tracks: [] })
            .then(d => { setTracks(d.tracks || []); setLoading(false); })
            .catch(() => {
                setTracks([
                    { track_id: 'demo-1', title: 'Noches de Dembow', genre: 'Dembow', username: 'Danny García', likes: 2841, plays: 18420, trending_score: 94.2, is_public: true, created_at: new Date().toISOString() },
                    { track_id: 'demo-2', title: 'Luna Electrónica', genre: 'Electronic', username: 'Luna Morales', likes: 1923, plays: 12300, trending_score: 87.1, is_public: true, created_at: new Date().toISOString() },
                    { track_id: 'demo-3', title: 'Trap Millennial', genre: 'Trap', username: 'Studio Noir', likes: 3102, plays: 24100, trending_score: 91.7, is_public: true, created_at: new Date().toISOString() },
                ]);
                setLoading(false);
            });
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-white">Gestión de Tracks</h2>
                <p className="text-[11px] text-white/30 mt-0.5">Todos los tracks publicados en el sistema</p>
            </div>
            <div
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
                <div
                    className="grid text-[8px] text-white/25 uppercase tracking-widest font-black px-4 py-2.5 border-b"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 60px', borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                >
                    <span>Título</span>
                    <span>Artista</span>
                    <span>Género</span>
                    <span>Plays</span>
                    <span>Score</span>
                    <span>Acc.</span>
                </div>
                {tracks.map((t, i) => (
                    <motion.div
                        key={t.track_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="grid items-center px-4 py-3 border-b transition-all hover:bg-white/[0.02]"
                        style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 60px', borderColor: 'rgba(255,255,255,0.04)' }}
                    >
                        <span className="text-[11px] text-white/80 font-black truncate">{t.title}</span>
                        <span className="text-[10px] text-white/40 truncate">{t.username}</span>
                        <span className="text-[9px] text-white/30">{t.genre}</span>
                        <span className="text-[10px] text-white/60">{t.plays >= 1000 ? `${(t.plays/1000).toFixed(1)}k` : t.plays}</span>
                        <span className="text-[10px] font-black" style={{ color: '#D4AF37' }}>{t.trending_score?.toFixed(0)}</span>
                        <div className="flex items-center gap-1.5">
                            <button className="text-white/20 hover:text-white/50 transition-colors"><Eye size={11} /></button>
                            <button className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
                        </div>
                    </motion.div>
                ))}
                {tracks.length === 0 && !loading && (
                    <div className="text-center py-8 text-white/20 text-[11px]">No hay tracks publicados aún</div>
                )}
            </div>
        </div>
    );
};

/* ── Section: Stats ── */
const SectionStats = ({ data }) => {
    const chartBars = [
        { label: 'Lun', plays: 4200, likes: 320 },
        { label: 'Mar', plays: 5800, likes: 440 },
        { label: 'Mié', plays: 3900, likes: 290 },
        { label: 'Jue', plays: 7100, likes: 580 },
        { label: 'Vie', plays: 8900, likes: 720 },
        { label: 'Sáb', plays: 11200, likes: 950 },
        { label: 'Dom', plays: 9400, likes: 810 },
    ];
    const maxPlays = Math.max(...chartBars.map(b => b.plays));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-white">Estadísticas</h2>
                <p className="text-[11px] text-white/30 mt-0.5">Métricas de uso y engagement de la plataforma</p>
            </div>

            {/* Bar Chart */}
            <div className="p-5 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 size={14} style={{ color: '#E91E8C' }} />
                    <h3 className="text-[11px] font-black text-white/60 uppercase tracking-wider">Plays por Día (esta semana)</h3>
                </div>
                <div className="flex items-end justify-between gap-2 h-32">
                    {chartBars.map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                                className="w-full rounded-t-lg"
                                initial={{ height: 0 }}
                                animate={{ height: `${(bar.plays / maxPlays) * 100}%` }}
                                transition={{ delay: i * 0.05, duration: 0.5 }}
                                style={{ background: 'linear-gradient(to top, rgba(233,30,140,0.6), rgba(107,33,212,0.3))' }}
                            />
                            <span className="text-[7px] text-white/20">{bar.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Genres */}
            <div className="p-5 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <h3 className="text-[11px] font-black text-white/60 uppercase tracking-wider mb-4">Géneros Más Populares</h3>
                <div className="space-y-3">
                    {[
                        { genre: 'Reggaeton', pct: 28, color: '#E91E8C' },
                        { genre: 'Dembow', pct: 22, color: '#F5A623' },
                        { genre: 'Electronic', pct: 18, color: '#00C9A7' },
                        { genre: 'Trap', pct: 15, color: '#6B21D4' },
                        { genre: 'House', pct: 10, color: '#D4AF37' },
                        { genre: 'Otros', pct: 7, color: 'rgba(255,255,255,0.2)' },
                    ].map((g, i) => (
                        <div key={i} className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-[10px] text-white/50">{g.genre}</span>
                                <span className="text-[10px] font-black" style={{ color: g.color }}>{g.pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5">
                                <motion.div
                                    className="h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${g.pct}%` }}
                                    transition={{ delay: i * 0.08, duration: 0.6 }}
                                    style={{ background: g.color }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SectionWallets = () => {
    const [wallets, setWallets] = useState([]);
    const [totalCredits, setTotalCredits] = useState(0);
    const [totalBalance, setTotalBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [adjustAmount, setAdjustAmount] = useState('');

    const fetchWallets = async () => {
        try {
            const response = await fetch('/api/backend/api/admin/wallets');
            const data = await response.json();
            setWallets(data.wallets);
            setTotalCredits(data.total_credits);
            setTotalBalance(data.total_balance);
        } catch (error) {
            console.error('Error fetching wallets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletDetails = async (userId) => {
        try {
            const response = await fetch(`/api/backend/api/wallet/${userId}`);
            const data = await response.json();
            setSelectedWallet(data);
        } catch (error) {
            console.error('Error fetching wallet details:', error);
        }
    };

    const handleRecharge = async (userId, amount) => {
        if (!amount || amount <= 0) return;
        try {
            const response = await fetch(
                `/api/backend/api/wallet/${userId}/recharge?amount=${amount}`,
                { method: 'POST' }
            );
            if (response.ok) {
                fetchWallets();
                fetchWalletDetails(userId);
                setRechargeAmount('');
            }
        } catch (error) {
            console.error('Error recharging wallet:', error);
        }
    };

    const handleAdjust = async (userId, amount) => {
        if (!amount) return;
        try {
            const response = await fetch(
                `/api/backend/api/admin/wallets/${userId}/adjust?amount=${amount}`,
                { method: 'POST' }
            );
            if (response.ok) {
                fetchWallets();
                fetchWalletDetails(userId);
                setAdjustAmount('');
            }
        } catch (error) {
            console.error('Error adjusting wallet:', error);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-white">Créditos & Wallets</h2>
                <p className="text-[11px] text-white/30 mt-0.5">Gestión de créditos de todos los usuarios</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet size={16} style={{ color: '#F5A623' }} />
                        <span className="text-[10px] font-black text-white/60 uppercase">Total Créditos</span>
                    </div>
                    <p className="text-3xl font-black" style={{ color: '#F5A623' }}>{totalCredits.toLocaleString()}</p>
                    <p className="text-[10px] text-white/30 mt-1">CRD en circulación</p>
                </div>
                <div className="p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={16} style={{ color: '#00C9A7' }} />
                        <span className="text-[10px] font-black text-white/60 uppercase">Total Balance</span>
                    </div>
                    <p className="text-3xl font-black" style={{ color: '#00C9A7' }}>${totalBalance.toFixed(2)}</p>
                    <p className="text-[10px] text-white/30 mt-1">Valor en USD</p>
                </div>
            </div>

            {/* Wallets List */}
            <div className="p-5 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <h3 className="text-[11px] font-black text-white/60 uppercase tracking-wider mb-4">Todos los Wallets</h3>
                {loading ? (
                    <div className="text-center py-8 text-white/30 text-[11px]">Cargando...</div>
                ) : (
                    <div className="space-y-3">
                        {wallets.map((wallet) => (
                            <div
                                key={wallet.user_id}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                    selectedWallet?.user_id === wallet.user_id
                                        ? 'border-[#F5A623] bg-[#F5A623]/10'
                                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                                }`}
                                onClick={() => fetchWalletDetails(wallet.user_id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[12px] font-bold text-white">{wallet.user_id}</p>
                                        <p className="text-[10px] text-white/30 mt-1">
                                            Actualizado: {new Date(wallet.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[14px] font-black" style={{ color: '#F5A623' }}>
                                            {wallet.credits.toLocaleString()} CRD
                                        </p>
                                        <p className="text-[10px] text-white/30">${wallet.balance.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Wallet Details */}
            {selectedWallet && (
                <div className="p-5 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <h3 className="text-[11px] font-black text-white/60 uppercase tracking-wider mb-4">
                        Detalles: {selectedWallet.user_id}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-white/5">
                            <p className="text-[10px] text-white/30">Saldo Actual</p>
                            <p className="text-[18px] font-black" style={{ color: '#F5A623' }}>
                                {selectedWallet.credits.toLocaleString()} CRD
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5">
                            <p className="text-[10px] text-white/30">Balance USD</p>
                            <p className="text-[18px] font-black" style={{ color: '#00C9A7' }}>
                                ${selectedWallet.balance.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {/* Recharge */}
                    <div className="space-y-2 mb-4">
                        <label className="text-[10px] font-black text-white/60 uppercase">Recargar Créditos</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={rechargeAmount}
                                onChange={(e) => setRechargeAmount(e.target.value)}
                                placeholder="Cantidad"
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[12px] placeholder-white/30 focus:outline-none focus:border-[#F5A623]"
                            />
                            <button
                                onClick={() => handleRecharge(selectedWallet.user_id, parseInt(rechargeAmount))}
                                className="px-4 py-2 rounded-lg text-[11px] font-black text-white transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #F5A623, #E91E8C)' }}
                            >
                                Recargar
                            </button>
                        </div>
                    </div>

                    {/* Admin Adjust */}
                    <div className="space-y-2 mb-4">
                        <label className="text-[10px] font-black text-white/60 uppercase">Ajuste Admin (+/-)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                placeholder="Cantidad (negativo para restar)"
                                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-[12px] placeholder-white/30 focus:outline-none focus:border-[#6B21D4]"
                            />
                            <button
                                onClick={() => handleAdjust(selectedWallet.user_id, parseInt(adjustAmount))}
                                className="px-4 py-2 rounded-lg text-[11px] font-black text-white transition-all hover:scale-105"
                                style={{ background: 'linear-gradient(135deg, #6B21D4, #E91E8C)' }}
                            >
                                Ajustar
                            </button>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div>
                        <h4 className="text-[10px] font-black text-white/60 uppercase tracking-wider mb-3">
                            Transacciones Recientes
                        </h4>
                        {selectedWallet.recent_transactions.length > 0 ? (
                            <div className="space-y-2">
                                {selectedWallet.recent_transactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                        <div>
                                            <p className="text-[11px] text-white">{tx.type}</p>
                                            <p className="text-[9px] text-white/30">{tx.description}</p>
                                        </div>
                                        <p
                                            className={`text-[12px] font-black ${
                                                tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                                            }`}
                                        >
                                            {tx.amount > 0 ? '+' : ''}{tx.amount} CRD
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] text-white/30 text-center py-4">Sin transacciones</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── Section: Cloud Engines ── */
const SectionCloudEngines = () => {
    const [resources, setResources] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trainingForm, setTrainingForm] = useState({ type: 'voice', name: '', provider: 'modal', data_url: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resRes, jobRes] = await Promise.all([
                fetch('/api/backend/api/admin/cloud/resources'),
                fetch('/api/backend/api/admin/training/jobs')
            ]);
            if (resRes.ok) setResources(await resRes.json());
            if (jobRes.ok) setJobs(await jobRes.json());
        } catch (e) { console.error('Error fetching cloud data:', e); }
        setLoading(false);
    };

    const startTraining = async () => {
        if (!trainingForm.name) return alert('Por favor, indica un nombre para el modelo');
        try {
            const res = await fetch('/api/backend/api/admin/training/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trainingForm)
            });
            if (res.ok) {
                alert('Entrenamiento iniciado con éxito en la nube');
                fetchData();
            }
        } catch (e) { console.error('Error starting training:', e); }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white">Cloud Engines & Training</h2>
                    <p className="text-[11px] text-white/30 mt-0.5">Gestión de servidores GPU y entrenamiento de modelos</p>
                </div>
                <button 
                    onClick={fetchData}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {resources.map(r => (
                    <motion.div 
                        key={r.id} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl border bg-white/5 border-white/10 relative group"
                    >
                        <div className="flex justify-between items-center mb-2">
                             <div className="text-[12px] font-black text-white/80">{r.name}</div>
                             <StatusBadge status={r.status} />
                        </div>
                        <div className="text-[9px] text-white/40 mb-3 font-mono">{r.provider.toUpperCase()} · {r.endpoint || 'Managed'}</div>
                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button className="px-2 py-1 rounded bg-white/5 text-[9px] font-black text-white/60 hover:text-white border border-white/10 transition-colors">Configurar</button>
                            <button className="px-2 py-1 rounded bg-red-500/10 text-[9px] font-black text-red-400/60 hover:text-red-400 border border-red-500/20 transition-colors">Borrar</button>
                        </div>
                    </motion.div>
                ))}
                
                {/* Add New Resource */}
                <button className="p-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-2 group">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Box size={14} className="text-white/20 group-hover:text-white/60" />
                    </div>
                    <span className="text-[10px] font-black text-white/20 group-hover:text-white/50 uppercase tracking-widest">Añadir Servidor</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Launch Training Form */}
                <div className="p-6 rounded-3xl border bg-gradient-to-br from-[#6B21D4]/10 to-[#E91E8C]/10 border-[#6B21D4]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap size={64} className="text-[#E91E8C]" />
                    </div>
                    
                    <h3 className="text-[13px] font-black text-white/80 uppercase mb-5 flex items-center gap-2">
                        <Flame size={14} className="text-[#E91E8C]" />
                        Nuevo Entrenamiento AI
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Tipo de Modelo</label>
                                <select 
                                    value={trainingForm.type}
                                    onChange={e => setTrainingForm({...trainingForm, type: e.target.value})}
                                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#E91E8C]"
                                >
                                    <option value="voice">Voz (RVC/So-VITS)</option>
                                    <option value="instrument">Instrumento (DNA Samples)</option>
                                    <option value="style">Estilo / LoRA</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Proveedor GPU</label>
                                <select 
                                    value={trainingForm.provider}
                                    onChange={e => setTrainingForm({...trainingForm, provider: e.target.value})}
                                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#E91E8C]"
                                >
                                    {resources.filter(r => r.status === 'active').map(r => (
                                        <option key={r.id} value={r.provider}>{r.name}</option>
                                    ))}
                                    <option value="modal">Modal (Autoscale)</option>
                                    <option value="runpod">RunPod (Serverless)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">Nombre del Modelo / ID</label>
                            <input 
                                type="text" 
                                value={trainingForm.name}
                                onChange={e => setTrainingForm({...trainingForm, name: e.target.value})}
                                placeholder="Ej: Danny Garcia Voice v1"
                                className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-[11px] placeholder-white/20 focus:outline-none focus:border-[#E91E8C]"
                            />
                        </div>

                        <div>
                            <label className="text-[9px] text-white/40 uppercase font-black tracking-widest">URL del Dataset (GCS/S3)</label>
                            <input 
                                type="text" 
                                value={trainingForm.data_url}
                                onChange={e => setTrainingForm({...trainingForm, data_url: e.target.value})}
                                placeholder="gs://gen-audius-train/danny_samples.zip"
                                className="w-full mt-1.5 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-[11px] placeholder-white/20 focus:outline-none focus:border-[#E91E8C]"
                            />
                        </div>

                        <button 
                            onClick={startTraining}
                            className="w-full py-3.5 mt-2 rounded-2xl text-[12px] font-black text-white transition-all hover:scale-[1.02] shadow-xl shadow-[#E91E8C]/20 flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg, #6B21D4, #E91E8C)' }}
                        >
                            <Zap size={14} />
                            LANZAR ENTRENAMIENTO PRO
                        </button>
                    </div>
                </div>

                {/* Training Jobs History */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden flex flex-col">
                    <div className="px-5 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Historial de Trabajos</span>
                        <span className="text-[9px] text-white/30">{jobs.length} totales</span>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-white/5">
                        {jobs.map((j, idx) => (
                            <motion.div 
                                key={j.id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                            >
                                <div className="min-w-0">
                                    <div className="text-[11px] font-black text-white/80 flex items-center gap-2">
                                        {j.name} 
                                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 font-normal uppercase">{j.type}</span>
                                    </div>
                                    <div className="text-[9px] text-white/25 mt-1 font-mono">{j.job_id} · {j.provider}</div>
                                </div>
                                <div className="text-right">
                                    <StatusBadge status={j.status} />
                                    <div className="text-[8px] text-white/20 mt-1.5 font-medium">{new Date(j.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </motion.div>
                        ))}
                        {jobs.length === 0 && (
                            <div className="p-12 text-center">
                                <Activity size={24} className="text-white/5 mx-auto mb-3" />
                                <p className="text-white/10 text-[11px]">No hay entrenamientos previos registrados</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Main SuperAdminPanel ── */
export default function SuperAdminPanel({ onNavigate }) {
    const [activeSection, setActiveSection] = useState('dashboard');
    const { data, loading } = useDashboardData();

    const sections = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#F5A623' },
        { id: 'cloud', label: 'Cloud Engines', icon: Zap, color: '#E91E8C' },
        { id: 'components', label: 'Componentes', icon: Layers, color: '#6B21D4' },
        { id: 'tracks', label: 'Tracks', icon: Music, color: '#E91E8C' },
        { id: 'artists', label: 'Artistas', icon: Users, color: '#00C9A7' },
        { id: 'wallets', label: 'Créditos & Wallets', icon: Wallet, color: '#F5A623' },
        { id: 'api', label: 'API Config', icon: Key, color: '#6B21D4' },
        { id: 'stats', label: 'Estadísticas', icon: BarChart3, color: '#D4AF37' },
        { id: 'logs', label: 'Logs', icon: Terminal, color: '#00C9A7' },
    ];

    return (
        <div className="min-h-screen bg-[#030816] text-white flex overflow-hidden">
            {/* Sub-sidebar */}
            <div
                className="w-52 shrink-0 border-r flex flex-col py-5 px-3 gap-1"
                style={{ background: 'rgba(5,8,18,0.95)', borderColor: 'rgba(255,255,255,0.05)' }}
            >
                {/* Header */}
                <div className="px-2 mb-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(233,30,140,0.15)', border: '1px solid rgba(233,30,140,0.25)' }}
                        >
                            <ShieldCheck size={14} style={{ color: '#E91E8C' }} />
                        </div>
                        <div>
                            <div className="text-[11px] font-black text-white/80">Super Admin</div>
                            <div className="text-[7px] text-white/25 uppercase tracking-wider">Panel de Control</div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(233,30,140,0.3), transparent)' }} />

                {/* Nav */}
                {sections.map(s => {
                    const isActive = activeSection === s.id;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
                            style={isActive ? {
                                background: `${s.color}10`,
                                border: `1px solid ${s.color}25`,
                            } : {
                                border: '1px solid transparent',
                            }}
                        >
                            <s.icon
                                size={12}
                                style={{ color: isActive ? s.color : 'rgba(255,255,255,0.25)' }}
                            />
                            <span
                                className="text-[10px] font-black uppercase tracking-wider"
                                style={{ color: isActive ? s.color : 'rgba(255,255,255,0.35)' }}
                            >
                                {s.label}
                            </span>
                            {isActive && <ChevronRight size={9} style={{ color: s.color, marginLeft: 'auto', opacity: 0.6 }} />}
                        </button>
                    );
                })}
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {activeSection === 'dashboard' && <SectionDashboard data={data} loading={loading} />}
                        {activeSection === 'cloud' && <SectionCloudEngines />}
                        {activeSection === 'components' && <SectionComponents onNavigate={onNavigate} />}
                        {activeSection === 'tracks' && <SectionTracks />}
                        {activeSection === 'api' && <SectionAPIConfig />}
                        {activeSection === 'stats' && <SectionStats data={data} />}
                        {activeSection === 'logs' && <SectionLogs />}
                        {activeSection === 'wallets' && <SectionWallets />}
                        {activeSection === 'artists' && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-black text-white">Gestión de Artistas</h2>
                                <p className="text-[11px] text-white/30">Perfiles de artistas de la plataforma</p>
                                <div className="text-[11px] text-white/20 py-8 text-center">
                                    Conectando con la base de datos...
                                    <br />
                                    <button
                                        onClick={() => setActiveSection('dashboard')}
                                        className="mt-3 text-[#6B21D4] hover:text-purple-400 transition-colors"
                                    >
                                        Ver Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}