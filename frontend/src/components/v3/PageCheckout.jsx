/**
 * Gen Audius v1.0 — PageCheckout
 * ================================
 * Payment form for selected plan.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Lock, Check, AlertCircle, Sparkles } from 'lucide-react';

const PLAN_DETAILS = {
  free:   { name: 'Free',   monthlyPrice: 0,    annualPrice: 0 },
  pro:    { name: 'Pro',    monthlyPrice: 12,   annualPrice: 9.6 },
  studio: { name: 'Studio', monthlyPrice: 29,   annualPrice: 23.2 },
};

export default function PageCheckout({ selectedPlan, onBack, sessionUser }) {
  const [billing, setBilling] = useState(selectedPlan?.billing || 'monthly');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const plan = PLAN_DETAILS[selectedPlan?.plan?.id] || PLAN_DETAILS.pro;
  const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  const annualTotal = (plan.annualPrice * 12).toFixed(2);

  // Format card number with spaces
  const handleCardNumber = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setExpiry(raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw);
  };

  const handlePurchase = async () => {
    setError(null);
    if (!cardNumber || !expiry || !cvc || !cardName) {
      setError('Por favor completa todos los campos de pago.');
      return;
    }
    setProcessing(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-full bg-[#0b0b0c] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-[#9b87f5]/20 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 bg-[#9b87f5]/10 border border-[#9b87f5]/30 rounded-full flex items-center justify-center">
              <Check size={40} className="text-[#9b87f5]" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-3">
            ¡Pago Exitoso!
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Tu plan <span className="text-white font-bold">{plan.name}</span> ha sido activado.
            Disfruta de todas las funciones premium.
          </p>
          <button
            onClick={() => onBack('generate')}
            className="w-full h-12 bg-[#9b87f5] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-[#9b87f5]/25"
          >
            <Sparkles size={16} /> Empezar a Crear
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#0b0b0c] px-8 py-12 overflow-y-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => onBack('plans')}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors mb-10"
        >
          <ArrowLeft size={14} /> Volver a Planes
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* Left: Payment Form */}
          <div className="md:col-span-3 space-y-5">
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">Datos de Pago</h1>
              <p className="text-gray-500 text-xs mt-1">Transacción segura y encriptada</p>
            </div>

            {/* Billing toggle */}
            <div className="bg-[#141416] border border-white/5 rounded-2xl p-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-3">Facturación</label>
              <div className="flex gap-2">
                {['monthly', 'annual'].map(b => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase border transition-all ${
                      billing === b
                        ? 'bg-[#9b87f5]/20 border-[#9b87f5] text-white'
                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {b === 'monthly' ? 'Mensual' : (
                      <span className="flex items-center justify-center gap-2">
                        Anual <span className="text-green-400 text-[9px]">−20%</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Card fields */}
            <div className="bg-[#141416] border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard size={16} className="text-[#9b87f5]" />
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Tarjeta de Crédito / Débito</label>
              </div>

              {/* Card number */}
              <div>
                <label className="text-xs text-gray-600 font-bold uppercase mb-1.5 block">Número de Tarjeta</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumber}
                  placeholder="1234 5678 9012 3456"
                  className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 outline-none focus:border-[#9b87f5]/40 font-mono tracking-widest"
                />
              </div>

              {/* Expiry + CVC row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-bold uppercase mb-1.5 block">Vencimiento</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiry}
                    placeholder="MM/AA"
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 outline-none focus:border-[#9b87f5]/40 font-mono tracking-widest"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-bold uppercase mb-1.5 block">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={e => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 outline-none focus:border-[#9b87f5]/40 font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Name on card */}
              <div>
                <label className="text-xs text-gray-600 font-bold uppercase mb-1.5 block">Nombre en la Tarjeta</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="NOMBRE APELLIDO"
                  className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-white/15 outline-none focus:border-[#9b87f5]/40 uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-xs font-bold">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handlePurchase}
              disabled={processing}
              className="w-full h-14 bg-gradient-to-r from-[#9b87f5] to-[#7c62f2] text-white rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#9b87f5]/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando…
                </span>
              ) : (
                <>
                  <Lock size={16} />
                  Completar Compra — ${billing === 'annual' ? annualTotal : price.toFixed(2)}
                  {billing === 'annual' ? '/año' : '/mes'}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-gray-700 text-xs">
              <Lock size={11} />
              <span>Pago seguro con cifrado SSL de 256 bits</span>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-[#141416] border border-white/5 rounded-2xl p-6 sticky top-0">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-5">Resumen del Pedido</h3>

              <div className="flex items-center gap-3 pb-5 border-b border-white/5 mb-5">
                <div className="w-10 h-10 bg-[#9b87f5]/10 border border-[#9b87f5]/20 rounded-xl flex items-center justify-center">
                  <Sparkles size={18} className="text-[#9b87f5]" />
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase">{plan.name}</p>
                  <p className="text-gray-500 text-xs capitalize">{billing === 'annual' ? 'Plan Anual' : 'Plan Mensual'}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">Precio base</span>
                  <span className="text-white font-bold">${billing === 'annual' ? (plan.monthlyPrice * 12).toFixed(2) : plan.monthlyPrice.toFixed(2)}</span>
                </div>
                {billing === 'annual' && (
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400 font-bold">Descuento anual (20%)</span>
                    <span className="text-green-400 font-bold">−${((plan.monthlyPrice - plan.annualPrice) * 12).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">IVA</span>
                  <span className="text-white font-bold">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-white font-black text-sm uppercase">Total</span>
                <div className="text-right">
                  <p className="text-white font-black text-xl">
                    ${billing === 'annual' ? annualTotal : price.toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-xs">{billing === 'annual' ? 'por año' : 'por mes'}</p>
                </div>
              </div>

              {/* Logged in as */}
              {sessionUser && (
                <div className="mt-5 pt-5 border-t border-white/5">
                  <p className="text-xs text-gray-600 font-medium">Cuenta:</p>
                  <p className="text-xs text-white font-bold truncate">{sessionUser.email || sessionUser.username}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
