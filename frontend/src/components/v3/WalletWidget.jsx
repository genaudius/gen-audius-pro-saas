/**
 * Gen Audius v3.0 — WalletWidget
 * ================================
 * Topbar credit display with recharge popup.
 * Designed to integrate into StudioLayout topbar.
 */
import React, { useState } from 'react';
import { C } from '../../utils/designTokens';
import { useLang } from '../../i18n/LanguageContext';

export default function WalletWidget({ wallet, onRecharge }) {
  const [showRecharge, setShowRecharge] = useState(false);
  const [amount, setAmount] = useState(100);
  const [accepted, setAccepted] = useState(false);
  const { t } = useLang();
  const packs = [
    { credits: 100,  price: "$1",  label: "Starter" },
    { credits: 500,  price: "$4",  label: "Popular" },
    { credits: 1000, price: "$7",  label: "Pro"     },
    { credits: 5000, price: "$29", label: "Studio"  },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShowRecharge(!showRecharge)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
        background: C.aBg, border: `1px solid ${C.aBd}`, borderRadius: 8,
        cursor: "pointer", transition: "all 0.15s", fontFamily: "'JetBrains Mono',monospace"
      }}>
        <span style={{ fontSize: 13, color: C.aLt, fontWeight: 700 }}>◈ {(wallet?.credits || 0).toLocaleString()}</span>
        <span style={{ fontSize: 11, color: C.t3 }}>CRD</span>
        <span style={{ fontSize: 11, color: C.a }}>+</span>
      </button>
      {showRecharge && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
          padding: 20, width: 280, zIndex: 200, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          animation: "v3-fadeUp 0.2s ease"
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.t1, marginBottom: 16 }}>Recargar Créditos</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {packs.map((p, i) => (
              <button key={i} onClick={() => setAmount(p.credits)} style={{
                padding: "10px 8px", borderRadius: 9, border: `1px solid ${amount === p.credits ? C.a : C.border}`,
                background: amount === p.credits ? C.aBg : "transparent", cursor: "pointer",
                transition: "all 0.12s", fontFamily: "'Inter',sans-serif"
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: amount === p.credits ? C.aLt : C.t1 }}>{p.credits.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>{p.price} · {p.label}</div>
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.t3, marginBottom: 12, fontFamily: "'JetBrains Mono',monospace" }}>
            10 CRD = $1 USD · Saldo: <span style={{ color: C.aLt }}>${(wallet?.balance || 0).toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <input 
              type="checkbox" 
              id="wallet-accept-terms" 
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              style={{ accentColor: C.a }}
            />
            <label htmlFor="wallet-accept-terms" style={{ fontSize: 10, color: C.t3, cursor: "pointer", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
              {t('legal.acceptTerms')}
            </label>
          </div>
          <button 
            className="v3-btn v3-btn-pr" 
            style={{ width: "100%", justifyContent: "center", opacity: accepted ? 1 : 0.5, cursor: accepted ? "pointer" : "not-allowed" }} 
            disabled={!accepted}
            onClick={() => { onRecharge?.(amount); setShowRecharge(false); }}
          >
            💳 Comprar {amount.toLocaleString()} CRD
          </button>
          <button onClick={() => setShowRecharge(false)} style={{ marginTop: 8, width: "100%", background: "none", border: "none", color: C.t3, fontSize: 13, cursor: "pointer", padding: "6px" }}>Cancelar</button>
        </div>
      )}
    </div>
  );
}
