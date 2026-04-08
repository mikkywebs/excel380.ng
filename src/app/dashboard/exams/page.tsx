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
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const tier = userDoc?.subscription_tier || "explorer";
  const isPaid = tier !== "explorer";

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const q = query(collection(db, "subjects"));
        const snap = await getDocs(q);
        const names = snap.docs.map((d) => d.data().name as string).filter(Boolean);
        setSubjects(names.length > 0 ? names : ["English", "Mathematics", "Physics", "Chemistry", "Biology", "Government", "Economics"]);
      } catch {
        setSubjects(["English", "Mathematics", "Physics", "Chemistry", "Biology", "Government", "Economics"]);
      } finally {
        setLoadingSubjects(false);
      }
    }
    fetchSubjects();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Start Exam</h1>
        <p className="text-gray-600 mt-1">Choose your exam body and subjects to begin a timed practice session.</p>
      </div>

      {/* Exam Body Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Select Exam Body</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EXAM_BODIES.map((body) => (
            <button
              key={body}
              onClick={() => setSelectedBody(body)}
              className={`h-14 rounded-xl font-bold text-sm transition-all border-2 ${
                selectedBody === body
                  ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20"
                  : "bg-white border-gray-200 text-gray-700 hover:border-green-300"
              }`}
            >
              {body}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Available Subjects</h2>
          {!isPaid && (
            <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-3 py-1 rounded-full">
              Free plan: limited access
            </span>
          )}
        </div>

        {loadingSubjects ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-400 h-6 w-6" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <div
                key={subject}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-800 text-sm capitalize">{subject}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Info Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-lg">{selectedBody} Practice</p>
              <p className="text-green-100 text-sm">
                {config?.jamb_time_minutes ?? 120} min · {config?.questions_per_exam ?? 40} questions
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors shadow-lg">
            <PlayCircle className="h-5 w-5" />
            Start {selectedBody} Exam
          </button>
        </div>
      </div>
    </div>
  );
}
