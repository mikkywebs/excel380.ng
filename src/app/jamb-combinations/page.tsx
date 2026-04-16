"use client";

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAppConfig } from "@/contexts/AppConfigContext";
import combinationsData from '@/data/jamb-combinations.json';

interface Course {
  id: number;
  course: string;
  subjects: string[];
}

interface Faculty {
  faculty: string;
  courses: Course[];
}

export default function PublicCombinationsPage() {
  const { config } = useAppConfig();
  const brandColor = config?.primary_color || "#45a257";

  const [search, setSearch] = useState('');
  const [activeFaculty, setActiveFaculty] = useState('All');

  const facultiesList = ['All', ...combinationsData.faculties.map(f => f.faculty)];

  // Enhanced search algorithm identical to the student dashboard
  const filteredResults = useMemo(() => {
    let results: { facultyName: string; course: Course }[] = [];

    combinationsData.faculties.forEach((fac) => {
      // Filter by faculty if one is selected
      if (activeFaculty !== 'All' && fac.faculty !== activeFaculty) return;

      fac.courses.forEach((c) => {
        if (c.course.toLowerCase().includes(search.toLowerCase())) {
          results.push({ facultyName: fac.faculty, course: c });
        }
      });
    });

    return results;
  }, [search, activeFaculty]);

  return (
    <div 
      className="relative min-h-screen selection:bg-[var(--brand)] selection:text-white flex flex-col bg-zinc-50 dark:bg-zinc-950"
      style={{ "--brand": brandColor } as React.CSSProperties}
    >
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">
              JAMB Subject Combinations
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Search the official JAMB brochure to discover the exact 4 subjects required for the university degree you wish to pursue.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-10 mb-8 z-10 relative">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search for a course (e.g. Accounting, Nursing, Computer Science)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-inner font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2 -mx-2 px-2">
              {facultiesList.map((fac) => (
                <button
                  key={fac}
                  onClick={() => setActiveFaculty(fac)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeFaculty === fac
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {fac}
                </button>
              ))}
            </div>
            
            <div className="mt-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-3">
              <div className="mt-0.5 text-blue-500"><CheckCircle2 className="w-5 h-5" /></div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                <span className="font-bold">Note:</span> {combinationsData.note}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredResults.length > 0 ? (
              filteredResults.map((result, idx) => (
                <div key={`${result.facultyName}-${result.course.id}-${idx}`} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-black uppercase tracking-widest rounded-lg mb-2">
                      Faculty of {result.facultyName}
                    </span>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{result.course.course}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {result.course.subjects.map((sub, i) => (
                      <div key={i} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm border ${
                        i === 0 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400' 
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] ${
                          i === 0 ? 'bg-green-200 dark:bg-green-800' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          {i + 1}
                        </div>
                        {sub}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-20 text-center">
                <Search className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No matching courses found</h3>
                <p className="text-zinc-500 font-medium">Try searching for a different course name or expanding your faculty filter.</p>
              </div>
            )}
            
            {filteredResults.length > 0 && (
               <div className="text-center pt-8 pb-4">
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                     Showing {filteredResults.length} Matching Courses
                  </p>
               </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
