"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { GraduationCap, Loader2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { config } = useAppConfig();
  const brandColor = config?.primary_color || "#45a257";

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black"
        style={{ "--brand": brandColor } as React.CSSProperties}
      >
        <Loader2 size={32} className="animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  if (user) return null; // Will redirect via useEffect

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black"
      style={{ "--brand": brandColor } as React.CSSProperties}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div className="h-11 w-11 bg-[var(--brand)] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[var(--brand)]/20">
          <GraduationCap size={26} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Excel 380
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-200/50 p-8 dark:bg-zinc-950 dark:border-zinc-900 dark:shadow-none">
        {children}
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center mt-8">
        © {new Date().getFullYear()} Excel 380 Platform. All rights reserved.
      </p>
    </div>
  );
}
