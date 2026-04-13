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
            <div className="relative w-full max-w-[320px] aspect-[9/19] bg-zinc-950 rounded-[3rem] p-3 border-[6px] border-zinc-900 shadow-2xl overflow-hidden ring-4 ring-zinc-900/50">
              {/* Screen Content */}
              <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col relative">
                
                {/* Header mimicking image */}
                <div className="bg-[var(--brand)] h-14 flex items-center justify-between px-5 text-white">
                  <GraduationCap size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">JAMB 2026 MOCK</span>
                  <div className="h-2 w-2 rounded-full bg-red-400" />
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-zinc-100">
                  <div className="h-full bg-[var(--brand)] w-1/3" />
                </div>

                <div className="p-6 flex flex-col gap-5 flex-1">
                  {/* Timer/Meta */}
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-24 bg-zinc-100 rounded-full animate-pulse" />
                    <div className="flex items-center gap-1 text-[var(--brand)] font-bold text-xs">
                      <Clock size={12} />
                      01:54:20
                    </div>
                  </div>

                  {/* Question */}
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-zinc-100 rounded-full" />
                    <div className="h-4 w-4/5 bg-zinc-100 rounded-full" />
                    <div className="h-4 w-3/5 bg-zinc-100 rounded-full" />
                  </div>

                  {/* Options mimicking arrows in image */}
                  <div className="space-y-3 mt-4">
                    <div className="p-4 rounded-xl border-2 border-[var(--brand)] bg-green-50 flex items-center gap-4">
                      <div className="h-4 w-4 rounded-full border-2 border-[var(--brand)]" />
                      <div className="h-3 w-32 bg-zinc-200 rounded-full" />
                    </div>
                    <div className="p-4 rounded-xl border-2 border-zinc-50 bg-zinc-50/50 flex items-center gap-4">
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-200" />
                      <div className="h-3 w-28 bg-zinc-200 rounded-full" />
                    </div>
                    <div className="p-4 rounded-xl border-2 border-zinc-50 bg-zinc-50/50 flex items-center gap-4 opacity-50">
                      <div className="h-4 w-4 rounded-full border-2 border-zinc-200" />
                      <div className="h-3 w-36 bg-zinc-200 rounded-full" />
                    </div>
                  </div>

                  {/* Central "Red Box" Placeholder from image */}
                  <div className="flex-1 border-2 border-red-50/20 border-dashed rounded-2xl flex items-center justify-center">
                    <div className="h-20 w-20 bg-zinc-50 rounded-2xl animate-pulse" />
                  </div>

                  {/* Footer Buttons mimicking arrows in image */}
                  <div className="flex gap-3 mt-auto">
                    <div className="h-12 flex-1 bg-zinc-100 rounded-xl" />
                    <div className="h-12 flex-1 bg-[var(--brand)] rounded-xl flex items-center justify-center text-white">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>

                {/* Submit Float */}
                <div className="absolute top-1/2 -right-12 translate-y-12">
                   <div className="bg-zinc-950 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 rotate-12">
                      <div className="h-8 w-8 bg-[var(--brand)] rounded-lg flex items-center justify-center">
                        <Send size={14} />
                      </div>
                      <span className="text-[10px] font-bold">SUBMIT</span>
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
