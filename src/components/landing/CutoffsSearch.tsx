"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertCircle, Building, Award } from "lucide-react";
import institutionsData from "@/data/institutions.json";

interface Institution {
  id: number;
  name: string;
  score: number;
  category: string;
}

export function CutoffsSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Institution[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCount, setSearchCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const counts = localStorage.getItem("excel380_search_count");
    if (counts) {
      setSearchCount(parseInt(counts));
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    if (searchCount >= 3) {
      router.push("/signup?reason=search_limit");
      return;
    }

    const filtered = (institutionsData as Institution[]).filter((inst) =>
      inst.name.toLowerCase().includes(query.toLowerCase())
    );
    
    setResults(filtered.slice(0, 5)); // Limit visual clutter
    setHasSearched(true);

    // Only increment search count if they actually searched for something and got results or at least attempted
    const newCount = searchCount + 1;
    setSearchCount(newCount);
    localStorage.setItem("excel380_search_count", newCount.toString());
  };

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
            Check Your Institution's Cut-Off Mark
          </h2>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Search our database of over 500 Nigerian universities, polytechnics, and colleges to verify the minimum JAMB score required.
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-32 py-4 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors shadow-sm"
              placeholder="E.g., University of Lagos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-[var(--brand)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
          <div className="mt-3 text-sm text-center text-zinc-500 font-medium">
            {searchCount > 0 && searchCount < 3 && (
              <span className="text-amber-600 dark:text-amber-400">
                You have {3 - searchCount} free search{3 - searchCount === 1 ? '' : 'es'} remaining today.
              </span>
            )}
            {searchCount >= 3 && (
              <span className="text-red-500 font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> Free search limit reached.
              </span>
            )}
          </div>
        </form>

        {hasSearched && (
          <div className="max-w-2xl mx-auto">
            {results.length > 0 ? (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {results.map((inst) => (
                    <li key={inst.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex-shrink-0">
                            <Building className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-white lead-tight">{inst.name}</h4>
                            <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300">
                              {inst.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5 bg-[var(--brand)]/10 text-[var(--brand)] px-3 py-1 rounded-lg">
                            <Award className="w-4 h-4" />
                            <span className="font-bold text-lg">{inst.score}</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1 font-semibold">Min Score</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-10 px-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-700 mb-4">
                  <Search className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No institutions found</h3>
                <p className="mt-1 text-zinc-500">Try adjusting your search terms or checking for spelling errors.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
