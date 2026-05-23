'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoyaltyCard from '@/components/account/LoyaltyCard';
import { AchievementBadges } from '@/components/gamification/AchievementBadges';
import { DailyCheckIn } from '@/components/gamification/DailyCheckIn';
import { Package, MapPin, Star, Heart, Edit3, CheckCircle } from 'lucide-react';

interface Profile {
  full_name: string | null;
  phone: string | null;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  delivered:  'bg-green-100 text-green-700',
  shipped:    'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const [profileRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('id,order_number,status,total,created_at')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      ]);

      setProfile(profileRes.data);
      setFormData({
        full_name: profileRes.data?.full_name || '',
        phone: profileRes.data?.phone || '',
      });

      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setOrders(ordersRes.data || []);
      setOrderCount(count || 0);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from('profiles')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  const quickLinks = [
    { href: '/account/orders',    icon: Package, label: 'Orders',    value: orderCount, sub: 'total orders' },
    { href: '/account/addresses', icon: MapPin,   label: 'Addresses', value: null,       sub: 'manage addresses' },
    { href: '/wishlist',          icon: Heart,    label: 'Wishlist',  value: null,       sub: 'saved items' },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!
        </p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {quickLinks.map(({ href, icon: Icon, label, value, sub }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-2 group-hover:bg-blue-100 transition-colors">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            {value !== null && (
              <span className="text-xl font-bold text-gray-900">{value}</span>
            )}
            <span className="text-xs font-semibold text-gray-700 mt-0.5">{label}</span>
            <span className="text-xs text-gray-400">{sub}</span>
          </Link>
        ))}
      </div>

      {/* Daily check-in */}
      <DailyCheckIn />

      {/* Loyalty card */}
      <LoyaltyCard />

      {/* Achievements */}
      <AchievementBadges />

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-blue-500" />
            Recent Orders
          </h3>
          <Link href="/account/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No orders yet</p>
            <Link href="/products" className="inline-block mt-3 text-sm text-blue-600 hover:underline">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">#{order.order_number}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    RWF {order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Profile Information</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' && <CheckCircle className="h-4 w-4 shrink-0" />}
            {message.text}
          </div>
        )}

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400"
                value={user.email}
                disabled
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Phone Number</label>
              <input
                type="tel"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+250 788 123 456"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
                }}
                className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <dl className="divide-y divide-gray-50">
            {[
              { label: 'Full Name',    value: profile?.full_name || 'Not set' },
              { label: 'Email',        value: user.email },
              { label: 'Phone',        value: profile?.phone || 'Not set' },
              { label: 'Member Since', value: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
            ].map(({ label, value }) => (
              <div key={label} className="py-3 flex items-center gap-4">
                <dt className="w-32 text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0">{label}</dt>
                <dd className="text-sm font-medium text-gray-800 min-w-0 truncate">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
