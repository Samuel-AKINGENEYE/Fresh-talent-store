'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, LogOut, Menu, X, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { SearchBar } from './SearchBar';
import LocaleSwitcher from './LocaleSwitcher';
import { Logo } from './Logo';

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      router.refresh();
    });

    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', onScroll);
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-slate-100'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Logo size="md" onDark={false} />

          {/* Search — desktop */}
          <div className="hidden md:flex flex-1 max-w-lg">
            <SearchBar />
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/products"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              Shop
            </Link>
            <Link
              href="/flash-sales"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center gap-1"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              Flash Sales
            </Link>
            <Link
              href="/about"
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-200"
            >
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <div className="hidden md:flex">
              <LocaleSwitcher />
            </div>

            {/* Wishlist */}
            <Link href="/wishlist">
              <button className="relative h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <button className="relative h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-all duration-200">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-orange-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-1">
                <Link href="/account">
                  <button className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                    <User className="h-5 w-5" />
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="ml-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200">
                  Sign In
                </button>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all duration-200"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-4 animate-slide-up">
            <SearchBar />
            <LocaleSwitcher />
            <div className="space-y-1">
              {[
                { href: '/products', label: 'Shop' },
                { href: '/flash-sales', label: 'Flash Sales' },
                { href: '/account', label: 'My Account' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
