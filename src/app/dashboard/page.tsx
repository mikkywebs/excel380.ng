"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import {
  Clock,
  Trophy,
  BookOpen,
  Target,
  PlayCircle,
  AlertTriangle,
  FileText,
  BarChart2,
  ChevronRight,
  Award,
  Calendar,
  TrendingUp
} from 'lucide-react';

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
          limit(5)
        );

        const snapshot = await getDocs(q);
        const sessionData: TestSession[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TestSession));

        setSessions(sessionData);

        // Calculate stats
        if (sessionData.length > 0) {
          const scores = sessionData.map((s) => s.percentage || 0);
          const subjects = new Set(sessionData.flatMap((s) => s.subjects || []));

          setStats({
            totalTests: sessionData.length,
            avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            bestScore: Math.round(Math.max(...scores)),
            subjectsStudied: subjects.size
          });
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  // Handle pause window countdown
  useEffect(() => {
    const pauseWindow = config?.pause_window_minutes || 30;
    const nextTime = getNextExamTime(lastExamTime, pauseWindow);
    setNextExamTime(nextTime);

    if (nextTime && nextTime > new Date()) {
      const interval = setInterval(() => {
        setCountdown(formatCountdown(nextTime));
        if (nextTime <= new Date()) {
          setNextExamTime(null);
          setCountdown("");
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lastExamTime, config]);

  const isInPauseWindow = nextExamTime && nextExamTime > new Date();

  const quickStats = [
    {
      icon: <Trophy className="h-6 w-6 text-green-600" />,
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
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-green-100">Ready to practice? Let's crush your exam prep today.</p>
          </div>
          <Link
            href="/dashboard/exams"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${isInPauseWindow
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-white text-green-600 hover:bg-green-50'
              }`}
            onClick={isInPauseWindow ? (e) => e.preventDefault() : undefined}
          >
            <PlayCircle className="h-5 w-5" />
            {isInPauseWindow ? 'Please Wait' : 'Start New Exam'}
          </Link>
        </div>
      </div>

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