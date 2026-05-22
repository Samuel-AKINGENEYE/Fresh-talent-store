'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

type Product = {
  id: number;
  name: string;
  price: number;
  images: string[];
  rating: number;
  slug: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (categoriesData) setCategories(categoriesData);
      
      // Fetch featured products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(4);
      
      if (productsData) setFeaturedProducts(productsData);
      
      setLoading(false);
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Fresh Talent Store...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Tech. Fresh. For You.
          </h1>
          <p className="mb-8 text-xl text-blue-100 md:text-2xl">
            Premium electronics delivered fast in Kigali, Rwanda 🇷🇼
          </p>
          <button className="rounded-lg bg-orange-500 px-6 py-3 font-semibold hover:bg-orange-600 transition">
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="mb-8 text-2xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-lg border p-4 text-center hover:shadow-lg transition cursor-pointer">
              <div className="text-3xl mb-2">{cat.icon || '📁'}</div>
              <p className="text-sm font-medium">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold">Featured Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="rounded-lg bg-white p-4 shadow hover:shadow-lg transition">
                <div className="mb-4 aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
                  {product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0]} alt={product.name} className="rounded-lg object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-400">📷 {product.name}</span>
                  )}
                </div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">★★★★ {product.rating} ({product.rating})</p>
                <p className="mt-2 text-lg font-bold text-blue-600">RWF {product.price.toLocaleString()}</p>
                <button className="mt-3 w-full rounded-lg bg-orange-500 py-2 text-white hover:bg-orange-600 transition">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
