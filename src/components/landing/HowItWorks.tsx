"use client";

import React from "react";
import { motion } from "framer-motion";
import { UserPlus, BookOpen, BarChart3, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus className="h-8 w-8 text-white" />,
      title: "Create Account",
      desc: "Sign up and get 100 free credits to start your practice journey immediately.",
      color: "bg-blue-500",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-white" />,
      title: "Select Subjects",
      desc: "Choose from 20+ subjects tailored for JAMB, WAEC, NECO, and NABTEB syllabuses.",
      color: "bg-[var(--brand)]",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      title: "Analyze Results",
      desc: "Track your performance with detailed analytics and improve your weak areas.",
      color: "bg-purple-500",
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl"
          >
            How it <span className="text-[var(--brand)]">Works</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-zinc-600 dark:text-zinc-400"
          >
            Get ready for your exams in three simple steps. Our platform is designed to be intuitive and effective.
          </motion.p>
        </div>

        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          {/* Connecting Line (Desktop) */}
          <div className="absolute top-12 left-1/3 right-1/3 h-0.5 bg-zinc-100 hidden lg:block dark:bg-zinc-800" />
          
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Icon Container */}
              <div className={`h-24 w-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-[var(--brand)]/10 ring-8 ring-zinc-50 dark:ring-zinc-900 transition-transform group-hover:scale-110 group-hover:rotate-3 ${step.color}`}>
                {step.icon}
              </div>

              {/* Mobile Arrow */}
              {idx < 2 && (
                <div className="lg:hidden mb-12 animate-bounce">
                  <ArrowRight size={24} className="text-zinc-300 rotate-90" />
                </div>
              )}

              <h3 className="text-2xl font-bold text-zinc-900 mb-4 dark:text-zinc-50">
                {step.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed px-4">
                {step.desc}
              </p>

              {/* Step indicator */}
              <div className="absolute -top-4 -left-4 text-6xl font-black text-zinc-50 dark:text-zinc-900 -z-10 select-none">
                0{idx + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
