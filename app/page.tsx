'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setCategories(categoriesData || []);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(4);
      setFeaturedProducts(productsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-blue-600">Fresh Talent</span>
              <span className="text-orange-500"> Store</span>
            </Link>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-600 hover:text-blue-600">Sign In</Link>
              <Link href="/cart" className="text-gray-600 hover:text-blue-600">Cart</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Tech. Fresh. For You.</h1>
          <p className="text-xl mb-8">Premium electronics delivered fast in Kigali, Rwanda 🇷🇼</p>
          <Link href="/products">
            <button className="bg-orange-500 px-8 py-3 rounded-lg font-semibold hover:bg-orange-600">
              Shop Now →
            </button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat: any) => (
            <div key={cat.id} className="border rounded-lg p-4 text-center hover:shadow-lg">
              <div className="text-3xl mb-2">{cat.icon || '📦'}</div>
              <p className="text-sm">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product: any) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-4xl">📱</span>
                  )}
                </div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-blue-600 font-bold mt-2">RWF {product.price.toLocaleString()}</p>
                <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
