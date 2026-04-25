/**
 * Gen Audius v3.0 — PageDashboard
 * =================================
 * Live stats, activity feed, system status.
 */
import React from 'react';
import { C } from '../../utils/designTokens';

export default function PageDashboard({ liveStats = {} }) {
  const stats = [
    { ic: "🎵", lbl: "Creaciones Totales", val: (liveStats.total || 0).toLocaleString(), chg: "+23% hoy" },
    { ic: "🎬", lbl: "Videos Generados", val: "347", chg: "+8 hoy" },
    { ic: "👥", lbl: "Usuarios Activos", val: "1,247", chg: "+18 nuevos" },
    { ic: "💰", lbl: "Revenue MRR", val: "$4,287", chg: "+$340 este mes" },
  ];
  const activity = [
    { user: "Sarah J.",    act: "Generó 4 tracks de música",   t: "2 min",  ic: "🎵" },
    { user: "DJ Phantom",  act: "Creó video musical de 30s",    t: "8 min",  ic: "🎬" },
    { user: "Carlos M.",   act: "Masterizó álbum — 12 tracks",  t: "15 min", ic: "🔊" },
    { user: "Laura V.",    act: "Generó letras bilingüe ES/EN", t: "1 h",    ic: "📝" },
    { user: "Mike C.",     act: "Creó 6 artes de portada",      t: "2 h",    ic: "🎨" },
  ];
  const sysStatus = [
    { nm: "Motor de Música",   st: "ok",   lat: `${(Math.random() * 5 + 6).toFixed(1)}s` },
    { nm: "Motor de Imágenes", st: "ok",   lat: `${(Math.random() * 3 + 3).toFixed(1)}s` },
    { nm: "Motor de Video",    st: "warn", lat: "24s" },
    { nm: "Motor de Voz",      st: "ok",   lat: `${(Math.random() * 2 + 2).toFixed(1)}s` },
    { nm: "Motor de Letras",   st: "ok",   lat: `${(Math.random() * 1 + 1).toFixed(1)}s` },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>Bienvenido de vuelta 👋</h2>
        <p style={{ fontSize: 14, color: C.t2, marginTop: 5 }}>Resumen de tu plataforma en tiempo real</p>
      </div>

      <div className="v3-g4" style={{ marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} className="v3-stat-card">
            <div style={{ fontSize: 20 }}>{s.ic}</div>
            <div className="v3-stat-val">{s.val}</div>
            <div className="v3-stat-lbl">{s.lbl}</div>
            <div className="v3-stat-chg">{s.chg}</div>
          </div>
        ))}
      </div>

      <div className="v3-g2">
        <div>
          <div className="v3-card" style={{ marginBottom: 18 }}>
            <div className="v3-card-title">Actividad Reciente</div>
            {activity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: i < activity.length - 1 ? `1px solid ${C.div}` : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.aBg, border: `1px solid ${C.aBd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{a.ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.t1 }}>{a.user}</div>
                  <div style={{ fontSize: 14, color: C.t2, marginTop: 2 }}>{a.act}</div>
                </div>
                <div style={{ fontSize: 12, color: C.t3, whiteSpace: "nowrap", fontFamily: "'JetBrains Mono',monospace" }}>hace {a.t}</div>
              </div>
            ))}
          </div>

          <div className="v3-card">
            <div className="v3-card-title">Estado del Sistema</div>
            {sysStatus.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < sysStatus.length - 1 ? `1px solid ${C.div}` : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.st === "warn" ? C.warn : C.ok, flexShrink: 0, boxShadow: `0 0 5px ${s.st === "warn" ? C.warn : C.ok}` }} />
                <span style={{ flex: 1, fontSize: 14, color: C.t1, fontWeight: 500 }}>{s.nm}</span>
                <span style={{ fontSize: 13, color: s.st === "warn" ? C.warn : C.ok, fontFamily: "'JetBrains Mono',monospace" }}>{s.st === "warn" ? "Degradado" : "Online"}</span>
                <span style={{ fontSize: 13, color: C.t3, fontFamily: "'JetBrains Mono',monospace", minWidth: 52, textAlign: "right" }}>{s.lat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="v3-card">
          <div className="v3-card-title">Creaciones de Hoy</div>
          {[
            { l: "Música",   v: liveStats.music  || 0, pct: 54, ic: "🎵" },
            { l: "Imágenes", v: liveStats.images || 0, pct: 19, ic: "🎨" },
            { l: "Voz",      v: 312,                   pct: 13, ic: "🎤" },
            { l: "Letras",   v: 198,                   pct: 8,  ic: "📝" },
            { l: "Videos",   v: 89,                    pct: 4,  ic: "🎬" },
          ].map((r, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 14, color: C.t1, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>{r.ic} {r.l}</span>
                <span style={{ fontSize: 13, color: C.t2, fontFamily: "'JetBrains Mono',monospace" }}>{r.v.toLocaleString()} · {r.pct}%</span>
              </div>
              <div className="v3-prog-track">
                <div className="v3-prog-fill" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.div}`, paddingTop: 16, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: C.t2 }}>Total generaciones hoy</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 800, color: C.aLt }}>{(liveStats.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
