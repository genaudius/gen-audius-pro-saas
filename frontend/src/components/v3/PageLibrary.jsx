/**
 * Gen Audius v3.0 — PageLibrary
 * ===============================
 * Filterable grid of all generated assets.
 */
import React, { useState } from 'react';
import { C } from '../../utils/designTokens';

export default function PageLibrary() {
  const [filter, setFilter] = useState("all");
  const [playing, setPlaying] = useState(null);
  const items = [
    { id: 1, type: "music",  title: "Electronic Pulse",  dur: "3:12", date: "hoy",  ic: "🎵", col: C.a },
    { id: 2, type: "image",  title: "Ciudad Neon",        dur: "4K",   date: "hoy",  ic: "🎨", col: C.ok },
    { id: 3, type: "music",  title: "Chill Vibes Lo-Fi",  dur: "2:48", date: "ayer", ic: "🎵", col: C.a },
    { id: 4, type: "video",  title: "Visual Trip Hop",    dur: "0:24", date: "ayer", ic: "🎬", col: C.warn },
    { id: 5, type: "lyrics", title: "Letra de Reggaeton", dur: "—",    date: "2d",   ic: "📝", col: "#f472b6" },
    { id: 6, type: "voice",  title: "Narración Espacial", dur: "1:05", date: "3d",   ic: "🎤", col: "#818cf8" },
    { id: 7, type: "image",  title: "Arte Abstracto 001", dur: "HD",   date: "4d",   ic: "🎨", col: C.ok },
    { id: 8, type: "music",  title: "Trap Beat Dark",     dur: "2:32", date: "5d",   ic: "🎵", col: C.a },
  ];

  const filters = [
    { id: "all", l: "Todo" }, { id: "music", l: "🎵 Música" }, { id: "image", l: "🎨 Imágenes" },
    { id: "video", l: "🎬 Videos" }, { id: "voice", l: "🎤 Voz" }, { id: "lyrics", l: "📝 Letras" },
  ];
  const filtered = filter === "all" ? items : items.filter(i => i.type === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>Mi Librería</h2>
        <input className="v3-inp" style={{ width: 200 }} placeholder="🔍 Buscar…" />
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {filters.map(f => (
          <button key={f.id} className={`v3-chip ${filter === f.id ? "on" : ""}`} onClick={() => setFilter(f.id)} style={{ fontSize: 13 }}>
            {f.l}
          </button>
        ))}
      </div>

      <div className="v3-lib-grid">
        {filtered.map(item => (
          <div key={item.id} className="v3-lib-item">
            <div className="v3-lib-thumb" style={{ background: `linear-gradient(135deg,${item.col}15,${item.col}05)` }}>
              <span style={{ fontSize: 34 }}>{item.ic}</span>
              {(item.type === "music" || item.type === "voice") && playing === item.id && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 2, padding: "6px", background: "rgba(0,0,0,0.5)" }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} style={{ width: 2, height: `${8 + Math.random() * 12}px`, background: item.col, borderRadius: 1, animation: `v3-wvPulse 0.8s ease-in-out ${i * 0.1}s infinite` }} />
                  ))}
                </div>
              )}
            </div>
            <div className="v3-lib-info">
              <div className="v3-lib-title">{item.title}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="v3-lib-meta">{item.dur} · {item.date}</div>
                {(item.type === "music" || item.type === "voice") && (
                  <button className={`v3-play-btn ${playing === item.id ? "on" : ""}`} style={{ width: 26, height: 26, fontSize: 11 }} onClick={() => setPlaying(playing === item.id ? null : item.id)}>
                    {playing === item.id ? "⏸" : "▶"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
