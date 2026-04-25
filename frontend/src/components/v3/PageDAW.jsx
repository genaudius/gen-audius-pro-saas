/**
 * Gen Audius v3.0 — PageDAW
 * ===========================
 * Timeline-based DAW with tracks, clips, transport, and mixer.
 */
import React, { useState, useEffect } from 'react';
import { C } from '../../utils/designTokens';
import { VuMeter } from './SharedComponents';

export default function PageDAW() {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(128);
  const [time, setTime] = useState("01:01:01");
  const [muted, setMuted] = useState([false, false, false, false, false, false]);
  const [soloed, setSoloed] = useState([false, false, false, false, false, false]);
  const [faders, setFaders] = useState([80, 75, 70, 85, 65, 90]);

  const tracks = [
    { nm: "DRUMS", col: "#D97060", ty: "Audio", clips: [{ s: 0, w: 200, l: "Drum Loop" }, { s: 250, w: 150, l: "Fill" }, { s: 450, w: 200, l: "Drum Loop" }] },
    { nm: "BASS",  col: C.ok,      ty: "MIDI",  clips: [{ s: 0, w: 400, l: "Bass Line" }, { s: 450, w: 200, l: "Bass Line" }] },
    { nm: "SYNTH", col: C.a,       ty: "VST",   clips: [{ s: 100, w: 180, l: "Lead" }, { s: 350, w: 240, l: "Lead v2" }] },
    { nm: "VOCAL", col: "#A78BFA",  ty: "Audio", clips: [{ s: 200, w: 300, l: "Vocal Main" }] },
    { nm: "PAD",   col: "#60A5FA",  ty: "VST",   clips: [{ s: 0, w: 650, l: "Ambient Pad" }] },
    { nm: "FX",    col: C.warn,    ty: "Audio", clips: [{ s: 400, w: 80, l: "Riser" }, { s: 600, w: 60, l: "Down" }] },
  ];

  useEffect(() => {
    if (!playing) return;
    let f = 0;
    const id = setInterval(() => {
      f++;
      const bar = Math.floor(f / (bpm * 4)) + 1;
      const beat = Math.floor((f % (bpm * 4)) / bpm) + 1;
      const sub = Math.floor((f % bpm) / (bpm / 4)) + 1;
      setTime(`0${bar}:0${beat}:0${sub}`);
    }, 60000 / bpm / 4);
    return () => clearInterval(id);
  }, [playing, bpm]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Transport Bar */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.border}`, padding: "8px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="v3-tpt-btn" onClick={() => setTime("01:01:01")}>⏮</button>
          <button className={`v3-tpt-btn ${playing ? "on" : ""}`} onClick={() => setPlaying(!playing)}>{playing ? "⏸" : "▶"}</button>
          <button className="v3-tpt-btn">⏹</button>
          <button className="v3-tpt-btn" style={{ color: C.err, borderColor: `${C.err}44` }}>⏺</button>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 600, color: C.t1, letterSpacing: 2 }}>{time}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>BPM</span>
          <div style={{ background: C.input, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 12px", fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: C.aLt }}>{bpm}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <button onClick={() => setBpm(b => Math.min(250, b + 1))} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 10, lineHeight: 1 }}>▲</button>
            <button onClick={() => setBpm(b => Math.max(40, b - 1))} style={{ background: "none", border: "none", color: C.t3, cursor: "pointer", fontSize: 10, lineHeight: 1 }}>▼</button>
          </div>
        </div>
        <div style={{ width: 1, height: 22, background: C.border }} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="v3-btn v3-btn-gh v3-btn-sm">🤖 AI Compose</button>
          <button className="v3-btn v3-btn-se v3-btn-sm">✨ AI Arrange</button>
          <button className="v3-btn v3-btn-pr v3-btn-sm">💿 Exportar</button>
        </div>
      </div>

      {/* Body: Tracks + Timeline */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Track Panel */}
        <div style={{ width: 204, minWidth: 204, background: C.surf, borderRight: `1px solid ${C.border}`, overflowY: "auto" }}>
          <div style={{ padding: "9px 14px", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: C.t3, borderBottom: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono',monospace", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            TRACKS
            <button style={{ background: C.a, border: "none", color: "#fff", width: 20, height: 20, borderRadius: 5, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          {tracks.map((t, i) => (
            <div key={i} style={{ height: 56, borderBottom: `1px solid ${C.div}`, display: "flex", alignItems: "center", gap: 9, padding: "0 11px", cursor: "pointer", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.aBg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 3, height: 36, borderRadius: 2, background: t.col, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.t1 }}>{t.nm}</div>
                <div style={{ fontSize: 11, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>{t.ty}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setMuted(m => m.map((v, j) => j === i ? !v : v))} style={{
                  width: 22, height: 22, borderRadius: 5, border: "none", fontSize: 10, fontWeight: 700, cursor: "pointer",
                  background: muted[i] ? `${C.warn}22` : C.border, color: muted[i] ? C.warn : C.t2,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>M</button>
                <button onClick={() => setSoloed(s => s.map((v, j) => j === i ? !v : v))} style={{
                  width: 22, height: 22, borderRadius: 5, border: "none", fontSize: 10, fontWeight: 700, cursor: "pointer",
                  background: soloed[i] ? C.aBg : C.border, color: soloed[i] ? C.aLt : C.t2,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>S</button>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Area */}
        <div style={{ flex: 1, overflow: "auto", background: C.bg, position: "relative" }}>
          {/* Ruler */}
          <div style={{ height: 26, background: C.surf, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "flex-end", padding: "0 3px" }}>
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} style={{ minWidth: 50, fontSize: 10, color: C.t3, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", paddingBottom: 4, borderLeft: i % 4 === 0 ? `1px solid ${C.border}` : "none" }}>
                {i % 4 === 0 ? i / 4 + 1 : ""}
              </div>
            ))}
          </div>
          {/* Clips */}
          <div style={{ position: "relative", minWidth: 1600 }}>
            {tracks.map((t, ti) => (
              <div key={ti} style={{ height: 56, borderBottom: `1px solid ${C.div}`, position: "relative" }}>
                {Array.from({ length: 32 }).map((_, i) => (
                  <div key={i} style={{ position: "absolute", left: i * 50, top: 0, bottom: 0, width: 1, background: i % 4 === 0 ? C.border : C.div }} />
                ))}
                {t.clips.map((cl, ci) => (
                  <div key={ci} style={{
                    position: "absolute", left: cl.s + 4, width: cl.w, top: 5, height: 46,
                    borderRadius: 6, display: "flex", alignItems: "center", padding: "0 10px",
                    fontSize: 11, fontWeight: 600, cursor: "grab", userSelect: "none", overflow: "hidden",
                    background: t.col + "18", border: `1px solid ${t.col}55`, color: t.col
                  }}>
                    {cl.l}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mixer */}
      <div style={{ height: 170, background: C.surf, borderTop: `1px solid ${C.border}`, display: "flex", overflowX: "auto", padding: "9px 14px", gap: 7, flexShrink: 0 }}>
        {tracks.map((t, i) => (
          <div key={i} style={{ minWidth: 54, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{ fontSize: 10, color: C.t2, fontFamily: "'JetBrains Mono',monospace", textAlign: "center", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.nm}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 82 }}>
              <VuMeter active={playing && !muted[i]} />
              <input type="range" min={0} max={100} value={faders[i]}
                onChange={e => setFaders(f => f.map((v, j) => j === i ? +e.target.value : v))}
                style={{ writingMode: "vertical-lr", direction: "rtl", height: 72, width: 5 }} />
              <VuMeter active={playing && !muted[i]} />
            </div>
            <div style={{ fontSize: 10, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>{faders[i]}</div>
            <div style={{ width: "100%", height: 2, borderRadius: 1, background: t.col, opacity: 0.7 }} />
          </div>
        ))}
        {/* Master channel */}
        <div style={{ minWidth: 54, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, borderLeft: `1px solid ${C.border}`, paddingLeft: 9 }}>
          <div style={{ fontSize: 10, color: C.t1, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>MST</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 82 }}>
            <VuMeter active={playing} />
            <input type="range" min={0} max={100} defaultValue={100}
              style={{ writingMode: "vertical-lr", direction: "rtl", height: 72, width: 5 }} />
            <VuMeter active={playing} />
          </div>
          <div style={{ fontSize: 10, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>100</div>
          <div style={{ width: "100%", height: 2, borderRadius: 1, background: C.a }} />
        </div>
      </div>
    </div>
  );
}
