"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Loader2, User, CreditCard, Activity, Calendar, ShieldBan, Save, X } from "lucide-react";
import { format } from "date-fns";

export default function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [editTier, setEditTier] = useState("");
  const [editCredits, setEditCredits] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const q = query(collection(db, "users"), orderBy("created_at", "desc"), limit(100));
        const snap = await getDocs(q);
        setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [selectedUser]); // refetch when selectedUser closes, cheap way to sync

  const openUser = (u: any) => {
    setSelectedUser(u);
    setEditTier(u.subscription_tier || "explorer");
    setEditCredits(u.credits || 0);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", selectedUser.id);
      await setDoc(userRef, {
        subscription_tier: editTier,
        credits: editCredits
      }, { merge: true });
      
      alert("User updated successfully");
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (u.displayName?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
  });

  return (
    <div className="w-full max-w-7xl flex flex-col h-[calc(100vh-2rem)]">
      <div className="flex justify-between items-end gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Users</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage accounts, active tiers, and free credits.</p>
        </div>
      </div>

      <div className="relative mb-4 shrink-0">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input 
          type="text" 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-100"
        />
      </div>

      <div className="flex-1 bg-white border border-zinc-200 rounded-2xl shadow-sm dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 h-full">
          {loading ? (
             <div className="p-8 flex justify-center items-center h-full">
               <Loader2 className="animate-spin text-zinc-400" size={32} />
             </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900/50 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status / Role</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} onClick={() => openUser(u)} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold uppercase">
                          {u.displayName ? u.displayName.charAt(0) : <User size={16}/>}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-[var(--brand)] transition-colors">{u.displayName || "Unknown"}</span>
                          <span className="text-xs text-zinc-500">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.suspended ? (
                        <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider dark:bg-red-900/30 dark:text-red-400">Suspended</span>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-100 dark:text-zinc-800' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {u.role || "student"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 capitalize font-medium text-zinc-700 dark:text-zinc-300">
                      {u.subscription_tier ? u.subscription_tier.replace('_', ' ') : "explorer"}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-zinc-600 dark:text-zinc-400">
                      {u.credits || 0}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {u.created_at?.toDate ? format(u.created_at.toDate(), "MMM d, yyyy") : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setSelectedUser(null)} />
          <div className="absolute right-0 inset-y-0 w-full max-w-md bg-white shadow-2xl dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col transform transition-transform">
            
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between bg-zinc-50 dark:bg-zinc-900/30 shrink-0">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-[var(--brand)] flex items-center justify-center text-white font-black text-xl">
                  {selectedUser.displayName ? selectedUser.displayName.charAt(0) : "U"}
                </div>
                <div>
                  <h2 className="text-xl font-bold leading-tight">{selectedUser.displayName || "Unknown User"}</h2>
                  <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-zinc-200/50 rounded-xl hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><CreditCard size={16}/> Modify Access</h3>
                
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold">Subscription Tier</span>
                  <select 
                    value={editTier}
                    onChange={(e) => setEditTier(e.target.value)}
                    className="h-11 px-4 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 text-sm font-medium capiltalize"
                  >
                    <option value="explorer">Explorer (Free)</option>
                    <option value="scholar">Scholar</option>
                    <option value="scholar_pro">Scholar Pro</option>
                    <option value="academy">Academy</option>
                    <option value="academy_elite">Academy Elite</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-bold">Credits Balance</span>
                  <input 
                    type="number" 
                    value={editCredits}
                    onChange={(e) => setEditCredits(Number(e.target.value))}
                    className="h-11 px-4 rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 font-mono" 
                  />
                  <p className="text-xs text-zinc-500">Credits are used for AI explanations and exams if not on a paid plan.</p>
                </label>
              </div>

              <div className="flex flex-col gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Activity size={16}/> Stats Preview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 font-bold mb-1">Joined</p>
                    <p className="font-semibold">{selectedUser.created_at?.toDate ? format(selectedUser.created_at.toDate(), "MMM d, yyyy") : "N/A"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 font-bold mb-1">Last Active</p>
                    <p className="font-semibold">{selectedUser.last_test_at?.toDate ? format(selectedUser.last_test_at.toDate(), "MMM d, yyyy") : "Never"}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6 mt-auto">
                <button className="flex items-center justify-center gap-2 h-11 rounded-xl text-red-600 font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 transition-colors">
                  <ShieldBan size={18} /> Suspend Account
                </button>
              </div>

            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
              <button 
                onClick={handleSaveUser}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-[var(--brand)] text-white font-bold tracking-wide hover:opacity-90 transition-all shadow-lg shadow-[var(--brand)]/20 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
