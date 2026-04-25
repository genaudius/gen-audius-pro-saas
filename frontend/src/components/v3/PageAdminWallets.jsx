/**
 * Gen Audius v3.0 — PageAdminWallets
 * =====================================
 * Wallet/credit management for all users (SuperAdmin).
 */
import React, { useState } from 'react';
import { C } from '../../utils/designTokens';

export default function PageAdminWallets({ allWallets = [], onAdjust = () => {} }) {
  const [adjustId, setAdjustId] = useState(null);
  const [adjustAmt, setAdjustAmt] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");

  const planColors = { free: C.t3, pro: C.a, studio: C.warn, enterprise: C.ok };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>Créditos & Wallets</h2>
          <p style={{ fontSize: 14, color: C.t2, marginTop: 5 }}>Ajustar créditos, ver balances y administrar wallets</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="v3-btn v3-btn-se v3-btn-sm">📊 Exportar</button>
          <button className="v3-btn v3-btn-pr v3-btn-sm">+ Recarga Masiva</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="v3-g4" style={{ marginBottom: 22 }}>
        {[
          { l: "Total Créditos",  v: allWallets.reduce((s, w) => s + (w.credits || 0), 0).toLocaleString(), ic: "◈", chg: "en circulación" },
          { l: "Balance Total",   v: `$${allWallets.reduce((s, w) => s + (w.balance || 0), 0).toFixed(2)}`, ic: "💰", chg: "en USD" },
          { l: "Wallets Activas", v: allWallets.length.toString(), ic: "👥", chg: "usuarios registrados" },
          { l: "Promedio/usuario", v: allWallets.length ? Math.round(allWallets.reduce((s, w) => s + (w.credits || 0), 0) / allWallets.length).toLocaleString() : "0", ic: "📊", chg: "créditos" },
        ].map((s, i) => (
          <div key={i} className="v3-stat-card">
            <div style={{ fontSize: 20 }}>{s.ic}</div>
            <div className="v3-stat-val">{s.v}</div>
            <div className="v3-stat-lbl">{s.l}</div>
            <div className="v3-stat-chg">{s.chg}</div>
          </div>
        ))}
      </div>

      {/* Wallet Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {allWallets.map((w, i) => (
          <div key={i} className="v3-card" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
            {/* Avatar */}
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.aBg, border: `1px solid ${C.aBd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: C.aLt, flexShrink: 0 }}>
              {(w.username || w.userId || "?")[0].toUpperCase()}
            </div>
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: C.t1 }}>{w.username || w.userId}</span>
                <span className="v3-tag" style={{ background: (planColors[w.plan] || C.t3) + "15", color: planColors[w.plan] || C.t3, borderColor: (planColors[w.plan] || C.t3) + "30", fontSize: 10 }}>
                  {(w.plan || "free").toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 12, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>
                ID: {w.userId} · Actualizado: {w.updatedAt || "—"}
              </div>
            </div>
            {/* Balance */}
            <div style={{ textAlign: "right", minWidth: 120 }}>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 800, color: C.aLt }}>
                ◈ {(w.credits || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 13, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>
                ${(w.balance || 0).toFixed(2)} USD
              </div>
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="v3-btn v3-btn-se v3-btn-sm" onClick={() => setAdjustId(adjustId === w.userId ? null : w.userId)}>
                {adjustId === w.userId ? "✕" : "✎ Ajustar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adjust modal */}
      {adjustId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 380, maxWidth: "90%", animation: "v3-fadeUp 0.2s ease" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.t1, marginBottom: 20 }}>Ajustar Créditos</h3>
            <div style={{ fontSize: 14, color: C.t2, marginBottom: 16 }}>
              Usuario: <span style={{ color: C.aLt, fontWeight: 700 }}>{adjustId}</span>
            </div>
            <div className="v3-field">
              <label className="v3-field-lbl">Cantidad (+ agregar, − descontar)</label>
              <input className="v3-inp" type="number" placeholder="Ej: 100 ó -50" value={adjustAmt || ""} onChange={e => setAdjustAmt(+e.target.value)} />
            </div>
            <div className="v3-field">
              <label className="v3-field-lbl">Razón</label>
              <input className="v3-inp" placeholder="Bonus de bienvenida, compensación…" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="v3-btn v3-btn-pr" style={{ flex: 1, justifyContent: "center" }}
                onClick={() => { onAdjust(adjustId, adjustAmt, adjustReason); setAdjustId(null); setAdjustAmt(0); setAdjustReason(""); }}
                disabled={!adjustAmt}>
                {adjustAmt >= 0 ? `+ Agregar ${adjustAmt} CRD` : `Descontar ${Math.abs(adjustAmt)} CRD`}
              </button>
              <button className="v3-btn v3-btn-gh" onClick={() => { setAdjustId(null); setAdjustAmt(0); setAdjustReason(""); }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
