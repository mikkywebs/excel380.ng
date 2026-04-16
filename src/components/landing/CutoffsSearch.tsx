"use client";

import React from "react";
import { Search } from "lucide-react";
import Link from "next/link";

interface Institution {
  id: number;
  name: string;
  score: number;
  category: string;
}


export function CutoffsSearch() {
  return (
    <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center justify-between h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand)]/5 blur-[80px] rounded-full group-hover:bg-[var(--brand)]/10 transition-colors duration-500" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)] mb-6">
          <Search className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-white sm:text-4xl tracking-tight mb-4">
          Institution Cut-Offs
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400 mb-8 max-w-sm">
          Search over 500 Nigerian universities, polytechnics, and colleges to verify the minimum JAMB score required.
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <Link 
          href="/institutions"
          className="relative inline-flex items-center justify-center h-14 px-8 rounded-full bg-[var(--brand)] text-white font-bold text-sm tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--brand)]/20"
        >
          Check Cut-Offs
        </Link>
      </div>
    </div>
  );
}
