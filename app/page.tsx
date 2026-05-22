'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase directly in the component to avoid import issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
}

interface Product {
  id: number;
  name: string;
  price: number;
  slug: string;
  images: string[];
  rating: number;
  description: string | null;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔄 Fetching data from Supabase...');
        
        // Fetch categories
        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (catError) throw new Error(`Categories error: ${catError.message}`);
        console.log('✅ Categories loaded:', categoriesData?.length);
        setCategories(categoriesData || []);
        
        // Fetch products
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .limit(6);
        
        if (prodError) throw new Error(`Products error: ${prodError.message}`);
        console.log('✅ Products loaded:', productsData?.length);
        setProducts(productsData || []);
        
      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading Fresh Talent Store...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="bg-gray-100 p-4 rounded-lg text-left mb-4">
            <p className="text-sm font-mono text-gray-700">
              Check that:
              <br />1. Supabase URL is correct in .env.local
              <br />2. Anon key is valid
              <br />3. Database tables exist
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              <span className="text-blue-600">Fresh Talent</span>
              <span className="text-orange-500"> Store</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-blue-600">Sign In</button>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                Cart (0)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Tech. Fresh. For You.
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Premium electronics delivered fast in Kigali, Rwanda 🇷🇼
          </p>
          <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition text-lg">
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 text-center hover:shadow-lg transition cursor-pointer hover:border-blue-300"
              >
                <div className="text-4xl mb-2">{category.icon || '📦'}</div>
                <p className="font-medium text-sm">{category.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      {products.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl text-gray-400">📱</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm text-gray-600 ml-1">{product.rating || 4.5}</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      RWF {product.price.toLocaleString()}
                    </p>
                    <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale Banner */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">⚡ Flash Sale</h2>
          <p className="text-lg mb-4">Up to 50% off on selected items</p>
          <div className="flex justify-center space-x-4 text-3xl font-mono font-bold mb-4">
            <span className="bg-black bg-opacity-30 px-3 py-1 rounded">12h</span>
            <span>:</span>
            <span className="bg-black bg-opacity-30 px-3 py-1 rounded">24m</span>
            <span>:</span>
            <span className="bg-black bg-opacity-30 px-3 py-1 rounded">35s</span>
          </div>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Shop Flash Deals
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Fresh Talent Store</h3>
              <p className="text-sm">Your trusted electronics store in Kigali, Rwanda.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>📍 Kigali, Rwanda</li>
                <li>📞 +250 788 123 456</li>
                <li>✉️ info@freshtalent.rw</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-white">📘 Facebook</a>
                <a href="#" className="hover:text-white">📸 Instagram</a>
                <a href="#" className="hover:text-white">🐦 Twitter</a>
              </div>
              <a href="https://wa.me/250788123456" className="mt-4 inline-block text-green-400 hover:text-green-300">
                💬 WhatsApp
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Fresh Talent Store. Kigali, Rwanda</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
