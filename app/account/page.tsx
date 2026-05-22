'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoyaltyCard from '@/components/account/LoyaltyCard';

interface Profile {
  full_name: string | null;
  phone: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profile);
      setFormData({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
      });
      setLoading(false);
    }
    
    loadUser();
  }, [router]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      // Reload profile
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(newProfile);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">My Account</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : '👤'}
                  </span>
                </div>
                <h2 className="text-xl font-semibold">{profile?.full_name || 'Customer'}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <p className="text-gray-500 text-xs mt-2">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="mt-6 space-y-1">
                <Link href="/account" className="block px-4 py-2 rounded bg-blue-50 text-blue-600 font-medium">
                  📋 Profile Overview
                </Link>
                <Link href="/account/orders" className="block px-4 py-2 rounded hover:bg-gray-50 transition">
                  📦 My Orders
                </Link>
                <Link href="/account/addresses" className="block px-4 py-2 rounded hover:bg-gray-50 transition">
                  📍 Addresses
                </Link>
                <Link href="/account" className="block px-4 py-2 rounded hover:bg-gray-50 transition">
                  ⭐ Loyalty Points
                </Link>
              </div>
              
              <button
                onClick={handleLogout}
                className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Loyalty Points Card */}
            <LoyaltyCard />

            {/* PLACEHOLDER: Profile Info section below */}
            <div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Profile Information</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
              
              {message && (
                <div className={`mb-4 p-3 rounded ${
                  message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {message.text}
                </div>
              )}
              
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      value={user.email}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+250 788 123 456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          full_name: profile?.full_name || '',
                          phone: profile?.phone || '',
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-600">Full Name:</span>
                    <span className="font-medium">{profile?.full_name || 'Not set'}</span>
                  </div>
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-600">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-600">Phone:</span>
                    <span className="font-medium">{profile?.phone || 'Not set'}</span>
                  </div>
                  <div className="flex py-2">
                    <span className="w-32 text-gray-600">Member Since:</span>
                    <span className="font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>
            </div>{/* end profile info */}
          </div>
        </div>
      </div>
    </div>
  );
}
