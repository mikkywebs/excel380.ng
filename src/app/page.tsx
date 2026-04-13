"use client";

import React from "react";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { motion } from "framer-motion";

// Landing Components
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SubjectsGrid } from "@/components/landing/SubjectsGrid";
import { CutoffsSearch } from "@/components/landing/CutoffsSearch";
import { PricingSection } from "@/components/landing/PricingSection";
import { DownloadSection } from "@/components/landing/DownloadSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  const { config, loading } = useAppConfig();

  // Define the base brand color (fallback to JAMB green)
  const brandColor = config?.primary_color || "#45a257";

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-zinc-100 border-t-[var(--brand)] rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse">Loading Excel 380...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen selection:bg-[var(--brand)] selection:text-white"
      style={{ "--brand": brandColor } as React.CSSProperties}
    >
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Institution Cutoffs Search Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <CutoffsSearch />
        </motion.div>

        {/* How It Works Section */}

        {/* Pricing Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <PricingSection />
        </motion.div>

        {/* Download Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <DownloadSection />
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <Testimonials />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <FAQ />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
