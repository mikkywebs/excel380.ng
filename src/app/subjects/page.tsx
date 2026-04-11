"use client";

import React from "react";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SubjectsGrid } from "@/components/landing/SubjectsGrid";

export default function SubjectsPage() {
  const { config, loading } = useAppConfig();

  // Define the base brand color
  const brandColor = config?.primary_color || "#45a257";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-zinc-100 border-t-[var(--brand)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen selection:bg-[var(--brand)] selection:text-white block bg-white dark:bg-black"
      style={{ "--brand": brandColor } as React.CSSProperties}
    >
      <Navbar />
      
      <main className="pt-24 min-h-screen">
        <SubjectsGrid />
      </main>

      <Footer />
    </div>
  );
}
