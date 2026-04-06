"use client";

import React, { useEffect, useState } from "react";
import { collection, getCountFromServer, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, CreditCard, FileQuestion, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { format, startOfDay } from "date-fns";

interface UserSnapshot {
  id: string;
  email: string;
  displayName: string;
  role: string;
  subscription_tier: string;
  created_at: any;
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    paidSubscribers: 0,
    totalQuestions: 0,
    testsTakenToday: 0
  });
  const [recentUsers, setRecentUsers] = useState<UserSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Total users
        const usersCol = collection(db, "users");
        const totalUsersSnap = await getCountFromServer(usersCol);
        
        // 2. Paid subscribers
        const paidQuery = query(usersCol, where("subscription_tier", "!=", "explorer"));
        const paidSubSnap = await getCountFromServer(paidQuery);

        // 3. Total questions
        const questionsCol = collection(db, "questions");
        const totalQuestionsSnap = await getCountFromServer(questionsCol);

        // 4. Tests taken today
        const todayStart = Timestamp.fromDate(startOfDay(new Date()));
        const testsCol = collection(db, "test_sessions");
        const testsTodayQuery = query(testsCol, where("completed_at", ">=", todayStart));
        const testsTodaySnap = await getCountFromServer(testsTodayQuery);

        setMetrics({
          totalUsers: totalUsersSnap.data().count,
          paidSubscribers: paidSubSnap.data().count,
          totalQuestions: totalQuestionsSnap.data().count,
          testsTakenToday: testsTodaySnap.data().count
        });

        // 5. Recent signups
        const recentSignupsQuery = query(usersCol, orderBy("created_at", "desc"), limit(5));
        const recentSnap = await getDocs(recentSignupsQuery);
        const users = recentSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserSnapshot[];
        
        setRecentUsers(users);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const cards = [
    { title: "Total Users", value: metrics.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Paid Subscribers", value: metrics.paidSubscribers, icon: CreditCard, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
    { title: "Total Questions", value: metrics.totalQuestions.toLocaleString(), icon: FileQuestion, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { title: "Tests Taken Today", value: metrics.testsTakenToday, icon: Activity, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Platform metrics and recent activity.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 bg-zinc-100 px-4 py-2 rounded-lg dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 font-medium">
          <TrendingUp size={16} />
          <span>Real-time data from Firestore</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm dark:bg-zinc-950 dark:border-zinc-800 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon size={24} className={card.color} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{card.value}</p>
                <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mt-1">{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recent Signups Table */}
        <div className="xl:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-zinc-950 dark:border-zinc-800 flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Recent Signups</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4">Name / Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 dark:text-zinc-50">{u.displayName || "Unknown User"}</span>
                        <span className="text-xs text-zinc-500">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                        {u.role || "student"}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize font-medium text-zinc-700 dark:text-zinc-300">
                      {u.subscription_tier ? u.subscription_tier.replace('_', ' ') : "explorer"}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {u.created_at?.toDate ? format(u.created_at.toDate(), "MMM d, yyyy h:mm a") : "N/A"}
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue Info Box */}
        <div className="bg-[var(--brand)] text-white rounded-2xl p-6 shadow-xl shadow-[var(--brand)]/10 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <CreditCard size={120} />
          </div>
          <h3 className="font-bold text-xl mb-2 relative z-10">Revenue Tracking</h3>
          <p className="text-white/80 text-sm mb-8 relative z-10 leading-relaxed">
            Revenue tracking is currently handled natively via the Paystack Dashboard.
          </p>
          
          <div className="mt-auto relative z-10 flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 bg-black/10 rounded-xl border border-white/10">
              <AlertCircle className="shrink-0 text-white/90" size={20} />
              <p className="text-sm font-medium text-white/90">
                To view detailed monthly reports, transaction statuses, and payout schedules, please login to your Paystack merchant portal.
              </p>
            </div>
            <a 
              href="https://dashboard.paystack.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-[var(--brand)] text-center font-bold px-4 py-3 rounded-xl hover:bg-zinc-50 active:scale-[0.98] transition-all w-full shadow-lg"
            >
              Open Paystack Dashboard
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
