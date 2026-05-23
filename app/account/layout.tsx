'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  User, Package, MapPin, Star, Heart, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar by default on wide screens
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      setProfile(profile);
      setLoading(false);
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { href: '/account',           label: 'Overview',      icon: User,    exact: true },
    { href: '/account/orders',    label: 'My Orders',     icon: Package, exact: false },
    { href: '/account/addresses', label: 'Addresses',     icon: MapPin,  exact: false },
    { href: '/wishlist',          label: 'Wishlist',      icon: Heart,   exact: false },
  ];

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h1 className="text-xl font-bold text-gray-900">My Account</h1>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white shadow text-gray-600 hover:bg-gray-50"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-6 lg:gap-8 relative">
          {/* Sidebar */}
          <aside
            className={`
              fixed top-0 left-0 h-full w-72 bg-white z-40 shadow-2xl flex flex-col
              transition-transform duration-300 lg:static lg:h-auto lg:w-64 lg:shadow-none lg:rounded-2xl lg:translate-x-0 lg:self-start
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            {/* Close button — mobile */}
            <div className="flex items-center justify-between px-5 py-4 border-b lg:hidden">
              <span className="font-semibold text-gray-800">My Account</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User card */}
            <div className="px-5 py-6 border-b bg-gradient-to-br from-blue-600 to-blue-700 lg:rounded-t-2xl text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0 ring-2 ring-white/30">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {profile?.full_name || 'Customer'}
                  </p>
                  <p className="text-blue-100 text-xs truncate mt-0.5">{user.email}</p>
                  <p className="text-blue-200 text-xs mt-1">
                    Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navItems.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${active
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Page content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
