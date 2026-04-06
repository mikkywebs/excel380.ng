"use client";

import React from "react";
import { FileDown, Trophy } from "lucide-react";

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Results</h1>
          <p className="text-muted-foreground text-sm">Full history of your practice sessions</p>
        </div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2.5 border border-border bg-card hover:bg-muted text-sm font-semibold rounded-xl">
          <FileDown className="h-4 w-4" />Export PDF
        </button>
      </div>
      
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-bold text-lg mb-2">No Test Results Yet</h3>
        <p className="text-muted-foreground text-sm">Start taking practice exams to see your detailed results and progress analytics here.</p>
      </div>
    </div>
  );
}
