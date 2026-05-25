'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  ArrowRight, Star, Truck, Shield, Headphones, Zap,
  ShoppingCart, BadgePercent, Trophy, CheckCircle2,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  rating: number;
  is_featured: boolean;
}

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 101, name: 'Business Laptop Core i5 15.6"', slug: 'laptop-core-i5',
    price: 345000, compare_at_price: 395000,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&fit=crop&q=85'],
    rating: 4.8, is_featured: true,
  },
  {
    id: 102, name: 'Gaming Laptop i7 RTX 4060', slug: 'gaming-laptop-rtx',
    price: 565000, compare_at_price: 650000,
    images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=480&h=480&fit=crop&q=85'],
    rating: 4.9, is_featured: true,
  },
  {
    id: 103, name: 'Slim Ultrabook 14" 8GB RAM', slug: 'slim-ultrabook',
    price: 295000, compare_at_price: null,
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=480&h=480&fit=crop&q=85'],
    rating: 4.6, is_featured: true,
  },
  {
    id: 104, name: 'Samsung Galaxy A55 5G', slug: 'samsung-galaxy-a55',
    price: 235000, compare_at_price: 265000,
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=480&h=480&fit=crop&q=85'],
    rating: 4.7, is_featured: true,
  },
  {
    id: 105, name: 'Wireless Noise-Cancelling Headphones', slug: 'wireless-headphones',
    price: 39000, compare_at_price: 52000,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=480&h=480&fit=crop&q=85'],
    rating: 4.6, is_featured: true,
  },
];

const HERO_SHOWCASE = [
  {
    name: 'Laptop Core i5',
    category: 'Best Seller',
    categoryColor: 'text-blue-300',
    price: 'RWF 345,000',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=320&h=240&fit=crop&q=85',
    badge: null,
    animCls: '',
  },
  {
    name: 'Gaming Laptop RTX 4060',
    category: 'Gaming',
    categoryColor: 'text-slate-400',
    price: 'RWF 565,000',
    img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=480&h=360&fit=crop&q=85',
    badge: 'Hot Deal',
    animCls: '',
  },
  {
    name: 'Galaxy A55 5G',
    category: 'New Arrival',
    categoryColor: 'text-emerald-400',
    price: 'RWF 235,000',
    img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=320&h=240&fit=crop&q=85',
    badge: null,
    animCls: 'animate-float-alt',
  },
];

