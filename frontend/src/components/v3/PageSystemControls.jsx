import React, { useState, useEffect } from 'react';
import { C } from '../../utils/designTokens';
import { Tog } from './SharedComponents';
import { Database, Shield, Zap, RefreshCcw, Activity, Server, Lock, Unlock } from 'lucide-react';

export default function PageSystemControls() {
  const [settings, setSettings] = useState({ maintenance_mode: 'on' });
  const [health, setHealth] = useState({ database: 'ok', redis: 'ok', mongodb: 'ok', uptime: '...' });
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const sRes = await fetch('/api/backend/api/admin/system/settings');
      const hRes = await fetch('/api/backend/api/admin/system/health');
      if (sRes.ok) setSettings(await sRes.json());
      if (hRes.ok) setHealth(await hRes.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 10000);
    return () => clearInterval(id);
  }, []);

  const updateSetting = async (key, val) => {
    try {
      await fetch(`/api/backend/api/admin/system/settings/update?key=${key}&value=${val}`, { method: 'POST' });
      setSettings(prev => ({ ...prev, [key]: val }));
    } catch (e) { alert("Error actualizando setting"); }
  };

  const handleAction = async (action) => {
    setLoading(true);
    try {
      let url = '';
      if (action === 'flush_redis') url = '/api/backend/api/admin/system/redis/flush';
      if (action === 'db_repair') url = '/api/backend/api/admin/system/db/repair';
      if (action === 'db_sync') url = '/api/backend/api/admin/system/db/sync';
      
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      alert(data.message || "Acción completada");
      fetchStatus();
    } catch (e) { alert("Fallo en la acción"); }
    setLoading(false);
  };

  return (
    <div style={{ animation: "v3-fadeUp 0.3s ease", display: "flex", flexDirection: "column", gap: 24 }}>
      
      {/* Maintenance Mode Hero */}
      <div className="v3-card" style={{ 
        background: settings.maintenance_mode === 'on' ? `linear-gradient(145deg, ${C.card} 0%, ${C.warn}10 100%)` : `linear-gradient(145deg, ${C.card} 0%, ${C.ok}10 100%)`,
        border: `1px solid ${settings.maintenance_mode === 'on' ? C.warn + '40' : C.ok + '40'}`
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ 
              width: 50, height: 50, borderRadius: 14, 
              background: settings.maintenance_mode === 'on' ? C.warn + '20' : C.ok + '20',
              display: "flex", alignItems: "center", justifyContent: "center" 
            }}>
              {settings.maintenance_mode === 'on' ? <Lock color={C.warn} size={24} /> : <Unlock color={C.ok} size={24} />}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.t1 }}>
                {settings.maintenance_mode === 'on' ? "Modo Construcción / Privado" : "Sistema LIVE / Público"}
              </h3>
              <p style={{ fontSize: 13, color: settings.maintenance_mode === 'on' ? C.warn : C.ok, fontWeight: 600 }}>
                {settings.maintenance_mode === 'on' ? "Solo administradores pueden acceder." : "Cualquier usuario puede entrar."}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.t3 }}>ESTADO: {settings.maintenance_mode.toUpperCase()}</span>
            <Tog 
              init={settings.maintenance_mode === 'on'} 
              onChange={v => updateSetting('maintenance_mode', v ? 'on' : 'off')} 
            />
          </div>
        </div>
      </div>

      <div className="v3-g3">
        {/* SQL DB */}
        <div className="v3-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Database size={18} color={C.a} />
            <div className="v3-card-title" style={{ margin: 0 }}>Core DB (SQL)</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: health.database === 'ok' ? C.ok : C.err }}>
            {health.database === 'ok' ? "HEALTHY" : "ERROR"}
          </div>
          <div style={{ fontSize: 11, color: C.t3, marginTop: 4, fontFamily: "monospace" }}>PostgreSQL Connection Pool: OK</div>
          <button 
            onClick={() => handleAction('db_repair')}
            disabled={loading}
            className="v3-btn v3-btn-gh v3-btn-sm" 
            style={{ marginTop: 15, width: "100%", justifyContent: "center" }}
          >
            Integrity Check & Repair
          </button>
        </div>

        {/* MongoDB */}
        <div className="v3-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Server size={18} color={C.ok} />
            <div className="v3-card-title" style={{ margin: 0 }}>Audio Vault (Mongo)</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: health.mongodb === 'ok' ? C.ok : C.warn }}>
            {health.mongodb.toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: C.t3, marginTop: 4, fontFamily: "monospace" }}>Async logging active</div>
          <button 
            onClick={() => handleAction('db_sync')}
            disabled={loading}
            className="v3-btn v3-btn-gh v3-btn-sm" 
            style={{ marginTop: 15, width: "100%", justifyContent: "center" }}
          >
            Sync Metadata
          </button>
        </div>

        {/* Redis */}
        <div className="v3-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Zap size={18} color={C.warn} />
            <div className="v3-card-title" style={{ margin: 0 }}>Cache Engine (Redis)</div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: health.redis === 'ok' ? C.ok : C.err }}>
            {health.redis.toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: C.t3, marginTop: 4, fontFamily: "monospace" }}>Rate limiting & Sessions</div>
          <button 
            onClick={() => handleAction('flush_redis')}
            disabled={loading}
            className="v3-btn v3-btn-sm" 
            style={{ marginTop: 15, width: "100%", justifyContent: "center", background: `${C.err}15`, color: C.err, border: `1px solid ${C.err}30` }}
          >
            <RefreshCcw size={14} style={{ marginRight: 6 }} className={loading ? "v3-spin" : ""} /> Clear Cache
          </button>
        </div>
      </div>

      {/* Hardware & Orchestration */}
      <div className="v3-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <Activity size={18} color={C.a} />
          <div className="v3-card-title" style={{ margin: 0 }}>Estadísticas de Orquestación</div>
        </div>
        <div className="v3-g4">
          <div style={{ padding: 15, borderRadius: 12, background: C.div + '22', border: `1px solid ${C.div}` }}>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 5 }}>Workers Activos</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.t1 }}>8 Threads</div>
          </div>
          <div style={{ padding: 15, borderRadius: 12, background: C.div + '22', border: `1px solid ${C.div}` }}>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 5 }}>Memoria Backend</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.t1 }}>482 MB</div>
          </div>
          <div style={{ padding: 15, borderRadius: 12, background: C.div + '22', border: `1px solid ${C.div}` }}>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 5 }}>Latencia DB</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.ok }}>14ms</div>
          </div>
          <div style={{ padding: 15, borderRadius: 12, background: C.div + '22', border: `1px solid ${C.div}` }}>
            <div style={{ fontSize: 11, color: C.t3, marginBottom: 5 }}>Uptime</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.a }}>142h 21m</div>
          </div>
        </div>
      </div>

    </div>
  );
}
