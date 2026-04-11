"use client";

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Search, Building, GraduationCap, FileText, Loader2 } from 'lucide-react';

interface Cutoff {
  id: string;
  name: string;
  score: number;
  category: string;
}

export default function InstitutionsCutoffPage() {
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
    // Allow partial match for "Polytechnic" against "Polytechnics" and so on
    const matchesCategory = activeCategory === 'All' || instCat.includes(activeCategory) || activeCategory.includes(instCat);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">2026 JAMB Minimum Cut-Off Marks</h1>
        <p className="text-gray-600">Search and explore the minimum cut-off scores submitted by institutions.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for an institution..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-green-600" size={32} />
             </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Institution</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Cut-Off Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((inst, index) => (
                    <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-green-50 flex items-center justify-center shrink-0">
                            {inst.category?.includes('Degree') ? (
                              <GraduationCap className="h-4 w-4 text-green-600" />
                            ) : inst.category?.includes('Polytechnic') ? (
                              <Building className="h-4 w-4 text-green-600" />
                            ) : (
                              <FileText className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">{inst.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {inst.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm bg-green-100 text-green-700 ring-4 ring-green-50">
                          {inst.score}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      No institutions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
