"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { BookMarked, ArrowRight } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  exam_bodies: string[];
  is_compulsory: boolean;
}

export function SubjectsGrid({ limit }: { limit?: number }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const q = query(collection(db, "subjects"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subject[];

        // Standardize: Ensure "English Language" is the canonical name
        const seen = new Set();
        const normalizedData = data.filter(sub => {
          const name = sub.name.trim();
          const lowerName = name.toLowerCase();
          
          // Map variations to "English Language"
          if (lowerName === "english" || lowerName === "use of english" || lowerName === "english language") {
            if (seen.has("english_language")) return false;
            seen.add("english_language");
            sub.name = "English Language"; // Force the display name
            return true;
          }

          if (seen.has(lowerName)) return false;
          seen.add(lowerName);
          return true;
        });

        setSubjects(normalizedData);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, []);

  return (
    <section id="subjects" className="py-24 bg-zinc-50 dark:bg-black transition-colors">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 sm:text-4xl lg:text-5xl">
              Available <span className="text-[var(--brand)]">Subjects</span>
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Select from our wide range of practice subjects, optimized for Nigerian exam standards.
            </p>
          </div>
          {limit && (
            <a
              href="/subjects"
              className="inline-flex items-center text-[var(--brand)] font-bold hover:gap-2 transition-all group"
            >
              View All Subjects
              <ArrowRight size={20} className="ml-1 transition-transform group-hover:translate-x-1" />
            </a>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-48 bg-zinc-100 rounded-2xl animate-pulse dark:bg-zinc-900" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subjects.slice(0, limit || subjects.length).map((subject, idx) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group relative h-full flex flex-col items-start p-8 rounded-2xl bg-white border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[var(--brand)]/5 hover:-translate-y-1 dark:bg-zinc-900 dark:border-zinc-800"
              >
                <div className="h-12 w-12 rounded-xl bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center mb-6 transition-transform group-hover:rotate-6">
                  <BookMarked size={24} />
                </div>
                
                {subject.is_compulsory && (
                  <span className="absolute top-8 right-8 bg-red-50 text-red-500 text-[10px] uppercase font-black px-2 py-1 rounded-md tracking-tighter dark:bg-red-950 dark:text-red-400">
                    Compulsory
                  </span>
                )}

                <h3 className="text-xl font-bold text-zinc-900 group-hover:text-[var(--brand)] transition-colors dark:text-zinc-50 mb-3">
                  {subject.name}
                </h3>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {subject.exam_bodies.map((body) => (
                    <span
                      key={body}
                      className="text-[10px] font-bold text-zinc-400 border border-zinc-100 px-2 py-1 rounded dark:border-zinc-800 dark:text-zinc-500"
                    >
                      {body}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
