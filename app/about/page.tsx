'use client';

import Link from 'next/link';
import {
  ArrowRight, Zap, Shield, Truck, Headphones, Star,
  MapPin, Phone, Mail, CheckCircle2, Users, Award, Package,
} from 'lucide-react';

const STATS = [
  { value: '1,000+', label: 'Happy Customers',  icon: Users    },
  { value: '500+',   label: 'Products Sold',     icon: Package  },
  { value: '4.9★',   label: 'Average Rating',    icon: Star     },
  { value: '1 year', label: 'Warranty Guarantee',icon: Award    },
];

const VALUES = [
  {
    icon: Shield,
    title: 'Genuine Products Only',
    desc: 'Every item we sell is 100% authentic, sourced directly from official distributors and brand partners. No counterfeits — ever.',
    color: 'text-blue-600', bg: 'bg-blue-50',
  },
  {
    icon: Truck,
    title: 'Fast Kigali Delivery',
    desc: 'Same-day or next-day delivery across Kigali. We know your time is precious, so we move fast to bring tech to your door.',
    color: 'text-orange-600', bg: 'bg-orange-50',
  },
  {
    icon: Headphones,
    title: '24/7 Customer Support',
    desc: 'Real humans ready to help via WhatsApp, phone, or email — any time of day. We stay with you from purchase to delivery.',
    color: 'text-violet-600', bg: 'bg-violet-50',
  },
  {
    icon: Zap,
    title: 'Best Prices in Kigali',
    desc: "We work directly with suppliers to cut out middlemen. You get the best prices in the market, backed by our price-match promise.",
    color: 'text-green-600', bg: 'bg-green-50',
  },
];

const TEAM = [
  {
    name: 'Samuel Akingeneye',
    role: 'Founder & CEO',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80',
    bio: 'Tech enthusiast and entrepreneur passionate about making premium electronics accessible to everyone in Rwanda.',
  },
  {
    name: 'Grace Uwimana',
    role: 'Head of Operations',
    img: 'https://images.unsplash.com/photo-1494790108755-2616b612b2a6?w=200&h=200&fit=crop&q=80',
    bio: 'Supply chain expert ensuring every product reaches customers in perfect condition, on time, every time.',
  },
  {
    name: 'Kevin Mugisha',
    role: 'Customer Experience Lead',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80',
    bio: 'Dedicated to making every customer interaction exceptional — from first browse to post-purchase support.',
  },
];

