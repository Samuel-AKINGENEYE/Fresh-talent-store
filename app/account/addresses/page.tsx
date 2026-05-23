'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Trash2, Star } from 'lucide-react';

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

const EMPTY_FORM = {
  full_name: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: 'Kigali',
  sector: '',
  is_default: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      setAddresses(data || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const reload = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    setAddresses(data || []);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from('addresses').insert({ ...formData, user_id: userId });
    if (error) {
      alert('Error saving address: ' + error.message);
    } else {
      setShowForm(false);
      setFormData(EMPTY_FORM);
      await reload();
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) {
      alert('Error deleting address: ' + error.message);
    } else {
      setAddresses((prev) => prev.filter(a => a.id !== id));
    }
  };

  const setDefault = async (id: number) => {
    if (!userId) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    await reload();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">New Address</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Jean-Paul Mugisha"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Phone</label>
                <input
                  type="tel"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+250 788 123 456"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Address Line 1</label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="KG 123 Street"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                Address Line 2 <span className="normal-case text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="Apartment, floor, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">City</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sector/Area</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Kimironko"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Set as default address</span>
            </label>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Address'}
              </button>
              <button
                onClick={() => { setShowForm(false); setFormData(EMPTY_FORM); }}
                className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {addresses.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-1">No addresses saved</p>
          <p className="text-gray-400 text-sm mb-5">Add a delivery address to speed up checkout</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-2xl border p-5 ${address.is_default ? 'border-blue-200 shadow-sm' : 'border-gray-100'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-900">{address.full_name}</p>
                    {address.is_default && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3 fill-blue-600" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">{address.address_line1}</p>
                  {address.address_line2 && <p className="text-sm text-gray-600">{address.address_line2}</p>}
                  <p className="text-sm text-gray-600">{address.city}{address.sector ? `, ${address.sector}` : ''}</p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  {!address.is_default && (
                    <button
                      onClick={() => setDefault(address.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
