'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings,
  LogOut, Menu, X, RotateCcw, Building2, BarChart2, Tag,
  Bell, Mail,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingReturns, setPendingReturns] = useState(0);
  const [pendingInquiries, setPendingInquiries] = useState(0);

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
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') { router.push('/'); return; }

      setIsAdmin(true);
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;
    const threshold = parseInt(localStorage.getItem('stockThreshold') ?? '5', 10);
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .lt('stock', threshold)
      .then(({ count }) => setLowStockCount(count ?? 0));

    supabase
      .from('return_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingReturns(count ?? 0));

    supabase
      .from('bulk_inquiries')
      .select('id', { count: 'exact', head: true })
      .or('status.eq.pending,status.is.null')
      .then(({ count }) => setPendingInquiries(count ?? 0));
  }, [isAdmin, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const menuItems = [
    { href: '/admin/dashboard',    label: 'Dashboard',      icon: LayoutDashboard, badge: 0 },
    { href: '/admin/analytics',    label: 'Analytics',      icon: BarChart2,        badge: 0 },
    { href: '/admin/products',     label: 'Products',       icon: Package,          badge: lowStockCount },
    { href: '/admin/orders',       label: 'Orders',         icon: ShoppingBag,      badge: 0 },
    { href: '/admin/returns',      label: 'Returns',        icon: RotateCcw,        badge: pendingReturns },
    { href: '/admin/corporate',    label: 'Corporate',      icon: Building2,        badge: pendingInquiries },
    { href: '/admin/promo-codes',  label: 'Promo Codes',    icon: Tag,              badge: 0 },
    { href: '/admin/notifications',label: 'Notifications',  icon: Bell,             badge: 0 },
    { href: '/admin/newsletter',   label: 'Newsletter',     icon: Mail,             badge: 0 },
    { href: '/admin/customers',    label: 'Customers',      icon: Users,            badge: 0 },
    { href: '/admin/settings',     label: 'Settings',       icon: Settings,         badge: 0 },
  ];

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Overlay backdrop — mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-white shadow-xl flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo / brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div>
            <h2 className="text-xl font-bold leading-tight">
              <span className="text-blue-600">Admin</span>
              <span className="text-orange-500"> Panel</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Fresh Talent Store</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                `}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t shrink-0">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content — never shifted on mobile; shifted on desktop when sidebar open */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Top header */}
        <header className="bg-white shadow-sm sticky top-0 z-20 shrink-0">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              {/* Breadcrumb hint */}
              <span className="hidden sm:block text-sm text-gray-400 capitalize">
                {pathname?.split('/').filter(Boolean).slice(1).join(' › ') || 'Dashboard'}
              </span>
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
