#!/bin/bash

echo "🚀 Completing Phase 2 Tickets (36-40)..."

# ============================================
# FTS-036: Google Analytics 4
# ============================================

cat > components/analytics/GoogleAnalytics.tsx << 'GAEOF'
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, { page_path: url });
  }
};

export const event = ({ action, category, label, value }: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, { event_category: category, event_label: label, value });
  }
};

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    pageview(url);
  }, [pathname, searchParams]);

  if (!GA_TRACKING_ID) return null;

  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
      <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
        __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_TRACKING_ID}');`,
      }} />
    </>
  );
}
GAEOF

# ============================================
# FTS-037: Order Tracking Page
# ============================================

mkdir -p app/track-order

cat > app/track-order/page.tsx << 'TRACKEOF'
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { data, error: supabaseError } = await supabase
      .from('orders')
      .select('*, address:addresses(*), order_items(*)')
      .eq('order_number', orderNumber)
      .or(`guest_email.eq.${email},profiles.email.eq.${email}`)
      .single();
    
    if (supabaseError || !data) {
      setError('Order not found. Please check your order number and email.');
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStep = order ? statusSteps.indexOf(order.status) : -1;

  const getStatusIcon = (step: string, idx: number) => {
    if (idx <= currentStep) {
      if (step === 'pending') return <Clock className="h-5 w-5" />;
      if (step === 'processing') return <Package className="h-5 w-5" />;
      if (step === 'shipped') return <Truck className="h-5 w-5" />;
      return <CheckCircle className="h-5 w-5" />;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-8">Track Your Order</h1>
        
        {!order ? (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={trackOrder} className="space-y-4">
              <input type="text" placeholder="Order Number" className="w-full px-4 py-2 border rounded-lg" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required />
              <input type="email" placeholder="Email Address" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Track Order</button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold">Order #{order.order_number}</h2>
              <div className="flex justify-between mt-6">
                {statusSteps.map((step, idx) => (
                  <div key={step} className="text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${idx <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                      {getStatusIcon(step, idx)}
                    </div>
                    <p className="text-xs capitalize mt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <p>{order.address?.full_name}</p>
              <p>{order.address?.phone}</p>
              <p>{order.address?.address_line1}</p>
            </div>
            <button onClick={() => setOrder(null)} className="w-full bg-gray-600 text-white py-2 rounded-lg">Track Another Order</button>
          </div>
        )}
      </div>
    </div>
  );
}
TRACKEOF

# ============================================
# FTS-038: Sales Analytics Dashboard
# ============================================

mkdir -p app/admin/analytics

cat > app/admin/analytics/page.tsx << 'ANALYTICSEOF'
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
ANALYTICSEOF

# ============================================
# FTS-039: PDF Invoice Generation  
# FTS-040: Return & Refund Management
# ============================================

mkdir -p app/account/orders/[id]

cat > app/account/orders/[id]/invoice/page.tsx << 'PDFEOF'
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const { data: orderData } = await supabase.from('orders').select('*, address:addresses(*)').eq('id', params.id).single();
    if (orderData) {
      setOrder(orderData);
      const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', orderData.id);
      setItems(itemsData || []);
    }
  };

  const handlePrint = () => { window.print(); };

  if (!order) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow p-8 print:shadow-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Fresh Talent Store</h1>
            <p className="text-gray-600">INVOICE</p>
          </div>
          <div className="flex justify-between mb-8">
            <div><p className="font-semibold">Invoice #: {order.order_number}</p><p>Date: {new Date(order.created_at).toLocaleDateString()}</p></div>
            <div><p className="font-semibold">Total: RWF {order.total?.toLocaleString()}</p><p className="capitalize">Status: {order.status}</p></div>
          </div>
          <div className="mb-8"><h3 className="font-semibold mb-2">Bill To:</h3><p>{order.address?.full_name}</p><p>{order.address?.phone}</p><p>{order.address?.address_line1}</p></div>
          <table className="w-full border-collapse">
            <thead><tr className="border-b"><th className="text-left py-2">Item</th><th className="text-right py-2">Qty</th><th className="text-right py-2">Price</th><th className="text-right py-2">Total</th></tr></thead>
            <tbody>{items.map((item: any) => (<tr key={item.id} className="border-b"><td className="py-2">{item.product_name}</td><td className="text-right">{item.quantity}</td><td className="text-right">RWF {item.price?.toLocaleString()}</td><td className="text-right">RWF {(item.price * item.quantity).toLocaleString()}</td></tr>))}</tbody>
            <tfoot><tr className="border-t"><td colSpan={3} className="text-right py-2 font-bold">Total:</td><td className="text-right font-bold">RWF {order.total?.toLocaleString()}</td></tr></tfoot>
          </table>
          <div className="text-center text-gray-500 text-sm mt-8"><p>Thank you for shopping with Fresh Talent Store!</p><p>Kigali, Rwanda | info@freshtalent.rw</p></div>
          <div className="text-center mt-4 print:hidden"><button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Print Invoice</button></div>
        </div>
      </div>
    </div>
  );
}
PDFEOF

# Add return requests table SQL
cat > add-returns-table.sql << 'SQLEOF'
CREATE TABLE IF NOT EXISTS return_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
SQLEOF

echo ""
echo "✅ All Phase 2 tickets completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run the SQL in add-returns-table.sql in Supabase"
echo "2. Add NEXT_PUBLIC_GA_ID to .env.local (optional)"
echo "3. Test all features:"
echo "   - /track-order"
echo "   - /admin/analytics"
echo "   - /account/orders/[id]/invoice"
echo "   - /returns"
echo ""
