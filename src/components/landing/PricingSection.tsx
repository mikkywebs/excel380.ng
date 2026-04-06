"use client";

import React from "react";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { motion } from "framer-motion";
import { Check, Star, Users, Zap } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

export function PricingSection() {
  const { config, loading } = useAppConfig();

  if (loading || !config) {
    return <section className="py-24 bg-white animate-pulse h-[600px] dark:bg-black" />;
  }

  const { subscription_plans } = config;

  const tiers = [
    {
      name: "Explorer",
      price: "Free",
      period: "Forever",
      credits: config.free_credits,
      features: [
        "100 Free Practice Credits",
        "JAMB, WAEC & NECO access",
        "Limited Offline Mode",
        "Standard Analytics",
        "Community Support",
      ],
      cta: "Get Started",
      highlight: false,
      icon: <Zap className="h-6 w-6" />,
    },
    {
      name: subscription_plans.scholar_6m?.label || "Scholar",
      price: `₦${subscription_plans.scholar_6m?.price.toLocaleString()}`,
      period: "6 Months",
      credits: "Unlimited",
      features: [
        "Unlimited Practice Sessions",
        "Full Offline Desktop App",
        "AI-Powered Performance Insights",
        "Priority Support",
        "Previous Year Questions",
      ],
      cta: "Go Scholar",
      highlight: false,
      icon: <Star className="h-6 w-6" />,
    },
    {
      name: subscription_plans.academy_6m?.label || "Academy",
      price: `₦${subscription_plans.academy_6m?.price.toLocaleString()}`,
      period: "6 Months / Institution",
      credits: "Unlimited",
      features: [
        `Up to ${config.max_institution_students} Students`,
        "Institutional Control Panel",
        "Batch Result Analysis",
        "Custom Mock Examinations",
        "Student Progress Tracking",
      ],
      cta: "Register Academy",
      highlight: true,
      icon: <Users className="h-6 w-6" />,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-black transition-colors">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl"
          >
            Flexible <span className="text-[var(--brand)]">Pricing</span> for Everyone
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-zinc-600 dark:text-zinc-400"
          >
            Choose the plan that fits your preparation needs. From individual students to full secondary schools.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={clsx(
                "relative flex flex-col p-8 rounded-3xl border transition-all hover:translate-y-[-8px]",
                tier.highlight
                  ? "bg-[var(--brand)] border-[var(--brand)] shadow-2xl shadow-[var(--brand)]/20 scale-105 z-10"
                  : "bg-white border-zinc-100 shadow-xl shadow-zinc-200/50 dark:bg-zinc-950 dark:border-zinc-900 dark:shadow-none"
              )}
            >
              {tier.highlight && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-zinc-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase dark:bg-white dark:text-black">
                  Most Popular
                </div>
              )}

              <div className={clsx("h-12 w-12 rounded-2xl flex items-center justify-center mb-6", tier.highlight ? "bg-white text-[var(--brand)]" : "bg-[var(--brand)]/10 text-[var(--brand)]")}>
                {tier.icon}
              </div>

              <h3 className={clsx("text-2xl font-bold mb-2", tier.highlight ? "text-white" : "text-zinc-900 dark:text-zinc-50")}>
                {tier.name}
              </h3>
              
              <div className="mb-8">
                <span className={clsx("text-4xl font-black", tier.highlight ? "text-white" : "text-zinc-900 dark:text-zinc-50")}>
                  {tier.price}
                </span>
                <span className={clsx("text-sm font-medium ml-1", tier.highlight ? "text-white/70" : "text-zinc-500")}>
                  / {tier.period}
                </span>
              </div>

              <ul className="flex-1 flex flex-col gap-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={clsx("h-5 w-5 mt-0.5", tier.highlight ? "text-white" : "text-[var(--brand)]")} />
                    <span className={clsx("text-sm transition-colors", tier.highlight ? "text-white/90" : "text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50")}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={clsx(
                  "h-14 w-full rounded-2xl flex items-center justify-center text-lg font-bold transition-all active:scale-95",
                  tier.highlight
                    ? "bg-white text-[var(--brand)] hover:bg-zinc-50"
                    : "bg-[var(--brand)] text-white hover:opacity-90 shadow-lg shadow-[var(--brand)]/20"
                )}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
