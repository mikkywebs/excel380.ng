"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PlayCircle, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { userDoc } = useAuth();
  const displayName = userDoc?.displayName || "Student";
  const firstName = displayName.split(" ")[0];
  const credits = userDoc?.credits || 0;
  const lowCredits = credits < 20;

  return (
    <div className="space-y-8">
      {lowCredits && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">Running low on credits</p>
            <p className="text-xs text-amber-600">{credits} credits left.</p>
          </div>
          <Link href="/dashboard/upgrade" className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl">
            Upgrade Now
          </Link>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold">Good morning, {firstName}! �</h1>
          <p className="text-muted-foreground mt-1">Ready to practice? Let us crush your exam prep today.</p>
        </div>
        <Link href="/dashboard/exams" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold w-fit">
          <PlayCircle className="h-5 w-5" />
          Start New Exam
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <h2 className="text-lg font-bold mb-4">Dashboard Overview</h2>
        <p className="text-muted-foreground">Your Excel 380 dashboard is ready! Stats and test history will appear here once you start taking exams.</p>
      </div>
    </div>
  );
}