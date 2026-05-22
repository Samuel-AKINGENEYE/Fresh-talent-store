'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // Get total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      // Get total orders
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      // Get total customers (profiles)
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      // Get total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total')
        .eq('payment_status', 'paid');
      
      const revenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      
      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Get low stock products (stock < 10)
      const { data: lowStock } = await supabase
        .from('products')
        .select('name, stock')
        .lt('stock', 10)
        .limit(5);
      
      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalCustomers: customersCount || 0,
        totalRevenue: revenue,
        recentOrders: recentOrders || [],
        lowStockProducts: lowStock || [],
      });
      setLoading(false);
    }
    
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-500' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-green-500' },
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-purple-500' },
    { title: 'Total Revenue', value: `RWF ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-orange-500' },
  ];

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
      
      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            ) : (
              stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-mono text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">RWF {order.total.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Low Stock Alerts
          </h2>
          <div className="space-y-3">
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All products have sufficient stock</p>
            ) : (
              stats.lowStockProducts.map((product: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center border-b pb-3">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-red-600 font-semibold">Stock: {product.stock}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
