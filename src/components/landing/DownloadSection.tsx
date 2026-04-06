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
            <div className="relative bg-[var(--brand)]/5 p-12 lg:p-20 overflow-hidden flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: 10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Desktop Preview */}
                <div className="relative w-full max-w-[400px] h-[300px] bg-zinc-900 rounded-xl border-4 border-zinc-100 shadow-2xl dark:border-zinc-800 overflow-hidden">
                  <div className="h-6 bg-zinc-100 flex items-center px-4 dark:bg-zinc-800">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-red-400" />
                      <div className="h-2 w-2 rounded-full bg-yellow-400" />
                      <div className="h-2 w-2 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                    <div className="h-4 w-1/3 bg-[var(--brand)] rounded" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-zinc-100 rounded-lg dark:bg-zinc-800" />
                      <div className="h-24 bg-zinc-100 rounded-lg dark:bg-zinc-800" />
                      <div className="h-24 bg-zinc-100 rounded-lg dark:bg-zinc-800" />
                      <div className="h-24 bg-zinc-100 rounded-lg dark:bg-zinc-800" />
                    </div>
                  </div>
                </div>

                {/* Floating Download Indicator */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 flex flex-col items-center gap-2 dark:bg-black dark:border-zinc-800"
                >
                  <div className="h-10 w-10 bg-[var(--brand)] rounded-full flex items-center justify-center text-white">
                    <Download size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Fast Download</span>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
