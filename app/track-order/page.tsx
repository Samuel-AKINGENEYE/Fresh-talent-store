'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { data, error: supabaseError } = await supabase
      .from('orders')
      .select('*, address:addresses(*), order_items(*)')
      .eq('order_number', orderNumber)
      .or(`guest_email.eq.${email},profiles.email.eq.${email}`)
      .single();
    
    if (supabaseError || !data) {
      setError('Order not found. Please check your order number and email.');
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStep = order ? statusSteps.indexOf(order.status) : -1;

  const getStatusIcon = (step: string, idx: number) => {
    if (idx <= currentStep) {
      if (step === 'pending') return <Clock className="h-5 w-5" />;
      if (step === 'processing') return <Package className="h-5 w-5" />;
      if (step === 'shipped') return <Truck className="h-5 w-5" />;
      return <CheckCircle className="h-5 w-5" />;
    }
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-8">Track Your Order</h1>
        
        {!order ? (
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={trackOrder} className="space-y-4">
              <input type="text" placeholder="Order Number" className="w-full px-4 py-2 border rounded-lg" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required />
              <input type="email" placeholder="Email Address" className="w-full px-4 py-2 border rounded-lg" value={email} onChange={(e) => setEmail(e.target.value)} required />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Track Order</button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="font-semibold">Order #{order.order_number}</h2>
              <div className="flex justify-between mt-6">
                {statusSteps.map((step, idx) => (
                  <div key={step} className="text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${idx <= currentStep ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                      {getStatusIcon(step, idx)}
                    </div>
                    <p className="text-xs capitalize mt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <p>{order.address?.full_name}</p>
              <p>{order.address?.phone}</p>
              <p>{order.address?.address_line1}</p>
            </div>
            <button onClick={() => setOrder(null)} className="w-full bg-gray-600 text-white py-2 rounded-lg">Track Another Order</button>
          </div>
        )}
      </div>
    </div>
  );
}
