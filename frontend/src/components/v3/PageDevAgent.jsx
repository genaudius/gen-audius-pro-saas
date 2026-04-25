import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, GitBranch, Play, AlertTriangle, CheckCircle2, Save, Sparkles, RefreshCcw } from 'lucide-react';
import { C } from '../../utils/designTokens';

/**
 * Gen Audius AI Dev Agent Panel
 * For SuperAdmin to modify code, add features, and fix bugs via AI.
 */
export default function PageDevAgent() {
  const [prompt, setPrompt] = useState("");
  const [executing, setExecuting] = useState(false);
  const [logs, setLogs] = useState([
    { t: new Date(), msg: "🛡️ AI Core Engine initialized.", type: "system" },
    { t: new Date(), msg: "📊 System monitoring active. Server: RUNNING", type: "ok" }
  ]);
  const [repoStatus, setRepoStatus] = useState("Clean - Main branch");
  const [lastDiff, setLastDiff] = useState(null);

  const addLog = (msg, type = "info") => {
    setLogs(prev => [{ t: new Date(), msg, type }, ...prev].slice(0, 50));
  };

  const handleExecute = async () => {
    if (!prompt.trim() || executing) return;
    setExecuting(true);
    addLog(`🚀 Analizando solicitud: "${prompt}"...`, "pending");

    try {
      // API call to the backend agent
      const res = await fetch('/api/backend/api/admin/dev/execute', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-ID': localStorage.getItem('ga_user_id') || 'admin'
        },
        body: JSON.stringify({ prompt, commit: true })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Error en el agente IA.");

      addLog(`✅ Cambio aplicado exitosamente: ${data.summary}`, "ok");
      addLog(`📝 Commit creado: ${data.commit_hash}`, "info");
      setRepoStatus(`Updated: ${data.commit_hash.slice(0,7)}`);
      setLastDiff(data.diff);
      setPrompt("");

    } catch (err) {
      addLog(`❌ Error: ${err.message}`, "err");
    } finally {
      setExecuting(false);
    }
  };

  const handleRestart = async () => {
    addLog("🔄 Reiniciando motor backend...", "system");
    try {
      await fetch('/api/backend/api/admin/system/restart', { method: 'POST' });
      addLog("✨ Backend reiniciado con éxito.", "ok");
    } catch (e) {
      addLog("❌ Fallo al reiniciar.", "err");
    }
  };

  return (
    <div style={{ animation: "v3-fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: C.t1, marginBottom: 4, display: "flex", alignItems: "center", gap: 12 }}>
            <Cpu size={32} color={C.a} /> AI Core Orchestrator
          </h2>
          <p style={{ fontSize: 13, color: C.t3, fontFamily: "'JetBrains Mono', monospace" }}>Autodesarrollo y Autocuración del Sistema</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleRestart} className="v3-btn v3-btn-se" style={{ borderColor: C.warn + '30', color: C.warn }}>
            <RefreshCcw size={14} style={{ marginRight: 6 }} /> Restart Server
          </button>
          <div className="v3-tag" style={{ background: C.ok + '15', color: C.ok, borderColor: C.ok + '30' }}>
            <GitBranch size={12} style={{ marginRight: 6 }} /> {repoStatus}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20 }}>
        
        {/* Left: AI Developer Console */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="v3-card" style={{ border: `1px solid ${C.a}40`, background: `linear-gradient(145deg, ${C.card} 0%, ${C.a}08 100%)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.a, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={18} color="#fff" />
              </div>
              <div className="v3-card-title">Prompt de Desarrollo</div>
            </div>
            
            <p style={{ fontSize: 13, color: C.t2, marginBottom: 16 }}>
              Describe una nueva funcionalidad, un cambio de diseño o una corrección de error. El modelo analizará el código fuente, aplicará los cambios y hará un commit automáticamente.
            </p>

            <textarea 
              className="v3-textarea"
              style={{ minHeight: 140, fontSize: 14, fontFamily: "'JetBrains Mono', monospace", border: `1px solid ${C.div}` }}
              placeholder="Ej: 'Añade un botón en el panel de usuario para exportar su historial a PDF' o 'Cambia el color de acento de la app a un dorado más brillante'..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button 
                className="v3-gen-btn" 
                style={{ flex: 1, margin: 0 }}
                onClick={handleExecute}
                disabled={executing || !prompt.trim()}
              >
                {executing ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <RefreshCcw size={18} className="v3-spin" /> Procesando Cambios...
                  </div>
                ) : (
                  "✨ Aplicar y Desplegar Cambios"
                )}
              </button>
              <button className="v3-btn v3-btn-gh" style={{ padding: "0 20px" }}>
                <Save size={18} />
              </button>
            </div>
          </div>

          {/* Last Diff View */}
          {lastDiff && (
            <div className="v3-card">
              <div className="v3-card-title" style={{ marginBottom: 12 }}>Último Cambio Aplicado</div>
              <pre style={{ 
                background: "#000", 
                padding: 16, 
                borderRadius: 12, 
                fontSize: 12, 
                fontFamily: "'JetBrains Mono', monospace", 
                overflow: "auto",
                maxHeight: 300,
                color: C.t2,
                border: `1px solid ${C.div}`
              }}>
                {lastDiff}
              </pre>
            </div>
          )}
        </div>

        {/* Right: Monitoring & Logs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="v3-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: C.div, padding: "12px 16px", fontSize: 12, fontWeight: 800, color: C.t2, textTransform: "uppercase", letterSpacing: 1, display: "flex", justifyBetween: "center", alignItems: "center" }}>
              <Terminal size={14} style={{ marginRight: 8 }} /> Developer Runtime Logs
            </div>
            <div style={{ 
              height: 400, 
              background: "#050508", 
              padding: 16, 
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              {logs.map((l, i) => (
                <div key={i} style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", display: "flex", gap: 8 }}>
                  <span style={{ color: C.t3 }}>[{l.t.toLocaleTimeString()}]</span>
                  <span style={{ 
                    color: l.type === 'err' ? C.err : l.type === 'ok' ? C.ok : l.type === 'system' ? C.aLt : C.t2 
                  }}>
                    {l.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="v3-card">
            <div className="v3-card-title" style={{ fontSize: 14, marginBottom: 12 }}>Estado del Servidor</div>
            <div className="v3-g2">
              <div style={{ textAlign: "center", padding: 12, borderRadius: 12, background: C.input }}>
                <div style={{ fontSize: 10, color: C.t3, marginBottom: 4 }}>CPU</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.ok }}>12%</div>
              </div>
              <div style={{ textAlign: "center", padding: 12, borderRadius: 12, background: C.input }}>
                <div style={{ fontSize: 10, color: C.t3, marginBottom: 4 }}>MEM</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.ok }}>420MB</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
