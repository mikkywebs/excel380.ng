"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { Sidebar } from "@/components/admin/Sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { config } = useAppConfig();
  const router = useRouter();

  const brandColor = config?.primary_color || "#45a257";

  useEffect(() => {
    // Redirect if loaded and not an admin
    if (!authLoading && (!user || !isAdmin)) {
      router.replace("/dashboard");
    }
  }, [user, isAdmin, authLoading, router]);

  // Show a loading screen while auth state is resolving or before redirect triggers
  if (authLoading || (!user || !isAdmin)) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black"
        style={{ "--brand": brandColor } as React.CSSProperties}
      >
        <Loader2 size={32} className="animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  return (
    <div 
      className="main-layout flex flex-col lg:flex-row min-h-screen bg-zinc-50 dark:bg-black font-sans"
      style={{ "--brand": brandColor } as React.CSSProperties}
    >
      <Sidebar />
      <main className="flex-1 w-full min-h-screen">
        <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
