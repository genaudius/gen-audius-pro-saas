import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Plus, Save, Trash2, Eye, Calendar, Tag, Image as ImageIcon } from 'lucide-react';
import { C } from '../../utils/designTokens';

export default function PageBlog() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/backend/api/blog');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/backend/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing)
      });
      if (res.ok) {
        setEditing(null);
        fetchPosts();
      }
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  return (
    <div style={{ animation: "v3-fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.t1, display: "flex", alignItems: "center", gap: 10 }}>
            <Newspaper size={28} color={C.a} /> Blog & Noticias
          </h2>
          <p style={{ fontSize: 13, color: C.t2 }}>Gestiona las noticias y promociones de Gen Audius.</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing({ title: "", content: "", category: "news", image_url: "" })} className="v3-btn v3-btn-pr">
            <Plus size={18} style={{ marginRight: 6 }} /> Nueva Noticia
          </button>
        )}
      </div>

      {editing ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="v3-card">
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="v3-card-title">Editor de Noticia</div>
              <button type="button" onClick={() => setEditing(null)} className="v3-btn v3-btn-gh v3-btn-sm">Cancelar</button>
            </div>
            
            <input 
              className="v3-inp" 
              placeholder="Título de la noticia..."
              value={editing.title} 
              onChange={e => setEditing({...editing, title: e.target.value})}
              style={{ fontSize: 18, fontWeight: 700 }}
            />
            
            <div className="v3-g2">
              <select className="v3-sel" value={editing.category} onChange={e => setEditing({...editing, category: e.target.value})}>
                <option value="news">Noticias</option>
                <option value="tutorial">Tutorial</option>
                <option value="update">Actualización</option>
                <option value="promo">Promoción</option>
              </select>
              <div style={{ position: "relative" }}>
                <ImageIcon size={16} style={{ position: "absolute", left: 12, top: 14, color: C.t3 }} />
                <input 
                  className="v3-inp" 
                  placeholder="URL de imagen destacada..." 
                  style={{ paddingLeft: 38 }}
                  value={editing.image_url}
                  onChange={e => setEditing({...editing, image_url: e.target.value})}
                />
              </div>
            </div>

            <textarea 
              className="v3-textarea" 
              placeholder="Contenido en Markdown o Texto plano..."
              style={{ minHeight: 300, fontFamily: "'JetBrains Mono', monospace" }}
              value={editing.content}
              onChange={e => setEditing({...editing, content: e.target.value})}
            />

            <button type="submit" className="v3-gen-btn" style={{ margin: 0 }}>
              <Save size={18} style={{ marginRight: 8 }} /> Publicar Noticia
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="v3-g2">
          {posts.map(p => (
            <div key={p.id} className="v3-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {p.image_url && <img src={p.image_url} alt={p.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />}
              <div style={{ padding: 20, flex: 1 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  <span className="v3-tag" style={{ background: C.a + '15', color: C.a }}>{p.category.toUpperCase()}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.t1, marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: C.t2, lineClamp: 3, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: 20 }}>
                  {p.content}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", borderTop: `1px solid ${C.div}`, paddingTop: 15 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: C.t3 }}>
                    <Calendar size={12} /> {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="v3-btn v3-btn-sm v3-btn-gh"><Eye size={14} /></button>
                    <button className="v3-btn v3-btn-sm v3-btn-gh"><Trash2 size={14} color={C.err} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && !loading && (
            <div style={{ gridColumn: "1/-1", padding: 60, textAlign: "center", color: C.t3, background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: `1px dashed ${C.div}` }}>
              No hay noticias publicadas todavía.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
