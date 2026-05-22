'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface FlashProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number;
  images: string[];
  rating: number;
  stock: number;
}

export default function FlashSalesPage() {
  const [products, setProducts] = useState<FlashProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    async function fetchFlashDeals() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('compare_at_price', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flash deals:', error);
      } else {
        setProducts((data as FlashProduct[]) || []);
      }
      setLoading(false);
    }

    fetchFlashDeals();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateDiscount = (price: number, compareAt: number) => {
    return Math.round(((compareAt - price) / compareAt) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flash deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-pulse">
            ⚡ Flash Sale ⚡
          </h1>
          <p className="text-xl mb-6">Limited time offers - Up to 70% off!</p>
          
          <div className="inline-flex items-center gap-4 bg-black bg-opacity-30 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-sm">Days</div>
            </div>
            <div className="text-3xl font-bold">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-sm">Hours</div>
            </div>
            <div className="text-3xl font-bold">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-sm">Minutes</div>
            </div>
            <div className="text-3xl font-bold">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-sm">Seconds</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No active flash deals at the moment.</p>
            <p className="text-gray-400 mt-2">Check back soon for amazing discounts!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const discount = calculateDiscount(product.price, product.compare_at_price);
                return (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer relative">
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full z-10 animate-pulse">
                        -{discount}% OFF
                      </div>
                      <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        🔥 HOT
                      </div>
                      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <span className="text-6xl text-gray-400">📱</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600 ml-1">{product.rating || 4.5}</span>
                          <span className="text-xs text-gray-400 ml-2">(24 reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-red-600">
                            RWF {product.price.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            RWF {product.compare_at_price.toLocaleString()}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Available Stock</span>
                            <span>{product.stock} units</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 rounded-full h-2 transition-all duration-500"
                              style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Added to cart!');
                          }}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 rounded-lg hover:from-orange-600 hover:to-red-700 transition font-medium"
                        >
                          🛒 Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">⏰ Hurry Up!</h3>
              <p className="text-lg mb-4">These deals won't last forever. Shop now before they're gone!</p>
              <Link href="/products">
                <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                  View All Products →
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
