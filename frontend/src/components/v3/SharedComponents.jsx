/**
 * Gen Audius v3.0 — Shared UI Components
 * ========================================
 * Small reusable components extracted from v3 monolith.
 * Uses design tokens from designTokens.js
 */

import React, { useState, useEffect } from 'react';
import { C } from '../../utils/designTokens';

// ── Waveform Visualization ────────────────────────────────
export function Waveform({ bars = 32, playing = false }) {
  const [h, setH] = useState(() => Array.from({ length: bars }, () => Math.random() * .7 + .3));
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setH(Array.from({ length: bars }, () => Math.random() * .8 + .2)), 110);
    return () => clearInterval(id);
  }, [playing, bars]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 34 }}>
      {h.map((v, i) => (
        <div key={i} style={{ width: 3, borderRadius: 2, height: `${v * 30}px`, background: C.a, opacity: playing ? 1 : 0.35 }} />
      ))}
    </div>
  );
}

// ── VU Meter ──────────────────────────────────────────────
export function VuMeter({ active }) {
  const segs = 10;
  return (
    <div style={{ width: 7, height: 72, background: C.border, borderRadius: 3, overflow: "hidden", display: "flex", flexDirection: "column-reverse", gap: 1, padding: 2 }}>
      {Array.from({ length: segs }).map((_, i) => {
        const pct = i / segs;
        const lit = active && pct < (0.25 + Math.random() * 0.65);
        const col = pct > .85 ? C.err : pct > .7 ? C.warn : C.ok;
        return <div key={i} style={{ height: 4, borderRadius: 1, background: col, opacity: lit ? 1 : 0.07 }} />;
      })}
    </div>
  );
}

// ── Toggle Switch ─────────────────────────────────────────
export function Tog({ init = true, onChange }) {
  const [on, setOn] = useState(init);
  return (
    <label style={{ position: "relative", width: 38, height: 22, cursor: "pointer", flexShrink: 0, display: "inline-block" }}>
      <input type="checkbox" checked={on} onChange={() => { setOn(!on); onChange?.(!on); }}
        style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
      <span style={{
        position: "absolute", inset: 0, background: on ? C.a : C.border, borderRadius: 22,
        transition: "0.2s",
      }}>
        <span style={{
          position: "absolute", width: 16, height: 16, left: on ? 19 : 3, bottom: 3,
          background: on ? "#fff" : C.t2, borderRadius: "50%", transition: "0.2s",
        }} />
      </span>
    </label>
  );
}
// ── CD Loader ─────────────────────────────────────────────
export function CDLoader({ loading }) {
  if (!loading) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, background: "rgba(3,8,22,0.8)",
      backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 20
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: "50%", border: `4px solid ${C.div}`,
        borderTopColor: C.a, animation: "v3-spinOrbit 1s linear infinite",
        boxShadow: `0 0 40px ${C.a}20`
      }} />
      <div style={{ fontSize: 13, fontWeight: 700, color: C.aLt, letterSpacing: 2, textTransform: "uppercase" }}>
        Loading Pro Engine...
      </div>
    </div>
  );
}
