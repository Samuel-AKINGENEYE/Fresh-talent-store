'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, subtotal, loading } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items yet</p>
          <Link href="/products">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = 5000;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Shopping Cart ({totalItems} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const productPrice = item.product?.price || 0;
              const variantAdjustment = item.variant?.price_adjustment || 0;
              const itemPrice = productPrice + variantAdjustment;
              const itemTotal = itemPrice * item.quantity;

              return (
                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📱</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product?.name}</h3>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {item.variant.attribute_name}: {item.variant.attribute_value}
                      </p>
                    )}
                    <p className="text-blue-600 font-semibold mt-1">
                      RWF {itemPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 border rounded hover:bg-gray-100">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 border rounded hover:bg-gray-100">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">RWF {itemTotal.toLocaleString()}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 text-sm mt-1">
                      <Trash2 className="h-4 w-4 inline" /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>RWF {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>RWF {deliveryFee.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">RWF {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
                  Proceed to Checkout
                  <ArrowRight className="inline h-4 w-4 ml-2" />
                </button>
              </Link>

              <Link href="/products">
                <button className="w-full mt-3 text-blue-600 hover:text-blue-700">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
