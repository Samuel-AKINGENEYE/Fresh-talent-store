'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp } from 'lucide-react';
import LowStockAlert from '@/components/admin/LowStockAlert';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .eq('payment_status', 'paid');
      
      const revenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      
      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalCustomers: customersCount || 0,
        totalRevenue: revenue,
      });
      setLoading(false);
    }
    
    loadStats();
  }, []);

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-green-500' },
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-purple-500' },
    { title: 'Total Revenue', value: `RWF ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Low Stock Alerts */}
      <div className="mb-8">
        <LowStockAlert />
      </div>
      
      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Recent Activity
        </h2>
        <p className="text-gray-500 text-center py-8">
          More analytics coming soon...
        </p>
      </div>
    </div>
  );
}
