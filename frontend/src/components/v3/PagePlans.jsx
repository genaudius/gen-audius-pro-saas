/**
 * Gen Audius v1.0 — PagePlans (Subscribe)
 * ========================================
 * Pricing page with monthly/annual toggle.
 * Buy button → redirects to Stripe hosted checkout.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Star, Crown, ArrowRight, ExternalLink } from 'lucide-react';

// ── Stripe payment links ──────────────────────────────────────────────────────
// Replace these with your real Stripe payment links from the Stripe Dashboard.
// Set cancel_url in each Stripe link to: https://yourdomain.com/subscribe
const STRIPE_LINKS = {
  pro: {
    monthly: 'https://buy.stripe.com/test_pro_monthly',   // ← replace
    annual:  'https://buy.stripe.com/test_pro_annual',    // ← replace
  },
  studio: {
    monthly: 'https://buy.stripe.com/test_studio_monthly', // ← replace
    annual:  'https://buy.stripe.com/test_studio_annual',  // ← replace
  },
};

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    color: '#6b7280',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Empieza a crear sin costo. Perfecto para explorar.',
    features: [
      '10 generaciones / mes',
      'Música en calidad estándar',
      'Acceso a todos los géneros',
      'Librería personal hasta 20 tracks',
      'Soporte por comunidad',
    ],
    disabledFeatures: [
      'Descarga sin marca de agua',
      'Modelos Premium V7.5',
      'Uso comercial',
      'Studio Pro & Mastering',
    ],
    cta: 'Comenzar Gratis',
    isFree: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Star,
    color: '#9b87f5',
    monthlyPrice: 12,
    annualPrice: 9.6,
    description: 'Para creadores que necesitan más potencia y calidad.',
    popular: true,
    features: [
      '150 generaciones / mes',
      'Música en alta calidad (WAV)',
      'Descarga sin marca de agua',
      'Modelos Premium V7.5',
      'Librería personal hasta 500 tracks',
      'Generación de imágenes & letras',
      'Soporte prioritario',
    ],
    disabledFeatures: [
      'Uso comercial completo',
      'Studio Pro & Mastering',
    ],
    cta: 'Subscribe Pro',
    isFree: false,
  },
  {
    id: 'studio',
    name: 'Studio',
    icon: Crown,
    color: '#F5A623',
    monthlyPrice: 29,
    annualPrice: 23.2,
    description: 'Para profesionales y estudios que exigen lo mejor.',
    features: [
      'Generaciones ilimitadas',
      'Máxima calidad (WAV + Stems)',
      'Descarga sin marca de agua',
      'Todos los modelos incluyendo V8',
      'Librería ilimitada',
      'Uso comercial completo',
      'Studio Pro & Mastering Pro',
      'API Access',
      'Soporte dedicado 24/7',
    ],
    disabledFeatures: [],
    cta: 'Subscribe Studio',
    isFree: false,
  },
];

export default function PagePlans({ sessionUser, onLoginClick }) {
  const [billing, setBilling] = useState('monthly');

  const getPrice = (plan) => {
    if (plan.isFree) return 0;
    return billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  };

  const handleBuy = (plan) => {
    if (plan.isFree) return;
    if (!sessionUser) {
      // Not logged in → open login/register, then return to Subscribe page
      onLoginClick({ redirectAfter: 'plans' });
      return;
    }
    // Logged in → redirect to Stripe hosted checkout (same tab)
    const stripeUrl = STRIPE_LINKS[plan.id]?.[billing];
    if (stripeUrl) {
      window.location.href = stripeUrl;
    } else {
      alert('Stripe link not configured yet. Add your Stripe payment link in PagePlans.jsx → STRIPE_LINKS.');
    }
  };

  return (
    <div className="min-h-full bg-[#0b0b0c] px-8 py-12 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block bg-[#9b87f5]/10 border border-[#9b87f5]/20 text-[#9b87f5] text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-5">
          Subscribe
        </span>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
          Elige tu <span className="text-[#9b87f5]">Plan ADN</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium max-w-md mx-auto">
          Crea música, imágenes, videos y más con inteligencia artificial de última generación.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setBilling('monthly')}
            className={`text-sm font-black uppercase tracking-widest transition-colors ${billing === 'monthly' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
            className={`relative w-14 h-7 rounded-full transition-all ${billing === 'annual' ? 'bg-[#9b87f5]' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${billing === 'annual' ? 'left-8' : 'left-1'}`} />
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${billing === 'annual' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Anual
            <span className="bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              −20% OFF
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const price = getPrice(plan);
          const isPopular = plan.popular;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative flex flex-col rounded-3xl border p-7 transition-all ${
                isPopular
                  ? 'bg-[#141416] border-[#9b87f5]/50 shadow-xl shadow-[#9b87f5]/10'
                  : 'bg-[#141416]/60 border-white/5 hover:border-white/10'
              }`}
            >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#9b87f5] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-[#9b87f5]/30">
                    Más Popular
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${plan.color}18`, border: `1px solid ${plan.color}30` }}
                >
                  <Icon size={22} style={{ color: plan.color }} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{plan.name}</h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-white/5">
                {plan.isFree ? (
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">$0</span>
                    <span className="text-gray-500 text-sm mb-1 font-bold">/siempre</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black text-white">${price.toFixed(2)}</span>
                      <span className="text-gray-500 text-sm mb-1 font-bold">/mes</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-green-400 text-xs font-bold mt-1">
                        Facturado anualmente — ${(price * 12).toFixed(2)}/año
                      </p>
                    )}
                    {billing === 'monthly' && (
                      <p className="text-gray-600 text-xs mt-1">
                        o ${plan.annualPrice.toFixed(2)}/mes con plan anual
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="flex-1 space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check size={14} className="shrink-0 mt-0.5" style={{ color: plan.color }} />
                    <span className="text-xs text-gray-300 font-medium">{f}</span>
                  </div>
                ))}
                {plan.disabledFeatures.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 opacity-30">
                    <Check size={14} className="shrink-0 mt-0.5 text-gray-600" />
                    <span className="text-xs text-gray-500 font-medium line-through">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleBuy(plan)}
                disabled={plan.isFree && !!sessionUser}
                className={`w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  plan.isFree
                    ? 'bg-white/5 text-gray-500 border border-white/5 cursor-default'
                    : isPopular
                    ? 'bg-[#9b87f5] text-white shadow-lg shadow-[#9b87f5]/25 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-white/10 text-white border border-white/10 hover:bg-white/15 active:scale-[0.98]'
                }`}
              >
                {plan.isFree && sessionUser ? 'Plan Actual' : plan.cta}
                {!plan.isFree && <ExternalLink size={13} />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-gray-700 text-xs mt-10 font-medium">
        Todos los planes incluyen acceso a la plataforma Gen Audius Pro.
        Cancela en cualquier momento. Sin compromisos.
      </p>
    </div>
  );
}
