"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp, deleteDoc, doc, writeBatch, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase";
import { Plus, Search, FileDown, Upload, MoreHorizontal, Database, X, Loader2, Filter, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";

export default function QuestionsManagement() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  // Available subjects for the filter dropdown
  const availableSubjects = [
    "english language", "mathematics", "physics", "chemistry", 
    "biology", "government", "economics", "commerce", "financial accounting", 
    "literature in english", "christian religious studies (crs)", 
    "islamic studies", "geography", "agricultural science", 
    "history", "french", "computer studies", "civic education", 
    "further mathematics", "data processing", "yoruba", "igbo", "hausa"
  ];

  const { register, handleSubmit, reset, watch } = useForm();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let q;
      if (subjectFilter !== "all") {
        q = query(
          collection(db, "questions"), 
          where("subject", "==", subjectFilter),
          orderBy("created_at", "desc"), 
          limit(200)
        );
      } else {
        q = query(
          collection(db, "questions"), 
          orderBy("created_at", "desc"), 
          limit(200)
        );
      }
      const snap = await getDocs(q);
      setQuestions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [subjectFilter]);

  const onAddQuestion = async (data: any) => {
    setAdding(true);
    try {
      const payload = {
        subject: data.subject,
        body: data.body,
        text: data.text,
        options: {
          a: data.optA,
          b: data.optB,
          c: data.optC,
          d: data.optD
        },
        correct_answer: data.correct_answer,
        explanation: data.explanation || "",
        source: "admin",
        created_at: serverTimestamp()
      };
      
      await addDoc(collection(db, "questions"), payload);
      setPanelOpen(false);
      reset();
      fetchQuestions();
    } catch (err) {
      console.error("Failed to add question:", err);
      alert("Failed to add question");
    } finally {
      setAdding(false);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question forever?")) return;
    try {
      await deleteDoc(doc(db, "questions", id));
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const triggerExport = async () => {
    alert("Triggering SQLite Background Export...");
    try {
      const exportFunc = httpsCallable(functions, "exportToSQLite");
      await exportFunc();
      alert("Export job queued successfully. Ensure your Cloud Function handles this properly.");
    } catch (e: any) {
      console.error(e);
      alert("Error: " + e.message);
    }
  };

  const filteredQuestions = questions.filter(q => {
    // Subject filtering is now done server-side, but keeping it here for safety
    if (subjectFilter !== "all" && q.subject !== subjectFilter) return false;
    if (searchTerm && !q.text?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full max-w-7xl flex flex-col h-[calc(100vh-2rem)]">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Question Bank</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage, import, and export CBT questions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={triggerExport} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 bg-white dark:bg-black transition-all">
            <Database size={16} /> 
            <span className="hidden sm:inline">Export SQLite</span>
          </button>
          <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 h-10 px-4 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 bg-white dark:bg-black transition-all">
            <Upload size={16} />
            <span className="hidden sm:inline">Bulk Import JSON</span>
          </button>
          <button onClick={() => setPanelOpen(true)} className="flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100">
            <Plus size={16} />
            Add Question
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 shrink-0">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <select 
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full h-11 pl-10 pr-4 appearance-none rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100 font-semibold uppercase tracking-wider"
          >
            <option value="all">ALL SUBJECTS</option>
            {availableSubjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 h-full">
          {loading ? (
            <div className="p-8 flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-zinc-400" size={32} />
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 w-1/2">Question Text</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Exam Body</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="truncate max-w-[400px] font-medium text-zinc-800 dark:text-zinc-200" title={q.text}>
                        {q.text}
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase font-bold tracking-wider text-xs text-zinc-500">
                      {q.subject}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        {q.body}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {q.source === 'ai' ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded dark:bg-amber-900/30 dark:text-amber-400 w-fit">
                          <Sparkles size={12} /> AI Gen
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-zinc-500">Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteQuestion(q.id)} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredQuestions.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No questions found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200 font-medium text-xs text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800">
          Showing {filteredQuestions.length} questions
        </div>
      </div>

      {/* Slide-over Panel for Adding Question */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setPanelOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-full max-w-md bg-white shadow-2xl dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <h2 className="text-xl font-bold">New Question</h2>
              <button onClick={() => setPanelOpen(false)} className="p-2 bg-zinc-100 rounded-xl text-zinc-500 hover:text-zinc-900 dark:bg-zinc-900 dark:hover:text-zinc-50"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="add-q-form" onSubmit={handleSubmit(onAddQuestion)} className="flex flex-col gap-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold">Subject Code</span>
                    <input {...register("subject", { required: true })} placeholder="english" className="h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 uppercase text-sm" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold">Exam Body</span>
                    <select {...register("body", { required: true })} className="h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 text-sm">
                      <option value="JAMB">JAMB</option>
                      <option value="WAEC">WAEC</option>
                      <option value="NECO">NECO</option>
                      <option value="NABTEB">NABTEB</option>
                    </select>
                  </label>
                </div>

                <label className="flex flex-col gap-1.5 mt-2">
                  <span className="text-sm font-bold">Question Text</span>
                  <textarea {...register("text", { required: true })} rows={4} className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 text-sm resize-none" placeholder="What is the capital of..."></textarea>
                </label>

                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-sm font-bold">Options</span>
                  {['A', 'B', 'C', 'D'].map(char => (
                    <div key={char} className="flex items-center gap-3">
                      <span className="font-black text-zinc-400 w-4">{char}</span>
                      <input {...register(`opt${char}` as const, { required: true })} className="flex-1 h-9 px-3 rounded-lg border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 text-sm" />
                    </div>
                  ))}
                </div>

                <label className="flex flex-col gap-1.5 mt-2">
                  <span className="text-sm font-bold">Correct Answer Key</span>
                  <select {...register("correct_answer", { required: true })} className="h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 text-sm font-bold uppercase">
                    {['a','b','c','d'].map(char => <option key={char} value={char}>{char}</option>)}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 mt-2 mb-8">
                  <span className="text-sm font-bold">Explanation (optional)</span>
                  <textarea {...register("explanation")} rows={2} className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 text-sm resize-none" placeholder="This happens because..."></textarea>
                </label>
                
              </form>
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 flex gap-4">
              <button type="button" onClick={() => setPanelOpen(false)} className="flex-1 h-12 rounded-xl border border-zinc-200 font-bold hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-950 transition-colors">Cancel</button>
              <button type="submit" form="add-q-form" disabled={adding} className="flex-1 h-12 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2">
                {adding && <Loader2 size={16} className="animate-spin" />}
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <ImportQuestionsModal 
          onClose={() => setImportModalOpen(false)} 
          onSuccess={() => {
            setImportModalOpen(false);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}

function ImportQuestionsModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBodies, setSelectedBodies] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const bodies = ["JAMB", "WAEC", "NECO", "NABTEB"];

  const handleImport = async () => {
    if (!file || !selectedSubject || selectedBodies.length === 0) {
      alert("Please select a file, subject, and at least one exam body.");
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const rawData = JSON.parse(text);
      if (!Array.isArray(rawData)) throw new Error("JSON must be an array of questions.");

      const totalOperations = rawData.length * selectedBodies.length;
      let completedOperations = 0;

      // Firestore batches are limited to 500 operations
      const BATCH_SIZE = 500;
      let batch = writeBatch(db);
      let opCount = 0;

      for (const item of rawData) {
        for (const body of selectedBodies) {
          const qRef = doc(collection(db, "questions"));
          
          // Map fields from user's JSON format
          const payload = {
            subject: selectedSubject.toLowerCase(),
            body: body,
            topic: item.topic || "Unknown",
            year: item.year || "Unknown",
            text: item.question || item.text,
            options: {
              a: item.options?.A || item.options?.a || "",
              b: item.options?.B || item.options?.b || "",
              c: item.options?.C || item.options?.c || "",
              d: item.options?.D || item.options?.d || "",
            },
            correct_answer: (item.answer || item.correct_answer || "").toLowerCase(),
            explanation: item.explanation || "",
            source: "admin",
            created_at: serverTimestamp(),
          };

          batch.set(qRef, payload);
          opCount++;
          completedOperations++;

          if (opCount >= BATCH_SIZE) {
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
            setProgress(Math.round((completedOperations / totalOperations) * 100));
          }
        }
      }

      if (opCount > 0) {
        await batch.commit();
      }

      alert(`Successfully imported ${rawData.length} questions across ${selectedBodies.length} bodies!`);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert("Import failed: " + err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tighter">BULK IMPORT QUESTIONS</h2>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl dark:hover:bg-zinc-900"><X size={20} /></button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">1. Select JSON File</label>
              <input 
                type="file" 
                accept=".json" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[var(--brand)]/10 file:text-[var(--brand)] hover:file:bg-[var(--brand)]/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500">2. Target Subject ID</label>
              <input 
                type="text" 
                placeholder="e.g. biology"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-500 block">3. Broadcast to Exam Bodies</label>
              <div className="grid grid-cols-2 gap-3">
                {bodies.map(body => (
                  <button
                    key={body}
                    onClick={() => {
                      setSelectedBodies(prev => 
                        prev.includes(body) ? prev.filter(b => b !== body) : [...prev, body]
                      );
                    }}
                    className={`h-12 rounded-xl font-bold flex items-center justify-center border-2 transition-all ${
                      selectedBodies.includes(body)
                        ? "bg-[var(--brand)] border-[var(--brand)] text-white"
                        : "bg-white border-zinc-100 text-zinc-500 hover:border-[var(--brand)]/30 dark:bg-zinc-900 dark:border-zinc-800"
                    }`}
                  >
                    {body}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col gap-4">
          {importing && (
            <div className="w-full bg-zinc-200 rounded-full h-2 dark:bg-zinc-800 overflow-hidden">
              <div 
                className="bg-[var(--brand)] h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              className="flex-1 h-12 rounded-xl font-bold border border-zinc-200 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={importing || !file || !selectedSubject || selectedBodies.length === 0}
              className="flex-1 h-12 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 dark:bg-white dark:text-zinc-900"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Importing ({progress}%)
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Start Import
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
