"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  LayoutDashboard, 
  FileQuestion, 
  Sparkles, 
  Users, 
  Building2, 
  Settings, 
  ArrowLeft,
  Menu,
  X
} from "lucide-react";
import { clsx } from "clsx";

const navLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Questions", href: "/admin/questions", icon: FileQuestion },
  { name: "AI Staging", href: "/admin/questions/ai-staging", icon: Sparkles },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Institutions", href: "/admin/institutions", icon: Building2 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiStagingCount, setAiStagingCount] = useState<number | null>(null);

  useEffect(() => {
    // Listen for AI staging documents
    const unsub = onSnapshot(collection(db, "ai_generated_questions_staging"), (snapshot) => {
      setAiStagingCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching AI staging count:", error);
    });

    return () => unsub();
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 dark:bg-black dark:border-zinc-800">
      <div className="flex flex-col items-start gap-1 p-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          Excel 380 
          <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider dark:bg-red-900/30 dark:text-red-400">
            ADMIN
          </span>
        </Link>
        <p className="text-xs text-zinc-500 font-medium">Control Center</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1.5">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50" 
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200"
              )}
            >
              <Icon 
                size={18} 
                className={clsx(
                  "shrink-0 transition-colors", 
                  isActive ? "text-[var(--brand)]" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                )} 
              />
              <span className="flex-1">{link.name}</span>
              
              {link.name === "AI Staging" && aiStagingCount !== null && aiStagingCount > 0 && (
                <span className="bg-[var(--brand)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                  {aiStagingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200 transition-all"
        >
          <ArrowLeft size={18} className="shrink-0 text-zinc-400" />
          Exit Admin Panel
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-zinc-200 dark:bg-black dark:border-zinc-800 sticky top-0 z-40">
        <Link href="/" className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          Excel 380 
          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest dark:bg-red-900/30 dark:text-red-400">
            ADMIN
          </span>
        </Link>
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-1.5 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900"
        >
          <Menu size={20} />
          {aiStagingCount !== null && aiStagingCount > 0 && (
            <span className="absolute top-3.5 right-3.5 h-2.5 w-2.5 rounded-full bg-[var(--brand)] border-2 border-white dark:border-black" />
          )}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 lg:hidden transition-transform duration-300 shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button 
          className="absolute top-4 right-4 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 z-40 shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}
