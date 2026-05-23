import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cookie-based browser client — session is readable by middleware
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'customer' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: 'customer' | 'admin';
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          icon: string | null;
          description: string | null;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          compare_at_price: number | null;
          stock: number;
          category_id: number;
          images: string[];
          brand: string | null;
          rating: number;
          review_count: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: number;
          order_number: string;
          user_id: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          address_id: number | null;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          payment_method: 'mtn_momo' | 'airtel_money' | 'card' | 'cod' | null;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          subtotal: number;
          delivery_fee: number;
          discount: number;
          total: number;
          promo_code: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          delivered_at: string | null;
        };
      };
      cart_items: {
        Row: {
          id: number;
          user_id: string;
          product_id: number;
          variant_id: number | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
      };
      reviews: {
        Row: {
          id: number;
          product_id: number;
          user_id: string;
          order_id: number | null;
          rating: number;
          title: string | null;
          comment: string | null;
          is_verified_purchase: boolean;
          helpful_count: number;
          created_at: string;
        };
      };
      wishlists: {
        Row: {
          id: number;
          user_id: string;
          product_id: number;
          created_at: string;
        };
      };
      addresses: {
        Row: {
          id: number;
          user_id: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          sector: string | null;
          is_default: boolean;
          created_at: string;
        };
      };
    };
  };
};

// Profile helper functions
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: { full_name?: string; phone?: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Address helper functions
export async function getUserAddresses(userId: string) {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addAddress(userId: string, address: any) {
  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...address, user_id: userId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
