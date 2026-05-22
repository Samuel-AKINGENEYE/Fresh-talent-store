'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  rating: number;
}

interface WishlistItem {
  id: number;
  product_id: number;
  product?: WishlistProduct;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  totalItems: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('wishlists')
      .select(`
        id,
        product_id,
        product:products(id, name, slug, price, compare_at_price, images, rating)
      `)
      .eq('user_id', user.id);

    // Supabase returns the relation as an array; normalise to a single object
    const normalised: WishlistItem[] = (data ?? []).map((row: any) => ({
      ...row,
      product: Array.isArray(row.product) ? row.product[0] : row.product,
    }));

    setItems(normalised);
    setLoading(false);
  };

  useEffect(() => {
    loadWishlist();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadWishlist();
    });
    return () => subscription.unsubscribe();
  }, []);

  const addToWishlist = async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, product_id: productId });

    if (error?.code === '23505') {
      // Already in wishlist — silently ignore duplicates
      return;
    }
    if (!error) {
      await loadWishlist();
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    await loadWishlist();
  };

  const isInWishlist = (productId: number) => items.some(item => item.product_id === productId);
  const totalItems = items.length;

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, totalItems, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
