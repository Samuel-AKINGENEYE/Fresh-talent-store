'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Deal {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number;
  images: string[];
}

export default function DailyDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    async function fetchDailyDeals() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .not('compare_at_price', 'is', null)
        .limit(4);
      
      setDeals(data || []);
    }

    fetchDailyDeals();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (deals.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Daily Deals</h2>
          <p className="text-gray-600">New deals added every day!</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Ends in:</div>
          <div className="flex gap-2 text-xl font-bold">
            <span className="bg-gray-900 text-white px-2 py-1 rounded">
              {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span>:</span>
            <span className="bg-gray-900 text-white px-2 py-1 rounded">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span>:</span>
            <span className="bg-gray-900 text-white px-2 py-1 rounded">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {deals.map((deal) => {
          const discount = Math.round(((deal.compare_at_price - deal.price) / deal.compare_at_price) * 100);
          return (
            <Link key={deal.id} href={`/product/${deal.slug}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group">
                <div className="relative aspect-square bg-gray-100">
                  {deal.images?.[0] ? (
                    <img
                      src={deal.images[0]}
                      alt={deal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{discount}%
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1">{deal.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-red-600">
                      RWF {deal.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      RWF {deal.compare_at_price.toLocaleString()}
                    </span>
                  </div>
                  <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition">
                    Shop Now →
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Link href="/flash-sales">
          <button className="text-orange-600 font-semibold hover:text-orange-700">
            View All Deals →
          </button>
        </Link>
      </div>
    </section>
  );
}
