'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Package, Truck, CheckCircle, Clock, MapPin, Search,
  ArrowLeft, ChevronRight, RotateCcw, Phone, Mail,
} from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface TrackedOrder {
  order_number: string;
  status: OrderStatus;
  created_at: string;
  delivered_at: string | null;
  total: number;
  subtotal: number;
  delivery_fee: number;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  address?: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    sector?: string;
  };
  order_items?: {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    product_image?: string;
  }[];
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending',    label: 'Order Placed',  desc: 'We received your order'        },
  { key: 'processing', label: 'Processing',    desc: 'We\'re preparing your items'   },
  { key: 'shipped',    label: 'On the Way',    desc: 'Your order is out for delivery' },
  { key: 'delivered',  label: 'Delivered',     desc: 'Enjoy your new purchase!'       },
];

const STATUS_ORDER: Record<OrderStatus, number> = {
  pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1,
};

function StepIcon({ step, active, done }: { step: string; active: boolean; done: boolean }) {
  const cls = `h-5 w-5 ${done || active ? 'text-white' : 'text-slate-400'}`;
  if (step === 'pending')    return <Clock className={cls} />;
  if (step === 'processing') return <Package className={cls} />;
  if (step === 'shipped')    return <Truck className={cls} />;
  return <CheckCircle className={cls} />;
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: err } = await supabase
      .from('orders')
      .select('*, address:addresses(*), order_items(*)')
      .eq('order_number', orderNumber.trim().toUpperCase())
      .or(`guest_email.eq.${email},profiles.email.eq.${email}`)
      .single();

    if (err || !data) {
      setError('Order not found. Please check your order number and email address.');
    } else {
      setOrder(data as TrackedOrder);
    }
    setLoading(false);
  };

  const currentStep = order ? (STATUS_ORDER[order.status] ?? -1) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 lg:px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-blue-100 hover:text-white text-sm font-medium mb-5 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Truck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Track Your Order</h1>
              <p className="text-blue-100 text-sm mt-1">Enter your order number to see real-time delivery status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-10 max-w-2xl">

        {!order ? (
          /* ---- SEARCH FORM ---- */
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">Find Your Order</h2>
                  <p className="text-slate-500 text-sm">Enter the details from your confirmation email</p>
                </div>
              </div>

              <form onSubmit={trackOrder} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="order-num" className="block text-sm font-semibold text-slate-700">
                    Order Number
                  </label>
                  <input
                    id="order-num"
                    type="text"
                    required
                    placeholder="e.g. FTS-20250523-001"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-medium bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="track-email" className="block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <input
                    id="track-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-medium bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                  />
                </div>

                {error && (
                  <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-red-500 flex-shrink-0 mt-0.5 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Searching…
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" /> Track Order
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Help bar */}
            <div className="border-t border-slate-100 bg-slate-50 px-8 py-5">
              <p className="text-sm text-slate-600 font-medium mb-3">Need help finding your order?</p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/250790663921"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  WhatsApp Support
                </a>
                <a
                  href="mailto:support@freshtalentstore.rw"
                  className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Mail className="h-4 w-4" /> Email Us
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* ---- ORDER RESULT ---- */
          <div className="space-y-5">

            {/* Order header card */}
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 p-6">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Order</p>
                  <h2 className="text-xl font-extrabold text-slate-900">#{order.order_number}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-RW', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide ${
                  isCancelled
                    ? 'bg-red-100 text-red-700'
                    : order.status === 'delivered'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Progress stepper */}
              {!isCancelled && (
                <div className="relative">
                  {/* connector line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-100" aria-hidden="true">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                      style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="relative flex justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const done   = idx < currentStep;
                      const active = idx === currentStep;
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                            done   ? 'bg-green-500 shadow-lg shadow-green-500/30' :
                            active ? 'bg-blue-600 shadow-lg shadow-blue-500/30 ring-4 ring-blue-100' :
                                     'bg-white border-2 border-slate-200'
                          }`}>
                            <StepIcon step={step.key} active={active} done={done} />
                          </div>
                          <div className="text-center px-1">
                            <p className={`text-xs font-bold ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] text-slate-400 hidden sm:block leading-tight mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                  <RotateCcw className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 font-semibold text-sm">Order Cancelled</p>
                    <p className="text-red-600 text-xs mt-0.5">This order has been cancelled. Contact us if you need help.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order items */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 p-6">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" /> Items Ordered
                </h3>
                <div className="divide-y divide-slate-100">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                        {item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{item.product_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-slate-800 text-sm whitespace-nowrap">
                        RWF {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order total */}
                <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>RWF {order.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Delivery</span>
                    <span className={order.delivery_fee === 0 ? 'text-green-600 font-medium' : ''}>
                      {order.delivery_fee === 0 ? 'Free' : `RWF ${order.delivery_fee?.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-slate-900 text-base pt-1 border-t border-slate-100">
                    <span>Total</span>
                    <span className="text-blue-700">RWF {order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery address */}
            {order.address && (
              <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 p-6">
                <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-orange-500" /> Delivery Address
                </h3>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-1.5">
                  <p className="font-semibold text-slate-800">{order.address.full_name}</p>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {order.address.phone}
                  </p>
                  <p className="text-sm text-slate-600">{order.address.address_line1}</p>
                  {order.address.address_line2 && <p className="text-sm text-slate-600">{order.address.address_line2}</p>}
                  <p className="text-sm text-slate-600">{order.address.sector && `${order.address.sector}, `}{order.address.city}</p>
                </div>
              </div>
            )}

            {/* Payment info */}
            <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/60 p-6">
              <h3 className="font-bold text-slate-800 text-base mb-4">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Method</p>
                  <p className="font-semibold text-slate-800 text-sm capitalize">{order.payment_method?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setOrder(null); setOrderNumber(''); setEmail(''); }}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors text-sm"
              >
                <RotateCcw className="h-4 w-4" /> Track Another
              </button>
              <a
                href="https://wa.me/250790663921"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                Get Help
              </a>
              <Link href="/products" className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 text-sm shadow-md shadow-blue-500/20">
                  Shop More <ChevronRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
