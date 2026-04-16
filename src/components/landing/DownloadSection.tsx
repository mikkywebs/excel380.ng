"use client";

import React from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone, Download, CheckCircle2 } from "lucide-react";

export function DownloadSection() {
  const benefits = [
    "No internet required for practice",
    "Exactly like the real JAMB portal",
    "Auto-sync progress when online",
    "Lifetime updates for year 2026",
  ];

  return (
    <section id="download" className="py-24 bg-zinc-50 dark:bg-black transition-colors overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="bg-white dark:bg-zinc-950 rounded-[3rem] border border-zinc-100 dark:border-zinc-900 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Content */}
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl mb-6"
              >
                Go <span className="text-[var(--brand)]">Offline</span>. <br />
                Excellence Anywhere.
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-zinc-600 dark:text-zinc-400 mb-8"
              >
                Don't let poor internet stop your dreams. Use Excel 380 on your Windows PC or Android phone completely offline.
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {benefits.map((benefit, idx) => (
                  <motion.div 
                    key={benefit} 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (idx * 0.1) }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/download/windows"
                  className="flex h-14 items-center justify-center rounded-2xl bg-zinc-900 px-8 text-lg font-bold text-white transition-all hover:bg-zinc-800 active:scale-95 shadow-xl shadow-zinc-900/10 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100"
                >
                  <Monitor className="mr-3 h-6 w-6" />
                  Download for PC
                </a>
                <a
                  href="/download/android"
                  className="flex h-14 items-center justify-center rounded-2xl border-2 border-zinc-200 px-8 text-lg font-bold text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900 active:scale-95"
                >
                  <Smartphone className="mr-3 h-6 w-6" />
                  Get Android App
                </a>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative bg-[var(--brand)]/5 overflow-hidden flex items-center justify-center min-h-[400px]">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="w-full h-full"
              >
                {/* CBT Center Image - Expanded to fill more space */}
                <div className="relative w-full h-full shadow-2xl overflow-hidden border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                  <img 
                    src="/images/cbt-center.jpg" 
                    alt="Students practicing on Excel 380 CBT software" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
