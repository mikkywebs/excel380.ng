"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, GraduationCap, Search, Plus, Save, X, Trash2, HardDriveUpload } from "lucide-react";
import defaultCutoffs from "@/data/institutions.json";

interface Cutoff {
  id?: string;
  name: string;
  score: number;
  category: string;
}

export default function AdminCutoffs() {
  const [cutoffs, setCutoffs] = useState<Cutoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", score: "160", category: "Degree-Awarding Institutions" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCutoffs();
  }, []);

  async function fetchCutoffs() {
    try {
      const q = query(collection(db, "university_cutoffs"), orderBy("name"));
      const snap = await getDocs(q);
      setCutoffs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cutoff)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Seeding functionality
  const seedDefaults = async () => {
    if (!confirm("This will upload all items from the JSON file to Firestore. Continue?")) return;
    setLoading(true);
    try {
       for (const inst of defaultCutoffs) {
          const ref = doc(db, "university_cutoffs", inst.id.toString());
          await setDoc(ref, {
             name: inst.name,
             score: Number(inst.score),
             category: inst.category,
             created_at: serverTimestamp()
          });
       }
       alert("Seeded successfully!");
       fetchCutoffs();
    } catch (error) {
       console.error(error);
       alert("Failed to seed.");
    } finally {
       setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: "", score: "160", category: "Degree-Awarding Institutions" });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Cutoff) => {
    setEditingId(item.id!);
    setFormData({ name: item.name, score: item.score.toString(), category: item.category });
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
      if (!confirm(`Are you sure you want to delete ${name}?`)) return;
      try {
         await deleteDoc(doc(db, "university_cutoffs", id));
         setCutoffs(prev => prev.filter(c => c.id !== id));
      } catch (err) {
         alert("Failed to delete.");
      }
  };

  const handleSave = async () => {
      if (!formData.name.trim()) return alert("Name is required");
      setSaving(true);
      try {
         const payload = {
            name: formData.name.trim(),
            score: Number(formData.score),
            category: formData.category,
            updated_at: serverTimestamp()
         };

         if (editingId) {
            await setDoc(doc(db, "university_cutoffs", editingId), payload, { merge: true });
         } else {
            // Assign a random ID or let firestore randomly assign
            await addDoc(collection(db, "university_cutoffs"), { ...payload, created_at: serverTimestamp() });
         }
         
         setModalOpen(false);
         fetchCutoffs(); // refresh or push to state
      } catch (err) {
         console.error(err);
         alert("Failed to save.");
      } finally {
         setSaving(false);
      }
  };

  const filtered = cutoffs.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full max-w-7xl flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex justify-between items-end gap-4 mb-6 shrink-0 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
             <GraduationCap className="text-[var(--brand)]" /> Universities & Cut-Offs
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage minimum cut-off marks for universities, polytechnics, and colleges.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={seedDefaults} className="flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm hover:bg-blue-200 transition-all shadow-sm dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50">
              <HardDriveUpload size={16} /> Seed Default Data
            </button>
            <button onClick={handleOpenNew} className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[var(--brand)] text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-[var(--brand)]/20">
              <Plus size={16} /> Add Cut-off
            </button>
        </div>
      </div>

      <div className="relative mb-4 shrink-0">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search by institution name..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 h-full">
            {loading ? (
               <div className="p-8 flex justify-center items-center h-full">
                 <Loader2 className="animate-spin text-zinc-400" size={32} />
               </div>
            ) : cutoffs.length === 0 ? (
               <div className="p-12 text-center text-zinc-500 h-full flex flex-col items-center justify-center">
                 <p className="mb-4">No cut-off data found.</p>
                 <button onClick={seedDefaults} className="px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">Seed Defaults Now</button>
               </div>
            ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                   <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                         <th className="px-6 py-4 w-16">S/N</th>
                         <th className="px-6 py-4">Institution Name</th>
                         <th className="px-6 py-4">Category</th>
                         <th className="px-6 py-4">Cut-Off Score</th>
                         <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {filtered.map((item, index) => (
                          <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                               <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                                   {index + 1}
                               </td>
                               <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                                   <div className="truncate max-w-md" title={item.name}>{item.name}</div>
                               </td>
                               <td className="px-6 py-4">
                                   <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                      {item.category}
                                   </span>
                               </td>
                               <td className="px-6 py-4 font-bold text-[var(--brand)] tracking-wider">
                                   {item.score}
                               </td>
                               <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                   <div className="flex items-center justify-end gap-2">
                                       <button onClick={() => handleOpenEdit(item)} className="px-3 py-1.5 text-xs font-bold text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors">Edit</button>
                                       <button onClick={() => handleDelete(item.id!, item.name)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 transition-colors">
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               </td>
                          </tr>
                      ))}
                   </tbody>
                </table>
            )}
          </div>
      </div>

      {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
               <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col transform transition-transform">
                   <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/30">
                       <h3 className="font-bold text-lg">{editingId ? "Edit Institution" : "Add Institution"}</h3>
                       <button onClick={() => setModalOpen(false)} className="p-1.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"><X size={18} /></button>
                   </div>
                   <div className="p-6 flex flex-col gap-5">
                       <label className="flex flex-col gap-1.5">
                           <span className="text-sm font-semibold">Institution Name</span>
                           <input 
                              type="text" 
                              value={formData.name} 
                              onChange={e => setFormData({ ...formData, name: e.target.value })}
                              className="h-11 px-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 dark:bg-zinc-900 dark:border-zinc-800 text-sm font-medium"
                              placeholder="e.g. University of Lagos"
                            />
                       </label>

                       <div className="grid grid-cols-2 gap-5">
                           <label className="flex flex-col gap-1.5">
                               <span className="text-sm font-semibold">Cut-Off Score</span>
                               <input 
                                  type="number" 
                                  value={formData.score} 
                                  onChange={e => setFormData({ ...formData, score: e.target.value })}
                                  className="h-11 px-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 dark:bg-zinc-900 dark:border-zinc-800 font-mono text-sm"
                                />
                           </label>

                           <label className="flex flex-col gap-1.5">
                               <span className="text-sm font-semibold">Category</span>
                               <select 
                                  value={formData.category}
                                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                                  className="h-11 px-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 dark:bg-zinc-900 dark:border-zinc-800 text-sm font-medium"
                                >
                                   <option>Degree-Awarding Institutions</option>
                                   <option>Colleges of Education</option>
                                   <option>Polytechnics</option>
                                   <option>Innovation Enterprise Institutions</option>
                                </select>
                           </label>
                       </div>
                   </div>
                   <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
                       <button 
                           onClick={handleSave} 
                           disabled={saving}
                           className="w-full h-11 bg-[var(--brand)] text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-[var(--brand)]/20"
                        >
                           {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Institution</>}
                       </button>
                   </div>
               </div>
          </div>
      )}
    </div>
  );
}
