import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Sparkles, ExternalLink } from 'lucide-react';
import { C } from '../../utils/designTokens';

/**
 * Gen Audius - AI Support Assistant
 * Trained on product info, pricing, and system operations.
 */
export default function SupportHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! Soy el asistente de Gen Audius. ¿En qué puedo ayudarte hoy? Consultas sobre planes, soporte técnico o ventas.' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // System prompt for the Support Assistant
      const systemPrompt = `
        Eres el Asistente Oficial de Soporte y Ventas de Gen Audius Pro.
        Gen Audius es una plataforma líder de música por IA que usa modelos como Suno, Kie.ai, Flux, y Masterchannel.
        
        INFORMACIÓN CLAVE:
        - Registro: Es necesario registrarse para usar el Studio.
        - Free: 100 tokens diarios gratis para usuarios registrados.
        - Pro: $19.99/mes, tokens ilimitados, mastering prioritario.
        - Enterprise: Consultar precios para sellos discográficos.
        - Créditos: $1 USD equivale a 10 créditos si se compran por separado.
        - Generación: Música, Imágenes, Video, Voz (TTS) y Letras.
        - Mastering: Usamos algoritmos Neve/SSL para calidad de estudio.
        - Empresa: Ubicados en el futuro de la música.
        
        Tu tono debe ser profesional, servicial y de "lujo oscuro" (premium).
        Responde brevemente si es posible. No inventes precios fuera de estos.
      `;

      // Simplified API call to OpenAI or similar via our ProviderEngine logic
      // For now, we simulate but we could use callCreationAPI
      setTimeout(() => {
        let response = "No estoy seguro de eso, pero puedes contactar a soporte@genaudius.com. ¿Te interesa saber sobre el plan Pro?";
        
        const lower = userMsg.toLowerCase();
        if (lower.includes("precio") || lower.includes("plan") || lower.includes("cuanto cuesta")) {
          response = "Tenemos 3 planes: El Free (100 tokens día), el Pro ($19.99/mes con todo ilimitado) y el Enterprise para empresas. ¿Quieres que te ayude a elegir uno?";
        } else if (lower.includes("funciona") || lower.includes("como se usa")) {
          response = "Es muy fácil: escribes una descripción (prompt) de lo que quieres (ej: 'reggaeton oscuro') y nuestra IA genera la pista, voz y hasta el arte en segundos.";
        } else if (lower.includes("token") || lower.includes("credito")) {
          response = "Regalamos 100 tokens diarios a todos los artistas registrados. Si necesitas más, puedes comprar créditos a razón de 10 créditos por $1 USD.";
        } else if (lower.includes("gratis")) {
          response = "¡Sí! Ofrecemos 100 tokens diarios totalmente gratis al registrarte.";
        }

        setMessages(prev => [...prev, { role: 'assistant', text: response }]);
        setLoading(false);
      }, 1000);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error de conexión. Inténtalo más tarde.' }]);
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 25, right: 25, zIndex: 1000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            style={{
              width: 380,
              height: 520,
              background: '#0d0d14',
              border: `1px solid ${C.a}40`,
              borderRadius: 24,
              boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${C.a}15`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: 15,
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${C.a}, #6B21D4)`, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Soporte Gen Audius</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.ok }} /> ONLINE
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7 }}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div ref={scrollRef} style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                    background: m.role === 'user' ? C.a : 'rgba(255,255,255,0.05)',
                    border: m.role === 'user' ? 'none' : `1px solid ${C.div}`,
                    color: '#fff',
                    fontSize: 13,
                    lineHeight: 1.5
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: 12, display: 'flex', gap: 4 }}>
                    <div className="v3-pulseDot" style={{ width: 6, height: 6, background: C.t3 }} />
                    <div className="v3-pulseDot" style={{ width: 6, height: 6, background: C.t3, animationDelay: '0.2s' }} />
                    <div className="v3-pulseDot" style={{ width: 6, height: 6, background: C.t3, animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div style={{ padding: '0 20px 10px', display: 'flex', gap: 6, overflowX: 'auto' }}>
              {["Planes", "Precio", "Tokens gratis", "Cómo funciona"].map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.div}`, color: C.t2, fontSize: 10, padding: '6px 10px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer' }}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: 15, borderTop: `1px solid ${C.div}`, display: 'flex', gap: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.div}`, borderRadius: 12, padding: '10px 14px', color: '#fff', outline: 'none', fontSize: 13 }}
              />
              <button
                type="submit"
                style={{ width: 44, height: 44, borderRadius: 12, background: C.a, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Send size={18} color="#fff" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.a}, #6B21D4)`,
          border: 'none',
          boxShadow: `0 10px 30px ${C.a}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
}
