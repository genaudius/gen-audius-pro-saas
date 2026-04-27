/**
 * Gen Audius — PagePlans
 * Subscription plans with real Stripe checkout integration
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Building2, Loader2 } from 'lucide-react';

const PLANS = [
  {
    id: 'basic',
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    icon: Zap,
    color: '#6B7280',
    features: [
      '100 tokens diarios',
      'Generación de música básica',
      'Calidad estándar',
      'Librería personal (10 tracks)',
      'Soporte por email',
    ],
    cta: 'Comenzar Gratis',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 19.99, annual: 15.99 },
    icon: Star,
    color: '#9b87f5',
    features: [
      'Tokens ilimitados',
      'Todos los modelos de IA',
      'Generación de imágenes y video',
      'Mastering prioritario (Neve/SSL)',
      'Librería ilimitada',
      'Voz TTS con ElevenLabs',
      'Soporte prioritario 24/7',
      'API access (1000 calls/mes)',
    ],
    cta: 'Empezar Pro',
    popular: true,
  },
  {
    id: 'studio',
    name: 'Studio',
    price: { monthly: 49.99, annual: 39.99 },
    icon: Building2,
    color: '#F5A623',
    features: [
      'Todo lo de Pro',
      'Modelo GenAudius_V1 exclusivo',
      'Stems separados ilimitados',
      'Colaboración en equipo (5 seats)',
      'White-label disponible',
      'API ilimitada',
      'Manager de cuenta dedicado',
      'SLA 99.9% uptime',
    ],
    cta: 'Empezar Studio',
    popular: false,
  },
];

export default function PagePlans({ sessionUser, onBuyPlan, onLoginClick }) {
  const [billing, setBilling] = useState('monthly');
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleSelect = async (plan) => {
    if (plan.id === 'basic') return; // Free plan, no payment needed

    if (!sessionUser) {
      onLoginClick?.({ redirectAfter: 'plans' });
      return;
    }

    setLoading(plan.id);
    setError(null);

    try {
      const userId = localStorage.getItem('ga_user_id') || '';
      const res = await fetch('/api/backend/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
        body: JSON.stringify({
          plan_id: plan.id,
          billing_period: billing,
          success_url: `${window.location.origin}/?payment=success&plan=${plan.id}`,
          cancel_url: `${window.location.origin}/?payment=cancelled`,
        })
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.detail?.includes('Price ID')) {
        // Stripe not configured yet — use onBuyPlan callback for local checkout
        onBuyPlan?.({ plan: plan.id, billing, price: plan.price[billing], name: plan.name });
      } else {
        setError(data.detail || 'Error al iniciar el pago. Intenta de nuevo.');
      }
    } catch (err) {
      // Fallback to local checkout if backend unavailable
      onBuyPlan?.({ plan: plan.id, billing, price: plan.price[billing], name: plan.name });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-full bg-[#0b0b0c] p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-3">
          Elige tu Plan
        </h1>
        <p className="text-gray-400 text-sm font-bold">
          Crea música, imágenes y video con IA de nivel profesional
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className={`text-sm font-bold ${billing === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Mensual</span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
            className={`w-12 h-6 rounded-full transition-all relative ${billing === 'annual' ? 'bg-[#9b87f5]' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${billing === 'annual' ? 'left-7' : 'left-1'}`} />
          </button>
          <span className={`text-sm font-bold ${billing === 'annual' ? 'text-white' : 'text-gray-500'}`}>
            Anual <span className="text-[#9b87f5] text-xs ml-1">-20%</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-bold">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const price = plan.price[billing];
          const isLoading = loading === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`relative rounded-3xl p-6 border flex flex-col ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#1a1630] to-[#0f0d1a] border-[#9b87f5]/40'
                  : 'bg-[#141416] border-white/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9b87f5] text-white text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full">
                  Más Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}20`, border: `1px solid ${plan.color}40` }}>
                  <Icon size={20} style={{ color: plan.color }} />
                </div>
                <div>
                  <div className="text-white font-black text-lg">{plan.name}</div>
                  <div className="text-gray-500 text-xs font-bold uppercase">
                    {price === 0 ? 'Gratis para siempre' : `$${price}/mes`}
                  </div>
                </div>
              </div>

              {price > 0 && (
                <div className="mb-5">
                  <span className="text-4xl font-black text-white">${price}</span>
                  <span className="text-gray-500 text-sm font-bold">/mes</span>
                  {billing === 'annual' && (
                    <div className="text-xs text-[#9b87f5] font-bold mt-1">
                      Facturado anualmente (${(price * 12).toFixed(0)}/año)
                    </div>
                  )}
                </div>
              )}

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check size={14} className="shrink-0 mt-0.5" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(plan)}
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={plan.popular
                  ? { background: '#9b87f5', color: '#fff', boxShadow: '0 8px 24px rgba(155,135,245,0.3)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
                }
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {plan.id === 'basic' ? 'Plan Actual' : plan.cta}
              </button>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-gray-600 text-xs font-bold mt-8">
        Pagos seguros con Stripe · Cancela cuando quieras · Sin contratos
      </p>
    </div>
  );
}
