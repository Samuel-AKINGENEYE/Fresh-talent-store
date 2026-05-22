'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, Calendar, Truck, Shield } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalItems, subtotal, loading } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    // Calculate estimated delivery date (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const deliveryFee = subtotal > 100000 ? 0 : 5000;
  const total = subtotal + deliveryFee - discount;

  const applyPromoCode = async () => {
    setIsApplying(true);
    setPromoMessage('');
    
    // Simulate promo code validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (promoCode.toUpperCase() === 'WELCOME10') {
      setDiscount(Math.floor(subtotal * 0.1));
      setPromoMessage('✅ Promo code applied! 10% discount');
    } else if (promoCode.toUpperCase() === 'FREESHIP') {
      setDiscount(0);
      setPromoMessage('✅ Free shipping applied!');
    } else if (promoCode === '') {
      setPromoMessage('Please enter a promo code');
    } else {
      setPromoMessage('❌ Invalid promo code');
      setDiscount(0);
    }
    setIsApplying(false);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</div>
            <span className="mx-2 text-sm font-medium text-blue-600">Cart</span>
            <div className="w-16 h-0.5 bg-blue-600"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">2</div>
            <span className="mx-2 text-sm text-gray-500">Checkout</span>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm">3</div>
            <span className="mx-2 text-sm text-gray-500">Confirmation</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-8">Shopping Cart ({totalItems} items)</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const productPrice = item.product?.price || 0;
              const variantAdjustment = item.variant?.price_adjustment || 0;
              const itemPrice = productPrice + variantAdjustment;
              const itemTotal = itemPrice * item.quantity;

              return (
                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4 hover:shadow-md transition">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product?.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📱</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <Link href={`/product/${item.product?.slug}`}>
                      <h3 className="font-semibold hover:text-blue-600 transition">{item.product?.name}</h3>
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {item.variant.attribute_name}: {item.variant.attribute_value}
                      </p>
                    )}
                    <p className="text-blue-600 font-semibold mt-1">
                      RWF {itemPrice.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border rounded hover:bg-gray-100 transition"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border rounded hover:bg-gray-100 transition"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 text-sm transition"
                    >
                      <Trash2 className="h-4 w-4 inline" /> Remove
                    </button>
                    <p className="font-semibold text-sm">RWF {itemTotal.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span>RWF {subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>RWF {deliveryFee.toLocaleString()}</span>
                  )}
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- RWF {discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">RWF {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (WELCOME10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={applyPromoCode}
                    disabled={isApplying}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                  >
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-sm mt-1 ${promoMessage.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {promoMessage}
                  </p>
                )}
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Estimated Delivery</span>
                </div>
                <p className="text-sm text-gray-600">{estimatedDelivery}</p>
                {deliveryFee === 0 && (
                  <p className="text-xs text-green-600 mt-1">✓ Free delivery on orders over 100,000 RWF</p>
                )}
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Shipping Information</span>
                </div>
                <p className="text-xs text-gray-600">Free delivery in Kigali within 24-48 hours</p>
                <p className="text-xs text-gray-600 mt-1">Nationwide delivery available (3-5 business days)</p>
              </div>

              {/* Guarantee */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Buyer Protection</span>
                </div>
                <p className="text-xs text-gray-600">14-day return policy • 1-year warranty • Secure checkout</p>
              </div>

              <Link href="/checkout">
                <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
                  Proceed to Checkout
                  <ArrowRight className="inline h-4 w-4 ml-2" />
                </button>
              </Link>

              <Link href="/products">
                <button className="w-full mt-3 text-blue-600 hover:text-blue-700 transition text-sm">
                  ← Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
