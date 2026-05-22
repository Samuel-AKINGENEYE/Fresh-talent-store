'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, Star, Truck, Shield, Headphones, Zap, ShoppingCart, BadgePercent } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────
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

// ── Real Unsplash electronics images ──────────────────────────────────
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 101,
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    price: 1199000,
    compare_at_price: 1399000,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=480&h=480&fit=crop&q=85'],
    rating: 4.9,
    is_featured: true,
  },
  {
    id: 102,
    name: 'Sony WH-1000XM5 Headphones',
    slug: 'sony-wh-1000xm5',
    price: 479000,
    compare_at_price: 560000,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=480&h=480&fit=crop&q=85'],
    rating: 4.8,
    is_featured: true,
  },
  {
    id: 103,
    name: 'MacBook Air M3',
    slug: 'macbook-air-m3',
    price: 2499000,
    compare_at_price: null,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&fit=crop&q=85'],
    rating: 5.0,
    is_featured: true,
  },
  {
    id: 104,
    name: 'Apple Watch Series 9',
    slug: 'apple-watch-series-9',
    price: 649000,
    compare_at_price: 750000,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=480&h=480&fit=crop&q=85'],
    rating: 4.7,
    is_featured: true,
  },
];

// Hero animated product cards
const HERO_CARDS = [
  {
    name: 'iPhone 15 Pro',
    price: 'RWF 1,299,000',
    badge: 'New Arrival',
    badgeCls: 'bg-blue-500',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=220&h=220&fit=crop&q=85',
    animCls: 'animate-float delay-200',
    rotate: '-rotate-2',
  },
  {
    name: 'MacBook Air M3',
    price: 'RWF 2,499,000',
    badge: 'Hot Deal',
    badgeCls: 'bg-red-500',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=220&h=220&fit=crop&q=85',
    animCls: 'animate-float-reverse delay-500',
    rotate: 'rotate-1',
  },
  {
    name: 'Sony XM5',
    price: 'RWF 479,000',
    badge: '15% OFF',
    badgeCls: 'bg-orange-500',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=220&h=220&fit=crop&q=85',
    animCls: 'animate-float delay-700',
    rotate: 'rotate-2',
  },
];

