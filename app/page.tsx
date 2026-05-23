'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, Star, Truck, Shield, Headphones, Zap, ShoppingCart, BadgePercent, Trophy, CheckCircle2 } from 'lucide-react';

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
    id: 101,
    name: 'Business Laptop Core i5 15.6"',
    slug: 'laptop-core-i5',
    price: 345000,
    compare_at_price: 395000,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=480&h=480&fit=crop&q=85'],
    rating: 4.8,
    is_featured: true,
  },
  {
    id: 102,
    name: 'Gaming Laptop i7 RTX 4060',
    slug: 'gaming-laptop-rtx',
    price: 565000,
    compare_at_price: 650000,
    images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=480&h=480&fit=crop&q=85'],
    rating: 4.9,
    is_featured: true,
  },
  {
    id: 103,
    name: 'Slim Ultrabook 14" 8GB RAM',
    slug: 'slim-ultrabook',
    price: 295000,
    compare_at_price: null,
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=480&h=480&fit=crop&q=85'],
    rating: 4.6,
    is_featured: true,
  },
  {
    id: 104,
    name: 'Samsung Galaxy A55 5G',
    slug: 'samsung-galaxy-a55',
    price: 235000,
    compare_at_price: 265000,
    images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=480&h=480&fit=crop&q=85'],
    rating: 4.7,
    is_featured: true,
  },
  {
    id: 105,
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-headphones',
    price: 39000,
    compare_at_price: 52000,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=480&h=480&fit=crop&q=85'],
    rating: 4.6,
    is_featured: true,
  },
];

const HERO_CARDS = [
  {
    name: 'Laptop Core i5',
    price: 'RWF 345,000',
    badge: 'Best Seller',
    badgeCls: 'bg-blue-500',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=220&h=220&fit=crop&q=85',
    animCls: 'animate-float delay-200',
    rotate: '-rotate-2',
  },
  {
    name: 'Gaming Laptop',
    price: 'RWF 565,000',
    badge: 'Hot Deal',
    badgeCls: 'bg-red-500',
    img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=220&h=220&fit=crop&q=85',
    animCls: 'animate-float-reverse delay-500',
    rotate: 'rotate-1',
  },
  {
    name: 'Galaxy A55 5G',
    price: 'RWF 235,000',
    badge: 'New Arrival',
    badgeCls: 'bg-green-500',
    img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=220&h=220&fit=crop&q=85',
    animCls: 'animate-float delay-700',
    rotate: 'rotate-2',
  },
];

