'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { SlidersHorizontal, Grid3x3, List, Star, Heart, ShoppingCart, ChevronDown, X, Search, Zap } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  rating: number;
  review_count: number;
  stock: number;
  category_id: number;
  brand: string;
  category?: { name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

// Sample products used when Supabase returns empty
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1, name: 'MacBook Pro 14" M3 Pro', slug: 'macbook-pro-14-m3',
    price: 1550000, compare_at_price: 1750000,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=85'],
    rating: 4.9, review_count: 142, stock: 8, category_id: 1, brand: 'Apple',
    category: { name: 'Laptops', slug: 'laptops' },
  },
  {
    id: 2, name: 'Dell XPS 15 Core i7', slug: 'dell-xps-15',
    price: 820000, compare_at_price: 980000,
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop&q=85'],
    rating: 4.7, review_count: 89, stock: 5, category_id: 1, brand: 'Dell',
    category: { name: 'Laptops', slug: 'laptops' },
  },
  {
    id: 3, name: 'ASUS ROG Strix G17 Gaming', slug: 'asus-rog-strix-g17',
    price: 995000, compare_at_price: 1150000,
    images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop&q=85'],
    rating: 4.8, review_count: 64, stock: 3, category_id: 1, brand: 'ASUS',
    category: { name: 'Laptops', slug: 'laptops' },
  },
  {
    id: 4, name: 'HP Pavilion 15 Core i5', slug: 'hp-pavilion-15',
    price: 465000, compare_at_price: 540000,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&q=85'],
    rating: 4.5, review_count: 203, stock: 12, category_id: 1, brand: 'HP',
    category: { name: 'Laptops', slug: 'laptops' },
  },
  {
    id: 5, name: 'Lenovo ThinkPad E14 Gen 5', slug: 'lenovo-thinkpad-e14',
    price: 595000, compare_at_price: null,
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop&q=85'],
    rating: 4.6, review_count: 57, stock: 7, category_id: 1, brand: 'Lenovo',
    category: { name: 'Laptops', slug: 'laptops' },
  },
  {
    id: 6, name: 'Acer Aspire 5 Slim Laptop', slug: 'acer-aspire-5',
    price: 345000, compare_at_price: 399000,
    images: ['https://images.unsplash.com/photo-1588702547923-7408785919c3?w=600&h=600&fit=crop&q=85'],
    rating: 4.4, review_count: 118, stock: 9, category_id: 1, brand: 'Acer',
    category: { name: 'Laptops', slug: 'laptops' },
  },
  {
    id: 7, name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra',
    price: 875000, compare_at_price: 1000000,
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop&q=85'],
    rating: 4.9, review_count: 321, stock: 15, category_id: 2, brand: 'Samsung',
    category: { name: 'Phones', slug: 'phones' },
  },
  {
    id: 8, name: 'iPhone 15 Pro 256GB', slug: 'iphone-15-pro',
    price: 1150000, compare_at_price: 1320000,
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&q=85'],
    rating: 4.9, review_count: 276, stock: 6, category_id: 2, brand: 'Apple',
    category: { name: 'Phones', slug: 'phones' },
  },
  {
    id: 9, name: 'Xiaomi Redmi Note 13 Pro', slug: 'xiaomi-redmi-note-13',
    price: 165000, compare_at_price: 195000,
    images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=600&fit=crop&q=85'],
    rating: 4.5, review_count: 445, stock: 20, category_id: 2, brand: 'Xiaomi',
    category: { name: 'Phones', slug: 'phones' },
  },
  {
    id: 10, name: 'Sony WH-1000XM5 Headphones', slug: 'sony-wh-1000xm5',
    price: 235000, compare_at_price: 280000,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=85'],
    rating: 4.8, review_count: 198, stock: 11, category_id: 3, brand: 'Sony',
    category: { name: 'Accessories', slug: 'accessories' },
  },
  {
    id: 11, name: 'Apple AirPods Pro (2nd Gen)', slug: 'airpods-pro-2',
    price: 155000, compare_at_price: 185000,
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&q=85'],
    rating: 4.7, review_count: 384, stock: 14, category_id: 3, brand: 'Apple',
    category: { name: 'Accessories', slug: 'accessories' },
  },
  {
    id: 12, name: 'Anker 65W USB-C Charger Hub', slug: 'anker-65w-charger',
    price: 26000, compare_at_price: 38000,
    images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop&q=85'],
    rating: 4.6, review_count: 512, stock: 30, category_id: 3, brand: 'Anker',
    category: { name: 'Accessories', slug: 'accessories' },
  },
];

