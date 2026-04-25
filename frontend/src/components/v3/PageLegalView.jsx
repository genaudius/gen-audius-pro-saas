import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield } from 'lucide-react';
import { C } from '../../utils/designTokens';

export default function PageLegalView({ onBack }) {
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    const slug = window.location.pathname.split('/').pop();

    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }
        fetch(`/api/legal/${slug}`)
            .then(r => {
                if (!r.ok) throw new Error("Not found");
                return r.json();
            })
            .then(data => setDoc(data))
            .catch(e => setDoc({ title: "Documento no encontrado", content: "El documento legal solicitado no existe o no está activo en este momento.", version: "0.0.0", updated_at: new Date() }))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.t2, background: C.bg }}>Cargando...</div>;

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.t1, padding: "40px 20px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <button 
                    onClick={handleBack}
                    style={{ 
                        background: "none", border: "none", color: C.aLt, 
                        display: "flex", alignItems: "center", gap: 8, 
                        cursor: "pointer", marginBottom: 30, fontSize: 14, fontWeight: 700 
                    }}
                >
                    <ChevronLeft size={18} /> Volver a Gen Audius
                </button>

                {doc && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="v3-card" 
                        style={{ padding: '40px 30px' }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                            <Shield size={24} color={C.a} />
                            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, color: C.t1 }}>{doc.title}</h1>
                        </div>
                        
                        <div style={{ fontSize: 11, color: C.t3, marginBottom: 30, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>
                            Versión {doc.version} · Actualizado: {new Date(doc.updated_at).toLocaleDateString()}
                        </div>

                        <div 
                            style={{ 
                                fontSize: 15, color: C.t2, lineHeight: 1.8, 
                                whiteSpace: "pre-wrap", borderTop: `1px solid ${C.div}44`, paddingTop: 30 
                            }}
                        >
                            {doc.content}
                        </div>
                    </motion.div>
                )}

                <div style={{ textAlign: "center", marginTop: 40, fontSize: 11, color: C.t3, opacity: 0.5, letterSpacing: 1, fontWeight: 700 }}>
                    GEN AUDIUS PRO · LEGAL ENGINE v1.0
                </div>
            </div>
        </div>
    );
}
