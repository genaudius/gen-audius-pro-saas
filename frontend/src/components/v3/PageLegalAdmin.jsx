import React, { useState, useEffect } from 'react';
import { C } from '../../utils/designTokens';

export default function PageLegalAdmin() {
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch('/api/backend/api/admin/legal');
      const data = await res.json();
      setDocs(data);
      if (data.length > 0) setSelected(data[0]);
    } catch (e) {
      console.error("Failed to fetch legal docs", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/backend/api/admin/legal/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selected.slug,
          title: selected.title,
          content: selected.content,
          version: selected.version,
          is_active: selected.is_active
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'ok', text: 'Documento actualizado correctamente' });
        fetchDocs();
      } else {
        setMessage({ type: 'err', text: data.detail || 'Error al guardar' });
      }
    } catch (e) {
      setMessage({ type: 'err', text: 'Error de conexión' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return <div style={{ color: C.t2, padding: 20 }}>Cargando documentos legales...</div>;

  return (
    <div style={{ display: "flex", gap: 20, height: "100%", minHeight: 600 }}>
      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.t3, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>DOCUMENTOS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {docs.map(doc => (
            <button 
              key={doc.slug}
              onClick={() => setSelected(doc)}
              style={{
                textAlign: "left",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: selected?.slug === doc.slug ? C.aBg : "transparent",
                color: selected?.slug === doc.slug ? C.aLt : C.t2,
                fontSize: 14,
                fontWeight: selected?.slug === doc.slug ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {doc.title}
              <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>v{doc.version} · /{doc.slug}</div>
            </button>
          ))}
          <button 
            onClick={() => setSelected({ slug: 'new', title: 'Nuevo Documento', content: '', version: '1.0.0', is_active: true })}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: `1px dashed ${C.border}`,
              background: "transparent",
              color: C.t3,
              fontSize: 14,
              marginTop: 10,
              cursor: "pointer"
            }}
          >
            + Agregar Documento
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="v3-card" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        {selected ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <label className="v3-field-lbl">Título del Documento</label>
                <input 
                  className="v3-inp" 
                  value={selected.title} 
                  onChange={e => setSelected({...selected, title: e.target.value})}
                  style={{ fontSize: 18, fontWeight: 700 }}
                />
              </div>
              <div style={{ width: 150, marginLeft: 16 }}>
                <label className="v3-field-lbl">Slug (URL)</label>
                <input 
                  className="v3-inp" 
                  value={selected.slug} 
                  disabled={selected.slug !== 'new' && docs.some(d => d.slug === selected.slug)}
                  onChange={e => setSelected({...selected, slug: e.target.value.toLowerCase().replace(/[^a-z0-h-_]/g, '-')})}
                  placeholder="terms-of-service"
                />
              </div>
              <div style={{ width: 100, marginLeft: 16 }}>
                <label className="v3-field-lbl">Versión</label>
                <input 
                  className="v3-inp" 
                  value={selected.version} 
                  onChange={e => setSelected({...selected, version: e.target.value})}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div>
              <label className="v3-field-lbl">Contenido (Markdown/HTML soporte)</label>
              <textarea 
                className="v3-textarea" 
                style={{ height: 400, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, lineHeight: 1.6 }}
                value={selected.content}
                onChange={e => setSelected({...selected, content: e.target.value})}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${C.div}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ padding: "4px 10px", borderRadius: 20, background: C.bg, border: `1px solid ${C.border}`, fontSize: 12, color: C.t3 }}>
                  API Endpoint: <span style={{ color: C.aLt }}>/api/legal/{selected.slug}</span>
                </div>
                {message && (
                  <span style={{ fontSize: 13, color: message.type === 'ok' ? C.ok : C.err, animation: "v3-fadeIn 0.3s" }}>
                    {message.type === 'ok' ? '✓ ' : '✗ '}{message.text}
                  </span>
                )}
              </div>
              <button 
                className="v3-btn v3-btn-pr" 
                disabled={saving} 
                onClick={handleSave}
                style={{ minWidth: 140, justifyContent: "center" }}
              >
                {saving ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.t3 }}>
            Selecciona un documento para editar
          </div>
        )}
      </div>

      <style>{`
        .v3-textarea {
          width: 100%;
          background: ${C.input};
          border: 1px solid ${C.border};
          border-radius: 8px;
          padding: 12px;
          color: ${C.t1};
          resize: vertical;
          min-height: 100px;
          outline: none;
          transition: border-color 0.2s;
        }
        .v3-textarea:focus {
          border-color: ${C.a};
        }
      `}</style>
    </div>
  );
}
