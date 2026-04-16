"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Globe, MessageCircle, Camera, Video, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#" },
        { name: "Pricing", href: "#pricing" },
        { name: "Subjects", href: "#subjects" },
        { name: "Download", href: "#download" },
      ],
    },
    {
      title: "Preparation",
      links: [
        { name: "JAMB UTME", href: "#" },
        { name: "WAEC SSCE", href: "#" },
        { name: "NECO Mock", href: "#" },
        { name: "Post-UTME", href: "#" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", href: "#" },
        { name: "Contact Us", href: "#" },
        { name: "Status Page", href: "#" },
        { name: "Resources", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Admin Login", href: "/admin" },
      ],
    },
  ];

  return (
    <footer className="pt-24 pb-12 bg-white dark:bg-black transition-colors border-t border-zinc-100 dark:border-zinc-900">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="max-w-sm flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 bg-[var(--brand)] rounded-xl flex items-center justify-center text-white">
                <GraduationCap size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Excel 380
              </span>
            </Link>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Nigeria's #1 CBT practice platform. Empowering students to excel in JAMB, WAEC, NECO and beyond with offline-first technology.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-[var(--brand)] hover:text-white hover:border-[var(--brand)] transition-all dark:border-zinc-800 dark:text-zinc-400">
                <Globe size={20} />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-[var(--brand)] hover:text-white hover:border-[var(--brand)] transition-all dark:border-zinc-800 dark:text-zinc-400">
                <MessageCircle size={20} />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-[var(--brand)] hover:text-white hover:border-[var(--brand)] transition-all dark:border-zinc-800 dark:text-zinc-400">
                <Camera size={20} />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-[var(--brand)] hover:text-white hover:border-[var(--brand)] transition-all dark:border-zinc-800 dark:text-zinc-400">
                <Video size={20} />
              </Link>
            </div>
          </div>

          {/* Links Columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 lg:pl-12">
            {footerLinks.map((block) => (
              <div key={block.title} className="flex flex-col gap-6">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-50 uppercase text-xs tracking-widest">{block.title}</h4>
                <ul className="flex flex-col gap-3">
                  {block.links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-zinc-500 hover:text-[var(--brand)] transition-colors dark:text-zinc-400 dark:hover:text-zinc-50 text-sm">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-100 dark:border-zinc-900 gap-6">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-1.5 flex-wrap">
            Made with <span className="text-sm">💚</span> for 🇳🇬 Students by <a href="https://wa.link/1a3xt7" target="_blank" rel="noopener noreferrer" className="font-bold text-zinc-900 dark:text-white hover:text-[var(--brand)] dark:hover:text-[var(--brand)] transition-colors">ITHub NG</a>.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm order-first md:order-last">
            © {currentYear} Excel 380 Platform. All rights reserved. Registered with CAC.
          </p>
        </div>
      </div>
    </footer>
  );
}
