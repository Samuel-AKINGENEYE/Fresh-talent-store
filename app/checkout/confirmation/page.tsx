'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Truck, Printer, Home } from 'lucide-react';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    async function loadOrder() {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderData) {
        setOrder(orderData);
        
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id);
        
        setOrderItems(itemsData || []);
      }
      setLoading(false);
    }

    loadOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">Thank you for shopping with Fresh Talent Store</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-mono font-bold text-lg">{order?.order_number}</p>
          </div>
          
          <div className="border-t pt-6 mb-6">
            <h2 className="font-semibold mb-3">Order Summary</h2>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>RWF {item.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>RWF {order?.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="font-medium">What's Next?</span>
            </div>
            <p className="text-sm text-gray-700">
              You will receive an order confirmation email shortly. 
              Our team will process your order and you'll get updates via SMS and email.
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/account/orders">
              <button className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                View Orders
              </button>
            </Link>
            <Link href="/">
              <button className="flex-1 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
