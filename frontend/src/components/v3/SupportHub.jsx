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
      const res = await fetch('/api/backend/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-6).map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        // Fallback local si el backend falla
        const fallback = getLocalReply(userMsg);
        setMessages(prev => [...prev, { role: 'assistant', text: fallback }]);
      }
    } catch (err) {
      const fallback = getLocalReply(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  function getLocalReply(msg) {
    const m = msg.toLowerCase();
    if (m.match(/precio|plan|costo|cuánto/)) return "Tenemos 3 planes: Free (100 tokens/día gratis), Pro ($19.99/mes) y Enterprise. ¿Te ayudo a elegir?";
    if (m.match(/token|crédito|saldo/)) return "Regalamos 100 tokens diarios gratis. También puedes comprar créditos a $1 USD por 10 créditos.";
    if (m.match(/gratis|free|probar/)) return "¡Sí! Regístrate y obtén 100 tokens diarios gratis. Sin tarjeta de crédito.";
    if (m.match(/hola|buenas|hey|hi/)) return "¡Hola! Soy ChatGEN. ¿En qué puedo ayudarte hoy?";
    if (m.match(/soporte|ayuda|error|problema/)) return "Para soporte técnico escríbenos a soporte@genaudius.com. Respondemos en menos de 24h.";
    if (m.match(/mastering/)) return "Nuestro motor de mastering usa algoritmos Neve/SSL para calidad de estudio profesional. Disponible en el plan Pro.";
    return "Para más información escríbenos a soporte@genaudius.com o visita genaudius.com.";
  }

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
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>ChatGEN</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.ok }} /> ONLINE · Asistente IA
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
