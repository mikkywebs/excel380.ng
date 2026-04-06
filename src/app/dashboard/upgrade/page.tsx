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
          await httpsCallable(functions, 'verifyPaystackPayment')({ reference: res.reference, plan: plan.id });
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
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Upgrade Your Plan</h1>
        <p className="text-muted-foreground mt-1">Choose the plan that fits your exam goals.</p>
      </div>
      
      <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
        <Shield className="h-5 w-5 text-primary shrink-0" />
        <div>
          <p className="text-sm font-bold">
            Current Plan: <span className="text-primary capitalize">{currentTier.replace('_', ' ')}</span>
          </p>
          {expiryDate && <p className="text-xs text-muted-foreground mt-0.5">Renews on {expiryDate}</p>}
        </div>
      </div>
      
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <X className="h-4 w-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => {
          const isCurrent = plan.id === currentTier;
          const isPaying = payingPlanId === plan.id;
          const icons = {
            explorer: <GraduationCap className="h-6 w-6" />,
            scholar: <Zap className="h-6 w-6" />,
            scholar_pro: <Crown className="h-6 w-6" />
          };
          return (
            <div key={plan.id} className={`relative bg-card rounded-2xl border-2 p-6 shadow-sm flex flex-col ${plan.color}${plan.highlight ? " shadow-primary/20 shadow-lg" : ""}`}>
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-primary text-white text-xs font-black rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div className={`p-3 rounded-xl w-fit mb-4 ${plan.highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {icons[plan.id as keyof typeof icons] || icons.explorer}
              </div>
              <h3 className="text-xl font-black">{plan.name}</h3>
              <div className="my-4">
                <span className="text-3xl font-black">{plan.priceDisplay}</span>
                {plan.price > 0 && <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>}
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="w-full py-3 text-center rounded-xl bg-muted text-muted-foreground text-sm font-bold">
                  Current Plan
                </div>
              ) : plan.price === 0 ? (
                <div className="w-full py-3 text-center rounded-xl border border-border text-sm font-bold text-muted-foreground">
                  Free Forever
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  className={`w-full py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${plan.highlight ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25" : "bg-foreground text-background hover:bg-foreground/90"}`}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Upgrade to {plan.name}</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Payments processed securely by Paystack. Cancel anytime.
      </p>
    </div>
  );
}
