'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Menu, X, RotateCcw, Building2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingReturns, setPendingReturns] = useState(0);
  const [pendingInquiries, setPendingInquiries] = useState(0);

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

  // Load low-stock count for Products badge
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 0 },
    { href: '/admin/products', label: 'Products', icon: Package, badge: lowStockCount },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, badge: 0 },
    { href: '/admin/returns', label: 'Returns', icon: RotateCcw, badge: pendingReturns },
    { href: '/admin/corporate', label: 'Corporate', icon: Building2, badge: pendingInquiries },
    { href: '/admin/customers', label: 'Customers', icon: Users, badge: 0 },
    { href: '/admin/settings', label: 'Settings', icon: Settings, badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white shadow-lg transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">
            <span className="text-blue-600">Admin</span>
            <span className="text-orange-500"> Panel</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">Fresh Talent Store</p>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-2 rounded-lg transition ${
                  active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
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

          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition mt-4"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <div className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-sm text-gray-600">Welcome, Admin</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
