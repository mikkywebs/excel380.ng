"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, Building, GraduationCap, FileText, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useAppConfig } from "@/contexts/AppConfigContext";

interface Cutoff {
  id: string;
  name: string;
  score: number;
  category: string;
}

export default function PublicInstitutionsPage() {
  const { config } = useAppConfig();
  const brandColor = config?.primary_color || "#45a257";

  const [institutionsData, setInstitutionsData] = useState<Cutoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Degree-Awarding Institutions', 'Colleges of Education', 'Polytechnics', 'Innovation Enterprise Institutions'];

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(collection(db, "university_cutoffs"), orderBy("name"));
        const snap = await getDocs(q);
        setInstitutionsData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cutoff)));
      } catch (err) {
        console.error("Error fetching cutoffs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = institutionsData.filter((inst) => {
    const matchesSearch = inst.name.toLowerCase().includes(search.toLowerCase());
    const instCat = inst.category || "";
    const matchesCategory = activeCategory === 'All' || instCat.includes(activeCategory) || activeCategory.includes(instCat);
    return matchesSearch && matchesCategory;
  });

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)] mb-6">
              <Building className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-4">
              Institution Cut-Off Marks
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Search the official JAMB minimum cut-off marks for over 500 universities, polytechnics, and colleges across Nigeria.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-[2rem] border border-zinc-200 dark:border-zinc-800 p-6 md:p-10 mb-8 z-10 relative">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search for an institution (e.g. University of Lagos)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all shadow-inner font-medium text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2 -mx-2 px-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-24 flex flex-col justify-center items-center gap-4">
                  <Loader2 className="animate-spin text-[var(--brand)]" size={40} />
                  <p className="text-zinc-500 font-medium">Fetching Live Database...</p>
                </div>
              ) : (
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                      <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Institution name</th>
                      <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Type</th>
                      <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Cut-Off</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredData.length > 0 ? (
                      filteredData.map((inst) => (
                        <tr key={inst.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/10 flex items-center justify-center shrink-0 text-[var(--brand)]">
                                {inst.category?.includes('Degree') ? (
                                  <GraduationCap className="h-5 w-5" />
                                ) : inst.category?.includes('Polytechnic') ? (
                                  <Building className="h-5 w-5" />
                                ) : (
                                  <FileText className="h-5 w-5" />
                                )}
                              </div>
                              <p className="text-base font-bold text-zinc-900 dark:text-white leading-tight">{inst.name}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 tracking-wide">
                              {inst.category}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <span className="inline-flex items-center justify-center min-w-[3rem] px-3 h-10 rounded-xl font-black text-lg bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20 shadow-sm">
                              {inst.score}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <Search className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                            <p className="text-zinc-500 font-medium">No institutions found matching your criteria.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
