"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export function JambCombinationsCTA() {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-[2.5rem] p-8 md:p-12 border border-amber-200/50 dark:border-amber-900/50 text-center flex flex-col items-center justify-between h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full group-hover:bg-amber-500/10 transition-colors duration-500" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-500 mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white sm:text-4xl tracking-tight mb-4">
          Subject Combinations
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm">
          Search our intelligent database to see exactly what JAMB requires for over 200 university courses.
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <Link 
          href="/jamb-combinations"
          className="relative inline-flex items-center justify-center h-14 px-8 rounded-full bg-amber-500 text-white font-bold text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber-500/20"
        >
          Find My Subjects
        </Link>
      </div>
    </div>
  );
}
