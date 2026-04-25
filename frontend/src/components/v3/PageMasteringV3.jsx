/**
 * Gen Audius v1.0 — PageMasteringV3
 * ====================================
 * Target loudness, parametric EQ, mastering progress.
 */
import React, { useState } from 'react';
import { C } from '../../utils/designTokens';

export default function PageMasteringV3() {
  const [style, setStyle] = useState("balanced");
  const [lufs, setLufs] = useState(-14);
  const [mastering, setMastering] = useState(false);
  const [mp, setMp] = useState(0);
  const [done, setDone] = useState(false);
  const [eq, setEq] = useState({ sub: 0, bass: 2, low: -1, mid: 0, high: 3, air: 2 });

  const doMaster = () => {
    setMastering(true); setMp(0); setDone(false);
    const id = setInterval(() => setMp(p => {
      if (p >= 100) { clearInterval(id); setMastering(false); setDone(true); return 100; }
      return Math.min(100, p + 1.4);
    }), 75);
  };

  const styles = [
    { id: "balanced", l: "Balanced", ic: "⚖️" }, { id: "warm", l: "Warm", ic: "🔥" },
    { id: "bright", l: "Bright", ic: "✨" }, { id: "punchy", l: "Punchy", ic: "👊" },
    { id: "cinematic", l: "Cinematic", ic: "🎬" }, { id: "vintage", l: "Vintage", ic: "📻" },
  ];
  const platforms = [
    { nm: "Spotify", lufs: -14 }, { nm: "Apple Music", lufs: -16 }, { nm: "YouTube", lufs: -14 },
    { nm: "SoundCloud", lufs: -8 }, { nm: "Tidal", lufs: -14 }, { nm: "Amazon", lufs: -14 },
  ];
  const bands = [
    { k: "sub", l: "SUB", f: "30 Hz" }, { k: "bass", l: "BASS", f: "100 Hz" },
    { k: "low", l: "LOW", f: "250 Hz" }, { k: "mid", l: "MID", f: "1 kHz" },
    { k: "high", l: "HIGH", f: "6 kHz" }, { k: "air", l: "AIR", f: "16 kHz" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>Mastering Studio</h2>
          <p style={{ fontSize: 14, color: C.t2, marginTop: 5 }}>Mastering profesional con IA</p>
        </div>
      </div>

      <div className="v3-g2" style={{ gap: 20 }}>
        {/* Left Column */}
        <div>
          {/* Source File */}
          <div className="v3-card" style={{ marginBottom: 18 }}>
            <div className="v3-card-title">Archivo de Origen</div>
            <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${C.a}66`}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎵</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.t1 }}>Arrastra tu archivo aquí</div>
              <div style={{ fontSize: 14, color: C.t2, marginTop: 5 }}>WAV · AIFF · FLAC · hasta 500 MB</div>
              <button className="v3-btn v3-btn-se" style={{ marginTop: 14 }}>Seleccionar Archivo</button>
            </div>
            <div style={{ marginTop: 14, padding: "12px 14px", background: C.input, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22 }}>🎶</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.t1 }}>Neon_Nights_mix.wav</div>
                <div style={{ fontSize: 13, color: C.t2, marginTop: 2 }}>48 kHz · 24-bit · 4:23 · 47.2 MB</div>
              </div>
              <span className="v3-tag v3-tag-ok">✓ Listo</span>
            </div>
          </div>

          {/* Master Style */}
          <div className="v3-card" style={{ marginBottom: 18 }}>
            <div className="v3-card-title">Estilo de Master</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {styles.map(s => (
                <button key={s.id} className={`v3-sty-btn ${style === s.id ? "on" : ""}`} onClick={() => setStyle(s.id)}>
                  <span style={{ fontSize: 20 }}>{s.ic}</span>{s.l}
                </button>
              ))}
            </div>
          </div>

          {/* Target Loudness */}
          <div className="v3-card" style={{ marginBottom: 18 }}>
            <div className="v3-card-title">Target Loudness</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: C.t2 }}>Nivel LUFS</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, color: C.aLt }}>{lufs} LUFS</span>
            </div>
            <input type="range" min={-20} max={-6} value={lufs} onChange={e => setLufs(+e.target.value)} style={{ width: "100%", marginBottom: 14 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
              {platforms.map(p => (
                <button key={p.nm} onClick={() => setLufs(p.lufs)} style={{
                  padding: "8px", borderRadius: 7, cursor: "pointer", transition: "all 0.12s",
                  border: `1px solid ${lufs === p.lufs ? C.a : C.border}`,
                  background: lufs === p.lufs ? C.aBg : "transparent",
                  color: lufs === p.lufs ? C.aLt : C.t2, fontFamily: "'Inter',sans-serif"
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nm}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, fontFamily: "'JetBrains Mono',monospace" }}>{p.lufs}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          {mastering && (
            <div className="v3-card" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.t1 }}>Procesando…</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: C.aLt }}>{Math.round(mp)}%</span>
              </div>
              <div className="v3-prog-track" style={{ height: 8, borderRadius: 4 }}>
                <div className="v3-prog-fill" style={{ width: `${mp}%`, borderRadius: 4 }} />
              </div>
            </div>
          )}

          <button className="v3-btn v3-btn-pr v3-btn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={doMaster} disabled={mastering}>
            {mastering ? "⚙️ Masterizando…" : "🚀  Iniciar Mastering"}
          </button>
        </div>

        {/* Right Column */}
        <div>
          {/* EQ */}
          <div className="v3-card" style={{ marginBottom: 18 }}>
            <div className="v3-card-title">EQ Paramétrico</div>
            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: 120, borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
              {bands.map(b => (
                <div key={b.k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 600, color: eq[b.k] > 0 ? C.aLt : eq[b.k] < 0 ? C.warn : C.t3 }}>
                    {eq[b.k] > 0 ? "+" : ""}{eq[b.k]}
                  </span>
                  <input type="range" min={-12} max={12} value={eq[b.k]}
                    onChange={e => setEq(v => ({ ...v, [b.k]: +e.target.value }))}
                    style={{ writingMode: "vertical-lr", direction: "rtl", height: 76, width: 5 }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {bands.map(b => (
                <div key={b.k} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: C.t2, fontFamily: "'JetBrains Mono',monospace" }}>{b.l}</div>
                  <div style={{ fontSize: 10, color: C.t3, fontFamily: "'JetBrains Mono',monospace" }}>{b.f}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Results */}
          {done && (
            <div className="v3-card" style={{ border: `1px solid ${C.ok}44`, background: C.okBg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.t1 }}>Mastering Completado</div>
                  <div style={{ fontSize: 14, color: C.t2, marginTop: 2 }}>Procesado en 48 segundos</div>
                </div>
              </div>
              <div className="v3-g2" style={{ gap: 10, marginBottom: 16 }}>
                {[
                  { l: "LUFS", before: "-22.3", after: "-14.0" }, { l: "True Peak", before: "-3.2", after: "-1.0" },
                  { l: "Dyn. Range", before: "12", after: "9" }, { l: "Stereo Width", before: "65%", after: "82%" },
                ].map((m, i) => (
                  <div key={i} style={{ background: C.card, borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, color: C.t3, marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }}>{m.l}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, color: C.t3 }}>{m.before}</span>
                      <span style={{ color: C.t3, fontSize: 11 }}>→</span>
                      <span style={{ fontSize: 16, fontWeight: 800, color: C.ok, fontFamily: "'JetBrains Mono',monospace" }}>{m.after}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="v3-btn v3-btn-pr" style={{ flex: 1, justifyContent: "center" }}>⬇ WAV Masterizado</button>
                <button className="v3-btn v3-btn-gh" style={{ flex: 1, justifyContent: "center" }}>⬇ MP3 320kbps</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
