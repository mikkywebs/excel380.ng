"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export function JambCombinationsCTA() {
  return (
    <section className="py-12 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full -translate-y-1/2" />
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-[2.5rem] p-10 md:p-14 border border-amber-200/50 dark:border-amber-900/50 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-500 mb-8">
            <BookOpen className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white sm:text-5xl tracking-tighter mb-4">
            JAMB Subject Combinations Guide
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl font-medium">
            Not sure which subjects to write for your dream course? Search our intelligent database to see exactly what JAMB requires for over 200 university courses.
          </p>
          <Link 
            href="/jamb-combinations"
            className="group relative inline-flex items-center justify-center h-16 px-10 rounded-full bg-amber-500 text-white font-black text-lg tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
          >
            Find My Subjects
            <span className="absolute -inset-2 rounded-full border-2 border-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          </Link>
        </div>
      </div>
    </section>
  );
}