const FEATURES = [
  { Icon: Truck,        title: 'Fast Delivery',    desc: 'Same-day in Kigali',        color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { Icon: Shield,       title: 'Genuine Products', desc: '100% authentic, warranted', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { Icon: Headphones,   title: '24/7 Support',     desc: 'Always here to help',       color: 'text-violet-600', bg: 'bg-violet-50' },
  { Icon: BadgePercent, title: 'Best Prices',      desc: 'Price-match guarantee',     color: 'text-orange-600', bg: 'bg-orange-50' },
];

const SHOWCASES = [
  { label: 'Business Laptops', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=320&fit=crop&q=80', accent: 'from-blue-500 to-blue-700',    href: '/products?category=laptops'     },
  { label: 'Gaming Laptops',   img: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&h=320&fit=crop&q=80', accent: 'from-red-500 to-rose-700',     href: '/products?category=laptops'     },
  { label: 'Slim Ultrabooks',  img: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=320&fit=crop&q=80', accent: 'from-indigo-500 to-indigo-700', href: '/products?category=laptops'     },
  { label: 'Smartphones',      img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=320&fit=crop&q=80', accent: 'from-green-500 to-emerald-700', href: '/products?category=phones'      },
  { label: 'Accessories',      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=320&fit=crop&q=80', accent: 'from-orange-500 to-orange-700', href: '/products?category=accessories' },
];

const TIERS = [
  { name: 'Bronze',   pts: '0 – 999',    color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',  perks: 'Earn 1 pt per RWF 1,000 spent' },
  { name: 'Silver',   pts: '1k – 4,999', color: 'text-slate-600',  bg: 'bg-slate-50',   border: 'border-slate-200',  perks: 'Earn 1.5 pts + priority support' },
  { name: 'Gold',     pts: '5k – 9,999', color: 'text-yellow-600', bg: 'bg-yellow-50',  border: 'border-yellow-200', perks: 'Earn 2 pts + early flash access' },
  { name: 'Platinum', pts: '10k+',       color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200',   perks: 'Earn 3 pts + VIP member perks' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  );
}

function DiscountBadge({ price, compareAt }: { price: number; compareAt: number }) {
  const pct = Math.round((1 - price / compareAt) * 100);
  return (
    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow">
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
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 hero-grid">
        <div className="absolute top-10 left-1/4 h-72 w-72 rounded-full bg-blue-500 blur-[120px] animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-indigo-600 blur-[100px] animate-glow-pulse delay-400 pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

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
                Premium laptops, phones &amp; accessories delivered fast across Kigali. Genuine products, earn loyalty points, enjoy exclusive member perks.
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

              <div className="flex flex-wrap gap-3 pt-1 animate-fade-in delay-600">
                {['Free delivery in Kigali', '1,000+ happy customers', '1-year warranty'].map((t) => (
                  <span key={t} className="text-xs text-slate-300 bg-white/8 border border-white/12 px-3 py-1.5 rounded-full font-medium">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating product cards */}
            <div className="hidden lg:flex items-center justify-center relative h-[440px]">
              {HERO_CARDS.map((card, i) => {
                const positions = ['top-0 left-8', 'top-24 right-0', 'bottom-0 left-20'];
                return (
                  <div key={card.name} className={`absolute ${positions[i]} ${card.animCls} ${card.rotate}`}>
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-2xl w-52">
                      <div className="relative rounded-xl overflow-hidden aspect-square">
                        <img src={card.img} alt={card.name} className="w-full h-full object-cover" />
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

      {/* FEATURES BAR */}
      <section className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ Icon, title, desc, color, bg }, i) => (
              <div key={title} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
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

      {/* CATEGORIES */}
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

      {/* FEATURED PRODUCTS */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-10">
            <div className="animate-slide-in-left">
              <p className="text-orange-500 text-sm font-semibold tracking-wide uppercase mb-2">Handpicked For You</p>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Featured Products</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold text-sm hover:gap-2 transition-all duration-200">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {displayProducts.map((product, i) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm card-hover animate-scale-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">💻</div>
                  )}
                  {product.compare_at_price && (
                    <DiscountBadge price={product.price} compareAt={product.compare_at_price} />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button className="w-full bg-white/90 backdrop-blur text-slate-800 font-semibold text-xs py-2 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-white transition-colors">
                      <ShoppingCart className="h-3.5 w-3.5" /> Quick Add
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-snug">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Stars rating={product.rating || 4.5} />
                    <span className="text-xs text-slate-400">({product.rating?.toFixed(1) || '4.5'})</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-blue-600 font-extrabold text-base">RWF {product.price.toLocaleString()}</span>
                    {product.compare_at_price && (
                      <span className="text-slate-400 text-xs line-through">RWF {product.compare_at_price.toLocaleString()}</span>
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

      {/* SHOWCASE TILES */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-10 animate-fade-in">
            <p className="text-violet-600 text-sm font-semibold tracking-wide uppercase mb-2">Shop by Type</p>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Browse Our Catalogue</h2>
            <p className="text-slate-500 text-sm mt-2">60% Laptops · 20% Phones · 20% Accessories</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {SHOWCASES.map(({ label, img, accent, href }, i) => (
              <Link href={href} key={label}>
                <div
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] card-hover animate-scale-in"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <img src={img} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${accent} opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-xs drop-shadow-lg">{label}</p>
                    <p className="text-white/80 text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 mt-0.5">
                      Shop now <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LOYALTY PROGRAM */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-indigo-600 blur-[130px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-violet-600 blur-[100px] opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full mb-5">
              <Trophy className="h-3.5 w-3.5 text-yellow-400" /> Loyalty Rewards Program
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Shop More. Earn More.</h2>
            <p className="text-slate-400 text-base mt-3 max-w-lg mx-auto">
              Earn points on every purchase and unlock exclusive perks as you level up through our loyalty tiers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* Left: Stats + benefits */}
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🏆', value: '4 Tiers',  label: 'Loyalty Levels'  },
                  { icon: '⭐', value: '1 pt',     label: 'per RWF 1,000'   },
                  { icon: '🎁', value: '100 pts',  label: '= RWF 1,000 off' },
                ].map(({ icon, value, label }) => (
                  <div key={label} className="bg-white/8 border border-white/15 rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">{icon}</p>
                    <p className="text-white font-extrabold text-sm">{value}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/8 border border-white/15 rounded-3xl p-6 space-y-3">
                <h3 className="text-white font-bold text-base mb-4">Member Benefits</h3>
                {[
                  'Earn points on every purchase automatically',
                  'Early access to flash sales and new arrivals',
                  'Priority customer support for Silver and above',
                  'Exclusive VIP perks at Platinum tier',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300 text-sm">{benefit}</p>
                  </div>
                ))}
              </div>

              <Link href="/account">
                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:-translate-y-0.5 text-sm">
                  View My Points &amp; Tier <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>

            {/* Right: Tier cards */}
            <div className="space-y-4">
              {TIERS.map(({ name, pts, color, bg, border, perks }) => (
                <div
                  key={name}
                  className="flex items-center gap-4 bg-white/8 border border-white/15 rounded-2xl px-5 py-4 hover:bg-white/12 transition-colors"
                >
                  <div className={`h-12 w-12 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
                    <Trophy className={`h-6 w-6 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-base">{name}</span>
                      <span className="text-slate-400 text-xs bg-white/10 px-2 py-0.5 rounded-full">{pts} pts</span>
                    </div>
                    <p className="text-slate-400 text-sm">{perks}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
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