const MILESTONES = [
  { year: '2023', event: 'Fresh Talent Store founded in Kigali', detail: 'Started with 50 products and a bold vision to transform Rwanda\'s electronics retail.' },
  { year: '2024', event: 'Reached 500 happy customers',          detail: 'Expanded our catalog to 300+ products across laptops, phones and accessories.' },
  { year: '2024', event: 'Launched loyalty rewards program',      detail: 'Introduced Bronze–Platinum tiers so every purchase earns points toward future savings.' },
  { year: '2025', event: '1,000+ customers milestone',           detail: 'Now serving customers across Kigali and beyond, with same-day delivery in the city.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
        <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-blue-500 blur-[130px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-indigo-600 blur-[100px] opacity-25 pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 py-24 lg:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur text-white text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              🇷🇼 Proudly Rwandan · Est. 2023
            </span>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6">
              Kigali&apos;s Most Trusted<br />
              <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
                Electronics Store
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl mx-auto mb-8">
              We started Fresh Talent Store with one mission: bring premium, genuine tech to every home and office in Rwanda — at prices that make sense.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/products">
                <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-orange-500/30 transition-all duration-300">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <a href="#contact">
                <button className="flex items-center gap-2 border border-white/25 hover:border-white/50 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-2xl transition-all duration-300 backdrop-blur">
                  Contact Us
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-b border-slate-100 py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
                <p className="text-slate-500 text-sm mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STORY ── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-blue-600 text-sm font-semibold tracking-wide uppercase mb-3">Our Story</p>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Born in Kigali, Built for Rwanda
              </h2>
              <div className="space-y-4 text-slate-600 text-base leading-relaxed">
                <p>
                  Fresh Talent Store was born out of a simple frustration: great tech was hard to find locally, expensive, or of questionable authenticity. We knew Rwanda deserved better.
                </p>
                <p>
                  We started small — a passionate team, a handful of genuine products, and an unwavering commitment to customer trust. Today we serve over 1,000 customers across Kigali, with a catalog of 500+ premium laptops, smartphones, and accessories.
                </p>
                <p>
                  Every product goes through our authenticity check before it reaches your hands. Every delivery is tracked. Every customer is treated like family. That&apos;s the Fresh Talent promise.
                </p>
              </div>
              <div className="mt-8 space-y-3">
                {[
                  'Certified reseller for Apple, Samsung, Dell, HP & more',
                  'Free same-day delivery in Kigali city',
                  '1-year warranty on all products',
                  '14-day hassle-free returns',
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 font-medium text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image collage */}
            <div className="relative h-[460px] hidden lg:block">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/60">
                <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop&q=80" alt="MacBook" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 left-0 w-56 h-56 rounded-3xl overflow-hidden shadow-xl shadow-slate-300/60">
                <img src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop&q=80" alt="Samsung phone" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-3xl overflow-hidden shadow-xl shadow-slate-300/60 border-4 border-white">
                <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80" alt="Headphones" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-6 left-6 w-44 h-44 rounded-3xl overflow-hidden shadow-lg shadow-slate-300/50">
                <img src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop&q=80" alt="iPhone" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR VALUES ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <p className="text-orange-500 text-sm font-semibold tracking-wide uppercase mb-3">What We Stand For</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Our Core Values</h2>
            <p className="text-slate-500 text-base mt-3 max-w-xl mx-auto">
              These aren&apos;t slogans — they&apos;re the principles we live by every single day.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="group bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300">
                <div className={`h-13 w-13 rounded-2xl ${bg} flex items-center justify-center mb-5 p-3`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEY / TIMELINE ── */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-violet-600 text-sm font-semibold tracking-wide uppercase mb-3">How Far We&apos;ve Come</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Our Journey</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-violet-500" aria-hidden="true" />
            <div className="space-y-8 pl-16">
              {MILESTONES.map(({ year, event, detail }) => (
                <div key={event} className="relative">
                  <div className="absolute -left-10 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-blue-100 top-1" />
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">{year}</span>
                  <h3 className="font-bold text-slate-800 text-base mt-2">{event}</h3>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-14">
            <p className="text-green-600 text-sm font-semibold tracking-wide uppercase mb-3">The People Behind It</p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Meet Our Team</h2>
            <p className="text-slate-500 text-base mt-3 max-w-lg mx-auto">
              A small but mighty team united by a love for tech and a drive to serve Rwanda.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {TEAM.map(({ name, role, img, bio }) => (
              <div key={name} className="group text-center">
                <div className="relative inline-block mb-5">
                  <img
                    src={img}
                    alt={name}
                    className="h-28 w-28 rounded-full object-cover mx-auto ring-4 ring-white shadow-xl shadow-slate-200/60 group-hover:ring-blue-100 transition-all duration-300"
                  />
                  <span className="absolute bottom-1 right-1 h-5 w-5 bg-green-400 rounded-full ring-2 ring-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{name}</h3>
                <p className="text-blue-600 text-xs font-semibold mt-0.5 mb-3">{role}</p>
                <p className="text-slate-500 text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-indigo-600 blur-[130px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-violet-600 blur-[100px] opacity-20 pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-sm font-semibold tracking-wide uppercase mb-3">Get In Touch</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">We&apos;d Love to Hear From You</h2>
            <p className="text-slate-400 text-base mt-3 max-w-lg mx-auto">
              Questions, wholesale inquiries, or just want to say hi — we&apos;re always here.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: Phone, label: 'Call / WhatsApp',
                value: '+250 790 663 921',
                href: 'https://wa.me/250790663921',
                color: 'text-green-400', bg: 'bg-green-400/10',
              },
              {
                icon: Mail, label: 'Email',
                value: 'support@freshtalentstore.rw',
                href: 'mailto:support@freshtalentstore.rw',
                color: 'text-blue-400', bg: 'bg-blue-400/10',
              },
              {
                icon: MapPin, label: 'Location',
                value: 'Kigali, Rwanda',
                href: 'https://maps.google.com/?q=Kigali,Rwanda',
                color: 'text-orange-400', bg: 'bg-orange-400/10',
              },
            ].map(({ icon: Icon, label, value, href, color, bg }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/8 border border-white/15 rounded-3xl p-6 text-center hover:bg-white/12 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
                <p className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">{value}</p>
              </a>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/products">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-orange-500/30 transition-all duration-300 text-sm">
                Start Shopping <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
