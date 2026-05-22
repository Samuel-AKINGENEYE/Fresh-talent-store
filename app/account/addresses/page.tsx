'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  sector: string | null;
  is_default: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: 'Kigali',
    sector: '',
    is_default: false,
  });

  useEffect(() => {
    async function loadUserAndAddresses() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUserId(user.id);
      
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      setAddresses(addresses || []);
      setLoading(false);
    }
    
    loadUserAndAddresses();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('addresses')
      .insert({
        ...formData,
        user_id: userId,
      });
    
    if (error) {
      alert('Error saving address: ' + error.message);
    } else {
      setShowForm(false);
      setFormData({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: 'Kigali',
        sector: '',
        is_default: false,
      });
      // Reload addresses
      const { data: newAddresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);
      setAddresses(newAddresses || []);
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting address: ' + error.message);
      } else {
        setAddresses(addresses.filter(a => a.id !== id));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/account" className="text-blue-600 hover:text-blue-700">
              ← Back to Account
            </Link>
            <h1 className="text-2xl font-bold">My Addresses</h1>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add New Address
          </button>
        </div>
        
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add New Address</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 border rounded"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-3 py-2 border rounded"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address Line 1"
                className="w-full px-3 py-2 border rounded"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                className="w-full px-3 py-2 border rounded"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Sector/Area"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                />
                <span>Set as default address</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No addresses saved yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between">
                  <div>
                    {address.is_default && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded mb-2">
                        Default
                      </span>
                    )}
                    <p className="font-semibold">{address.full_name}</p>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600">{address.address_line1}</p>
                    {address.address_line2 && <p className="text-gray-600">{address.address_line2}</p>}
                    <p className="text-gray-600">{address.city}, {address.sector}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
