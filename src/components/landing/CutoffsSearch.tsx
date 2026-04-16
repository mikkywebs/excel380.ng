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
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--brand)]/5 blur-[100px] rounded-full" />
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[var(--brand)]/10 text-[var(--brand)] mb-8">
            <Search className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white sm:text-5xl tracking-tighter mb-4">
            Check Your Institution's Cut-Off Mark
          </h2>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl font-medium">
            Search our database of over 500 Nigerian universities, polytechnics, and colleges to verify the minimum JAMB score required.
          </p>
          <Link 
            href="/institutions"
            className="group relative inline-flex items-center justify-center h-16 px-10 rounded-full bg-[var(--brand)] text-white font-black text-lg tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[var(--brand)]/20"
          >
            Start Searching
            <span className="absolute -inset-2 rounded-full border-2 border-[var(--brand)]/50 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
          </Link>
        </div>
      </div>
    </section>
  );
}
