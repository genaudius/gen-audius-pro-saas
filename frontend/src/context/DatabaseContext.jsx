/**
 * Gen Audius Pro — Database Context
 * ====================================
 * Dual-layer persistence:
 *   1. Remote: FastAPI → PostgreSQL (source of truth for wallet/credits)
 *   2. Local:  IndexedDB via idb (offline cache, project storage)
 *
 * Wallet security model:
 *   - deductCredits() ONLY updates local state optimistically
 *   - Real deduction happens server-side on every /api/music/generate call
 *   - After generation, wallet is re-synced from backend
 *   - rechargeWallet() calls backend POST and re-syncs
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { openDB } from 'idb';

const DatabaseContext = createContext(null);

const BACKEND    = import.meta.env.VITE_API_URL || '/api/backend';
const DB_NAME    = 'GenAudiusLocal';
const DB_VERSION = 3;

// ─── Auth helpers ─────────────────────────────────────────────────────────────
export const getStoredUserId = () =>
    localStorage.getItem('ga_user_id') || 'current_user';

export const getStoredToken = () =>
    localStorage.getItem('ga_token') || '';

export const getAuthHeaders = () => {
    const token = getStoredToken();
    const headers = {
        'Content-Type': 'application/json',
        'X-User-ID': getStoredUserId(),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

export const clearSession = () => {
    ['ga_user_id', 'ga_plan', 'ga_token', 'ga_username', 'ga_email', 'ga_credits']
        .forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new Event('ga_auth_change'));
};

// ─── IndexedDB Schema ─────────────────────────────────────────────────────────
async function openLocalDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            if (!db.objectStoreNames.contains('projects'))
                db.createObjectStore('projects',   { keyPath: 'id', autoIncrement: true });
            if (!db.objectStoreNames.contains('history'))
                db.createObjectStore('history',    { keyPath: 'id', autoIncrement: true });
            if (!db.objectStoreNames.contains('api_configs'))
                db.createObjectStore('api_configs', { keyPath: 'provider' });
            if (!db.objectStoreNames.contains('wallet'))
                db.createObjectStore('wallet',     { keyPath: 'userId' });
            if (!db.objectStoreNames.contains('settings'))
                db.createObjectStore('settings',   { keyPath: 'key' });
        },
    });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const DatabaseProvider = ({ children }) => {
    const [db,         setDb]         = useState(null);
    const [projects,   setProjects]   = useState([]);
    const [history,    setHistory]    = useState([]);
    const [apiConfigs, setApiConfigs] = useState([]);
    const [userWallet, setUserWallet] = useState({ credits: 0, balance: 0.0 });
    const [isOnline,   setIsOnline]   = useState(true);
    const syncIntervalRef = useRef(null);

    // ── Initialize ────────────────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const localDb = await openLocalDB();
                if (mounted) {
                    setDb(localDb);
                    await syncFromBackend(localDb);
                }
            } catch (err) {
                console.error('❌ [DB] Failed to open IndexedDB:', err);
            }
        })();

        // Periodic wallet sync every 60s
        syncIntervalRef.current = setInterval(() => {
            syncWalletFromBackend();
        }, 60_000);

        return () => {
            mounted = false;
            clearInterval(syncIntervalRef.current);
        };
    }, []);


    // ── Backend Sync ──────────────────────────────────────────────────────────
    const syncFromBackend = useCallback(async (localDb) => {
        try {
            console.log('🔄 [SYNC] Syncing with backend...');

            const userId = getStoredUserId();
            const token = getStoredToken();
            const headers = { 'X-User-ID': userId };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const [walletRes, configRes, historyRes] = await Promise.allSettled([
                fetch(`${BACKEND}/api/user/wallet`,   { headers }),
                fetch(`${BACKEND}/api/admin/configs`, { headers }),
                fetch(`${BACKEND}/api/music/history`, { headers }),
            ]);

            // Wallet
            if (walletRes.status === 'fulfilled' && walletRes.value.ok) {
                const wallet = await walletRes.value.json();
                const walletData = { credits: wallet.credits ?? 0, balance: wallet.balance ?? 0 };
                setUserWallet(walletData);
                await localDb?.put('wallet', { userId: 'current_user', ...walletData });
                setIsOnline(true);
                console.log(`✅ [SYNC] Wallet: ${walletData.credits} CRD | $${walletData.balance}`);
            }

            // API Configs
            if (configRes.status === 'fulfilled' && configRes.value.ok) {
                const configs = await configRes.value.json();
                setApiConfigs(configs);
                if (localDb) {
                    for (const cfg of configs) await localDb.put('api_configs', cfg);
                }
            }

            // History
            if (historyRes.status === 'fulfilled' && historyRes.value.ok) {
                const remoteHistory = await historyRes.value.json();
                setHistory(remoteHistory);
            }

        } catch (err) {
            console.warn('⚠️ [OFFLINE] Backend unreachable, using IndexedDB cache:', err.message);
            setIsOnline(false);
            await loadFromCache(localDb);
        }
    }, []);

    const syncWalletFromBackend = useCallback(async () => {
        try {
            const res = await fetch(`${BACKEND}/api/user/wallet`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const wallet = await res.json();
                setUserWallet({ credits: wallet.credits ?? 0, balance: wallet.balance ?? 0 });
            }
        } catch {
            // Silent fail — just keep local state
        }
    }, []);

    // ── Auth Change Listener ──────────────────────────────────────────────────
    useEffect(() => {
        const handleAuthChange = () => {
            console.log('🔑 [AUTH] Change detected, re-syncing...');
            syncFromBackend(db);
        };
        window.addEventListener('ga_auth_change', handleAuthChange);
        return () => window.removeEventListener('ga_auth_change', handleAuthChange);
    }, [db, syncFromBackend]);

    const loadFromCache = async (localDb) => {
        if (!localDb) return;
        try {
            const [p, h, wallet, configs] = await Promise.all([
                localDb.getAll('projects'),
                localDb.getAll('history'),
                localDb.get('wallet', 'current_user'),
                localDb.getAll('api_configs'),
            ]);
            setProjects(p || []);
            setHistory(h || []);
            if (wallet) setUserWallet({ credits: wallet.credits ?? 0, balance: wallet.balance ?? 0 });
            if (configs?.length) setApiConfigs(configs);
        } catch (err) {
            console.error('❌ [DB] Cache read failed:', err);
        }
    };

    // ── Project Actions ───────────────────────────────────────────────────────
    const saveProject = useCallback(async (project) => {
        if (!db) return null;
        const id = await db.put('projects', { ...project, updatedAt: new Date().toISOString() });
        const updated = await db.getAll('projects');
        setProjects(updated);
        return id;
    }, [db]);

    const addToHistory = useCallback(async (entry) => {
        if (!db) return null;
        const id = await db.add('history', { ...entry, timestamp: new Date().toISOString() });
        const updated = await db.getAll('history');
        setHistory(updated);
        return id;
    }, [db]);

    const deleteFromHistory = useCallback(async (id) => {
        if (!db) return;
        await db.delete('history', id);
        const updated = await db.getAll('history');
        setHistory(updated);
    }, [db]);

    // ── Settings ──────────────────────────────────────────────────────────────
    const getSettings = useCallback(async (key) => {
        if (!db) return null;
        const row = await db.get('settings', key);
        return row?.value ?? null;
    }, [db]);

    const saveSettings = useCallback(async (key, value) => {
        if (!db) return;
        await db.put('settings', { key, value });
    }, [db]);

    // ── Wallet Actions ────────────────────────────────────────────────────────

    /**
     * Recharge wallet — calls backend (PostgreSQL) and re-syncs local state.
     * @param {number} amountUsd  Amount in USD to add
     */
    const rechargeWallet = useCallback(async (amountUsd) => {
        try {
            const res = await fetch(`${BACKEND}/api/user/recharge`, {
                method:  'POST',
                headers: getAuthHeaders(),
                body:    JSON.stringify({ amount: amountUsd }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `Recharge failed: ${res.status}`);
            }
            const updated = await res.json();
            const walletData = { credits: updated.credits, balance: updated.balance };
            setUserWallet(walletData);
            if (db) await db.put('wallet', { userId: 'current_user', ...walletData });
            console.log(`💰 [WALLET] Recharged: +${updated.credits_added} CRD`);
            return updated;
        } catch (err) {
            console.error('❌ [WALLET] Recharge failed:', err.message);
            throw err;
        }
    }, [db]);

    /**
     * Optimistic credit deduction for UI feedback only.
     * IMPORTANT: Real deduction happens server-side on generate/master calls.
     * Backend validates and refunds if needed — this is purely for UX.
     */
    const deductCredits = useCallback(async (amount) => {
        if (userWallet.credits < amount) return false;
        // Optimistic UI update only
        setUserWallet(prev => ({ ...prev, credits: prev.credits - amount }));
        return true;
    }, [userWallet.credits]);

    /**
     * Re-sync wallet after a backend operation confirms the real balance.
     */
    const refreshWallet = useCallback(async () => {
        await syncWalletFromBackend();
    }, [syncWalletFromBackend]);

    /**
     * Update API config — syncs to backend (PostgreSQL) and local cache.
     */
    const updateApiConfig = useCallback(async (config) => {
        // Local cache update
        if (db) {
            await db.put('api_configs', config);
            const updatedLocal = await db.getAll('api_configs');
            setApiConfigs(updatedLocal);
        }

        // Backend sync (PostgreSQL)
        try {
            const res = await fetch(`${BACKEND}/api/admin/config/update`, {
                method:  'POST',
                headers: getAuthHeaders(),
                body:    JSON.stringify(config),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error('⚠️ [CONFIG] Backend sync failed:', err.detail);
            } else {
                console.log('✅ [CONFIG] Synced to backend:', config.provider);
            }
        } catch (err) {
            console.error('⚠️ [CONFIG] Backend unreachable:', err.message);
        }
    }, [db]);

    // ── Context Value ─────────────────────────────────────────────────────────
    const value = {
        db,
        isOnline,
        projects,
        history,
        userWallet,
        apiConfigs,
        // Project
        saveProject,
        addToHistory,
        deleteFromHistory,
        // Settings
        getSettings,
        saveSettings,
        // Wallet
        rechargeWallet,
        deductCredits,
        refreshWallet,
        // Config
        updateApiConfig,
        // Manual sync
        syncFromBackend: () => syncFromBackend(db),
    };

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (!context) throw new Error('useDatabase must be used within a DatabaseProvider');
    return context;
};