const CATEGORY_TABS = [
  { label: 'All Products', value: 'all', icon: '🛍️' },
  { label: 'Laptops', value: 'laptops', icon: '💻' },
  { label: 'Phones', value: 'phones', icon: '📱' },
  { label: 'Accessories', value: 'accessories', icon: '🎧' },
];

const PRICE_PRESETS = [
  { label: 'Under 200k', max: 200000 },
  { label: '200k – 500k', min: 200000, max: 500000 },
  { label: '500k – 1M', min: 500000, max: 1000000 },
  { label: 'Over 1M', min: 1000000 },
];

function getProductImage(name: string, images?: string[]): string | null {
  if (images?.[0]) return images[0];
  const n = name.toLowerCase();
  if (n.includes('iphone'))                                   return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop&q=85';
  if (n.includes('galaxy') || n.includes('samsung'))         return 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&h=600&fit=crop&q=85';
  if (n.includes('xiaomi') || n.includes('redmi'))           return 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&h=600&fit=crop&q=85';
  if (n.includes('macbook'))                                  return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop&q=85';
  if (n.includes('dell') || n.includes('xps'))               return 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop&q=85';
  if (n.includes('rog') || n.includes('gaming laptop'))      return 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=600&fit=crop&q=85';
  if (n.includes('thinkpad') || n.includes('lenovo'))        return 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&h=600&fit=crop&q=85';
  if (n.includes('pavilion') || n.includes(' hp ') || n.startsWith('hp ')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&q=85';
  if (n.includes('acer'))                                    return 'https://images.unsplash.com/photo-1588702547923-7408785919c3?w=600&h=600&fit=crop&q=85';
  if (n.includes('airpods'))                                 return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&q=85';
  if (n.includes('headphone') || n.includes('wh-') || n.includes('earphone') || n.includes('beats')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&q=85';
  if (n.includes('watch'))                                   return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop&q=85';
  if (n.includes('charger') || n.includes('hub') || n.includes('anker') || n.includes('cable')) return 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&h=600&fit=crop&q=85';
  if (n.includes('keyboard'))                                return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop&q=85';
  if (n.includes('mouse'))                                   return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop&q=85';
  if (n.includes('phone') || n.includes('smartphone'))      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop&q=85';
  if (n.includes('laptop') || n.includes('notebook') || n.includes('ultrabook')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop&q=85';
  return null;
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  const cls = size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`${cls} ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-slate-100 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-5 bg-slate-100 rounded w-2/5" />
        <div className="h-9 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());

  const [activeTab, setActiveTab] = useState('all');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(2000000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const brands: string[] = [];
  products.forEach((p) => {
    if (p.brand && !brands.includes(p.brand)) brands.push(p.brand);
  });

  useEffect(() => {
    async function fetchData() {
      const { data: categoriesData } = await supabase.from('categories').select('*').order('name');
      setCategories(categoriesData || []);

      const { data: productsData } = await supabase
        .from('products')
        .select('*, categories!inner (name, slug)')
        .eq('is_active', true);

      if (productsData && productsData.length > 0) {
        setProducts(productsData);
        const maxPrice = Math.max(...productsData.map((p) => p.price), 2000000);
        setPriceMax(maxPrice);
      } else {
        setProducts(SAMPLE_PRODUCTS);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    if (activeTab !== 'all') {
      filtered = filtered.filter((p) => p.category?.slug === activeTab);
    }

    filtered = filtered.filter((p) => p.price >= priceMin && p.price <= priceMax);

    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }

    if (minRating > 0) {
      filtered = filtered.filter((p) => p.rating >= minRating);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'price_asc':  filtered.sort((a, b) => a.price - b.price); break;
      case 'price_desc': filtered.sort((a, b) => b.price - a.price); break;
      case 'rating':     filtered.sort((a, b) => b.rating - a.rating); break;
      case 'newest':     filtered.sort((a, b) => b.id - a.id); break;
    }

    setFilteredProducts(filtered);
  }, [products, activeTab, priceMin, priceMax, selectedBrands, minRating, sortBy, searchQuery]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  const clearFilters = () => {
    setActiveTab('all');
    setPriceMin(0);
    setPriceMax(2000000);
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy('newest');
    setSearchQuery('');
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeFilterCount =
    (activeTab !== 'all' ? 1 : 0) +
    (priceMin > 0 || priceMax < 2000000 ? 1 : 0) +
    selectedBrands.length +
    (minRating > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">
                <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-700 font-medium">Shop</span>
              </p>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Shop Electronics</h1>
              <p className="text-slate-500 text-sm mt-1">Premium laptops, phones &amp; accessories in Kigali</p>
            </div>
            <Link href="/flash-sales">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-orange-100 transition-colors cursor-pointer">
                <Zap className="h-4 w-4 fill-orange-500 text-orange-500" />
                Flash Sales Active
              </div>
            </Link>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.value
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        {/* Search + sort toolbar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or brand…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white text-blue-600 text-xs font-bold h-4 w-4 rounded-full flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-base">Filters</h3>
              <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                <X className="h-3.5 w-3.5" /> Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Price range */}
              <div>
                <h4 className="font-semibold text-slate-700 text-sm mb-3">Price Range (RWF)</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PRICE_PRESETS.map((p) => {
                    const active = priceMin === (p.min ?? 0) && priceMax === (p.max ?? 2000000);
                    return (
                      <button
                        key={p.label}
                        onClick={() => { setPriceMin(p.min ?? 0); setPriceMax(p.max ?? 2000000); }}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          active ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-1.5">
                  <input type="range" min={0} max={2000000} step={50000} value={priceMax}
                    onChange={(e) => setPriceMax(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0</span>
                    <span className="font-medium text-blue-600">Up to {(priceMax / 1000).toFixed(0)}k RWF</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-700 text-sm mb-3">Brand</h4>
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          selectedBrands.includes(brand)
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-slate-700 text-sm mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[0, 3, 4, 4.5].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === r}
                        onChange={() => setMinRating(r)}
                        className="accent-blue-600"
                      />
                      <div className="flex items-center gap-1.5">
                        {r === 0 ? (
                          <span className="text-sm text-slate-600 group-hover:text-slate-800">Any rating</span>
                        ) : (
                          <>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} className={`h-3 w-3 ${s <= r ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">&amp; up</span>
                          </>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-600">
            <span className="font-bold text-slate-800">{filteredProducts.length}</span> products found
            {searchQuery && <span className="text-slate-500"> for &ldquo;{searchQuery}&rdquo;</span>}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        {/* Product grid / list */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-bold text-slate-800 text-lg mb-2">No products found</h3>
            <p className="text-slate-500 text-sm mb-5">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 transition-colors">
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <GridCard key={product.id} product={product} wishlisted={wishlist.has(product.id)} onWishlist={toggleWishlist} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <ListCard key={product.id} product={product} wishlisted={wishlist.has(product.id)} onWishlist={toggleWishlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GridCard({
  product,
  wishlisted,
  onWishlist,
}: {
  product: Product;
  wishlisted: boolean;
  onWishlist: (id: number, e: React.MouseEvent) => void;
}) {
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  const outOfStock = product.stock === 0;
  const imgUrl = getProductImage(product.name, product.images);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${outOfStock ? 'opacity-50' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">📦</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
              -{discount}%
            </span>
          )}
          {outOfStock && (
            <span className="bg-slate-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => onWishlist(product.id, e)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 h-8 w-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
            wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Quick add on hover */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-colors">
              <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {product.brand && (
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">{product.brand}</p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 hover:text-blue-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Stars rating={product.rating || 4.5} size="xs" />
          <span className="text-xs text-slate-400">({product.review_count || 0})</span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-blue-700 font-extrabold text-base">RWF {product.price.toLocaleString()}</span>
          {product.compare_at_price && (
            <span className="text-slate-400 text-xs line-through">{product.compare_at_price.toLocaleString()}</span>
          )}
        </div>
        <Link href={`/product/${product.slug}`}>
          <button className="w-full bg-slate-900 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors duration-200">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}

function ListCard({
  product,
  wishlisted,
  onWishlist,
}: {
  product: Product;
  wishlisted: boolean;
  onWishlist: (id: number, e: React.MouseEvent) => void;
}) {
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  const imgUrl = getProductImage(product.name, product.images);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex">
      <div className="relative w-36 sm:w-48 flex-shrink-0 bg-slate-50 overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">📦</div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3 min-w-0">
        <div>
          {product.brand && (
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-1">{product.brand}</p>
          )}
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-bold text-slate-800 text-base leading-snug hover:text-blue-600 transition-colors line-clamp-2 mb-1.5">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <Stars rating={product.rating || 4.5} size="xs" />
            <span className="text-xs text-slate-400">({product.review_count || 0} reviews)</span>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-blue-700 font-extrabold text-xl">RWF {product.price.toLocaleString()}</span>
            {product.compare_at_price && (
              <span className="text-slate-400 text-sm line-through">RWF {product.compare_at_price.toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onWishlist(product.id, e)}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors ${
                wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200'
              }`}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500' : ''}`} />
            </button>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
