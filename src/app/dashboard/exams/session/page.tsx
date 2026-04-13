"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, query, where, getDocs, limit, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Flag, 
  Send, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  X
} from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct_answer: string;
  subject: string;
  explanation?: string;
}

export default function ExamSessionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const body = searchParams.get("body") || "JAMB";
  const subjectsParam = searchParams.get("subjects") || "";
  const selectedSubjectNames = useMemo(() => subjectsParam.split(",").filter(Boolean), [subjectsParam]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null);

  // 1. Fetch Questions
  useEffect(() => {
    async function fetchAllQuestions() {
      if (selectedSubjectNames.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let allFetched: Question[] = [];
        for (const subName of selectedSubjectNames) {
          const q = query(
            collection(db, "questions"),
            where("subject", "==", subName),
            where("body", "==", body),
            limit(40)
          );
          const snap = await getDocs(q);
          const subQs = snap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as Question));
          
          allFetched = [...allFetched, ...subQs];
        }
        // Shuffle the final selection
        setQuestions(allFetched.sort(() => Math.random() - 0.5));
      } catch (err) {
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllQuestions();
  }, [selectedSubjectNames, body]);

  // 2. Timer Logic
  useEffect(() => {
    if (loading || finished) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, finished]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (option: string) => {
    if (finished) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleSubmit = async () => {
    if (isSubmitting || finished) return;
    setIsSubmitting(true);

    try {
      // Calculate results
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer) {
          score++;
        }
      });

      const total = questions.length;
      const percentage = total > 0 ? (score / total) * 100 : 0;
      const timeUsed = (120 * 60) - timeLeft;

      const finalResult = { score, total, percentage };
      setResult(finalResult);

      // Save to Firebase
      if (user) {
        await addDoc(collection(db, "test_sessions"), {
          userId: user.uid,
          exam_body: body,
          subjects: selectedSubjectNames,
          score,
          total,
          percentage,
          timeUsed,
          timestamp: serverTimestamp(),
        });
      }

      setFinished(true);
      setShowSubmitModal(false);
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err) {
      console.error("Error submitting:", err);
      alert("Submission failed, but your score was: " + result?.score);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="relative">
          <div className="h-24 w-24 border-8 border-green-100 border-t-green-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-black text-green-600">380</div>
        </div>
        <p className="mt-8 font-bold text-zinc-500 animate-pulse uppercase tracking-[0.3em]">Preparing your session...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={64} className="text-amber-500 mb-6" />
        <h1 className="text-3xl font-black mb-2 tracking-tighter">NO QUESTIONS FOUND</h1>
        <p className="text-zinc-500 max-w-sm mb-8 font-medium">We couldn't find any questions for the selected body and subjects. Please try another combination.</p>
        <button onClick={() => router.back()} className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-6">
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[3rem] p-12 shadow-2xl text-center border border-zinc-100 dark:border-zinc-800">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter">EXAM COMPLETED!</h1>
          <p className="text-zinc-500 mb-12 font-medium">Great job! Here is how you performed today.</p>
          
          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">SCORE</p>
              <p className="text-3xl font-black">{result?.score}/{result?.total}</p>
            </div>
            <div className="p-6 bg-green-600 text-white rounded-3xl shadow-xl shadow-green-600/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">PERCENTAGE</p>
              <p className="text-3xl font-black">{Math.round(result?.percentage || 0)}%</p>
            </div>
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-3xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">ACCURACY</p>
              <p className="text-3xl font-black">High</p>
            </div>
          </div>

          <button 
            onClick={() => router.push("/dashboard")}
            className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl dark:bg-white dark:text-zinc-900"
          >
            Go to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between px-8 sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{body} PRACTICE</span>
            <span className="font-bold text-sm tracking-tight">{selectedSubjectNames.join(" • ")}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-black tabular-nums transition-colors ${timeLeft < 300 ? "bg-red-500 text-white animate-pulse" : "bg-zinc-100 dark:bg-zinc-900"}`}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          <button 
            onClick={() => setShowSubmitModal(true)}
            className="h-10 px-6 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Submit Exam
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{currentQuestion.subject}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-12">
              {currentQuestion.text}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                if (!value) return null;
                const isSelected = answers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleAnswer(key)}
                    className={`flex items-center gap-6 p-6 rounded-3xl border-2 text-left transition-all group ${
                      isSelected 
                        ? "border-green-600 bg-green-50 dark:bg-green-950/20 shadow-xl shadow-green-600/10" 
                        : "border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:border-green-200"
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black uppercase transition-colors shrink-0 ${
                      isSelected ? "bg-green-600 text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 group-hover:bg-green-100 group-hover:text-green-600"
                    }`}>
                      {key}
                    </div>
                    <span className={`font-bold text-lg ${isSelected ? "text-green-900 dark:text-green-100" : "text-zinc-600 dark:text-zinc-400"}`}>{value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-80 border-l border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 p-8 flex flex-col">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Navigation</h3>
          <div className="grid grid-cols-5 gap-2 overflow-y-auto flex-1 mb-8 pr-2 custom-scrollbar">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = currentIndex === idx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl text-[10px] font-bold transition-all border-2 ${
                    isCurrent 
                      ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20" 
                      : isAnswered 
                        ? "bg-green-100 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-900/40 dark:text-green-400" 
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-green-300"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <button 
                onClick={() => setCurrentIndex(c => Math.max(0, c - 1))}
                disabled={currentIndex === 0}
                className="flex-1 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-900 transition-colors disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentIndex(c => Math.min(questions.length - 1, c + 1))}
                disabled={currentIndex === questions.length - 1}
                className="flex-1 h-12 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-2xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 shadow-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button className="h-12 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors">
              <Flag size={14} /> Report Issue
            </button>
          </div>
        </aside>
      </div>

      {/* Progress Bar Footer */}
      <footer className="h-1 bg-zinc-100 dark:bg-zinc-900">
        <div 
          className="h-full bg-green-600 transition-all duration-300" 
          style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
        />
      </footer>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmitModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -mr-16 -mt-16" />
            
            <div className="relative">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mb-6">
                <Send size={28} />
              </div>
              <h3 className="text-2xl font-black tracking-tighter mb-2">ARE YOU SURE?</h3>
              <p className="text-zinc-500 font-medium text-sm mb-8 leading-relaxed">
                You have answered <span className="text-zinc-900 dark:text-zinc-100 font-bold">{Object.keys(answers).length}</span> out of <span className="text-zinc-900 dark:text-zinc-100 font-bold">{questions.length}</span> questions. You still have <span className="text-green-600 font-bold">{formatTime(timeLeft)}</span> remaining.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowSubmitModal(false)}
                  className="h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold text-sm tracking-tight hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Keep Working
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-14 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-2xl font-bold text-sm tracking-tight flex items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Finish Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
