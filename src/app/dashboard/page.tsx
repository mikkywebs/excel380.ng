"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import combinationsData from '@/data/jamb-combinations.json';
import {
  Clock,
  Trophy,
  BookOpen,
  PlayCircle,
  AlertTriangle,
  FileText,
  BarChart2,
  ChevronRight,
  Award,
  Calendar,
  TrendingUp,
  Sparkles,
  BrainCircuit,
  Zap,
  Info,
  Target,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { InstitutionJoinBanner } from '@/components/dashboard/InstitutionJoinBanner';

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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getNextExamTime(lastExamTime: Date | null, pauseWindow: number = 30): Date | null {
  if (!lastExamTime) return null;
  return new Date(lastExamTime.getTime() + pauseWindow * 60 * 1000);
}

function formatCountdown(targetTime: Date): string {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  if (diff <= 0) return "00:00";

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function DashboardPage() {
  const { user, userDoc } = useAuth();
  const { config } = useAppConfig();
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgScore: 0,
    bestScore: 0,
    subjectsStudied: 0
  });
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [nextExamTime, setNextExamTime] = useState<Date | null>(null);
  const [savingGoal, setSavingGoal] = useState(false);
  const [prediction, setPrediction] = useState<{
    score: number;
    trend: 'up' | 'down' | 'stable';
    confidence: 'High' | 'Medium' | 'Low';
    insights: string[];
    sampleSize: number;
  } | null>(null);

  const allCourses = Array.from(new Set(
    combinationsData.faculties.flatMap(f => f.courses.map(c => c.course))
  )).sort();

  const displayName = userDoc?.displayName || user?.displayName || 'Student';
  const firstName = displayName.split(' ')[0];
  const credits = userDoc?.credits || 0;
  const tier = userDoc?.subscription_tier || 'explorer';
  const isPaid = tier !== 'explorer';
  const lowCredits = !isPaid && credits < 20;
  const lastExamTime = userDoc?.last_test_at?.toDate() || null;

  // Fetch user sessions
  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        const q = query(
          collection(db, 'test_sessions'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(20)
        );

        const snapshot = await getDocs(q);
        const sessionData: TestSession[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TestSession));

        setSessions(sessionData);

        // Calculate stats
        let totalScore = 0;
        let bestScore = 0;
        const subjects = new Set<string>();

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          totalScore += data.percentage || 0;
          if (data.percentage > bestScore) bestScore = data.percentage;
          if (data.subjects) {
            data.subjects.forEach((s: string) => subjects.add(s));
          }
        });

        setStats({
          totalTests: snapshot.size,
          avgScore: snapshot.size > 0 ? Math.round(totalScore / snapshot.size) : 0,
          bestScore: Math.round(bestScore),
          subjectsStudied: subjects.size
        });

        // AI PREDICTION ENGINE
        const jambSessions = sessionData.filter(s => s.exam_body === "JAMB");
        if (jambSessions.length >= 2) {
          let weightedSum = 0;
          let weightTotal = 0;
          
          const subjectScores: Record<string, { total: number, count: number }> = {};

          jambSessions.forEach((s, idx) => {
            // Weighting: 1-3 (1.0), 4-10 (0.6), 11+ (0.3)
            const weight = idx < 3 ? 1.0 : (idx < 10 ? 0.6 : 0.3);
            weightedSum += s.percentage * weight;
            weightTotal += weight;

            // Subject trends
            s.subjects?.forEach(sub => {
              if (!subjectScores[sub]) subjectScores[sub] = { total: 0, count: 0 };
              subjectScores[sub].total += s.percentage;
              subjectScores[sub].count += 1;
            });
          });

          const avgPercentage = weightedSum / weightTotal;
          const projectedScore = Math.round((avgPercentage / 100) * 400);
          
          // Trend analysis
          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (jambSessions.length >= 3) {
            const recent = jambSessions[0].percentage;
            const older = jambSessions[jambSessions.length - 1].percentage;
            if (recent > older + 5) trend = 'up';
            else if (recent < older - 5) trend = 'down';
          }

          // Generate insights
          const insights: string[] = [];
          const subjectAvg = Object.entries(subjectScores)
            .map(([name, data]) => ({ name, avg: data.total / data.count }))
            .sort((a, b) => b.avg - a.avg);

          if (subjectAvg.length > 0) {
            insights.push(`Strongest Subject: ${subjectAvg[0].name} (${Math.round(subjectAvg[0].avg)}%)`);
            if (subjectAvg.length > 1) {
              const weakest = subjectAvg[subjectAvg.length - 1];
              if (weakest.avg < 50) {
                insights.push(`Recommended Focus: Improve ${weakest.name} scores`);
              }
            }
          }

          setPrediction({
            score: projectedScore,
            trend,
            confidence: jambSessions.length > 8 ? 'High' : (jambSessions.length > 3 ? 'Medium' : 'Low'),
            insights,
            sampleSize: jambSessions.length
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  // Pause window countdown logic
  useEffect(() => {
    if (!lastExamTime || !config?.pause_window_minutes) return;

    const nextTime = getNextExamTime(lastExamTime, config.pause_window_minutes);
    setNextExamTime(nextTime);

    if (!nextTime) return;

    const updateCountdown = () => {
      if (nextTime.getTime() > new Date().getTime()) {
        setCountdown(formatCountdown(nextTime));
      } else {
        setCountdown("");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lastExamTime, config?.pause_window_minutes]);

  const handleUpdateGoal = async (course: string) => {
    if (!user) return;
    setSavingGoal(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        target_course: course
      });
    } catch (err) {
      console.error("Failed to update goal:", err);
    } finally {
      setSavingGoal(false);
    }
  };

  const isInPauseWindow = nextExamTime && nextExamTime.getTime() > new Date().getTime();

  const quickStats = [
    {
      icon: <FileText className="h-6 w-6 text-green-600" />,
      label: 'Total Tests',
      value: loading ? '—' : String(stats.totalTests),
      color: 'bg-green-100',
      trend: '+12%'
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-blue-600" />,
      label: 'Average Score',
      value: loading ? '—' : `${stats.avgScore}%`,
      color: 'bg-blue-100',
      trend: '+5%'
    },
    {
      icon: <Target className="h-6 w-6 text-purple-600" />,
      label: 'Best Score',
      value: loading ? '—' : `${stats.bestScore}%`,
      color: 'bg-purple-100',
      trend: '+8%'
    },
    {
      icon: <BookOpen className="h-6 w-6 text-orange-600" />,
      label: 'Subjects',
      value: loading ? '—' : String(stats.subjectsStudied),
      color: 'bg-orange-100',
      trend: '+2'
    }
  ];

  return (
    <div className="space-y-6">
      <InstitutionJoinBanner />

      {/* Low Credits Warning */}
      {lowCredits && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">Running low on credits</p>
            <p className="text-sm text-yellow-600">{credits} credits remaining. Upgrade to continue practicing.</p>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Pause Window Countdown */}
      {isInPauseWindow && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-800">Taking a break</p>
              <p className="text-sm text-blue-600">Next exam available in</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-800 font-mono">{countdown}</p>
            <p className="text-xs text-blue-600">mm:ss</p>
          </div>
        </div>
      )}

      {/* Welcome Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-green-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tighter">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-green-100 font-medium text-base sm:text-lg mb-8">Ready to practice? Let's crush your exam prep today.</p>
            <Link
              href="/dashboard/exams"
              className={`inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 h-14 rounded-2xl font-black uppercase tracking-widest transition-all shadow-2xl ${isInPauseWindow
                  ? 'bg-white/20 text-white/50 cursor-not-allowed backdrop-blur-md'
                  : 'bg-white text-green-700 hover:bg-green-50 active:scale-95'
                }`}
              onClick={isInPauseWindow ? (e) => e.preventDefault() : undefined}
            >
              <PlayCircle className="h-6 w-6" />
              {isInPauseWindow ? 'Please Wait' : 'Start New Exam'}
            </Link>
          </div>
        </div>

        {/* Academic Goal Widget */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Target size={24} />
              </div>
              {savingGoal && <Loader2 className="animate-spin text-zinc-400 h-5 w-5" />}
            </div>
            <h3 className="text-xl font-black tracking-tighter mb-1">My Academic Goal</h3>
            <p className="text-sm text-zinc-500 font-medium mb-6">Set your target course for admission.</p>
          </div>
          
          <div className="relative group">
            <select 
              value={userDoc?.target_course || ""}
              onChange={(e) => handleUpdateGoal(e.target.value)}
              disabled={savingGoal}
              className="w-full h-14 pl-4 pr-10 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm text-zinc-900 dark:text-zinc-100 appearance-none focus:ring-2 focus:ring-amber-500 outline-none transition-all cursor-pointer truncate"
            >
              <option value="" disabled>Select Target Course...</option>
              {allCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <ChevronRight size={18} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Performance Predictor Row */}
      {prediction && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-zinc-950 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 overflow-hidden shadow-2xl border border-zinc-800"
        >
          {/* Neon Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px] -mr-48 -mt-48 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
            <div className="flex-1 space-y-4 sm:space-y-6 w-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tighter flex items-center gap-2">
                    AI Performance Predictor <Sparkles size={16} className="text-indigo-400" />
                  </h2>
                  <p className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Powered by Predictive Mastery™ Engine</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {prediction.insights.map((insight, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 text-zinc-300">
                    <div className={i === 0 ? "text-green-400" : "text-amber-400"} style={{ flexShrink: 0 }}>
                      {i === 0 ? <Zap size={18} /> : <Info size={18} />}
                    </div>
                    <span className="text-xs sm:text-sm font-bold truncate">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 bg-white/5 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 border border-white/10 shrink-0 w-full lg:w-auto">
               <div className="text-center">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Projected JAMB Score</p>
                  <div className="flex items-end gap-2 justify-center">
                    <span className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tighter">{prediction.score}</span>
                    <span className="text-lg sm:text-xl font-bold text-zinc-600 mb-1">/ 400</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      prediction.trend === 'up' ? 'bg-green-500/10 text-green-500' : prediction.trend === 'down' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-500/10 text-zinc-500'
                    }`}>
                      <TrendingUp size={12} className={prediction.trend === 'down' ? 'rotate-180' : ''} /> {prediction.trend} Trend
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <div className={`h-1.5 w-1.5 rounded-full ${prediction.confidence === 'High' ? 'bg-green-500' : prediction.confidence === 'Medium' ? 'bg-amber-500' : 'bg-red-500'}`} />
                      {prediction.confidence} Confidence
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                {stat.trend}
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Test History */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Test History</h3>
          <Link
            href="/dashboard/results"
            className="text-green-600 text-sm font-medium hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading test history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900 mb-2">No tests yet</p>
            <p className="text-gray-600 mb-6">Start your first practice session to see your progress here</p>
            <Link
              href="/dashboard/exams"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <PlayCircle className="h-4 w-4" />
              Start First Exam
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sessions.map((session) => {
              const percentage = Math.round(session.percentage || 0);
              const scoreColor = percentage >= 70
                ? 'bg-green-100 text-green-800 border-green-200'
                : percentage >= 50
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : 'bg-red-100 text-red-800 border-red-200';

              const date = session.timestamp?.toDate
                ? new Date(session.timestamp.toDate()).toLocaleDateString()
                : '—';

              return (
                <div key={session.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {session.exam_body || 'Practice Session'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {session.subjects?.slice(0, 3).join(', ') || '—'}
                          {session.subjects?.length > 3 && ` +${session.subjects.length - 3} more`}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {session.timeUsed ? `${Math.floor(session.timeUsed / 60)}m` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full border text-sm font-semibold ${scoreColor}`}>
                        {percentage}%
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {session.score}/{session.total} correct
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}