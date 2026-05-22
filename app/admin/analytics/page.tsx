'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, ShoppingBag, TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    const now = new Date();
    const currentStart = new Date();
    const previousStart = new Date();
    
    if (period === '7d') {
      currentStart.setDate(now.getDate() - 7);
      previousStart.setDate(now.getDate() - 14);
    } else {
      currentStart.setDate(now.getDate() - 30);
      previousStart.setDate(now.getDate() - 60);
    }
    
    const { data: currentOrders } = await supabase.from('orders').select('*').gte('created_at', currentStart.toISOString());
    const { data: previousOrders } = await supabase.from('orders').select('*').gte('created_at', previousStart.toISOString()).lt('created_at', currentStart.toISOString());
    
    const currentRevenue = currentOrders?.reduce((s, o) => s + o.total, 0) || 0;
    const previousRevenue = previousOrders?.reduce((s, o) => s + o.total, 0) || 0;
    
    setStats({ revenue: { current: currentRevenue, previous: previousRevenue, change: previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0 }, orderCount: currentOrders?.length || 0 });
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500">Revenue</p><p className="text-2xl font-bold">RWF {stats.revenue?.current?.toLocaleString() || 0}</p></div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            {stats.revenue?.change > 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            <span className={stats.revenue?.change > 0 ? 'text-green-600' : 'text-red-600'}>{Math.abs(stats.revenue?.change || 0).toFixed(1)}%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500">Orders</p><p className="text-2xl font-bold">{stats.orderCount || 0}</p></div>
            <ShoppingBag className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
