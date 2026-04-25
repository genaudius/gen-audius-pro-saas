/**
 * Gen Audius v3.0 — PageAdmin
 * =============================
 * Admin panel shell with tabs: Providers, Analytics, Users, Costs, Logs
 */
import React, { useState, useEffect } from 'react';
import { C } from '../../utils/designTokens';
import { Tog } from './SharedComponents';
import PageAPIConfig from './PageAPIConfig';
import PageDevAgent from './PageDevAgent';
import PageTasks from './PageTasks';
import PageBlog from './PageBlog';
import PageSecurity from './PageSecurity';
import PageEmailSettings from './PageEmailSettings';
import PageSystemControls from './PageSystemControls';
import PageLegalAdmin from './PageLegalAdmin';
import { providerService } from '../../services/providerService';

// ──────────── Sub: Admin Providers ────────────
function AdminProviders({ providerState, setProviderState }) {
  const [cat, setCat] = useState("music");
  const [backendStatus, setBackendStatus] = useState(null);
  const CATS = [
    { id: "music", l: "🎵 Música" }, { id: "image", l: "🎨 Imágenes" },
    { id: "video", l: "🎬 Video" }, { id: "voice", l: "🎤 Voz" }, { id: "lyrics", l: "📝 Letras" },
  ];
  const current = providerState[cat] || [];
  const activeTotal = current.filter(p => p.active).reduce((s, p) => s + p.weight, 0);
  const update = (idx, field, value) => {
    setProviderState(prev => {
      const arr = [...(prev[cat] || [])];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [cat]: arr };
    });
  };
  const avgCost = current.filter(p => p.active).reduce((s, p) => {
    const share = activeTotal ? p.weight / activeTotal : 0;
    return s + p.cost * share;
  }, 0);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const s = await providerService.getStatus();
      if (alive) setBackendStatus(s);
    };
    tick();
    const id = setInterval(tick, 12000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div>
      <div style={{ background: C.a + "08", border: `1px solid ${C.a}25`, borderRadius: 10, padding: "14px 18px", marginBottom: 22, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 22 }}>🧠</span>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.aLt }}>Routing automático — </span>
          <span style={{ fontSize: 14, color: C.t2 }}>El usuario nunca ve qué proveedor procesa su solicitud. El sistema selecciona según pesos, y hace failover automático si uno falla.</span>
        </div>
      </div>
      <div className="v3-card" style={{ marginBottom: 18 }}>
        <div className="v3-card-title">Estado Backend (real)</div>
        {backendStatus ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <span className="v3-tag v3-tag-ok" style={{ fontSize: 11 }}>✓ online</span>
            <span className="v3-tag v3-tag-a" style={{ fontSize: 11 }}>
              activo: {(backendStatus.active_provider || "—")}
            </span>
            <span className="v3-tag v3-tag-dim" style={{ fontSize: 11 }}>
              chain: {(backendStatus.active_chain || []).join(" → ") || "—"}
            </span>
            <span className="v3-tag v3-tag-dim" style={{ fontSize: 11 }}>
              failover: {backendStatus.failover_enabled ? "on" : "off"}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: C.t2 }}>Conectando a backend…</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
        {CATS.map(c => <button key={c.id} className={`v3-chip ${cat === c.id ? "on" : ""}`} onClick={() => setCat(c.id)} style={{ fontSize: 13 }}>{c.l}</button>)}
      </div>
      <div className="v3-g2" style={{ gap: 20, alignItems: "start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.t1, marginBottom: 14 }}>Proveedores</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {current.map((p, i) => (
              <div key={p.id} className={`v3-prov-card ${p.active ? "active" : ""}`} style={{ opacity: p.active ? 1 : 0.55 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.active ? C.ok : C.t3, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>{p.name}</span>
                    {i === 0 && <span className="v3-tag v3-tag-a" style={{ fontSize: 10 }}>PRIMARIO</span>}
                  </div>
                  <Tog init={p.active} onChange={v => update(i, "active", v)} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>PESO</span>
                      <input type="number" className="v3-w-input" value={p.weight} min={0} max={100}
                        onChange={e => update(i, "weight", Math.max(0, Math.min(100, +e.target.value)))} disabled={!p.active} />
                    </div>
                    <div className="v3-prog-track">
                      <div className="v3-prog-fill" style={{ width: `${activeTotal ? (p.weight / activeTotal) * 100 : 0}%`, background: p.active ? C.a : C.t3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: C.t3, marginTop: 4, fontFamily: "'JetBrains Mono',monospace" }}>
                      {activeTotal ? Math.round((p.weight / activeTotal) * 100) : 0}% del tráfico
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 88, fontSize: 12, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>
                    <span>💸 ${p.cost}/req</span>
                    <span>⚡ ~{p.latency}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="v3-card" style={{ marginBottom: 18 }}>
            <div className="v3-card-title">Comportamiento</div>
            {[
              { l: "Failover automático", s: "Si falla, usa el siguiente activo", on: true },
              { l: "Balanceo por peso", s: "Distribución A/B según pesos", on: true },
              { l: "Reintentar en error", s: "Hasta 3 intentos antes de failover", on: true },
              { l: "Caché de resultados", s: "Prompts iguales → mismo resultado", on: false },
              { l: "Rate limiting", s: "Respetar límites de cada API", on: true },
            ].map((o, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 4 ? `1px solid ${C.div}` : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.t1 }}>{o.l}</div>
                  <div style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>{o.s}</div>
                </div>
                <Tog init={o.on} />
              </div>
            ))}
          </div>
          <div className="v3-card">
            <div className="v3-card-title">Distribución Actual</div>
            {current.filter(p => p.active).map((p, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: C.t1, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: 13, color: C.aLt, fontFamily: "'JetBrains Mono',monospace" }}>
                    {activeTotal ? Math.round((p.weight / activeTotal) * 100) : 0}%
                  </span>
                </div>
                <div className="v3-prog-track">
                  <div className="v3-prog-fill" style={{ width: `${activeTotal ? (p.weight / activeTotal) * 100 : 0}%`, background: `hsl(${260 + i * 30},70%,65%)` }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.div}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: C.t2 }}>Costo promedio</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 800, color: C.aLt }}>${avgCost.toFixed(4)}/req</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────── Main Admin Panel ────────────
