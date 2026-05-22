'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer, Truck, Package, MapPin, CreditCard, Calendar, ArrowLeft, CheckCircle } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  user_id: string;
  guest_email: string | null;
  guest_phone: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  notes: string | null;
  created_at: string;
  address: {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    sector: string | null;
  };
  profiles?: { email: string; full_name: string | null };
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  product_image: string | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const { data: orderData } = await supabase
      .from('orders')
      .select(`
        *,
        address:addresses(*),
        profiles(email, full_name)
      `)
      .eq('id', params.id)
      .single();

    if (orderData) {
      setOrder(orderData);
      
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);
      
      setItems(itemsData || []);
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', params.id);
    
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      await loadOrder();
      alert(`Order status updated to ${newStatus}`);
    }
    setUpdating(false);
  };

  const getStatusSteps = () => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(order?.status || 'pending');
    
    return steps.map((step, idx) => ({
      name: step,
      label: step.charAt(0).toUpperCase() + step.slice(1),
      completed: idx <= currentIndex,
      current: idx === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!order) return null;

  const customerEmail = order.profiles?.email || order.guest_email;
  const customerName = order.profiles?.full_name || order.address?.full_name;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <button className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Printer className="h-4 w-4" />
          Print Invoice
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="flex items-center justify-between">
              {getStatusSteps().map((step, idx) => (
                <div key={step.name} className="flex-1 text-center">
                  <div className={`relative ${idx < getStatusSteps().length - 1 ? 'after:absolute after:top-4 after:left-1/2 after:w-full after:h-0.5 after:bg-gray-200' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      step.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                    </div>
                    <p className={`text-sm font-medium ${step.current ? 'text-blue-600' : 'text-gray-600'}`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <label className="block text-sm font-medium mb-2">Update Status</label>
              <div className="flex gap-2">
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={updating}
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {updating && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">RWF {item.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total: RWF {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>RWF {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>RWF {order.delivery_fee.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- RWF {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-blue-600">RWF {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{customerName || 'Guest'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{customerEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.guest_phone || order.address?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>
              <div className="space-y-1">
                <p className="font-medium">{order.address.full_name}</p>
                <p className="text-sm text-gray-600">{order.address.phone}</p>
                <p className="text-sm text-gray-600">{order.address.address_line1}</p>
                {order.address.address_line2 && <p className="text-sm text-gray-600">{order.address.address_line2}</p>}
                <p className="text-sm text-gray-600">{order.address.city}, {order.address.sector}</p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Method</span>
                <span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
