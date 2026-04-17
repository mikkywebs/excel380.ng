"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { PlayCircle, Clock, BookOpen, Loader2, ChevronRight, Compass, Lock } from "lucide-react";

// Exam bodies
const EXAM_BODIES = ["JAMB", "WAEC", "NECO", "NABTEB"];

function ExamsContent() {
  const { user, userDoc } = useAuth();
  const { config } = useAppConfig();
  const searchParams = useSearchParams();
  
  const fallbackSubjects = [
    "English Language", "Mathematics", "Physics", "Chemistry", 
    "Biology", "Government", "Economics", "Commerce", "Financial Accounting", 
    "Literature in English", "Christian Religious Studies (CRS)", 
    "Islamic Studies", "Geography", "Agricultural Science", 
    "History", "French", "Computer Studies", "Civic Education", 
    "Further Mathematics", "Data Processing", "Yoruba", "Igbo", "Hausa"
  ];
  const [subjects, setSubjects] = useState<string[]>(fallbackSubjects);

  const getCompulsorySubjects = (body: string) => {
    if (body === "JAMB") return ["English Language"];
    return ["English Language", "Mathematics"];
  };

  const [selectedBody, setSelectedBody] = useState("JAMB");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(getCompulsorySubjects("JAMB"));
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const q = query(collection(db, "subjects"));
        const snap = await getDocs(q);
        const names = snap.docs.map((d) => d.data().name as string).filter(Boolean);
        
        const available = names.length > 0 ? names : fallbackSubjects;
        setSubjects(available);

        // Handle pre-selected subjects from URL
        const preselected = searchParams.get('subjects');
        if (preselected) {
          const namesArr = preselected.split(',').map(s => s.trim());
          const compulsory = getCompulsorySubjects("JAMB");
          
          // Filter to only valid available subjects + always include compulsory
          const validSelected = available.filter(s => namesArr.includes(s));
          
          // Merge with compulsory
          const uniqueSelected = Array.from(new Set([...compulsory, ...validSelected]));
          
          // Cap at 4 for JAMB
          setSelectedSubjects(uniqueSelected.slice(0, 4));
        }
      } catch {
        // Fallback already handled in state
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, [searchParams]);

  const toggleSubject = (name: string) => {
    const compulsory = getCompulsorySubjects(selectedBody);
    if (compulsory.includes(name)) return; // Prevent toggling compulsory subjects

    setSelectedSubjects(prev => {
      if (prev.includes(name)) return prev.filter(s => s !== name);
      
      const maxAllowed = selectedBody === "JAMB" ? 4 : (selectedBody === "NABTEB" ? 8 : 9);
      if (prev.length >= maxAllowed) return prev; // Reached max
      return [...prev, name];
    });
  };

  let validationMessage = "";
  let canStart = false;

  if (selectedBody === "JAMB") {
    if (selectedSubjects.length < 4) validationMessage = `Select ${4 - selectedSubjects.length} more subject(s) (English is compulsory)`;
    else if (selectedSubjects.length === 4) canStart = true;
  } else if (selectedBody === "NABTEB") {
    const hasEconCom = selectedSubjects.includes("Economics") || selectedSubjects.includes("Commerce");
    if (selectedSubjects.length < 5) validationMessage = `Select at least ${5 - selectedSubjects.length} more subject(s)`;
    else if (!hasEconCom) validationMessage = "Economics or Commerce is Compulsory";
    else canStart = true;
  } else {
    // WAEC & NECO
    if (selectedSubjects.length < 8) validationMessage = `Select at least ${8 - selectedSubjects.length} more subject(s) (English & Math are compulsory)`;
    else canStart = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Start Exam</h1>
          <p className="text-gray-600 mt-1">Choose your exam body and subjects to begin a timed practice session.</p>
        </div>
        <Link 
          href="/dashboard/jamb-combinations" 
          className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-200 font-bold text-sm hover:bg-amber-100 transition-colors shrink-0 whitespace-nowrap shadow-sm"
        >
          <Compass size={16} /> Course Combinations Guide
        </Link>
      </div>

      {/* Exam Body Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4 uppercase tracking-widest text-xs opacity-60">Select Exam Body</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXAM_BODIES.map((body) => (
            <button
              key={body}
              onClick={() => {
                setSelectedBody(body);
                setSelectedSubjects(getCompulsorySubjects(body)); // Reset & Auto-select compulsory
              }}
              className={`h-14 rounded-xl font-bold text-sm transition-all border-2 ${selectedBody === body
                ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20"
                : "bg-white border-gray-100 text-gray-500 hover:border-green-300"
                }`}
            >
              {body}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 uppercase tracking-widest text-xs opacity-60">Available Subjects</h2>
        </div>

        {loadingSubjects ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400 h-6 w-6" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject);
              const isCompulsory = getCompulsorySubjects(selectedBody).includes(subject);

              return (
                <div
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`flex items-center justify-between p-5 border-2 rounded-2xl transition-all group ${
                    isCompulsory ? "cursor-not-allowed" : "cursor-pointer"
                  } ${isSelected
                    ? "border-green-600 bg-green-50 shadow-md " + (!isCompulsory ? "transform -translate-y-1" : "")
                    : "border-gray-50 bg-white hover:border-green-200 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-green-600 text-white" : "bg-zinc-100 text-zinc-400 group-hover:bg-green-100 group-hover:text-green-600"}`}>
                      <BookOpen size={20} />
                    </div>
                    <span className={`font-bold text-sm ${isSelected ? "text-green-900" : "text-zinc-600"}`}>{subject}</span>
                  </div>
                  {isCompulsory && (
                    <span className="text-[10px] font-black uppercase text-green-700 tracking-widest bg-green-200 px-2 py-1 rounded-md">Compulsory</span>
                  )}
                  {!isCompulsory && (
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-green-600 border-green-600" : "border-zinc-200 group-hover:border-green-300"}`}>
                      {isSelected && <ChevronRight className="h-3 w-3 text-white rotate-90" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exam Info Card */}
      <div className="bg-zinc-950 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/20 blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] -ml-32 -mb-32" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shrink-0">
              <Clock className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <p className="font-black text-2xl tracking-tighter">{selectedBody} Session</p>
              <div className="flex items-center gap-3 mt-1 text-zinc-400 font-bold text-sm tracking-widest uppercase">
                <span>120 Min <span className="text-[10px] text-zinc-500 lowercase">(~{Math.floor(120 / (selectedSubjects.length || 1))} min/subject)</span></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                <span>{selectedSubjects.length} Subject{selectedSubjects.length !== 1 && "s"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {canStart ? (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <Link
                  href={`/dashboard/exams/session?body=${selectedBody}&subjects=${selectedSubjects.join(',')}&mode=demo`}
                  className="flex flex-1 items-center justify-center gap-2 px-6 h-14 rounded-2xl font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all shadow-xl shadow-black/5 active:scale-95 border border-white/20 whitespace-nowrap text-sm"
                  title={userDoc?.subscription_tier === 'explorer' ? "Demo mode uses credits" : "Quick practice with fewer questions"}
                >
                  {userDoc?.subscription_tier === 'explorer' 
                    ? `Start Demo (-${selectedBody === "JAMB" ? "5" : "2"}/Q)`
                    : "Quick Practice (Free)"
                  }
                </Link>

                <Link
                  href={userDoc?.subscription_tier === 'explorer' ? '/dashboard/upgrade' : `/dashboard/exams/session?body=${selectedBody}&subjects=${selectedSubjects.join(',')}&mode=real`}
                  className={`flex flex-2 items-center justify-center gap-2 px-6 h-14 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl whitespace-nowrap text-sm ${
                    userDoc?.subscription_tier === 'explorer'
                      ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20 active:scale-95"
                      : "bg-green-600 text-white hover:bg-green-500 shadow-green-600/20 active:scale-95"
                  }`}
                >
                  {userDoc?.subscription_tier === 'explorer' ? (
                    <><Lock size={18} /> Official Exam</>
                  ) : (
                    <><PlayCircle size={18} /> Official Exam</>
                  )}
                </Link>
              </div>
            ) : (
              <div
                className="flex items-center justify-center px-10 h-14 rounded-[1.5rem] font-black uppercase tracking-widest bg-zinc-800 text-zinc-600 cursor-not-allowed w-full md:w-auto"
              >
                Not Ready
              </div>
            )}
            
            {!canStart && validationMessage && (
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest w-full text-center md:text-right mt-1">
                {validationMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function ExamsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-zinc-400" />
      </div>
    }>
      <ExamsContent />
    </Suspense>
  );
}
