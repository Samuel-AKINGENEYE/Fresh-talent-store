'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Truck, Mail, Home, Package, AlertCircle } from 'lucide-react';
import { isMockMode } from '@/lib/config';

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [address, setAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    async function loadOrder() {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*, address:addresses(*)')
        .eq('id', orderId)
        .single();

      if (orderData) {
        setOrder(orderData);
        setAddress(orderData.address);
        
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderData.id);
        
        setOrderItems(itemsData || []);

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user?.email) {
          try {
            const response = await fetch('/api/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                order: orderData, 
                items: itemsData, 
                user: { email: user.email, full_name: user.user_metadata?.full_name },
                address: orderData.address 
              }),
            });
            const result = await response.json();
            setEmailSent(true);
            if (result.mock) {
              console.log('Mock email sent (configure real email provider for production)');
            }
          } catch (error) {
            console.error('Email send failed:', error);
          }
        }
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
        {isMockMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                🔧 Mock Mode Active - Configure real API keys for production
              </span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">Thank you for shopping at Fresh Talent Store</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-mono font-bold text-lg">{order?.order_number}</p>
          </div>

          {emailSent && (
            <div className="bg-green-50 rounded-lg p-3 mb-6 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">
                {isMockMode ? 'Mock confirmation logged (configure email for real sending)' : 'Confirmation email sent!'}
              </span>
            </div>
          )}
          
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
                  <span className="text-blue-600">RWF {order?.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="font-medium">What's Next?</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 ml-6 list-disc">
              <li>Order confirmation logged in console (email will be sent when configured)</li>
              <li>Our team will process your order within 1-2 hours</li>
              <li>Delivery in Kigali: 24-48 hours</li>
            </ul>
          </div>
          
          <div className="flex gap-4">
            <Link href="/account/orders">
              <button className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                <Package className="inline h-4 w-4 mr-2" />
                View Orders
              </button>
            </Link>
            <Link href="/">
              <button className="flex-1 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
                <Home className="inline h-4 w-4 mr-2" />
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
