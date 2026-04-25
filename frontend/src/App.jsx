/**
 * Gen Audius Pro — App Root
 * ==========================
 * Main application shell.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Menu, X, WifiOff, LogOut, User, 
    ShieldCheck, ChevronLeft, CheckCircle 
} from 'lucide-react';
import { CDLoader } from './components/v3/SharedComponents';
import SuperAdminPanel from './components/SuperAdminPanel';
import LandingPage from './components/LandingPage';
import PageCreatorV3 from './components/v3/PageCreatorV3';
import PagePlans from './components/v3/PagePlans';
import PageCheckout from './components/v3/PageCheckout';
import PageExplore from './components/v3/PageExplore';
import PageLibrary from './components/v3/PageLibrary';
import PageDashboard from './components/v3/PageDashboard';
import PageAdmin from './components/v3/PageAdmin';
import PageProfileSettings from './components/v3/PageProfileSettings';
import PageLegalView from './components/v3/PageLegalView';
import SupportHub from './components/v3/SupportHub';
import LoginModal from './components/LoginModal';
import { useDatabase } from './context/DatabaseContext';
import { clearSession } from './context/DatabaseContext';
import { useLang } from './i18n/LanguageContext';
import { LANGUAGES } from './i18n/translations';
import { useProviders } from './context/ProviderContext';
import StudioLayout from './components/StudioLayout';

const PAGE_VARIANTS = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};
const PAGE_TRANSITION = { duration: 0.2, ease: 'easeOut' };

const NAV_ITEMS = [
    { id: 'home',     label: 'Inicio'   },
    { id: 'generate', label: 'Generar'  },
    { id: 'studio',   label: 'Studio'   },
    { id: 'library',  label: 'Librería' },
    { id: 'explore',  label: 'Explorar' },
];

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, info) { console.error("Crash Guard:", error, info); }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#030816] flex items-center justify-center p-8 text-center" style={{ backgroundImage: 'url("/assets/brand/bg_texture.png")', backgroundSize: 'cover' }}>
                    <div className="max-w-md p-8 rounded-[2.5rem] border border-red-500/20 bg-red-500/5 backdrop-blur-2xl">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <WifiOff className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Fallo en el ADN</h1>
                        <p className="text-white/40 text-sm mb-6">Ha ocurrido un error inesperado al renderizar la interfaz.</p>
                        <div className="p-4 bg-black/40 rounded-xl mb-6 overflow-hidden">
                            <code className="text-[10px] text-red-400 font-mono break-all">{this.state.error?.toString()}</code>
                        </div>
                        <button onClick={() => window.location.reload()} className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all uppercase tracking-widest text-xs">Reiniciar App</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const App = () => {
    const { t } = useLang();
    const { userWallet, isOnline } = useDatabase();
    const { providerState, setProviderState } = useProviders();

    const [currentView, setCurrentView] = useState(() => {
        const path = window.location.pathname;
        if (path.startsWith('/legal/')) return 'legal_view';
        return 'home';
    });
    const [isLoading, setIsLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState('online');
    const [sessionUser, setSessionUser] = useState(() => {
        const userId = localStorage.getItem('ga_user_id');
        if (!userId) return null;
        return {
            user_id: userId,
            username: localStorage.getItem('ga_username') || userId,
            plan: localStorage.getItem('ga_plan') || 'free',
            email: localStorage.getItem('ga_email') || '',
        };
    });
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [afterLoginRedirect, setAfterLoginRedirect] = useState(null);

    const navigate = useCallback((view, opts = {}) => {
        const protectedViews = ['generate', 'studio', 'admin', 'library', 'profile', 'checkout'];
        if (protectedViews.includes(view) && !sessionUser) {
            if (opts.redirectAfter) setAfterLoginRedirect(opts.redirectAfter);
            setIsLoginModalOpen(true);
            return;
        }
        if (opts.plan) setSelectedPlan(opts);
        setCurrentView(view);
        window.scrollTo(0, 0);
    }, [sessionUser]);

    const handleLoginSuccess = useCallback((userData) => {
        setSessionUser(userData);
        setIsLoginModalOpen(false);
        window.dispatchEvent(new Event('ga_auth_change'));
        if (afterLoginRedirect) {
            setCurrentView(afterLoginRedirect);
            setAfterLoginRedirect(null);
            return;
        }
        if (currentView === 'home') setCurrentView('generate');
    }, [currentView, afterLoginRedirect]);

    const handleLogout = useCallback(() => {
        clearSession();
        setSessionUser(null);
        setCurrentView('home');
    }, []);

    return (
        <ErrorBoundary>
            <div className="App selection:bg-[#F5A623]/30 selection:text-white">
                {currentView === 'legal_view' ? (
                    <PageLegalView onBack={() => setCurrentView('home')} />
                ) : currentView === 'home' ? (
                    <LandingPage
                        onStartCreating={(view) => navigate(view === 'explore' ? 'explore' : 'generate')}
                        onLoginSuccess={handleLoginSuccess}
                    />
                ) : (
                    <StudioLayout currentView={currentView} setCurrentView={navigate}>
                        <AnimatePresence mode="wait">
                            {currentView === 'generate' && (
                                <motion.div key="generate" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={PAGE_TRANSITION}>
                                    <PageCreatorV3 sessionUser={sessionUser} onLoginClick={() => setIsLoginModalOpen(true)} />
                                </motion.div>
                            )}
                            {currentView === 'explore' && (
                                <motion.div key="explore" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={PAGE_TRANSITION}>
                                    <PageExplore />
                                </motion.div>
                            )}
                            {currentView === 'library' && (
                                <motion.div key="library" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={PAGE_TRANSITION} className="p-6 md:p-8">
                                    <PageLibrary />
                                </motion.div>
                            )}
                            {currentView === 'dashboard' && (
                                <motion.div key="dashboard" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={PAGE_TRANSITION}>
                                    <PageDashboard liveStats={{ total: 1254, music: 432, images: 204 }} />
                                </motion.div>
                            )}
                            {currentView === 'admin' && (
                                <motion.div key="admin" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={PAGE_TRANSITION} className="p-6 md:p-8">
                                    <PageAdmin providerState={providerState} setProviderState={setProviderState} liveStats={{ total: 1254, music: 432, cost: 12.45 }} />
                                </motion.div>
                            )}
                            {currentView === 'profile' && (
                                <motion.div key="profile" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={PAGE_TRANSITION}>
                                    <PageProfileSettings user={sessionUser} />
                                </motion.div>
                            )}
                            {currentView === 'plans' && (
                                <motion.div key="plans" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={PAGE_TRANSITION} className="h-full">
                                    <PagePlans
                                        sessionUser={sessionUser}
                                        onBuyPlan={(planData) => navigate('checkout', planData)}
                                        onLoginClick={(opts) => {
                                            if (opts?.redirectAfter) setAfterLoginRedirect(opts.redirectAfter);
                                            setIsLoginModalOpen(true);
                                        }}
                                    />
                                </motion.div>
                            )}
                            {currentView === 'checkout' && (
                                <motion.div key="checkout" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={PAGE_TRANSITION} className="h-full">
                                    <PageCheckout
                                        selectedPlan={selectedPlan}
                                        sessionUser={sessionUser}
                                        onBack={(dest) => navigate(dest || 'plans')}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </StudioLayout>
                )}

                <SupportHub />

                <LoginModal 
                    isOpen={isLoginModalOpen} 
                    onClose={() => setIsLoginModalOpen(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            </div>
        </ErrorBoundary>
    );
};

export default App;