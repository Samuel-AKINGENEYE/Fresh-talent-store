'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw, X, CheckCircle, AlertCircle, Package, ShoppingBag } from 'lucide-react';

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

const STATUS_STYLES: Record<string, string> = {
  delivered:  'bg-green-100 text-green-700',
  shipped:    'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  cancelled:  'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState<{ orderId: number; orderNumber: string } | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { loadOrders(); }, [router]);

  const loadOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!ordersData) { setLoading(false); return; }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden lg:block mb-2">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`p-4 rounded-2xl flex items-start gap-3 ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            : <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
          <span className={`text-sm ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {toast.message}
          </span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-1">No orders yet</p>
          <p className="text-gray-400 text-sm mb-5">Your order history will appear here</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">#{order.order_number}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full capitalize font-medium ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-base font-bold text-gray-900 shrink-0">
                  RWF {order.total.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Package className="h-4 w-4" />
                  View Details
                </Link>

                {order.status === 'delivered' && (
                  order.hasReturn ? (
                    <span className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-xl">
                      Return Requested
                    </span>
                  ) : (
                    <button
                      onClick={() => setReturnModal({ orderId: order.id, orderNumber: order.order_number })}
                      className="flex items-center gap-1.5 text-sm text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl hover:bg-orange-50 transition-colors"
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

      {/* Return modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold">Request a Return</h2>
                <p className="text-sm text-gray-400 mt-0.5">Order #{returnModal.orderNumber}</p>
              </div>
              <button onClick={() => setReturnModal(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              Refunds are processed within 5–7 business days after approval.
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Reason for return *</label>
                <select
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reason…</option>
                  {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                  Additional details <span className="normal-case text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Describe the issue…"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitting || !returnReason}
                  className="flex-1 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setReturnModal(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
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
