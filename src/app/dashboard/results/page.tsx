"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FileDown, Trophy, Clock, Target, CalendarDays, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface TestSession {
  id: string;
  exam_body: string;
  subjects: string[];
  score: number;
  total: number;
  percentage: number;
  timeUsed: number;
  timestamp: any;
}

export default function ResultsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;
      try {
        const q = query(
          collection(db, "test_sessions"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TestSession));
        setSessions(fetched);
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [user]);

  const formatTimeUsed = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">My Results</h1>
          <p className="text-zinc-500 font-medium mt-1">Full history of your practice sessions and analytical insights</p>
        </div>
        <button 
          onClick={() => window.print()} 
          disabled={loading || sessions.length === 0}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <FileDown size={18} />
          Export PDF
        </button>
      </div>
      
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <Loader2 size={32} className="text-green-600 animate-spin" />
          <p className="text-sm font-bold text-zinc-500 tracking-widest uppercase animate-pulse">Loading Results...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-12 text-center max-w-2xl mx-auto shadow-inner">
          <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Trophy size={48} />
          </div>
          <h3 className="font-black text-2xl mb-3 text-zinc-900 dark:text-zinc-100 tracking-tight">No Test Results Yet</h3>
          <p className="text-zinc-500 mb-8 max-w-sm mx-auto font-medium">Start taking practice exams to see your detailed results, scores, and progress analytics here.</p>
          <a href="/dashboard/exams" className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl hover:shadow-zinc-900/20 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
            Take a Practice Exam <ArrowRight size={18} />
          </a>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="group relative overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 hover:border-green-300 dark:hover:border-green-900/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-green-600/5"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-12">
                {/* Left block: Body & Subjects */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {session.exam_body}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                      <CalendarDays size={14} />
                      {session.timestamp ? format(session.timestamp.toDate(), "MMM d, yyyy • h:mm a") : "Recent"}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                    {session.subjects.join(", ")}
                  </h3>
                </div>

                {/* Right block: Stats */}
                <div className="flex items-center gap-4 md:gap-8 flex-wrap lg:flex-nowrap shrink-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Score</span>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{session.score}</span>
                      <span className="text-sm font-bold text-zinc-400 leading-none mb-0.5">/{session.total}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Time Used</span>
                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-white">
                      <Clock size={16} className="text-zinc-400" />
                      <span className="text-lg font-bold leading-none">{formatTimeUsed(session.timeUsed)}</span>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800 hidden md:block" />

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Percentage</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${session.percentage >= 50 ? 'bg-green-500 flex' : 'bg-red-500'}`} />
                      <span className={`text-xl font-black leading-none ${session.percentage >= 50 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        {Math.round(session.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
