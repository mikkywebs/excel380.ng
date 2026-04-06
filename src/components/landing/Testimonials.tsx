"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Chinedu Okafor",
      school: "University of Lagos Aspirant",
      improvement: "210 → 295 (JAMB)",
      content: "The offline mode was a lifesaver. I could practice in the village without internet. Highly recommended!",
      image: "CO",
    },
    {
      name: "Aminat Bello",
      school: "Queen's College, Lagos",
      improvement: "5 B's → 7 A's (WAEC)",
      content: "The explanations for each question are so detailed. It's like having a personal tutor at home.",
      image: "AB",
    },
    {
      name: "Tunde Williams",
      school: "Government Secondary School, Abuja",
      improvement: "185 → 270 (JAMB)",
      content: "Excel 380 is the most realistic CBT engine I've used. It gave me the confidence I needed for D-day.",
      image: "TW",
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl"
          >
            Success <span className="text-[var(--brand)]">Stories</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-zinc-600 dark:text-zinc-400"
          >
            Join thousands of students who have transformed their exam results with Excel 380.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testi, idx) => (
            <motion.div
              key={testi.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 flex flex-col dark:bg-zinc-950 dark:border-zinc-900"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <Quote className="h-10 w-10 text-[var(--brand)]/10 mb-4" />

              <p className="text-lg text-zinc-700 dark:text-zinc-300 italic mb-8 flex-1">
                "{testi.content}"
              </p>

              <div className="flex items-center gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-900">
                <div className="h-12 w-12 bg-[var(--brand)] rounded-full flex items-center justify-center text-white font-bold">
                  {testi.image}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-900 dark:text-zinc-50">{testi.name}</span>
                  <span className="text-xs text-zinc-500 font-medium">{testi.school}</span>
                  <span className="text-xs font-bold text-[var(--brand)] mt-1">{testi.improvement}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
