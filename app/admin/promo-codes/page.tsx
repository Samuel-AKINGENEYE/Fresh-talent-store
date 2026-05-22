'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Copy, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface PromoCode {
  id: number;
  code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  usage_limit: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_order: '',
    usage_limit: '',
    starts_at: '',
    expires_at: '',
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    const { data } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    setPromoCodes(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const promoData = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: parseInt(formData.discount_value) || 0,
      minimum_order: parseInt(formData.minimum_order) || 0,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      starts_at: formData.starts_at || null,
      expires_at: formData.expires_at || null,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase
        .from('promo_codes')
        .update(promoData)
        .eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('promo_codes')
        .insert(promoData);
      error = insertError;
    }

    if (error) {
      alert('Error saving promo code: ' + error.message);
    } else {
      alert(editingId ? 'Promo code updated!' : 'Promo code created!');
      setShowForm(false);
      setEditingId(null);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        minimum_order: '',
        usage_limit: '',
        starts_at: '',
        expires_at: '',
      });
      loadPromoCodes();
    }
  };

  const handleDelete = async (id: number, code: string) => {
    if (confirm(`Delete promo code "${code}"?`)) {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting promo code: ' + error.message);
      } else {
        loadPromoCodes();
      }
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      loadPromoCodes();
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code "${code}" copied to clipboard!`);
  };

  const getDiscountDisplay = (promo: PromoCode) => {
    if (promo.discount_type === 'percentage') {
      return `${promo.discount_value}% OFF`;
    } else if (promo.discount_type === 'fixed') {
      return `RWF ${promo.discount_value.toLocaleString()} OFF`;
    } else {
      return 'Free Shipping';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promo Codes</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              code: '',
              description: '',
              discount_type: 'percentage',
              discount_value: '',
              minimum_order: '',
              usage_limit: '',
              starts_at: '',
              expires_at: '',
            });
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Promo Code
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Promo Code' : 'Create New Promo Code'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., SUMMER20"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  placeholder="What's this code for?"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Discount Type</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (RWF)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {formData.discount_type === 'percentage' ? 'Discount (%)' : 
                   formData.discount_type === 'fixed' ? 'Discount Amount (RWF)' : 'Notes'}
                </label>
                {formData.discount_type === 'free_shipping' ? (
                  <input
                    type="text"
                    disabled
                    value="Free delivery"
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  />
                ) : (
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Order (RWF)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.minimum_order}
                  onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                  placeholder="0 for no minimum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {editingId ? 'Update' : 'Create'} Promo Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promo Codes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{promo.code}</code>
                  </td>
                  <td className="px-6 py-4 text-sm">{promo.description || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-green-600">{getDiscountDisplay(promo)}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.minimum_order > 0 ? `RWF ${promo.minimum_order.toLocaleString()}` : 'No minimum'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.used_count} / {promo.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(promo.id, promo.is_active)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        promo.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {promo.is_active ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(promo.code)}
                        className="p-1 text-gray-500 hover:text-blue-600"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(promo.id);
                          setFormData({
                            code: promo.code,
                            description: promo.description || '',
                            discount_type: promo.discount_type,
                            discount_value: promo.discount_value.toString(),
                            minimum_order: promo.minimum_order.toString(),
                            usage_limit: promo.usage_limit?.toString() || '',
                            starts_at: promo.starts_at?.slice(0, 16) || '',
                            expires_at: promo.expires_at?.slice(0, 16) || '',
                          });
                          setShowForm(true);
                        }}
                        className="p-1 text-gray-500 hover:text-green-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id, promo.code)}
                        className="p-1 text-gray-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
