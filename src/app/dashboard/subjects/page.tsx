"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BookOpen, Search, Loader2, ChevronRight } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  description?: string;
  exam_bodies?: string[];
  question_count?: number;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const snap = await getDocs(collection(db, "subjects"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subject));
        setSubjects(
          data.length > 0
            ? data
            : [
                { id: "english", name: "English", exam_bodies: ["JAMB", "WAEC", "NECO"] },
                { id: "math", name: "Mathematics", exam_bodies: ["JAMB", "WAEC", "NECO"] },
                { id: "physics", name: "Physics", exam_bodies: ["JAMB", "WAEC", "NECO"] },
                { id: "chemistry", name: "Chemistry", exam_bodies: ["JAMB", "WAEC", "NECO"] },
                { id: "biology", name: "Biology", exam_bodies: ["WAEC", "NECO"] },
                { id: "government", name: "Government", exam_bodies: ["JAMB", "WAEC"] },
                { id: "economics", name: "Economics", exam_bodies: ["JAMB", "WAEC"] },
                { id: "literature", name: "Literature in English", exam_bodies: ["WAEC", "NECO"] },
              ]
        );
      } catch {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSubjects();
  }, []);

  const filtered = subjects.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <p className="text-gray-600 mt-1">Browse all available subjects and their question banks.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-gray-400 h-8 w-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((subject) => (
            <div
              key={subject.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {subject.name}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors mt-1 shrink-0" />
              </div>
              {subject.exam_bodies && subject.exam_bodies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {subject.exam_bodies.map((body) => (
                    <span
                      key={body}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600"
                    >
                      {body}
                    </span>
                  ))}
                </div>
              )}
              {subject.question_count != null && (
                <p className="text-xs text-gray-500 mt-2">{subject.question_count.toLocaleString()} questions</p>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No subjects found matching "{search}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