// Feature trust items
const FEATURES = [
  { Icon: Truck,       title: 'Fast Delivery',      desc: 'Same-day in Kigali',         color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { Icon: Shield,      title: 'Genuine Products',   desc: '100% authentic, warranted',  color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { Icon: Headphones,  title: '24/7 Support',       desc: 'Always here to help you',    color: 'text-violet-600', bg: 'bg-violet-50' },
  { Icon: BadgePercent,title: 'Best Prices',         desc: 'Price-match guarantee',      color: 'text-orange-600', bg: 'bg-orange-50' },
];

// ── Star component ─────────────────────────────────────────────────────
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

// ── Discount badge ─────────────────────────────────────────────────────
function DiscountBadge({ price, compareAt }: { price: number; compareAt: number }) {
  const pct = Math.round((1 - price / compareAt) * 100);
  return (
    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">
      -{pct}%
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
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
        .limit(4);
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
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 animate-pulse">
            <Zap className="h-7 w-7 text-white fill-white" />
          </div>
          <p className="text-slate-500 text-sm font-medium animate-pulse">Loading Fresh Talent Store…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 hero-grid">
        {/* Glow orbs */}
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-blue-500 blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-indigo-600 blur-[100px] animate-glow-pulse delay-400 pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div className="space-y-7">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur text-white text-xs font-semibold px-4 py-2 rounded-full animate-fade-in">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                🇷🇼 Kigali&apos;s #1 Electronics Store
              </span>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight animate-slide-in-left delay-100">
                <span className="block text-white">Tech.</span>
                <span className="block shimmer-text">Fresh.</span>
                <span className="block text-white">For You.</span>
              </h1>

              <p className="text-slate-300 text-lg leading-relaxed max-w-md animate-slide-in-left delay-300">
                Premium electronics delivered fast across Kigali. Genuine products, unbeatable prices, and support that actually helps.
              </p>

              <div className="flex flex-wrap gap-3 animate-slide-in-left delay-400">
                <Link href="/products">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-7 py-3.5 rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 text-sm">
                    Shop Now <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/flash-sales">
                  <button className="flex items-center gap-2 border border-white/25 hover:border-white/50 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-2xl transition-all duration-300 text-sm backdrop-blur">
                    <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Flash Sales
                  </button>
                </Link>
              </div>

              {/* Mini trust pills */}
              <div className="flex flex-wrap gap-3 pt-1 animate-fade-in delay-600">
                {['Free delivery in Kigali', '1,000+ happy customers', '1-year warranty'].map((t) => (
                  <span key={t} className="text-xs text-slate-300 bg-white/8 border border-white/12 px-3 py-1.5 rounded-full font-medium">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — floating product cards */}
            <div className="hidden lg:flex items-center justify-center relative h-[440px]">
              {HERO_CARDS.map((card, i) => {
                const positions = [
                  'top-0 left-8',
                  'top-24 right-0',
                  'bottom-0 left-20',
                ];
                return (
                  <div
                    key={card.name}
                    className={`absolute ${positions[i]} ${card.animCls} ${card.rotate}`}
                  >
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl w-52">
                      <div className="relative rounded-xl overflow-hidden aspect-square">
                        <img
                          src={card.img}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-2 left-2 ${card.badgeCls} text-white text-[10px] font-bold px-2 py-0.5 rounded-lg`}>
                          {card.badge}
                        </span>
                      </div>
                      <div className="mt-2.5 px-0.5">
                        <p className="text-white text-sm font-semibold line-clamp-1">{card.name}</p>
                        <p className="text-orange-400 text-sm font-bold mt-0.5">{card.price}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ Icon, title, desc, color, bg }, i) => (
              <div
                key={title}
                className={`flex items-center gap-4 animate-fade-in`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="text-center mb-10 animate-fade-in">
              <p className="text-blue-600 text-sm font-semibold tracking-wide uppercase mb-2">Browse</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Shop by Category</h2>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {categories.map((cat, i) => (
                <Link href={`/products?category=${cat.slug}`} key={cat.id}>
                  <div
                    className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50 card-hover cursor-pointer animate-scale-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 group-hover:from-blue-100 group-hover:to-indigo-200 flex items-center justify-center text-2xl transition-all duration-300 shadow-sm">
                      {cat.icon || '📦'}
                    </div>
                    <p className="text-xs font-medium text-slate-600 group-hover:text-blue-700 text-center line-clamp-2 transition-colors duration-200">
                      {cat.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-10">
            <div className="animate-slide-in-left">
              <p className="text-orange-500 text-sm font-semibold tracking-wide uppercase mb-2">Handpicked For You</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Featured Products</h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold text-sm hover:gap-2 transition-all duration-200"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product, i) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm card-hover animate-scale-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">📱</div>
                  )}
                  {product.compare_at_price && (
                    <DiscountBadge price={product.price} compareAt={product.compare_at_price} />
                  )}
                  {/* Quick action */}
                  <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button className="w-full bg-white/90 backdrop-blur text-slate-800 font-semibold text-xs py-2 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-white transition-colors">
                      <ShoppingCart className="h-3.5 w-3.5" /> Quick Add
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">{product.name}</h3>

                  <div className="flex items-center gap-2 mt-1.5">
                    <Stars rating={product.rating || 4.5} />
                    <span className="text-xs text-slate-400">({product.rating?.toFixed(1) || '4.5'})</span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-blue-600 font-extrabold text-base">
                      RWF {product.price.toLocaleString()}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-slate-400 text-xs line-through">
                        RWF {product.compare_at_price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <Link href={`/product/${product.slug}`}>
                    <button className="mt-3.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL ELECTRONICS SHOWCASE ─────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-10 animate-fade-in">
            <p className="text-violet-600 text-sm font-semibold tracking-wide uppercase mb-2">Latest Arrivals</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Top Electronics Picks</h2>
            <p className="text-slate-500 text-sm mt-2">Curated from the world&apos;s leading brands</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Smartphones',  img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=320&fit=crop&q=80', accent: 'from-blue-500 to-blue-700' },
              { label: 'Laptops',      img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=320&fit=crop&q=80', accent: 'from-indigo-500 to-indigo-700' },
              { label: 'Headphones',   img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=320&fit=crop&q=80', accent: 'from-violet-500 to-violet-700' },
              { label: 'Smart Watches',img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=320&fit=crop&q=80', accent: 'from-orange-500 to-rose-600' },
            ].map(({ label, img, accent }, i) => (
              <Link href="/products" key={label}>
                <div
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] card-hover animate-scale-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <img
                    src={img}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${accent} opacity-40 group-hover:opacity-55 transition-opacity duration-300`} />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-sm drop-shadow-lg">{label}</p>
                    <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      Shop now <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 py-16">
        <div className="absolute inset-0 hero-grid pointer-events-none" />
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-6 relative z-10 text-center">
          <span className="inline-block bg-white/15 border border-white/25 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 animate-fade-in">
            Limited Time
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4 animate-slide-in-left delay-100">
            Flash Sale — Up to 40% OFF
          </h2>
          <p className="text-blue-100 text-base mb-8 max-w-md mx-auto animate-fade-in delay-200">
            Grab the best deals on top-tier electronics before they&apos;re gone.
          </p>
          <Link href="/flash-sales">
            <button className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 animate-scale-in delay-300">
              <Zap className="h-4 w-4 fill-orange-500 text-orange-500" />
              See All Flash Deals
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
