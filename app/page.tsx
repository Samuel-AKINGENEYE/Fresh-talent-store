'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  rating: number;
  is_featured: boolean;
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setCategories(categoriesData || []);

      // Fetch featured products
      const { data: featuredData } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(8);
      setFeaturedProducts(featuredData || []);

      // Fetch new arrivals (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: newData } = await supabase
        .from('products')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .limit(8);
      setNewProducts(newData || []);

      // Fetch flash deals (products with compare_at_price)
      const { data: flashData } = await supabase
        .from('products')
        .select('*')
        .not('compare_at_price', 'is', null)
        .limit(4);
      setFlashDeals(flashData || []);

      setLoading(false);
    }

    fetchData();

    // Countdown timer
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Fresh Talent Store...</p>
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
            Tech. Fresh. For You.
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Premium electronics delivered fast in Kigali, Rwanda 🇷🇼
          </p>
          <Link href="/products">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition text-lg">
              Shop Now →
            </button>
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <div className="border rounded-lg p-4 text-center hover:shadow-lg transition cursor-pointer hover:border-blue-300 group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition">
                  {category.icon || '📦'}
                </div>
                <p className="font-medium text-sm">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      {flashDeals.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">⚡ Flash Sale</h2>
              <p className="text-lg mb-4">Up to 50% off on selected items</p>
              <div className="flex justify-center space-x-4 text-3xl font-mono font-bold mb-6">
                <div className="bg-black bg-opacity-30 px-4 py-2 rounded">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </div>
                <span>:</span>
                <div className="bg-black bg-opacity-30 px-4 py-2 rounded">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </div>
                <span>:</span>
                <div className="bg-black bg-opacity-30 px-4 py-2 rounded">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </div>
              </div>
              <Link href="/flash-sales">
                <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Shop Flash Deals →
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale Products */}
      {flashDeals.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8">Limited Time Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashDeals.map((product) => (
              <ProductCard key={product.id} product={product} isFlashSale />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">New Arrivals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="bg-blue-600 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Subscribe to Our Newsletter</h2>
          <p className="text-blue-100 mb-6">Get the latest deals and updates straight to your inbox</p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

// Product Card Component
function ProductCard({ product, isFlashSale }: { product: Product; isFlashSale?: boolean }) {
  const discountPercentage = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer">
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
          {isFlashSale && discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
          <div className="flex items-center mb-2">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-600 ml-1">{product.rating || 4.5}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">
              RWF {product.price.toLocaleString()}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-400 line-through">
                RWF {product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>
          <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium">
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
