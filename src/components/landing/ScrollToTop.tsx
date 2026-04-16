"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[99] p-4 bg-[var(--brand)] text-white font-bold rounded-full shadow-2xl hover:bg-green-700 hover:shadow-[var(--brand)]/50 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[var(--brand)]/50 border border-white/20 dark:border-zinc-800/50"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 stroke-[3]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
