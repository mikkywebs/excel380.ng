"use client";

import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Clock, ChevronRight, ChevronLeft, Send } from "lucide-react";

export function MockExamPreview() {
  return (
    <section className="py-24 bg-zinc-50 dark:bg-black/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-xl"
          >
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-zinc-50 leading-tight tracking-tighter mb-6">
              Realistic <span className="text-[var(--brand)]">CBT Engine</span> Built for Results.
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Practice exactly the way you'll be tested. Our exam engine mimics the latest JAMB and WAEC standards, complete with a live timer, subject navigation, and instant results.
            </p>
            
            <div className="space-y-4">
              {[
                "100% Mobile & Desktop Responsive",
                "Timed practice sessions (120 Mins)",
                "Instant Score & Detailed Analysis",
                "Works Offline on Mobile Apps"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30">
                    <CheckIcon />
                  </div>
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Phone Mockup Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[var(--brand)]/20 blur-[120px] rounded-full" />
            
            {/* Phone Container */}
            <div className="relative w-full max-w-[320px] aspect-[9/19] bg-zinc-950 rounded-[3rem] p-3 border-[6px] border-zinc-900 shadow-2xl overflow-hidden ring-4 ring-zinc-900/50 flex">
              {/* Screen Content */}
              <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-[2.2rem] overflow-hidden flex flex-col relative font-sans">
                
                {/* Header mimicking image */}
                <div className="h-14 border-b border-zinc-100 dark:border-zinc-900 px-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-[var(--brand)] uppercase tracking-widest">WAEC PRACTICE</span>
                    <span className="font-bold text-[10px] tracking-tight dark:text-white">Mathematics</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[var(--brand)] font-bold text-[10px] bg-[var(--brand)]/10 px-2 py-1 rounded-md">
                    <Clock size={10} />
                    02:30:00
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-zinc-100 dark:bg-zinc-900">
                  <div className="h-full bg-[var(--brand)] shadow-[0_0_10px_var(--brand)]" style={{ width: '45%' }} />
                </div>

                <div className="p-5 flex flex-col gap-4 flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-md text-[8px] font-black uppercase tracking-widest">Q 22 of 50</span>
                    <span className="text-[8px] font-bold text-zinc-400">Score: 42%</span>
                  </div>

                  {/* Question */}
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2 mb-4 leading-relaxed">
                    If log₁₀2 = 0.3010 and log₁₀3 = 0.4771, evaluate log₁₀4.5
                  </h2>

                  {/* Options mimicking functional app */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-left transition-all">
                      <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center font-black text-[10px] shrink-0">
                        A
                      </div>
                      <span className="font-bold text-xs text-zinc-600 dark:text-zinc-400">0.8341</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl border-2 border-[var(--brand)] bg-[var(--brand)]/10 text-left transition-all">
                      <div className="h-8 w-8 rounded-xl bg-[var(--brand)] text-white flex items-center justify-center font-black text-[10px] shrink-0">
                        B
                      </div>
                      <span className="font-bold text-xs text-[var(--brand)]">0.6532</span>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-left transition-all opacity-50">
                      <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 flex items-center justify-center font-black text-[10px] shrink-0">
                        C
                      </div>
                      <span className="font-bold text-xs text-zinc-600 dark:text-zinc-400 line-through">0.9542</span>
                    </div>
                  </div>

                  {/* Footer Buttons mimicking arrows in image */}
                  <div className="flex gap-2 mt-auto pt-4">
                    <div className="h-10 flex-1 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                      <ChevronLeft size={16} />
                    </div>
                    <div className="h-10 flex-1 bg-[var(--brand)] rounded-xl flex items-center justify-center text-white shadow-lg">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>

                {/* Submit Float */}
                <div className="absolute top-1/2 -right-12 translate-y-8 animate-pulse">
                   <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-2xl flex items-center gap-2 border border-zinc-800 rotate-12">
                      <div className="h-6 w-6 bg-red-500 rounded-md flex items-center justify-center">
                        <Send size={10} />
                      </div>
                      <span className="text-[8px] font-black tracking-widest mr-1">SUBMIT</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -left-12 top-20 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 animate-bounce cursor-default">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                   <Clock size={20} />
                 </div>
                 <div>
                   <p className="text-[10px] font-black opacity-40 uppercase">EXAM TIME</p>
                   <p className="font-bold text-sm">120 Minutes</p>
                 </div>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
