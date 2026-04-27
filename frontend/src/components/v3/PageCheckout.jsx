/**
 * Gen Audius — PageCheckout
 * Redirects to Stripe Checkout or shows success/cancel state
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, CreditCard, ArrowLeft } from 'lucide-react';

export default function PageCheckout({ selectedPlan, sessionUser, onBack }) {
  const [status, setStatus] = useState('idle'); // idle | loading | success | cancelled | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check URL params for Stripe redirect result
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const plan = params.get('plan');

    if (payment === 'success') {
      setStatus('success');
      setMessage(plan ? `Plan ${plan} activado correctamente.` : 'Suscripción activada.');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'cancelled') {
      setStatus('cancelled');
      setMessage('Pago cancelado. Puedes intentarlo de nuevo cuando quieras.');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (selectedPlan) {
      // Initiate checkout
      initiateCheckout();
    }
  }, []);

  const initiateCheckout = async () => {
    if (!selectedPlan || !sessionUser) {
      setStatus('error');
      setMessage('Sesión inválida. Por favor inicia sesión de nuevo.');
      return;
    }

    setStatus('loading');

    try {
      const userId = localStorage.getItem('ga_user_id') || '';
      const res = await fetch('/api/backend/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-ID': userId },
        body: JSON.stringify({
          plan_id: selectedPlan.plan,
          billing_period: selectedPlan.billing || 'monthly',
          success_url: `${window.location.origin}/?payment=success&plan=${selectedPlan.plan}`,
          cancel_url: `${window.location.origin}/?payment=cancelled`,
        })
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setStatus('error');
        setMessage(data.detail || 'Error al iniciar el pago. Contacta soporte@genaudius.com');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error de conexión. Verifica tu internet e intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-full bg-[#0b0b0c] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-[#141416] border border-white/5 rounded-3xl p-8 text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-[#9b87f5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={32} className="text-[#9b87f5] animate-spin" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Redirigiendo a Stripe</h2>
            <p className="text-gray-400 text-sm">Preparando tu pago seguro…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">¡Pago Exitoso!</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <button
              onClick={() => onBack?.('generate')}
              className="w-full py-3 bg-[#9b87f5] text-white rounded-xl font-black text-sm uppercase tracking-widest"
            >
              Empezar a Crear
            </button>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-yellow-400" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Pago Cancelado</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => onBack?.('plans')}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <ArrowLeft size={14} /> Ver Planes
              </button>
              <button
                onClick={initiateCheckout}
                className="flex-1 py-3 bg-[#9b87f5] text-white rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <CreditCard size={14} /> Reintentar
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Error de Pago</h2>
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            <button
              onClick={() => onBack?.('plans')}
              className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm uppercase tracking-widest"
            >
              Volver a Planes
            </button>
          </>
        )}

        {status === 'idle' && (
          <>
            <div className="w-16 h-16 bg-[#9b87f5]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard size={32} className="text-[#9b87f5]" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Checkout</h2>
            <p className="text-gray-400 text-sm mb-6">
              {selectedPlan ? `Plan ${selectedPlan.name} — $${selectedPlan.price}/mes` : 'Selecciona un plan para continuar'}
            </p>
            {selectedPlan ? (
              <button
                onClick={initiateCheckout}
                className="w-full py-3 bg-[#9b87f5] text-white rounded-xl font-black text-sm uppercase tracking-widest"
              >
                Pagar con Stripe
              </button>
            ) : (
              <button
                onClick={() => onBack?.('plans')}
                className="w-full py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-sm uppercase tracking-widest"
              >
                Ver Planes
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
