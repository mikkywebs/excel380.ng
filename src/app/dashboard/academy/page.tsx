"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { Building2, Users, FileText, Settings, Copy, ShieldCheck, UserX, Loader2, Target, Download, Printer, FileSpreadsheet, MonitorPlay, Activity, Clock as ClockIcon } from "lucide-react";

interface Institution {
  id: string;
  name: string;
  ownerId: string;
  max_seats: number;
  active_student_ids: string[];
  invite_code: string;
  created_at: any;
}

export default function AcademyDashboard() {
  const { user, userDoc, isAcademy } = useAuth();
  const { config } = useAppConfig();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [batchAnalytics, setBatchAnalytics] = useState<{ totalTests: number, averageScore: number }>({ totalTests: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [academyName, setAcademyName] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [fullReportData, setFullReportData] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'roster' | 'live'>('roster');

  useEffect(() => {
    if (!user || (!isAcademy && userDoc?.subscription_tier !== "academy")) {
      setLoading(false);
      return;
    }

    const fetchAcademyData = async () => {
      try {
        const q = query(collection(db, "institutions"), where("ownerId", "==", user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const instDoc = snapshot.docs[0];
          const instData = { id: instDoc.id, ...instDoc.data() } as Institution;
          setInstitution(instData);

          // Fetch student roster if active_students exist
          if (instData.active_student_ids?.length > 0) {
            const BATCH_SIZE = 10;
            const fetchedStudents: any[] = [];

            // Firebase limits 'in' queries to 10 elements. We chunk it.
            for (let i = 0; i < instData.active_student_ids.length; i += BATCH_SIZE) {
              const chunk = instData.active_student_ids.slice(i, i + BATCH_SIZE);
              const studentQ = query(collection(db, "users"), where("__name__", "in", chunk));
              const studentSnap = await getDocs(studentQ);

              studentSnap.docs.forEach(doc => {
                fetchedStudents.push({ uid: doc.id, ...doc.data() });
              });
            }

            setStudents(fetchedStudents);

            // Fetch Batch Analytics (Test Sessions)
            let _totalTests = 0;
            let _totalPercentageScore = 0;

            for (let i = 0; i < instData.active_student_ids.length; i += BATCH_SIZE) {
              const chunk = instData.active_student_ids.slice(i, i + BATCH_SIZE);
              const sessionQ = query(collection(db, "test_sessions"), where("userId", "in", chunk));
              const sessionSnap = await getDocs(sessionQ);

              _totalTests += sessionSnap.size;
              sessionSnap.docs.forEach(doc => {
                _totalPercentageScore += (doc.data().percentage || 0);
              });
            }

            setBatchAnalytics({
              totalTests: _totalTests,
              averageScore: _totalTests > 0 ? Math.round(_totalPercentageScore / _totalTests) : 0
            });
          }
        }
      } catch (err) {
        console.error("Error fetching academy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademyData();
  }, [user, isAcademy, userDoc]);

  // Real-time Active Session Listener
  useEffect(() => {
    if (!institution?.id) return;

    const q = query(
      collection(db, "active_sessions"),
      where("institutionId", "==", institution.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date().getTime();
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).filter((s: any) => {
        // Only show sessions active in the last 5 minutes (heartbeat check)
        const lastActive = s.lastActive?.toDate().getTime() || 0;
        return (now - lastActive) < 5 * 60000;
      });
      setActiveSessions(sessions);
    });

    return () => unsubscribe();
  }, [institution?.id]);

  const generateInviteCode = () => {
    return 'XL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSetupAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academyName || !user) return;
    setLoading(true);

    try {
      const code = generateInviteCode();
      const newInst = {
        name: academyName,
        ownerId: user.uid,
        max_seats: config?.max_institution_students || 500,
        active_student_ids: [],
        invite_code: code,
        created_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "institutions"), newInst);
      setInstitution({ id: docRef.id, ...newInst });
    } catch (err) {
      console.error(err);
      alert("Failed to setup academy");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!institution) return;
    navigator.clipboard.writeText(institution.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeStudent = async (studentId: string) => {
    if (!institution || !confirm("Are you sure you want to revoke Premium access for this student? This action cannot be undone.")) return;

    try {
      // Remove from institution roster
      await updateDoc(doc(db, "institutions", institution.id), {
        active_student_ids: arrayRemove(studentId)
      });

      // Downgrade student document
      await updateDoc(doc(db, "users", studentId), {
        subscription_tier: "explorer",
        institution_id: null
      });

      // Update local state
      setStudents(prev => prev.filter(s => s.uid !== studentId));
      setInstitution(prev => prev ? { ...prev, active_student_ids: prev.active_student_ids.filter(id => id !== studentId) } : null);

      alert("Seat revoked successfully. 1 seat has been returned to your pool.");
    } catch (err) {
      console.error(err);
      alert("Failed to revoke student seat.");
    }
  };

  const handleExportData = async (format: 'csv' | 'pdf') => {
    if (!institution || students.length === 0) return;
    setIsExporting(true);

    try {
      const BATCH_SIZE = 10;
      const allSessions: any[] = [];

      // Fetch ALL sessions for ALL students (chunked)
      for (let i = 0; i < institution.active_student_ids.length; i += BATCH_SIZE) {
        const chunk = institution.active_student_ids.slice(i, i + BATCH_SIZE);
        const sessionQ = query(collection(db, "test_sessions"), where("userId", "in", chunk));
        const sessionSnap = await getDocs(sessionQ);

        sessionSnap.docs.forEach(doc => {
          const data = doc.data();
          const student = students.find(s => s.uid === data.userId);
          allSessions.push({
            id: doc.id,
            studentName: student?.displayName || 'Unknown',
            studentEmail: student?.email || 'Unknown',
            targetCourse: student?.target_course || 'Not Set',
            exam: data.exam_body || 'Practice',
            subjects: data.subjects?.join(', ') || '—',
            score: data.score || 0,
            total: data.total || 0,
            percentage: data.percentage || 0,
            date: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : '—',
            rawDate: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(0)
          });
        });
      }

      // Sort by date descending
      allSessions.sort((a, b) => b.rawDate - a.rawDate);

      if (format === 'csv') {
        const headers = ["Student", "Email", "Target Course", "Exam", "Subjects", "Score", "Total", "%", "Date"];
        const rows = allSessions.map(s => [
          `"${s.studentName}"`,
          `"${s.studentEmail}"`,
          `"${s.targetCourse}"`,
          `"${s.exam}"`,
          `"${s.subjects}"`,
          s.score,
          s.total,
          `${s.percentage}%`,
          `"${s.date}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Excel380_Report_${institution.name.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setFullReportData(allSessions);
        setTimeout(() => {
          window.print();
        }, 500);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate report data.");
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={32} /></div>;
  }

  if (!isAcademy && userDoc?.subscription_tier !== "academy") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-96 bg-white dark:bg-black rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-xl">
        <ShieldCheck size={64} className="text-zinc-200 dark:text-zinc-800 mb-6" />
        <h2 className="text-2xl font-black mb-2">Restricted Area</h2>
        <p className="text-zinc-500 max-w-sm">This control panel is strictly reserved for Excel 380 Academy Institution Owners.</p>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-black rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-xl">
        <Building2 size={64} className="text-amber-500 mb-6" />
        <h2 className="text-3xl font-black tracking-tighter mb-2">Welcome to Academy</h2>
        <p className="text-zinc-500 max-w-md mx-auto mb-8 font-medium">To begin managing your institution and allocating your 500 Premium seats, please register your institution name below.</p>

        <form onSubmit={handleSetupAcademy} className="w-full max-w-md flex flex-col gap-4">
          <input
            type="text"
            placeholder="e.g. Brainiac Tutorial Center"
            value={academyName}
            onChange={(e) => setAcademyName(e.target.value)}
            className="h-14 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 block w-full focus:ring-2 focus:ring-amber-500 outline-none"
            required
          />
          <button type="submit" className="h-14 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95">
            Initialize Institution
          </button>
        </form>
      </div>
    );
  }

  const seatsUsed = institution.active_student_ids?.length || 0;
  const seatsLeft = institution.max_seats - seatsUsed;
  const utilization = Math.round((seatsUsed / institution.max_seats) * 100);

  return (
    <div className="space-y-8">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-amber-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10 w-full sm:w-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4">
            <Building2 size={14} /> {seatsLeft} SEATS REMAINING
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter break-words">{institution.name}</h1>
          <p className="text-amber-100/80 mt-1 font-medium text-sm">Institutional Control Panel</p>
        </div>

        {/* Invite Code Block */}
        <div className="relative z-10 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Student Invite Code</p>
            <p className="text-lg sm:text-xl font-black text-white tracking-widest leading-none">{institution.invite_code}</p>
          </div>
          <button onClick={copyToClipboard} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 border border-white/20 shrink-0">
            {copied ? <ShieldCheck size={18} className="text-green-400" /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col items-center justify-center text-center gap-2">
          <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{seatsUsed}</p>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Enrolled</p>
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col items-center justify-center text-center gap-2">
          <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{institution.max_seats}</p>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Capacity</p>
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col items-center justify-center text-center gap-2">
          <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{utilization}%</p>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Utilization</p>
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-[20px] pointer-events-none" />
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center relative z-10">
            <FileText size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{batchAnalytics.totalTests}</p>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Exams Taken</p>
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 p-6 rounded-[2rem] shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col items-center justify-center text-center gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 blur-[20px] pointer-events-none" />
          <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center relative z-10">
            <Building2 size={20} />
          </div>
          <div className="relative z-10">
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{batchAnalytics.averageScore}%</p>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Avg Score</p>
          </div>
        </div>
      </div>

      {/* Analytics & Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-[2rem] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="w-full">
              <h2 className="text-xl font-black tracking-tighter flex items-center gap-3 mb-1">
                <FileSpreadsheet className="text-blue-500 shrink-0" size={24} /> BATCH REPORTS
              </h2>
              <p className="text-zinc-500 text-sm font-medium">Export student results for administrative review.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleExportData('csv')}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 h-12 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="animate-spin h-4 w-4" /> : <Download size={16} />}
                Export CSV
              </button>

              <button
                onClick={() => handleExportData('pdf')}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 h-12 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="animate-spin h-4 w-4" /> : <Printer size={16} />}
                Print PDF
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] -mr-16 -mt-16 rounded-full" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Pro Tip</p>
          <h3 className="text-base sm:text-lg font-bold leading-tight mb-4 tracking-tight">Use CSV for detailed analysis in Google Sheets.</h3>
          <div className="flex items-center gap-2 text-[10px] font-black bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-md uppercase tracking-widest">
            <ShieldCheck size={12} /> Data Secured
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-900 mb-8 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-8 py-4 font-black transition-all border-b-2 flex items-center gap-2 shrink-0 ${activeTab === 'roster' ? 'border-amber-600 text-amber-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          <Users size={18} /> STUDENT ROSTER
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={`px-8 py-4 font-black transition-all border-b-2 flex items-center gap-2 shrink-0 ${activeTab === 'live' ? 'border-amber-600 text-amber-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          <MonitorPlay size={18} /> LIVE MONITORING
          {activeSessions.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">{activeSessions.length}</span>
          )}
        </button>
      </div>

      {/* Tabbed Content */}
      <div className="min-h-[400px]">
        {activeTab === 'roster' ? (
          <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] shadow-xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  <tr>
                    <th className="px-8 py-6">Student</th>
                    <th className="px-8 py-4">Target Course</th>
                    <th className="px-8 py-4 text-center">Seats</th>
                    <th className="px-8 py-4">Reg. Date</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {students.map((stu) => (
                    <tr key={stu.uid} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="font-bold text-zinc-900 dark:text-zinc-50">{stu.displayName || 'Unnamed Student'}</p>
                        <p className="text-sm text-zinc-500">{stu.email}</p>
                      </td>
                      <td className="px-8 py-5">
                        {stu.target_course ? (
                          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                            <div className="h-6 w-6 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded flex items-center justify-center shrink-0">
                              <Target size={14} />
                            </div>
                            <span className="truncate max-w-[150px]">{stu.target_course}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest italic">Not Set</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider rounded-md">
                          Institutional
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm text-zinc-500 font-medium italic">
                          {stu.created_at?.toDate ? new Date(stu.created_at.toDate()).toLocaleDateString() : "Unknown"}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => revokeStudent(stu.uid)}
                          className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all active:scale-95"
                          title="Revoke Access"
                        >
                          <UserX size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <Users size={48} className="text-zinc-100 mx-auto mb-4" />
                        <p className="text-zinc-400 font-medium">No students registered yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map((session) => (
              <div key={session.id} className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-black text-lg tracking-tight mb-1">{session.userName}</h3>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={12} /> {session.body} PRACTICE
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {session.subjects.map((sub: string) => (
                      <span key={sub} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-lg text-[10px] font-bold">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <ClockIcon size={14} />
                    <span className="text-[10px] font-bold">Started {session.startTime?.toDate ? new Date(session.startTime.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                </div>
              </div>
            ))}

            {activeSessions.length === 0 && (
              <div className="col-span-full bg-zinc-50 dark:bg-zinc-900/50 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[2rem] p-12 text-center">
                <MonitorPlay size={48} className="text-zinc-200 mx-auto mb-4" />
                <h3 className="text-xl font-black tracking-tight text-zinc-400 uppercase">No Live Sessions</h3>
                <p className="text-zinc-400 text-sm mt-2 font-medium">When students start taking exams, they will appear here in real-time.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden Print View */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter">{institution.name}</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Institutional Performance Report</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
              <p className="text-xs text-zinc-500">Excel 380 Academy Platform</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12 bg-zinc-50 p-6 rounded-2xl">
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Student Tests</p>
              <p className="text-3xl font-black">{fullReportData.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Institutional Average</p>
              <p className="text-3xl font-black">{batchAnalytics.averageScore}%</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-900 text-[10px] font-black uppercase tracking-widest">
                <th className="py-4">Student</th>
                <th className="py-4">Exam</th>
                <th className="py-4">Subjects</th>
                <th className="py-4 text-center">Score</th>
                <th className="py-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {fullReportData.map((s, i) => (
                <tr key={i} className="text-sm">
                  <td className="py-4 pr-4">
                    <p className="font-bold">{s.studentName}</p>
                    <p className="text-[10px] text-zinc-500">{s.targetCourse}</p>
                  </td>
                  <td className="py-4 pr-4 font-medium">{s.exam}</td>
                  <td className="py-4 pr-4 text-xs max-w-[200px] truncate">{s.subjects}</td>
                  <td className="py-4 text-center">
                    <span className="font-black">{s.percentage}%</span>
                    <p className="text-[9px] text-zinc-500">[{s.score}/{s.total}]</p>
                  </td>
                  <td className="py-4 text-right text-xs font-medium">{s.date.split(',')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-20 pt-8 border-t border-zinc-200 text-center">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Generated via Excel 380 - Nigeria's #1 CBT Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}
