'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { RotateCcw, CheckCircle, XCircle, RefreshCw, Package } from 'lucide-react';

interface ReturnRequest {
  id: number;
  order_id: number;
  user_id: string;
  reason: string;
  status: string;
  created_at: string;
  order?: { order_number: string; total: number };
  profile?: { email: string; full_name: string | null };
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadReturns();
  }, [statusFilter]);

  const loadReturns = async () => {
    setLoading(true);
    let query = supabase
      .from('return_requests')
      .select(`
        *,
        order:orders(order_number, total),
        profile:profiles(email, full_name)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;

    if (data) {
      setReturns(data.map(r => ({
        ...r,
        order: Array.isArray(r.order) ? r.order[0] : r.order,
        profile: Array.isArray(r.profile) ? r.profile[0] : r.profile,
      })));
    }
    setLoading(false);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    setUpdating(id);
    const res = await fetch('/api/returns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      setReturns(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } else {
      const data = await res.json();
      alert('Error: ' + (data.error ?? 'Update failed'));
    }
    setUpdating(null);
  };

  const pendingCount = returns.filter(r => r.status === 'pending').length;

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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Returns & Refunds</h1>
          {pendingCount > 0 && (
            <span className="bg-yellow-500 text-white text-sm font-bold px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <button onClick={loadReturns} className="p-2 border rounded-lg hover:bg-gray-50" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected', 'refunded'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'border text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {returns.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No return requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {returns.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${req.order_id}`} className="font-mono text-sm text-blue-600 hover:underline">
                        #{req.order?.order_number ?? req.order_id}
                      </Link>
                      {req.order && (
                        <p className="text-xs text-gray-500">RWF {req.order.total.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{req.profile?.email ?? '—'}</p>
                      {req.profile?.full_name && (
                        <p className="text-xs text-gray-500">{req.profile.full_name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm max-w-xs">{req.reason}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_STYLES[req.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(req.id, 'approved')}
                            disabled={updating === req.id}
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(req.id, 'rejected')}
                            disabled={updating === req.id}
                            className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <button
                          onClick={() => updateStatus(req.id, 'refunded')}
                          disabled={updating === req.id}
                          className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Mark Refunded
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
