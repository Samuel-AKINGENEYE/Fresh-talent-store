'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CartItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    images: string[];
    slug: string;
  };
  variant?: {
    id: number;
    attribute_name: string;
    attribute_value: string;
    price_adjustment: number;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: number, variantId: number | null, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(id, name, price, images, slug),
        variant:product_variants(id, attribute_name, attribute_value, price_adjustment)
      `)
      .eq('user_id', user.id);

    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCart();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadCart();
    });

    return () => subscription.unsubscribe();
  }, []);

  const addToCart = async (productId: number, variantId: number | null, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user.id,
        product_id: productId,
        variant_id: variantId,
        quantity,
      }, {
        onConflict: 'user_id, product_id, variant_id',
      });

    if (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart');
    } else {
      await loadCart();
      alert('Added to cart!');
    }
  };

  const removeFromCart = async (itemId: number) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing from cart:', error);
    } else {
      await loadCart();
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating quantity:', error);
    } else {
      await loadCart();
    }
  };

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing cart:', error);
    } else {
      await loadCart();
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = items.reduce((sum, item) => {
    const productPrice = item.product?.price || 0;
    const variantAdjustment = item.variant?.price_adjustment || 0;
    return sum + ((productPrice + variantAdjustment) * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
