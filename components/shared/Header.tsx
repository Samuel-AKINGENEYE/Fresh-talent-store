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

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xl font-bold text-blue-600">Fresh Talent</span>
            <span className="text-sm text-orange-500 hidden sm:inline">Store</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-lg">
            <SearchBar />
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 transition text-sm">
              Shop
            </Link>
            <Link href="/flash-sales" className="text-gray-700 hover:text-orange-500 transition text-sm">
              Flash Sales
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex">
              <LocaleSwitcher />
            </div>
            <Link href="/wishlist">
              <button className="relative rounded-full p-2 hover:bg-gray-100">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-xs font-medium text-white flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/cart">
              <button className="relative rounded-full p-2 hover:bg-gray-100">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-xs font-medium text-white flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-1">
                <Link href="/account">
                  <button className="rounded-full p-2 hover:bg-gray-100">
                    <User className="h-5 w-5" />
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full p-2 hover:bg-gray-100 text-red-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link href="/login">
                <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
                  Sign In
                </button>
              </Link>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-4">
            <SearchBar />
            <LocaleSwitcher />
            <div className="space-y-2">
              <Link href="/products" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/flash-sales" className="block py-2 text-gray-700 hover:text-orange-500" onClick={() => setMobileMenuOpen(false)}>
                Flash Sales
              </Link>
              <Link href="/account" className="block py-2 text-gray-700 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                My Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

