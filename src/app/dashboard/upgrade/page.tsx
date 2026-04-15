"use client";

import React, { useEffect, useState, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Crown, GraduationCap, Loader2, Star, X, Building2 } from 'lucide-react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function UpgradePage() {
  const { user, userDoc } = useAuth();
  const { config } = useAppConfig();
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.async = true;
    document.head.appendChild(s);
    loaded.current = true;
  }, []);

  const currentTier = userDoc?.subscription_tier ?? 'explorer';
  const expiryDate = userDoc?.subscription_expiry?.toDate ? format(userDoc.subscription_expiry.toDate(), 'MMMM d, yyyy') : null;
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '';

  const subscription_plans = config?.subscription_plans || {};

  const PLANS = [
    {
      id: 'explorer',
      name: 'Explorer',
      price: 0,
      priceDisplay: 'Free',
      period: 'forever',
      color: 'border-border',
      highlight: false,
      features: ['100 free credits','JAMB & WAEC past questions','Basic score report','Limited Offline Mode'],
      icon: <GraduationCap className="h-8 w-8" />
    },
    {
      id: 'scholar_6m',
      name: subscription_plans.scholar_6m?.label || 'Scholar',
      price: subscription_plans.scholar_6m?.price ? subscription_plans.scholar_6m.price * 100 : 300000,
      priceDisplay: `₦${subscription_plans.scholar_6m?.price?.toLocaleString() || '3,000'}`,
      period: '6 Months',
      color: 'border-primary',
      highlight: true,
      features: ['Unlimited practice sessions','Full Offline Desktop App','AI performance analysis','Priority support','All exam bodies'],
      icon: <Star className="h-8 w-8 text-white transition-transform group-hover:scale-110" />
    },
    {
      id: 'academy_6m',
      name: subscription_plans.academy_6m?.label || 'Academy',
      price: subscription_plans.academy_6m?.price ? subscription_plans.academy_6m.price * 100 : 5000000,
      priceDisplay: `₦${subscription_plans.academy_6m?.price?.toLocaleString() || '50,000'}`,
      period: '6 Months',
      color: 'border-amber-400',
      highlight: false,
      features: [`Up to ${config?.max_institution_students || 500} Students`,'Institutional Control Panel','Batch Result Analysis','Custom Mock Examinations','Student Progress Tracking'],
      icon: <Building2 className="h-8 w-8 transition-transform group-hover:scale-110" />
    },
  ];

  const handleUpgrade = (plan: any) => {
    setError(null);
    if (!user) {
      setError("User not found.");
      return;
    }
    setPayingPlanId(plan.id);
    const handler = window.PaystackPop?.setup({
      key: paystackKey,
      email: user.email,
      amount: plan.price,
      currency: 'NGN',
      ref: 'excel380-' + plan.id + '-' + user.uid + '-' + Date.now(),
      metadata: { userId: user.uid, plan: plan.id },
      onSuccess: async (res: any) => {
        try {
          await httpsCallable(functions, 'verifyPaystackPayment')({ 
            reference: res.reference, 
            plan: plan.id,
            user_uid: user.uid 
          });
          confetti({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#6366f1','#8b5cf6','#f59e0b','#10b981']
          });
          setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } }), 300);
          setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } }), 500);
          setSuccessPlan(plan.name);
        } catch {
          setError('Payment received but verification failed. Contact support with ref: ' + res.reference);
        } finally {
          setPayingPlanId(null);
        }
      },
      onClose: () => setPayingPlanId(null),
    });
    handler ? handler.openIframe() : (setError('Paystack failed to load. Refresh and try again.'), setPayingPlanId(null));
  };

  if (successPlan) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
        <Crown className="h-12 w-12 text-green-500" />
      </div>
      <h1 className="text-4xl font-black mb-3 text-zinc-900 dark:text-white tracking-tight">You're now a {successPlan}! 🎊</h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-10 text-lg">Your subscription is active and seamlessly synced across all your devices.</p>
      <a href="/dashboard" className="px-10 py-4 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-black tracking-widest text-sm uppercase rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
        Enter Dashboard
      </a>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2 mb-12 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">Choose Your Edge</h1>
        <p className="text-zinc-500 text-lg font-medium">Unlock your full academic potential with our premium tools.</p>
      </motion.div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 p-4 mb-8 bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium mx-auto max-w-2xl"
        >
          <X className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4 max-w-6xl mx-auto">
        {PLANS.map((plan, idx) => {
          // Normalize tiers. Current tier might be 'scholar' or 'explorer' or 'academy'. 
          // The IDs here are scholar_6m. To be safe, checking includes logic.
          const isCurrent = currentTier === plan.id || currentTier === plan.name.toLowerCase();
          const isPaying = payingPlanId === plan.id;

          const cardStyles = plan.highlight 
            ? "border-green-600 bg-green-50 shadow-2xl shadow-green-600/20 scale-105 z-10 dark:bg-green-950/20 dark:border-green-900/50" 
            : "border-zinc-200 bg-white shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none";

          return (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative flex flex-col rounded-[2.5rem] border-2 p-8 transition-all duration-300 hover:-translate-y-2 ${cardStyles}`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-6 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <CheckCircle2 size={14} />
                    Current Plan
                  </span>
                </div>
              )}

              {plan.highlight && !isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-6 py-2 bg-green-600 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`p-4 rounded-3xl w-16 h-16 flex items-center justify-center mb-8 shadow-inner ${plan.id === 'academy_6m' ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-500" : plan.highlight ? "bg-green-600 text-white shadow-green-600/30" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"}`}>
                {plan.icon}
              </div>

              <h3 className={`text-2xl font-black tracking-tight mb-2 ${plan.highlight ? "text-green-900 dark:text-green-50" : "text-zinc-900 dark:text-white"}`}>{plan.name}</h3>
              <p className={`text-xs font-bold mb-6 uppercase tracking-widest ${plan.highlight ? "text-green-600" : "text-zinc-400"}`}>
                {plan.id === 'explorer' ? 'Perfect for starters' : plan.id === 'scholar_6m' ? 'For active learners' : 'For secondary schools'}
              </p>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-black tabular-nums tracking-tighter ${plan.highlight ? "text-green-950 dark:text-white" : "text-zinc-900 dark:text-white"}`}>{plan.priceDisplay}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs font-bold uppercase tracking-widest ${plan.highlight ? "text-green-600/80" : "text-zinc-400"}`}>/ {plan.period}</span>
                  {isCurrent && expiryDate && (
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1"><Zap size={10} />Renews {expiryDate}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 flex-1 mb-10">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-4 text-sm font-bold text-zinc-600 dark:text-zinc-300">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span className="mt-0.5 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className={`w-full py-5 text-center rounded-2xl text-xs font-black uppercase tracking-widest cursor-default ${plan.highlight ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500"}`}>
                  Currently Active
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isPaying}
                  className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl ${
                    plan.highlight 
                    ? "bg-green-600 text-white hover:bg-green-500 shadow-green-600/20" 
                    : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 shadow-zinc-900/10"
                  }`}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>Upgrade to {plan.name}</>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex flex-col items-center gap-6 pt-16 pb-8">
        <div className="flex items-center gap-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          <div className="h-px w-16 bg-zinc-200 dark:bg-zinc-800" />
          Secured by Paystack
          <div className="h-px w-16 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        
        <p className="text-xs text-zinc-400 max-w-sm text-center font-medium leading-relaxed">
          By upgrading, you agree to our Terms of Service. 
          Subscriptions can be managed or canceled in your account settings at any time.
        </p>
      </div>
    </div>
  );
}
