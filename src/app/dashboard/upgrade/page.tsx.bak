"use client";

import React, { useEffect, useState, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import { CheckCircle2, Zap, Shield, Crown, GraduationCap, Loader2, Star, X } from 'lucide-react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PLANS = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: 0,
    priceDisplay: 'Free',
    period: 'forever',
    color: 'border-border',
    highlight: false,
    features: ['100 free credits','JAMB & WAEC past questions','Basic score report','3 subjects per session']
  },
  {
    id: 'scholar',
    name: 'Scholar',
    price: 150000,
    priceDisplay: '₦1,500',
    period: 'per month',
    color: 'border-primary',
    highlight: true,
    features: ['Unlimited practice sessions','All exam bodies','Full question review','Performance analytics','All subjects']
  },
  {
    id: 'scholar_pro',
    name: 'Scholar Pro',
    price: 350000,
    priceDisplay: '₦3,500',
    period: 'per month',
    color: 'border-amber-400',
    highlight: false,
    features: ['Everything in Scholar','20 years past questions','AI performance analysis','Mock exam simulations','Priority support','Offline access']
  },
];

export default function UpgradePage() {
  const { user, userDoc, isPaid } = useAuth();
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Star className="h-10 w-10 text-primary fill-primary" />
      </div>
      <h1 className="text-3xl font-black mb-2">You're now a {successPlan}! �</h1>
      <p className="text-muted-foreground max-w-md mb-8">Your subscription is active. All premium features are unlocked.</p>
      <a href="/dashboard" className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90">
        Go to Dashboard
      </a>
    </div>
  );

  return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-black tracking-tighter">Choose Your Edge</h1>
        <p className="text-muted-foreground text-lg uppercase font-bold tracking-widest text-xs opacity-60">Unlock your potential with premium tools.</p>
      </motion.div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium"
        >
          <X className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {PLANS.map((plan, idx) => {
          const isCurrent = plan.id === currentTier;
          const isPaying = payingPlanId === plan.id;
          const icons = {
            explorer: <GraduationCap className="h-8 w-8" />,
            scholar: <Zap className="h-8 w-8" />,
            scholar_pro: <Crown className="h-8 w-8" />
          };

          const cardStyles = plan.highlight 
            ? "border-primary/50 bg-primary/5 shadow-2xl shadow-primary/10" 
            : "border-border/50 bg-card/50 backdrop-blur-xl shadow-sm";

          return (
            <motion.div 
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative flex flex-col rounded-3xl border-2 p-8 transition-all hover:-translate-y-2 ${cardStyles}`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-5 py-1.5 bg-green-500 text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <CheckCircle2 size={12} />
                    Active Plan
                  </span>
                </div>
              )}

              {plan.highlight && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-5 py-1.5 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                    Best Value
                  </span>
                </div>
              )}

              <div className={`p-4 rounded-2xl w-fit mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3 ${plan.id === 'scholar_pro' ? "bg-amber-400/10 text-amber-500" : plan.highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                {icons[plan.id as keyof typeof icons] || icons.explorer}
              </div>

              <h3 className="text-2xl font-black tracking-tight mb-1">{plan.name}</h3>
              <p className="text-xs text-muted-foreground font-medium mb-6 uppercase tracking-wider opacity-60">
                {plan.id === 'explorer' ? 'Perfect for starters' : plan.id === 'scholar' ? 'For active learners' : 'The ultimate experience'}
              </p>

              <div className="mb-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tabular-nums tracking-tighter">{plan.priceDisplay}</span>
                  {plan.price > 0 && <span className="text-muted-foreground font-bold opacity-60">/mo</span>}
                </div>
                {isCurrent && expiryDate && (
                  <p className="text-[10px] font-bold text-green-600 mt-2 uppercase tracking-widest">Renews {expiryDate}</p>
                )}
              </div>

              <ul className="space-y-4 flex-1 mb-10">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <div className="h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full py-4 text-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 text-sm font-black uppercase tracking-widest cursor-default">
                  Currently Active
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isPaying}
                  className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl ${
                    plan.highlight 
                    ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20" 
                    : "bg-foreground text-background hover:opacity-90 shadow-foreground/10"
                  }`}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Securing...
                    </>
                  ) : (
                    <>Get Started</>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      
      <div className="flex flex-col items-center gap-6 pt-12">
        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">
          <div className="h-px w-12 bg-border" />
          Secured by Paystack
          <div className="h-px w-12 bg-border" />
        </div>
        
        <p className="text-xs text-muted-foreground/60 max-w-sm text-center font-medium leading-relaxed">
          By upgrading, you agree to our Terms of Service. 
          Subscriptions can be managed or canceled in your account settings.
        </p>
      </div>
    </div>
  );
}
