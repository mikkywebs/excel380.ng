"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { PlayCircle, Clock, BookOpen, Loader2, ChevronRight } from "lucide-react";

// Exam bodies
const EXAM_BODIES = ["JAMB", "WAEC", "NECO", "NABTEB"];

export default function ExamsPage() {
  const { user, userDoc } = useAuth();
  const { config } = useAppConfig();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedBody, setSelectedBody] = useState("JAMB");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const tier = userDoc?.subscription_tier || "explorer";
  const isPaid = tier !== "explorer";

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const q = query(collection(db, "subjects"));
        const snap = await getDocs(q);
        const names = snap.docs.map((d) => d.data().name as string).filter(Boolean);
        setSubjects(names.length > 0 ? names : ["English Language", "Mathematics", "Physics", "Chemistry", "Biology", "Government", "Economics"]);
      } catch {
        setSubjects(["English Language", "Mathematics", "Physics", "Chemistry", "Biology", "Government", "Economics"]);
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, []);

  const toggleSubject = (name: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(name)) return prev.filter(s => s !== name);
      // Limit to 4 for JAMB
      if (selectedBody === "JAMB" && prev.length >= 4) {
        alert("JAMB usually requires exactly 4 subjects.");
        return prev;
      }
      return [...prev, name];
    });
  };

  const canStart = selectedSubjects.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Start Exam</h1>
        <p className="text-gray-600 mt-1">Choose your exam body and subjects to begin a timed practice session.</p>
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
                setSelectedSubjects([]); // Reset on body change
              }}
              className={`h-14 rounded-xl font-bold text-sm transition-all border-2 ${
                selectedBody === body
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
          {!isPaid && (
            <span className="text-[10px] bg-yellow-100 text-yellow-700 font-black uppercase px-3 py-1 rounded-full tracking-tighter">
              Free plan: 3 Subjects max
            </span>
          )}
        </div>

        {loadingSubjects ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400 h-6 w-6" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((subject) => {
              const isSelected = selectedSubjects.includes(subject);
              return (
                <div
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`flex items-center justify-between p-5 border-2 rounded-2xl transition-all group cursor-pointer ${
                    isSelected 
                      ? "border-green-600 bg-green-50 shadow-md transform -translate-y-1" 
                      : "border-gray-50 bg-white hover:border-green-200 hover:bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-green-600 text-white" : "bg-zinc-100 text-zinc-400 group-hover:bg-green-100 group-hover:text-green-600"}`}>
                      <BookOpen size={20} />
                    </div>
                    <span className={`font-bold text-sm ${isSelected ? "text-green-900" : "text-zinc-600"}`}>{subject}</span>
                  </div>
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "bg-green-600 border-green-600" : "border-zinc-200 group-hover:border-green-300"}`}>
                    {isSelected && <ChevronRight className="h-3 w-3 text-white rotate-90" />}
                  </div>
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
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20">
              <Clock className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <p className="font-black text-2xl tracking-tighter">{selectedBody} Session</p>
              <div className="flex items-center gap-3 mt-1 text-zinc-400 font-bold text-sm tracking-widest uppercase">
                <span>120 Min</span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <span>{selectedSubjects.length > 0 ? `${selectedSubjects.length * 40} Questions` : "Select Subjects"}</span>
              </div>
            </div>
          </div>
          
          <Link 
            href={canStart ? `/dashboard/exams/session?body=${selectedBody}&subjects=${selectedSubjects.join(',')}` : "#"}
            onClick={(e) => !canStart && e.preventDefault()}
            className={`flex items-center gap-3 px-10 h-16 rounded-[1.5rem] font-black uppercase tracking-widest transition-all ${
              canStart 
                ? "bg-green-600 text-white hover:bg-green-500 shadow-xl shadow-green-600/20 active:scale-95" 
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          >
            {canStart ? (
              <>
                <PlayCircle size={24} />
                Begin Practice
              </>
            ) : (
              "Select Subjects"
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

    </div>
  );
}