const FEATURES = [
  { Icon: Truck,        title: 'Same-Day Delivery', desc: 'Free in Kigali',            color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100'   },
  { Icon: Shield,       title: 'Genuine Products',  desc: '100% authentic items',      color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  { Icon: Headphones,   title: '24/7 Support',      desc: 'Always here to help',       color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  { Icon: BadgePercent, title: 'Best Prices',        desc: 'Price-match guarantee',     color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100'  },
];

const SHOWCASES = [
  { label: 'Business Laptops', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=320&fit=crop&q=80', accent: 'from-blue-900/80 to-blue-600/40',    href: '/products?category=laptops'     },
  { label: 'Gaming Laptops',   img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=320&fit=crop&q=80', accent: 'from-slate-900/80 to-red-900/40',  href: '/products?category=laptops'     },
  { label: 'Slim Ultrabooks',  img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=320&fit=crop&q=80', accent: 'from-indigo-900/80 to-indigo-600/40', href: '/products?category=laptops'  },
  { label: 'Smartphones',      img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=320&fit=crop&q=80', accent: 'from-slate-900/80 to-emerald-900/40', href: '/products?category=phones'   },
  { label: 'Accessories',      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=320&fit=crop&q=80', accent: 'from-slate-900/80 to-amber-900/40', href: '/products?category=accessories' },
];

const TIERS = [
  { name: 'Bronze',   pts: '0 – 999',    icon: '🥉', color: 'text-amber-700',  bg: 'bg-amber-50/10',   perks: 'Earn 1 pt per RWF 1,000 spent' },
  { name: 'Silver',   pts: '1k – 4,999', icon: '🥈', color: 'text-slate-300',  bg: 'bg-slate-50/10',   perks: 'Earn 1.5 pts + priority support' },
  { name: 'Gold',     pts: '5k – 9,999', icon: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-50/10',  perks: 'Earn 2 pts + early flash access' },
  { name: 'Platinum', pts: '10k+',       icon: '💎', color: 'text-blue-300',   bg: 'bg-blue-50/10',    perks: 'Earn 3 pts + VIP member perks' },
];

function getProductImage(name: string, images?: string[]): string | null {
  if (images?.[0]) return images[0];
  const n = name.toLowerCase();
  if (n.includes('iphone'))                                                       return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=480&h=480&fit=crop&q=85';
  if (n.includes('galaxy') || n.includes('samsung'))                             return 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=480&h=480&fit=crop&q=85';
  if (n.includes('xiaomi') || n.includes('redmi'))                               return 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=480&h=480&fit=crop&q=85';
  if (n.includes('macbook'))                                                      return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=480&h=480&fit=crop&q=85';
  if (n.includes('dell') || n.includes('xps'))                                   return 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=480&h=480&fit=crop&q=85';
  if (n.includes('rog') || n.includes('gaming laptop'))                          return 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=480&h=480&fit=crop&q=85';
  if (n.includes('thinkpad') || n.includes('lenovo'))                            return 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=480&h=480&fit=crop&q=85';
  if (n.includes('pavilion') || n.includes(' hp ') || n.startsWith('hp '))      return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&fit=crop&q=85';
  if (n.includes('acer'))                                                         return 'https://images.unsplash.com/photo-1588702547923-7408785919c3?w=480&h=480&fit=crop&q=85';
  if (n.includes('airpods'))                                                      return 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=480&h=480&fit=crop&q=85';
  if (n.includes('headphone') || n.includes('wh-') || n.includes('earphone') || n.includes('beats')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=480&h=480&fit=crop&q=85';
  if (n.includes('watch'))                                                        return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=480&h=480&fit=crop&q=85';
  if (n.includes('charger') || n.includes('hub') || n.includes('anker') || n.includes('cable')) return 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=480&h=480&fit=crop&q=85';
  if (n.includes('keyboard'))                                                     return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=480&h=480&fit=crop&q=85';
  if (n.includes('mouse'))                                                        return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=480&h=480&fit=crop&q=85';
  if (n.includes('phone') || n.includes('smartphone'))                           return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=480&h=480&fit=crop&q=85';
  if (n.includes('laptop') || n.includes('notebook') || n.includes('ultrabook')) return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&fit=crop&q=85';
  return null;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`}
        />
      ))}
    </div>
  );
}

function DiscountBadge({ price, compareAt }: { price: number; compareAt: number }) {
  const pct = Math.round((1 - price / compareAt) * 100);
  return (
    <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
      -{pct}%
    </span>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: catsData } = await supabase.from('categories').select('*').order('name');
      setCategories(catsData || []);

      const { data: prodsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .limit(5);
      setFeaturedProducts(prodsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : SAMPLE_PRODUCTS;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 animate-pulse">
            <Zap className="h-6 w-6 text-white fill-white" />
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading Fresh Talent Store…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950">
        {/* Subtle top-right light accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-800/20 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: headline + CTAs */}
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2.5 bg-white/8 border border-white/15 text-slate-300 text-xs font-semibold px-4 py-2 rounded-full animate-fade-in">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                🇷🇼 Kigali&apos;s Premier Electronics Store
              </span>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.06] tracking-tight animate-slide-in-left delay-100">
                <span className="block text-white">Tech That</span>
                <span className="block gradient-text">Moves You</span>
                <span className="block text-white">Forward.</span>
              </h1>

              <p className="text-slate-400 text-lg leading-relaxed max-w-md animate-fade-in delay-200">
                Premium laptops, phones &amp; accessories delivered same-day across
                Kigali. Genuine products, great prices, loyalty rewards.
              </p>

              <div className="flex flex-wrap gap-3 animate-fade-in delay-300">
                <Link href="/products">
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all duration-200 text-sm">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/flash-sales">
                  <button className="flex items-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/6 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm">
                    <Zap className="h-4 w-4 text-amber-400 fill-amber-400" /> Flash Deals
                  </button>
                </Link>
              </div>

              {/* Social proof stats */}
              <div className="flex items-center gap-8 pt-2 animate-fade-in delay-500">
                {[
                  { num: '1,000+', label: 'Customers Served' },
                  { num: '500+',   label: 'Products Available' },
                  { num: '1-Year', label: 'Warranty Included' },
                ].map(({ num, label }) => (
                  <div key={label}>
                    <p className="text-white font-extrabold text-xl leading-none">{num}</p>
                    <p className="text-slate-500 text-xs mt-1.5 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: product showcase cards (stacked, clean) */}
            <div className="hidden lg:flex flex-col gap-3 max-w-sm mx-auto w-full animate-slide-in-right delay-200">

              {/* Top small card */}
              <div className="animate-float bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                  <img src={HERO_SHOWCASE[0].img} alt={HERO_SHOWCASE[0].name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wide ${HERO_SHOWCASE[0].categoryColor}`}>
                    {HERO_SHOWCASE[0].category}
                  </p>
                  <p className="text-white text-sm font-bold mt-0.5 line-clamp-1">{HERO_SHOWCASE[0].name}</p>
                  <p className="text-amber-400 text-sm font-extrabold mt-0.5">{HERO_SHOWCASE[0].price}</p>
                </div>
                <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Center main card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-4 shadow-2xl">
                <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-800">
                  <img
                    src={HERO_SHOWCASE[1].img}
                    alt={HERO_SHOWCASE[1].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-medium">{HERO_SHOWCASE[1].category}</p>
                    <p className="text-white text-base font-bold mt-0.5">{HERO_SHOWCASE[1].name}</p>
                    <p className="text-amber-400 text-xl font-extrabold mt-1">{HERO_SHOWCASE[1].price}</p>
                  </div>
                  <span className="inline-flex items-center bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {HERO_SHOWCASE[1].badge}
                  </span>
                </div>
              </div>

              {/* Bottom small card */}
              <div className="animate-float-alt bg-white/8 backdrop-blur-xl border border-white/12 rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                  <img src={HERO_SHOWCASE[2].img} alt={HERO_SHOWCASE[2].name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wide ${HERO_SHOWCASE[2].categoryColor}`}>
                    {HERO_SHOWCASE[2].category}
                  </p>
                  <p className="text-white text-sm font-bold mt-0.5 line-clamp-1">{HERO_SHOWCASE[2].name}</p>
                  <p className="text-amber-400 text-sm font-extrabold mt-0.5">{HERO_SHOWCASE[2].price}</p>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3 w-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ──────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-6 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {FEATURES.map(({ Icon, title, desc, color, bg, border }, i) => (
              <div
                key={title}
                className="flex items-center gap-4 animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`h-12 w-12 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-10 animate-fade-in">
              <p className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-2">Browse</p>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shop by Category</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.map((cat, i) => (
                <Link href={`/products?category=${cat.slug}`} key={cat.id}>
                  <div
                    className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer animate-scale-in transition-all duration-200"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="h-11 w-11 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center text-2xl transition-colors duration-200">
                      {cat.icon || '📦'}
                    </div>
                    <p className="text-xs font-semibold text-slate-600 group-hover:text-blue-700 text-center line-clamp-2 transition-colors duration-200">
                      {cat.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ─────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-10">
            <div className="animate-slide-in-left">
              <p className="text-amber-600 text-xs font-bold tracking-widest uppercase mb-2">Handpicked For You</p>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Products</h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:gap-2.5 transition-all duration-200 group"
            >
              View all <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {displayProducts.map((product, i) => {
              const imgUrl = getProductImage(product.name, product.images);
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm card-hover animate-scale-in"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                    )}
                    {product.compare_at_price && (
                      <DiscountBadge price={product.price} compareAt={product.compare_at_price} />
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button className="w-full bg-white/95 backdrop-blur text-slate-800 font-bold text-xs py-2 rounded-lg shadow-lg flex items-center justify-center gap-1.5 hover:bg-white transition-colors">
                        <ShoppingCart className="h-3.5 w-3.5" /> Quick Add
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Stars rating={product.rating || 4.5} />
                      <span className="text-xs text-slate-400">({product.rating?.toFixed(1) || '4.5'})</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-blue-700 font-extrabold text-base">
                        RWF {product.price.toLocaleString()}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-slate-400 text-xs line-through">
                          {product.compare_at_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Link href={`/product/${product.slug}`}>
                      <button className="mt-3.5 w-full bg-slate-900 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors duration-200">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CATALOGUE TILES ───────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-10 animate-fade-in">
            <p className="text-violet-600 text-xs font-bold tracking-widest uppercase mb-2">Shop by Type</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Our Catalogue</h2>
            <p className="text-slate-500 text-sm mt-2">Laptops · Phones · Accessories</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {SHOWCASES.map(({ label, img, accent, href }, i) => (
              <Link href={href} key={label}>
                <div
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] card-hover animate-scale-in"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <img
                    src={img}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600 ease-out"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${accent}`} />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm drop-shadow">{label}</p>
                    <p className="text-white/70 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 mt-0.5">
                      Shop now <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOYALTY PROGRAM ───────────────────────────────────── */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        {/* Single subtle background element */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-5">
              <Trophy className="h-3.5 w-3.5" /> Loyalty Rewards Program
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Shop More. Earn More.
            </h2>
            <p className="text-slate-400 text-base mt-3 max-w-lg mx-auto">
              Earn points on every purchase and unlock exclusive perks as you level up.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* Left: stats + benefits */}
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🏆', value: '4 Tiers',   label: 'Loyalty Levels'  },
                  { icon: '⭐', value: '1 pt',      label: 'per RWF 1,000'   },
                  { icon: '🎁', value: '100 pts',   label: '= RWF 1,000 off' },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="bg-white/6 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className="text-white font-extrabold text-sm">{value}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/6 border border-white/10 rounded-2xl p-6 space-y-3.5">
                <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-4">Member Benefits</h3>
                {[
                  'Earn points automatically on every purchase',
                  'Early access to flash sales and new arrivals',
                  'Priority support for Silver tier and above',
                  'Exclusive VIP perks at Platinum tier',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300 text-sm">{benefit}</p>
                  </div>
                ))}
              </div>

              <Link href="/account">
                <button className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 rounded-xl transition-all duration-200 text-sm shadow-lg">
                  View My Points &amp; Tier <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Right: tier list */}
            <div className="space-y-3">
              {TIERS.map(({ name, pts, icon, perks }) => (
                <div
                  key={name}
                  className="flex items-center gap-4 bg-white/6 border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/10 transition-colors duration-200"
                >
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-base">{name}</span>
                      <span className="text-slate-500 text-xs bg-white/8 px-2 py-0.5 rounded-full">{pts} pts</span>
                    </div>
                    <p className="text-slate-400 text-sm">{perks}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────── */}
      <section className="bg-blue-700 py-16 relative overflow-hidden">
        {/* Subtle right-side decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/50 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
          <span className="inline-block bg-white/15 border border-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-5 animate-fade-in">
            Limited Time Offer
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4 animate-slide-in-left delay-100">
            Flash Sale — Up to 40% OFF
          </h2>
          <p className="text-blue-100 text-base mb-8 max-w-md mx-auto animate-fade-in delay-200">
            Grab the best deals on top-tier electronics before they&apos;re gone.
          </p>
          <Link href="/flash-sales">
            <button className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 animate-scale-in delay-300">
              <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
              See Flash Deals
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
