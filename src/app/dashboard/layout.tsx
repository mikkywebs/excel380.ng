"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import {
  LayoutDashboard,
  PlayCircle,
  BarChart3,
  BookOpen,
  Crown,
  Menu,
  X,
  User,
  LogOut,
  Building,
  WifiOff,
  Zap,
  Compass
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/jamb-combinations', label: 'Combinations', icon: Compass },
  { href: '/dashboard/institutions', label: 'Cut-Offs', icon: Building },
  { href: '/dashboard/exams', label: 'Start Exam', icon: PlayCircle },
  { href: '/dashboard/results', label: 'My Results', icon: BarChart3 },
  { href: '/dashboard/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/dashboard/upgrade', label: 'Upgrade', icon: Crown },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userDoc, loading } = useAuth();
  const { config } = useAppConfig();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = userDoc?.displayName || user?.displayName || 'Student';
  const credits = userDoc?.credits || 0;
  const tier = userDoc?.subscription_tier || 'explorer';
  const isPaid = tier !== 'explorer';
  const freeCredits = config?.free_credits || 100;
  const creditPercentage = isPaid ? 100 : Math.min((credits / freeCredits) * 100, 100);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const NavLink = ({ item, mobile = false }: { item: typeof navItems[0]; mobile?: boolean }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={mobile ? () => setSidebarOpen(false) : undefined}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
            ? 'bg-green-100 text-green-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold">Excel <span className="text-green-600">380</span></span>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate">{displayName}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier === 'explorer' ? 'bg-gray-100 text-gray-700' :
                      tier === 'scholar' ? 'bg-green-100 text-green-700' :
                        tier === 'scholar_pro' ? 'bg-blue-100 text-blue-700' :
                          tier === 'academy' ? 'bg-purple-100 text-purple-700' :
                            'bg-gold-100 text-gold-700'
                    }`}>
                    {tier === 'explorer' ? 'Explorer' :
                      tier === 'scholar' ? 'Scholar' :
                        tier === 'scholar_pro' ? 'Scholar Pro' :
                          tier === 'academy' ? 'Academy' : 'Academy Elite'}
                  </span>
                  {!isOnline && (
                    <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Credits */}
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Credits:</span>
                <span className="font-medium">
                  {isPaid ? 'Unlimited' : `${credits}`}
                </span>
              </div>
              {!isPaid && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${creditPercentage}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            {userDoc?.subscription_tier === 'academy' && (
              <NavLink item={{ href: '/dashboard/academy', label: 'Academy Panel', icon: Building }} />
            )}
            {userDoc?.subscription_tier === 'academy_elite' && (
              <NavLink item={{ href: '/dashboard/academy', label: 'Academy Panel', icon: Building }} />
            )}
          </nav>

          {/* Sign Out */}
          <div className="px-6 py-4 border-t border-gray-200">
            {userDoc?.role !== 'admin' && (
              <button
                onClick={async () => {
                  const { doc, setDoc } = await import('firebase/firestore');
                  const { db } = await import('@/lib/firebase');
                  await setDoc(doc(db, 'users', user.uid), { role: 'admin' }, { merge: true });
                  alert("You are now an Admin! Refreshing...");
                  window.location.reload();
                }}
                className="flex items-center justify-center gap-3 px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full font-bold text-xs mb-3 shadow-md"
              >
                <span>Make Me Admin (Dev)</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold">Excel <span className="text-green-600">380</span></span>
          </div>

          <div className="flex items-center gap-3">
            {!isOnline && (
              <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                <WifiOff className="h-3 w-3" />
                Offline
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />

            <div className="relative flex flex-col w-full max-w-xs bg-white">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">E</span>
                  </div>
                  <span className="text-xl font-bold">Excel <span className="text-green-600">380</span></span>
                </div>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile User Info & Navigation */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{displayName}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tier === 'explorer' ? 'bg-gray-100 text-gray-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                        {tier === 'explorer' ? 'Explorer' : 'Scholar'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">
                        {isPaid ? 'Unlimited' : `${credits}`}
                      </span>
                    </div>
                    {!isPaid && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${creditPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <nav className="px-4 py-4 space-y-1">
                  {navItems.map((item) => (
                    <NavLink key={item.href} item={item} mobile />
                  ))}
                </nav>
              </div>

              <div className="px-4 py-4 border-t border-gray-200">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="grid grid-cols-5 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-2 px-1 transition-colors ${isActive
                      ? 'text-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}