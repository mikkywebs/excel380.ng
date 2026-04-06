"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the offline mode work?",
      answer: "Our desktop (PC) and mobile apps allow you to download all questions and exam bodies once. After that, you can practice without any data connection. Your results will automatically sync to your account the next time you're online.",
    },
    {
      question: "Which exam bodies are supported?",
      answer: "Excel 380 currently supports JAMB (UTME), WAEC (SSCE), NECO (SSCE), and NABTEB. We provide recent past questions and simulated mock exams for all subjects.",
    },
    {
      question: "How do I get more credits?",
      answer: "You start with 100 free credits. Once exhausted, you can upgrade to a Scholar or Scholar Pro plan for unlimited access, or purchase credit bundles through your dashboard.",
    },
    {
      question: "Can I use Excel 380 for my school?",
      answer: "Yes! Our Academy plan is designed for schools and CBT centers. It allows you to manage students, conduct internal mock exams, and track the progress of your entire class.",
    },
    {
      question: "Is the interface exactly like the real JAMB portal?",
      answer: "Yes, our CBT engine is meticulously designed to replicate the exact look, feel, and functionality of the official JAMB portal to build maximum confidence.",
    },
    {
      question: "Which payment methods do you accept?",
      answer: "We use Paystack to process payments securely. You can pay using your debit card, bank transfer, USSD, or any mobile money platform supported in Nigeria.",
    },
  ];

  return (
    <section className="py-24 bg-zinc-50 dark:bg-black transition-colors">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl"
          >
            Got <span className="text-[var(--brand)]">Questions</span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-zinc-600 dark:text-zinc-400"
          >
            We've answered the most common questions from students and educators.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-zinc-100 rounded-2xl overflow-hidden dark:bg-zinc-950 dark:border-zinc-900"
            >
              <button
                className="w-full p-6 text-left flex items-start justify-between gap-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{faq.question}</span>
                <div className="mt-1 text-zinc-400">
                  {openIdx === idx ? <Minus size={20} /> : <Plus size={20} />}
                </div>
              </button>

              <AnimatePresence>
                {openIdx === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-zinc-600 leading-relaxed border-t border-zinc-50 dark:border-zinc-900 dark:text-zinc-400">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
