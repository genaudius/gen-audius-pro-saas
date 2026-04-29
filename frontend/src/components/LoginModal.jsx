/**
 * Gen Audius Pro — Login Modal
 * ============================
 * Dark Luxury Wave design system v10
 * Authenticates against POST /api/auth/login
 * Stores session in localStorage: ga_user_id, ga_plan, ga_token, ga_username
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2, Zap, Chrome } from 'lucide-react';
import { auth, googleProvider, appleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useLang } from '../i18n/LanguageContext';

const API_BASE = '/api/backend';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const [mode,     setMode]     = useState('login'); // 'login' | 'register'
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');
    const [success,  setSuccess]  = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [legalLinks, setLegalLinks] = useState({});
    const { t } = useLang();

    const isRegister = mode === 'register';

    React.useEffect(() => {
        fetch(`${API_BASE}/api/legal/all`)
            .then(async r => {
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                return r.json();
            })
            .then(data => setLegalLinks(data))
            .catch(e => {
                console.error("Legal fetch failed", e);
            });
    }, []);

    const switchMode = (newMode) => {
        if (loading) return;
        setMode(newMode);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!accepted) {
            setError(t('legal.acceptTerms'));
            return;
        }
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
            const body = isRegister
                ? { email: email.trim(), password, username: username.trim() || undefined, accepted_terms: true }
                : { email: email.trim(), password };

            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                // Pydantic validation errors come as array
                const detail = Array.isArray(data.detail)
                    ? data.detail.map(d => d.msg).join(' · ')
                    : (data.detail || (isRegister ? 'No se pudo crear la cuenta.' : 'Login failed. Check your credentials.'));
                setError(detail);
                setLoading(false);
                return;
            }

            // Store session
            localStorage.setItem('ga_user_id',  data.user_id);
            localStorage.setItem('ga_plan',      data.plan);
            localStorage.setItem('ga_token',     data.token);
            localStorage.setItem('ga_username',  data.username);
            localStorage.setItem('ga_email',     data.email);
            localStorage.setItem('ga_credits',   data.credits);

            setSuccess(true);
            setTimeout(() => {
                onLoginSuccess(data);
                onClose();
            }, 900);

        } catch (err) {
            setError('Error de conexión. Verifica que el backend esté corriendo.');
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        if (!auth || !provider) {
            setError('Social login no está habilitado en este entorno.');
            return;
        }
        if (!accepted) {
            setError(t('legal.acceptTerms'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Sync with our backend to getting GA specific profile (plan, credits)
            // or generate a token
            const res = await fetch(`${API_BASE}/api/auth/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: user.email, 
                    uid: user.uid, 
                    username: user.displayName 
                }),
            });
            const data = await res.json();
            
            localStorage.setItem('ga_user_id',  data.user_id || user.uid);
            localStorage.setItem('ga_plan',     data.plan || 'free');
            localStorage.setItem('ga_username', data.username || user.displayName);
            localStorage.setItem('ga_email',    user.email);
            
            setSuccess(true);
            setTimeout(() => {
                onLoginSuccess(data);
                onClose();
            }, 900);
        } catch (err) {
            setError(err.message || 'Error con el proveedor social.');
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setError('');
        setSuccess(false);
        setEmail('');
        setPassword('');
        setUsername('');
        setMode('login');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[100]"
                        style={{ background: 'rgba(3,8,22,0.85)', backdropFilter: 'blur(12px)' }}
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        exit={{   opacity: 0, scale: 0.92, y: 20  }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                        style={{ pointerEvents: 'none' }}
                    >
                        <div
                            className="relative w-full max-w-md rounded-2xl overflow-hidden"
                            style={{
                                pointerEvents: 'auto',
                                background: 'linear-gradient(145deg, rgba(10,14,30,0.98) 0%, rgba(7,9,20,0.99) 100%)',
                                border: '1px solid rgba(107,33,212,0.25)',
                                boxShadow: '0 0 60px rgba(107,33,212,0.15), 0 0 120px rgba(233,30,140,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
                            }}
                        >
                            {/* Top gradient bar */}
                            <div className="h-[2px] w-full" style={{
                                background: 'linear-gradient(90deg, #F5A623, #6B21D4, #E91E8C, #00C9A7)'
                            }} />

                            {/* bg texture overlay */}
                            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
                                backgroundImage: 'url("/assets/brand/bg_texture.png")',
                                backgroundSize: 'cover',
                            }} />

                            <div className="relative p-8">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <img
                                            src="/assets/brand/sidebar_logo.png"
                                            alt="Gen Audius"
                                            style={{ height: '52px', width: 'auto', marginBottom: '12px' }}
                                        />
                                        <p className="text-[10px] font-black tracking-[0.3em] uppercase"
                                           style={{ color: 'rgba(255,255,255,0.3)' }}>
                                            {isRegister ? 'Crea tu cuenta' : 'Acceso al Studio Pro'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        data-testid="login-modal-close-btn"
                                        className="p-2 rounded-full transition-all hover:bg-white/5"
                                        style={{ color: 'rgba(255,255,255,0.3)' }}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Mode tabs (Login / Register) */}
                                {!success && (
                                    <div
                                        className="flex p-1 rounded-xl mb-6"
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(107,33,212,0.18)',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            data-testid="auth-tab-login"
                                            onClick={() => switchMode('login')}
                                            className="flex-1 py-2.5 rounded-lg text-[10px] font-black tracking-[0.25em] uppercase transition-all"
                                            style={{
                                                background: !isRegister
                                                    ? 'linear-gradient(135deg, #6B21D4 0%, #E91E8C 100%)'
                                                    : 'transparent',
                                                color: !isRegister ? '#fff' : 'rgba(255,255,255,0.45)',
                                                boxShadow: !isRegister ? '0 2px 12px rgba(107,33,212,0.35)' : 'none',
                                            }}
                                        >
                                            Iniciar Sesión
                                        </button>
                                        <button
                                            type="button"
                                            data-testid="auth-tab-register"
                                            onClick={() => switchMode('register')}
                                            className="flex-1 py-2.5 rounded-lg text-[10px] font-black tracking-[0.25em] uppercase transition-all"
                                            style={{
                                                background: isRegister
                                                    ? 'linear-gradient(135deg, #F5A623 0%, #00C9A7 100%)'
                                                    : 'transparent',
                                                color: isRegister ? '#fff' : 'rgba(255,255,255,0.45)',
                                                boxShadow: isRegister ? '0 2px 12px rgba(245,166,35,0.35)' : 'none',
                                            }}
                                        >
                                            Registro
                                        </button>
                                    </div>
                                )}

                                {/* Success state */}
                                {success ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center py-8 gap-4"
                                    >
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                             style={{ background: 'rgba(0,201,167,0.15)', border: '1px solid rgba(0,201,167,0.3)' }}>
                                            <CheckCircle2 size={32} style={{ color: '#00C9A7' }} />
                                        </div>
                                        <p className="text-white font-black text-lg">
                                            {isRegister ? '¡Cuenta creada!' : '¡Bienvenido!'}
                                        </p>
                                        <p className="text-[11px] tracking-widest uppercase"
                                           style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            {isRegister ? '200 créditos cargados · Entrando...' : 'Entrando al Studio...'}
                                        </p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Username field — only on register */}
                                        <AnimatePresence initial={false}>
                                        {isRegister && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, y: -8 }}
                                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                exit={{ opacity: 0, height: 0, y: -8 }}
                                                className="space-y-2 overflow-hidden"
                                            >
                                                <label className="text-[10px] font-black tracking-[0.25em] uppercase"
                                                       style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                    Usuario
                                                </label>
                                                <div className="relative">
                                                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2"
                                                          style={{ color: 'rgba(0,201,167,0.7)' }} />
                                                    <input
                                                        type="text"
                                                        value={username}
                                                        data-testid="register-username-input"
                                                        onChange={e => setUsername(e.target.value)}
                                                        placeholder="dj_starlight"
                                                        autoComplete="username"
                                                        minLength={2}
                                                        maxLength={64}
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-white/20 outline-none transition-all"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.04)',
                                                            border: '1px solid rgba(0,201,167,0.2)',
                                                        }}
                                                        onFocus={e => e.target.style.borderColor = 'rgba(0,201,167,0.6)'}
                                                        onBlur={e => e.target.style.borderColor = 'rgba(0,201,167,0.2)'}
                                                    />
                                                </div>
                                                <p className="text-[9px] text-white/25 px-1">Opcional · si lo dejás vacío usamos la parte previa al @ de tu email</p>
                                            </motion.div>
                                        )}
                                        </AnimatePresence>

                                        {/* Email field */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-[0.25em] uppercase"
                                                   style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2"
                                                      style={{ color: 'rgba(107,33,212,0.7)' }} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    data-testid="auth-email-input"
                                                    onChange={e => setEmail(e.target.value)}
                                                    placeholder="admin@genaudius.com"
                                                    required
                                                    autoComplete="email"
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-white/20 outline-none transition-all"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px solid rgba(107,33,212,0.2)',
                                                    }}
                                                    onFocus={e => e.target.style.borderColor = 'rgba(107,33,212,0.6)'}
                                                    onBlur={e => e.target.style.borderColor = 'rgba(107,33,212,0.2)'}
                                                />
                                            </div>
                                        </div>

                                        {/* Password field */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black tracking-[0.25em] uppercase"
                                                   style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                Contraseña
                                            </label>
                                            <div className="relative">
                                                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2"
                                                      style={{ color: 'rgba(233,30,140,0.7)' }} />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    data-testid="auth-password-input"
                                                    onChange={e => setPassword(e.target.value)}
                                                    placeholder={isRegister ? 'Mín. 8 caracteres' : '••••••••••••'}
                                                    required
                                                    minLength={isRegister ? 8 : undefined}
                                                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder-white/20 outline-none transition-all"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.04)',
                                                        border: '1px solid rgba(233,30,140,0.2)',
                                                    }}
                                                    onFocus={e => e.target.style.borderColor = 'rgba(233,30,140,0.6)'}
                                                    onBlur={e => e.target.style.borderColor = 'rgba(233,30,140,0.2)'}
                                                />
                                            </div>
                                        </div>

                                        {/* Accept Terms Checkbox */}
                                        <div className="flex items-center gap-3 px-1">
                                            <input 
                                                type="checkbox" 
                                                id="accept-terms"
                                                checked={accepted}
                                                onChange={e => setAccepted(e.target.checked)}
                                                className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#6B21D4] cursor-pointer"
                                            />
                                            <label htmlFor="accept-terms" className="text-[10px] text-white/40 cursor-pointer hover:text-white/60 transition-all uppercase tracking-widest font-bold">
                                                {t('legal.acceptTerms')}
                                                {Object.keys(legalLinks).length > 0 && (
                                                    <span className="ml-2 lowercase font-medium tracking-normal text-[9px] text-white/30">
                                                        (leer <a href="/legal/terms-of-service" target="_blank" className="underline hover:text-white">Términos</a> y <a href="/legal/privacy-policy" target="_blank" className="underline hover:text-white">Privacidad</a>)
                                                    </span>
                                                )}
                                            </label>
                                        </div>

                                        {/* Error message */}
                                        <AnimatePresence>
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                                                    style={{
                                                        background: 'rgba(233,30,140,0.08)',
                                                        border: '1px solid rgba(233,30,140,0.2)',
                                                    }}
                                                >
                                                    <AlertCircle size={14} style={{ color: '#E91E8C', flexShrink: 0 }} />
                                                    <p className="text-[11px] font-medium" style={{ color: '#E91E8C' }}>
                                                        {error}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Submit button */}
                                        <motion.button
                                            type="submit"
                                            disabled={loading}
                                            data-testid="auth-submit-btn"
                                            whileHover={{ scale: loading ? 1 : 1.02 }}
                                            whileTap={{ scale: loading ? 1 : 0.98 }}
                                            className="w-full py-3.5 rounded-xl font-black text-[11px] tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-2"
                                            style={{
                                                background: loading
                                                    ? 'rgba(107,33,212,0.3)'
                                                    : (isRegister
                                                        ? 'linear-gradient(135deg, #F5A623 0%, #00C9A7 100%)'
                                                        : 'linear-gradient(135deg, #6B21D4 0%, #E91E8C 100%)'),
                                                color: loading ? 'rgba(255,255,255,0.4)' : '#fff',
                                                boxShadow: loading ? 'none' : (isRegister
                                                    ? '0 4px 24px rgba(245,166,35,0.35)'
                                                    : '0 4px 24px rgba(107,33,212,0.35)'),
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    {isRegister ? 'Creando cuenta...' : 'Autenticando...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Zap size={14} />
                                                    {isRegister ? 'Crear cuenta' : 'Entrar al Studio'}
                                                </>
                                            )}
                                        </motion.button>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4 my-6">
                                            <div className="flex-1 h-px bg-white/5" />
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">o continuar con</span>
                                            <div className="flex-1 h-px bg-white/5" />
                                        </div>

                                        {/* Social Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => handleSocialLogin(googleProvider)}
                                                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-[11px] font-bold"
                                            >
                                                <Chrome size={14} /> Google
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => handleSocialLogin(appleProvider)}
                                                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-[11px] font-bold"
                                            >
                                                <Zap size={14} /> Apple
                                            </button>
                                        </div>

                                        {/* Plan info */}
                                        <p className="text-center text-[10px] mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                            Gen Audius Pro · Plataforma privada
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;