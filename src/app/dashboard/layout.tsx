"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { LayoutDashboard, BookOpen, History, CreditCard, User, Settings, LogOut, GraduationCap, Bell, WifiOff, Zap, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/exams', icon: BookOpen, label: 'Start Exam' },
  { href: '/dashboard/results', icon: History, label: 'My Results' },
  { href: '/dashboard/upgrade', icon: CreditCard, label: 'Upgrade' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, userDoc, loading, isPaid } = useAuth();
  const { config } = useAppConfig();
  const pathname = usePathname();
  const router = useRouter();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
  }, [loading, user, router]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <GraduationCap className="h-10 w-10 text-primary animate-pulse" />
    </div>
  );

  const tier = userDoc?.subscription_tier ?? 'explorer';
  const credits = userDoc?.credits ?? 0;
  const freeCredits = config?.free_credits ?? 100;
  const displayName = userDoc?.displayName ?? user?.displayName ?? 'Student';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const creditPercent = Math.min(100, Math.round((credits / freeCredits) * 100));

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-muted/20">
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-border">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Excel <span className="text-primary">380</span></span>
        </div>
        
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{displayName}</p>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                {tier}
              </span>
            </div>
            {isOffline && (
              <span className="ml-auto flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
                <WifiOff className="h-3 w-3" />Offline
              </span>
            )}
          </div>

          {isPaid ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-primary">Unlimited Access</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-bold">{credits} / {freeCredits}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${creditPercent < 20 ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: creditPercent + '%' }}
                />
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-primary/10 text-primary border border-primary/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <div className="flex items-center gap-3">
            {isOffline && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">
                <WifiOff className="h-3.5 w-3.5" />You're offline
              </span>
            )}
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>

        <nav className="md:hidden border-t border-border bg-card flex">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
