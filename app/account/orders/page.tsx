'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  hasReturn?: boolean;
}

const RETURN_REASONS = [
  'Defective or damaged product',
  'Wrong item received',
  'Product not as described',
  'Changed my mind',
  'Duplicate order',
  'Other',
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState<{ orderId: number; orderNumber: string } | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) { router.push('/login'); return; }

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!ordersData) { setLoading(false); return; }

    // Check which delivered orders already have returns
    const deliveredIds = ordersData.filter(o => o.status === 'delivered').map(o => o.id);
    let returnedOrderIds = new Set<number>();

    if (deliveredIds.length > 0) {
      const { data: returns } = await supabase
        .from('return_requests')
        .select('order_id')
        .in('order_id', deliveredIds)
        .in('status', ['pending', 'approved']);
      if (returns) returnedOrderIds = new Set(returns.map(r => r.order_id));
    }

    setOrders(ordersData.map(o => ({ ...o, hasReturn: returnedOrderIds.has(o.id) })));
    setLoading(false);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModal || !returnReason) return;

    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    const reason = returnNotes.trim() ? `${returnReason}: ${returnNotes.trim()}` : returnReason;

    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
      body: JSON.stringify({ orderId: returnModal.orderId, reason }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast('success', `Return request submitted for order #${returnModal.orderNumber}. We'll contact you within 2 business days.`);
      setReturnModal(null);
      setReturnReason('');
      setReturnNotes('');
      loadOrders();
    } else {
      showToast('error', data.error ?? 'Failed to submit return request');
    }
    setSubmitting(false);
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      delivered: 'bg-green-100 text-green-700',
      shipped: 'bg-blue-100 text-blue-700',
      processing: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
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
        <div className="flex items-center gap-4 mb-6">
          <Link href="/account" className="text-blue-600 hover:text-blue-700">← Back to Account</Link>
          <h1 className="text-2xl font-bold">My Orders</h1>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {toast.type === 'success'
              ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              : <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
            <span className={`text-sm ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{toast.message}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
            <Link href="/products" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="border-t pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Total: RWF {order.total.toLocaleString()}</p>
                    <Link href={`/account/orders/${order.id}`} className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                      View Details →
                    </Link>
                  </div>
                  {order.status === 'delivered' && (
                    order.hasReturn ? (
                      <span className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
                        Return Requested
                      </span>
                    ) : (
                      <button
                        onClick={() => setReturnModal({ orderId: order.id, orderNumber: order.order_number })}
                        className="flex items-center gap-1.5 text-sm text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Request Return
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">Request a Return</h2>
                <p className="text-sm text-gray-500">Order #{returnModal.orderNumber}</p>
              </div>
              <button onClick={() => setReturnModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              Refunds are processed within 5–7 business days after approval.
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reason for return *</label>
                <select
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason…</option>
                  {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Please describe the issue in more detail…"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting || !returnReason}
                  className="flex-1 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
                >
                  {submitting ? 'Submitting…' : 'Submit Return Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setReturnModal(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
