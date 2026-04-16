"use client";

import { useState } from "react";
import { Building2, Key, Loader2, CheckCircle2 } from "lucide-react";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function InstitutionJoinBanner() {
  const { user, userDoc } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Only show if user is explorer and NOT already in an institution
  if (userDoc?.subscription_tier !== "explorer" || userDoc?.institution_id) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !user) return;
    
    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "institutions"),
        where("invite_code", "==", code.trim().toUpperCase())
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("Invalid institutional access code.");
      }

      const instDoc = snapshot.docs[0];
      const instData = instDoc.data();

      // Check seat capacity
      const currentStudentsCount = instData.active_student_ids?.length || 0;
      if (currentStudentsCount >= instData.max_seats) {
        throw new Error("This institution has reached its maximum student capacity.");
      }

      // Upgrade student & add to institution roster
      await updateDoc(doc(db, "users", user.uid), {
        subscription_tier: "scholar_pro",
        institution_id: instDoc.id
      });

      await updateDoc(doc(db, "institutions", instDoc.id), {
        active_student_ids: arrayUnion(user.uid)
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Failed to join institution.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
        <p className="font-bold text-green-900 text-lg">Successfully joined your institution!</p>
        <p className="text-green-700 text-sm">Your account is being upgraded...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      
      <div className="relative flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Building2 size={14} /> Academic Institutions
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white mb-2 tracking-tighter">Student Access Link</h2>
          <p className="text-zinc-400 font-medium max-w-md mx-auto lg:mx-0">
            Does your school or tutorial center use Excel 380? Enter your 6-digit access code to unlock Premium instantly.
          </p>
        </div>

        <form onSubmit={handleJoin} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text" 
              placeholder="e.g. XL-9A8B7C" 
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={loading}
              className="w-full sm:w-64 h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold uppercase tracking-widest placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white/10 transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={!code || loading}
            className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center min-w-[120px]"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Join"}
          </button>
        </form>
      </div>

      {error && <p className="text-red-400 text-sm font-bold text-center mt-4">{error}</p>}
    </div>
  );
}
