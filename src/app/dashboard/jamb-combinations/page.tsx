"use client";

import React, { useState, useMemo } from 'react';
import { Search, BookOpen, CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import combinationsData from '@/data/jamb-combinations.json';

interface Course {
  id: number;
  course: string;
  subjects: string[];
}

interface Faculty {
  faculty: string;
  courses: Course[];
}

export default function DashboardCombinationsPage() {
  const [search, setSearch] = useState('');
  const [activeFaculty, setActiveFaculty] = useState('All');

  const facultiesList = ['All', ...combinationsData.faculties.map(f => f.faculty)];

  const filteredResults = useMemo(() => {
    let results: { facultyName: string; course: Course }[] = [];

    combinationsData.faculties.forEach((fac) => {
      if (activeFaculty !== 'All' && fac.faculty !== activeFaculty) return;

      fac.courses.forEach((c) => {
        if (c.course.toLowerCase().includes(search.toLowerCase())) {
          results.push({ facultyName: fac.faculty, course: c });
        }
      });
    });

    return results;
  }, [search, activeFaculty]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-amber-500 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 blur-[80px] -mr-32 -mt-32 rounded-full" />
        <div className="relative z-10 text-white max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg text-sm font-bold uppercase tracking-widest mb-4">
            <BookOpen size={16} /> Course Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">JAMB Subject Combinations</h1>
          <p className="text-amber-50 font-medium">
            Find the exact 4 subjects you need to write for your dream course. 
            Select your subjects correctly before starting your CBT practice!
          </p>
        </div>
        
        <div className="relative z-10 shrink-0">
          <Link 
            href="/dashboard/exams"
            className="flex items-center gap-2 bg-white text-amber-600 px-6 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-lg"
          >
            Start Practice <PlayCircle size={20} />
          </Link>
        </div>
      </div>

      {/* Controls Container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
        
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a course (e.g. Mass Communication, Medicine)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-14 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-gray-900"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {facultiesList.map((fac) => (
            <button
              key={fac}
              onClick={() => setActiveFaculty(fac)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeFaculty === fac
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {fac}
            </button>
          ))}
        </div>
        
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3">
          <div className="mt-0.5 text-blue-500"><CheckCircle2 className="w-5 h-5" /></div>
          <p className="text-sm font-semibold text-blue-700">
            <span className="font-bold">Note:</span> {combinationsData.note}
          </p>
        </div>

      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.length > 0 ? (
          filteredResults.map((result, idx) => (
            <div key={`${result.facultyName}-${result.course.id}-${idx}`} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-widest rounded-md mb-2">
                  Faculty of {result.facultyName}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{result.course.course}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {result.course.subjects.map((sub, i) => (
                  <div key={i} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm border ${
                    i === 0 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}>
                    <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-[10px] ${
                      i === 0 ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {i + 1}
                    </div>
                    {sub}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No matching courses found</h3>
            <p className="text-gray-500 text-sm font-medium">Adjust your search or change the faculty filter to discover more courses.</p>
          </div>
        )}
      </div>

    </div>
  );
}
