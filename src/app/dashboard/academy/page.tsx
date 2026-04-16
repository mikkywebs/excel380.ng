"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { Building2, Users, FileText, Settings, Copy, ShieldCheck, UserX, Loader2 } from "lucide-react";

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
      <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-amber-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Building2 size={14} /> {seatsLeft} SEATS REMAINING
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter">{institution.name}</h1>
          <p className="text-amber-100/80 mt-1 font-medium">Institutional Control Panel</p>
        </div>
        
        {/* Invite Code Block */}
        <div className="relative z-10 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4">
          <div>
            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Student Invite Code</p>
            <p className="text-xl font-black text-white tracking-widest">{institution.invite_code}</p>
          </div>
          <button onClick={copyToClipboard} className="h-12 w-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 border border-white/20">
            {copied ? <ShieldCheck size={20} className="text-green-400" /> : <Copy size={20} />}
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

      {/* Roster & Analytics Toggle */}
      <div className="bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tighter flex items-center gap-3">
            <Users className="text-amber-500" size={24} /> STUDENT ROSTER
          </h2>
        </div>

        <div className="p-0 overflow-x-auto custom-scrollbar">
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-zinc-500 font-medium">No students have joined your institution yet.</p>
              <p className="text-sm text-zinc-400 mt-2">Send them your Invite Code to get started!</p>
            </div>
          ) : (
            <table className="w-full text-left whitespace-nowrap min-w-[600px]">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs font-black uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Role</th>
                  <th className="px-8 py-4">Account Tag</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {students.map((stu) => (
                  <tr key={stu.uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-zinc-900 dark:text-zinc-50">{stu.displayName || 'Unnamed Student'}</p>
                      <p className="text-sm text-zinc-500">{stu.email}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-md">
                        {stu.role || 'student'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 w-fit">
                        <ShieldCheck size={12} /> Institutional
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => revokeStudent(stu.uid)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        <UserX size={14} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
