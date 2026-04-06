"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Download, Monitor, Smartphone, Play, GraduationCap } from "lucide-react";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const stats = [
    { label: "Questions", val: "10,000+" },
    { label: "Exam Bodies", val: "4" },
    { label: "Sync", val: "Works Offline" },
    { label: "Start", val: "Free to Start" },
  ];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden lg:pt-48 lg:pb-32 bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-6 grid grid-cols-1 gap-16 items-center lg:grid-cols-2">
        {/* Left Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8 text-center lg:text-left"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand)]/10 text-[var(--brand)] rounded-full text-sm font-bold w-fit mx-auto lg:mx-0 border border-[var(--brand)]/20">
            <span className="flex h-2 w-2 rounded-full bg-[var(--brand)] animate-pulse" />
            2026 JAMB/WAEC Ready
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl font-extrabold tracking-tight text-zinc-900 leading-[1.1] sm:text-6xl lg:text-7xl dark:text-zinc-50"
          >
            Nigeria's <span className="text-[var(--brand)] italic">#1</span> CBT Practice Platform
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg text-zinc-600 leading-relaxed max-w-xl mx-auto lg:mx-0 dark:text-zinc-400 sm:text-xl"
          >
            Prepare for JAMB, WAEC, NECO & NABTEB with the most advanced exam engine. Study online or download our desktop and mobile apps for a completely offline experience.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <Link
              href="/signup"
              className="group relative flex h-14 items-center justify-center rounded-2xl bg-[var(--brand)] px-10 text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[var(--brand)]/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full transition-transform group-hover:translate-y-0" />
              Start Free (100 Credits)
            </Link>
            <Link
              href="#download"
              className="flex h-14 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white px-8 text-lg font-bold text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:hover:bg-zinc-900 active:scale-95 shadow-sm"
            >
              <Monitor className="mr-2 h-5 w-5 opacity-70" />
              Download for PC
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-10 dark:border-zinc-800 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-2xl">{stat.val}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold dark:text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Content - Phone Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          {/* Mockup Container */}
          <div className="relative mx-auto w-[320px] aspect-[9/18.5] bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl p-4 overflow-hidden dark:border-zinc-800/50">
            {/* Screen Content */}
            <div className="h-full w-full bg-white rounded-[2rem] overflow-hidden flex flex-col">
              <div className="h-14 bg-[var(--brand)] p-4 flex items-center justify-between text-white">
                <GraduationCap size={20} />
                <span className="text-xs font-bold">JAMB 2026 MOCK</span>
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="h-4 w-2/3 bg-zinc-100 rounded" />
                <div className="h-10 w-full bg-zinc-50 border-2 border-[var(--brand)] rounded-xl flex items-center px-4">
                  <div className="h-4 w-4 rounded-full border-2 border-[var(--brand)] mr-3" />
                  <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                </div>
                <div className="h-10 w-full bg-zinc-50 rounded-xl flex items-center px-4">
                  <div className="h-4 w-4 rounded-full border-2 border-zinc-200 mr-3" />
                  <div className="h-3 w-1/3 bg-zinc-200 rounded" />
                </div>
                <div className="h-10 w-full bg-zinc-50 rounded-xl flex items-center px-4">
                  <div className="h-4 w-4 rounded-full border-2 border-zinc-200 mr-3" />
                  <div className="h-3 w-2/3 bg-zinc-200 rounded" />
                </div>
              </div>
              <div className="mt-auto p-4 flex gap-2">
                <div className="h-10 flex-1 bg-zinc-100 rounded-lg" />
                <div className="h-10 flex-1 bg-[var(--brand)] rounded-lg" />
              </div>
            </div>
            {/* Dynamic Accents */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-24 bg-zinc-800 rounded-full" />
          </div>

          {/* Floating Accents */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-4 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-3 dark:bg-black dark:border-zinc-800"
          >
            <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center text-white">
              <Smartphone size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold dark:text-white">Mobile Sync</span>
              <span className="text-xs text-zinc-500">Real-time backup</span>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-zinc-100 flex items-center gap-3 dark:bg-black dark:border-zinc-800"
          >
            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <Play size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold dark:text-white">5,000+ Students</span>
              <span className="text-xs text-zinc-500">Active today</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