export default function PageAdmin({ liveStats = {}, providerState = {}, setProviderState = () => {} }) {
  const [tab, setTab] = useState("providers");

  const [logs, setLogs] = useState([
    { t: "18:42:01", lv: "INFO",  msg: "music req routed → [hidden] [ok 8.1s] user:u-4821" },
    { t: "18:41:58", lv: "INFO",  msg: "image req routed → [hidden] [ok 4.2s] user:u-3312" },
    { t: "18:41:55", lv: "WARN",  msg: "video req → timeout 30s → failover [ok 24s] user:u-9103" },
    { t: "18:41:40", lv: "INFO",  msg: "lyrics req routed → [hidden] [ok 2.1s] user:u-7291" },
    { t: "18:41:20", lv: "ERROR", msg: "image req → rate limit 429 → failover [ok 3.8s] user:u-5512" },
  ]);

  useEffect(() => {
    const types = ["music", "image", "voice", "lyrics", "video"];
    const id = setInterval(() => {
      const isErr = Math.random() > 0.92;
      const ms = (Math.random() * 12 + 2).toFixed(1);
      const now = new Date();
      const ts = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setLogs(l => [{
        t: ts, lv: isErr ? "WARN" : "INFO",
        msg: `${types[Math.floor(Math.random() * types.length)]} req routed → [hidden] [${isErr ? "timeout → failover" : `ok ${ms}s`}] user:u-${Math.floor(Math.random() * 9999)}`,
      }, ...l.slice(0, 49)]);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const users = [
    { nm: "Carlos M.", email: "carlos@studio.mx",  plan: "Pro",        gens: 127,  st: "active" },
    { nm: "Sarah J.",  email: "sarah@beats.io",    plan: "Enterprise", gens: 834,  st: "active" },
    { nm: "DJ Phantom",email: "phantom@dj.com",    plan: "Free",       gens: 12,   st: "active" },
    { nm: "Laura V.",  email: "laura@music.co",    plan: "Pro",        gens: 256,  st: "suspended" },
    { nm: "Mike C.",   email: "mike@studio.sg",    plan: "Enterprise", gens: 1203, st: "active" },
  ];

  const lvCol = l => l === "ERROR" ? C.err : l === "WARN" ? C.warn : C.t3;
  const allProviders = Object.entries(providerState).flatMap(([type, provs]) =>
    (provs || []).filter(p => p.active).map(p => ({ ...p, category: type }))
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>Panel de Administración</h2>
          <p style={{ fontSize: 14, color: C.t2, marginTop: 5 }}>Control completo de proveedores, usuarios y costos</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", background: C.a + "12", border: `1px solid ${C.a}30`, borderRadius: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.a, animation: "v3-pulseDot 1.5s infinite" }} />
          <span style={{ fontSize: 12, color: C.aLt, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>ADMIN MODE</span>
        </div>
      </div>

      <div className="v3-g4" style={{ marginBottom: 22 }}>
        {[
          { l: "Generaciones hoy", v: (liveStats.total || 0).toLocaleString(), ic: "⚡", chg: "+23%" },
          { l: "Costo hoy", v: `$${(liveStats.cost || 0).toFixed(2)}`, ic: "💸", chg: "de $40 budget" },
          { l: "Usuarios activos", v: "1,247", ic: "👥", chg: "+18 nuevos" },
          { l: "Tasa de éxito", v: "98.9%", ic: "◈", chg: "12 errores" },
        ].map((s, i) => (
          <div key={i} className="v3-stat-card">
            <div style={{ fontSize: 20 }}>{s.ic}</div>
            <div className="v3-stat-val">{s.v}</div>
            <div className="v3-stat-lbl">{s.l}</div>
            <div className="v3-stat-chg">{s.chg}</div>
          </div>
        ))}
      </div>

      <div className="v3-tabs">
        {[
          { id: "providers", l: "⊞ Proveedores" }, 
          { id: "apiconfig", l: "🔑 Config APIs" }, 
          { id: "analytics", l: "◈ Analytics" }, 
          { id: "devagent",  l: "🧠 Core Engine" },
          { id: "tasks",     l: "📋 Tareas" },
          { id: "blog",      l: "📰 Blog" },
          { id: "security",  l: "🛡️ Seguridad" },
          { id: "email",     l: "📧 Correo/Notif" },
          { id: "legal",     l: "⚖️ Legal" },
          { id: "system",    l: "⚖️ Sistema" },
          { id: "users", l: "👥 Usuarios" }, 
          { id: "costs", l: "💸 Costos" }, 
          { id: "logs", l: "📋 Logs Live" }
        ].map(t => <button key={t.id} className={`v3-tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>{t.l}</button>)}
      </div>

      {tab === "providers" && <AdminProviders providerState={providerState} setProviderState={setProviderState} />}
      {tab === "apiconfig" && <PageAPIConfig />}
      {tab === "devagent"  && <PageDevAgent />}
      {tab === "tasks"     && <PageTasks />}
      {tab === "blog"      && <PageBlog />}
      {tab === "security"  && <PageSecurity />}
      {tab === "email"     && <PageEmailSettings />}
      {tab === "legal"     && <PageLegalAdmin />}
      {tab === "system"    && <PageSystemControls />}

      {tab === "analytics" && (
        <div className="v3-g2" style={{ gap: 20 }}>
          <div className="v3-card">
            <div className="v3-card-title">Requests por tipo — Hoy</div>
            {[
              { l: "Música", v: liveStats.music || 0, pct: 54, col: C.a },
              { l: "Imágenes", v: liveStats.images || 0, pct: 19, col: C.ok },
              { l: "Voz", v: 312, pct: 13, col: "#818cf8" },
              { l: "Letras", v: 198, pct: 8, col: "#f472b6" },
              { l: "Video", v: 89, pct: 4, col: C.warn },
            ].map((r, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: C.t1, fontWeight: 500 }}>{r.l}</span>
                  <span style={{ fontSize: 13, color: C.t2, fontFamily: "'JetBrains Mono',monospace" }}>{r.v.toLocaleString()} · {r.pct}%</span>
                </div>
                <div className="v3-prog-track"><div className="v3-prog-fill" style={{ width: `${r.pct}%`, background: r.col }} /></div>
              </div>
            ))}
          </div>
          <div className="v3-card">
            <div className="v3-card-title">Estado de Proveedores</div>
            {allProviders.map((p, i) => {
              const typeColors = { music: C.a, image: C.ok, video: C.warn, voice: "#818cf8", lyrics: "#f472b6" };
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.div}22` }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.ok, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: C.t1 }}>{p.name}</span>
                  <span className="v3-tag" style={{ background: typeColors[p.category] + "15", color: typeColors[p.category], borderColor: typeColors[p.category] + "30", fontSize: 10 }}>{p.category}</span>
                  <span style={{ fontSize: 12, color: C.ok, fontFamily: "'JetBrains Mono',monospace" }}>OK</span>
                  <span style={{ fontSize: 12, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>~{p.latency}s</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="v3-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <input className="v3-inp" placeholder="🔍 Buscar usuarios…" style={{ maxWidth: 250 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <select className="v3-sel" style={{ width: 150 }}><option>Todos los planes</option><option>Free</option><option>Pro</option><option>Enterprise</option></select>
              <button className="v3-btn v3-btn-pr v3-btn-sm">+ Invitar</button>
            </div>
          </div>
          <table className="v3-tbl">
            <thead><tr><th>Usuario</th><th>Plan</th><th>Generaciones</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.aBg, border: `1px solid ${C.aBd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.aLt, flexShrink: 0 }}>{u.nm[0]}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{u.nm}</div>
                        <div style={{ fontSize: 13, color: C.t2 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`v3-tag ${u.plan === "Enterprise" ? "v3-tag-warn" : u.plan === "Pro" ? "v3-tag-a" : "v3-tag-dim"}`} style={{ fontSize: 12 }}>{u.plan}</span></td>
                  <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14 }}>{u.gens.toLocaleString()}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: u.st === "active" ? C.ok : C.err }} />
                      <span style={{ fontSize: 14, color: u.st === "active" ? C.ok : C.err }}>{u.st === "active" ? "Activo" : "Suspendido"}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="v3-btn v3-btn-gh v3-btn-sm">Ver</button>
                      <button className="v3-btn v3-btn-sm" style={{ background: `${C.err}12`, color: C.err, border: `1px solid ${C.err}30` }}>Suspender</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "costs" && (
        <div className="v3-g2" style={{ gap: 20 }}>
          <div className="v3-card">
            <div className="v3-card-title">Desglose por Proveedor — Hoy</div>
            {allProviders.map((p, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.t1 }}>{p.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: C.t1 }}>${(p.cost * Math.floor(Math.random() * 800 + 100)).toFixed(2)}</span>
                </div>
                <div className="v3-prog-track"><div className="v3-prog-fill" style={{ width: `${Math.random() * 70 + 10}%` }} /></div>
              </div>
            ))}
          </div>
          <div>
            <div className="v3-card" style={{ marginBottom: 18, border: `1px solid ${C.ok}30`, background: C.okBg }}>
              <div className="v3-card-title" style={{ color: C.ok }}>💡 Optimizaciones Sugeridas</div>
              {[
                "Aumentar peso de Mureka: 40% más barato con calidad similar a Suno",
                "Activar caché → ahorro estimado $3-5/día en prompts repetidos",
                "Kie Video con 4 errores hoy → reducir peso temporal al 15%",
                "SDXL puede manejar 30% del tráfico de imágenes simples a $0.01/req",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 3 ? `1px solid ${C.ok}15` : "none" }}>
                  <span style={{ color: C.ok, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13, color: C.t2 }}>{tip}</span>
                </div>
              ))}
            </div>
            <div className="v3-card">
              <div className="v3-card-title">Budget Diario</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: C.t2 }}>Gastado hoy</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: (liveStats.cost || 0) > 32 ? C.warn : C.ok }}>
                  ${(liveStats.cost || 0).toFixed(2)} / $40
                </span>
              </div>
              <div className="v3-prog-track" style={{ height: 10, borderRadius: 5, marginBottom: 14 }}>
                <div className="v3-prog-fill" style={{ width: `${Math.min(100, ((liveStats.cost || 0) / 40) * 100)}%`, borderRadius: 5, background: (liveStats.cost || 0) > 32 ? C.warn : C.a }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="v3-btn v3-btn-gh v3-btn-sm" style={{ flex: 1, justifyContent: "center" }}>Editar budget</button>
                <button className="v3-btn v3-btn-sm" style={{ flex: 1, justifyContent: "center", background: `${C.warn}12`, color: C.warn, border: `1px solid ${C.warn}30` }}>Pausar si excede</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.ok, animation: "v3-pulseDot 1.5s infinite" }} />
              <span style={{ fontSize: 13, color: C.t2, fontFamily: "'JetBrains Mono',monospace" }}>Live — actualizando en tiempo real</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select className="v3-sel" style={{ width: 120, fontSize: 13, padding: "6px 10px" }}><option>Todos</option><option>INFO</option><option>WARN</option><option>ERROR</option></select>
              <input className="v3-inp" style={{ width: 200 }} placeholder="Filtrar…" />
            </div>
          </div>
          <div className="v3-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: C.bg, padding: "12px 16px", maxHeight: "calc(100vh - 380px)", overflowY: "auto" }}>
              {logs.map((l, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "6px 0", borderBottom: `1px solid ${C.div}22`, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, animation: i === 0 ? "v3-fadeUp 0.2s ease" : "none" }}>
                  <span style={{ color: C.t3, flexShrink: 0 }}>{l.t}</span>
                  <span style={{ color: lvCol(l.lv), fontWeight: 700, minWidth: 44, flexShrink: 0 }}>{l.lv}</span>
                  <span style={{ color: C.t2 }}>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
