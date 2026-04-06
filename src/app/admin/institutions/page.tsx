"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2, Building2, Ticket, Users, Search, RefreshCw, Plus } from "lucide-react";
import { format } from "date-fns";

export default function InstitutionsManagement() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const q = query(collection(db, "institutions"), orderBy("created_at", "desc"));
        const snap = await getDocs(q);
        setInstitutions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstitutions();
  }, []);

  const regenerateCode = async (inst: any) => {
    if (!confirm(`Regenerate invite code for ${inst.name}? Old code will stop working.`)) return;
    try {
      const newCode = "EXCEL-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      await setDoc(doc(db, "institutions", inst.id), { invite_code: newCode }, { merge: true });
      setInstitutions(prev => prev.map(i => i.id === inst.id ? { ...i, invite_code: newCode } : i));
    } catch (e) {
      alert("Failed to regenerate code");
    }
  };

  const filtered = institutions.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.owner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.invite_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex justify-between items-end gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-3">
             <Building2 className="text-[var(--brand)]" /> Institutions
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage B2B academy subscriptions and invite codes.</p>
        </div>
        <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
          <Plus size={16} /> Create Manual
        </button>
      </div>

      <div className="relative mb-4 shrink-0">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search by name, owner email, or code..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
            No institutions found.
          </div>
        ) : (
          filtered.map(inst => (
            <div key={inst.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 flex flex-col gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
              <div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-50">{inst.name}</h3>
                <p className="text-sm text-zinc-500">{inst.owner_email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    <Users size={14} /> Students
                  </div>
                  <p className="font-bold text-zinc-900 dark:text-zinc-50">{inst.student_count || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl dark:bg-blue-900/10 dark:border-blue-900/30">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                    <Ticket size={14} /> Code
                  </div>
                  <p className="font-bold text-blue-700 dark:text-blue-400 tracking-wider uppercase">{inst.invite_code || "N/A"}</p>
                </div>
              </div>

              <div className="mt-2 text-xs font-medium text-zinc-500 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg flex justify-between items-center">
                <span>Tier: <span className="uppercase text-zinc-900 dark:text-zinc-50 font-bold">{inst.subscription_tier}</span></span>
                <span>{inst.created_at?.toDate ? format(inst.created_at.toDate(), "MMM yyyy") : ""}</span>
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button onClick={() => regenerateCode(inst)} className="flex-1 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5">
                  <RefreshCw size={14} /> Reset Code
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
