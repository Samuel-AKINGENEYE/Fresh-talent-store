#!/bin/bash

echo "========================================="
echo "🗄️ Configuring Supabase Database Schema"
echo "========================================="
echo ""

read -p "Enter your Supabase Project URL: " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY

# Save to .env.local
cat > .env.local << ENV
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Cloudinary (will add later)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Flutterwave (will add later)
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
ENV

echo "✅ Environment variables saved to .env.local"

echo ""
echo "📊 Now run these SQL commands in Supabase SQL Editor:"
echo "========================================="
echo ""

cat << 'SQL'
-- ============================================
-- FRESH TALENT STORE - DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. ENUM TYPES
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_method AS ENUM ('mtn_momo', 'airtel_money', 'card', 'cod');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- 2. USERS TABLE (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price INTEGER NOT NULL, -- in RWF (no decimals)
    compare_at_price INTEGER, -- original price for sales
    stock INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES public.categories(id),
    images TEXT[], -- array of Cloudinary URLs
    brand TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS (for color, storage, etc.)
CREATE TABLE public.product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL, -- 'color', 'storage', 'ram'
    attribute_value TEXT NOT NULL, -- 'black', '128GB', '8GB'
    price_adjustment INTEGER DEFAULT 0, -- additional price if any
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE
);

-- 6. ADDRESSES TABLE
CREATE TABLE public.addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    sector TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS TABLE
CREATE TABLE public.orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    guest_email TEXT,
    guest_phone TEXT,
    address_id INTEGER REFERENCES public.addresses(id),
    status order_status DEFAULT 'pending',
    payment_method payment_method,
    payment_status payment_status DEFAULT 'pending',
    subtotal INTEGER NOT NULL,
    delivery_fee INTEGER DEFAULT 0,
    discount INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    promo_code TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- 8. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id),
    variant_id INTEGER REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL, -- price at time of purchase
    product_name TEXT NOT NULL,
    product_image TEXT
);

-- 9. CART TABLE (for logged-in users)
CREATE TABLE public.cart_items (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id),
    variant_id INTEGER REFERENCES public.product_variants(id),
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REVIEWS TABLE
CREATE TABLE public.reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    order_id INTEGER REFERENCES public.orders(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. WISHLIST TABLE
CREATE TABLE public.wishlists (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 12. PROMO CODES TABLE
CREATE TABLE public.promo_codes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value INTEGER, -- percentage or fixed amount in RWF
    minimum_order INTEGER DEFAULT 0,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FLASH SALES TABLE
CREATE TABLE public.flash_sales (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    discount_percentage INTEGER NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. FLASH SALE PRODUCTS
CREATE TABLE public.flash_sale_products (
    id SERIAL PRIMARY KEY,
    flash_sale_id INTEGER REFERENCES public.flash_sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    sale_price INTEGER NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Products: Everyone can read, only admin can modify
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

-- Orders: Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Cart: Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON public.cart_items
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT SAMPLE CATEGORIES
-- ============================================

INSERT INTO public.categories (name, slug, icon) VALUES
('Smartphones', 'smartphones', '📱'),
('Laptops', 'laptops', '💻'),
('Audio', 'audio', '🎧'),
('Accessories', 'accessories', '🔌'),
('Wearables', 'wearables', '⌚'),
('Gaming', 'gaming', '🎮'),
('TV & Home', 'tv-home', '📺'),
('Cameras', 'cameras', '📷');

-- ============================================
-- INSERT SAMPLE PRODUCT (for testing)
-- ============================================

INSERT INTO public.products (name, slug, description, price, stock, category_id, brand, is_featured) VALUES
('iPhone 15 Pro', 'iphone-15-pro', 'Latest iPhone with A17 Pro chip', 1250000, 10, 1, 'Apple', true),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'AI-powered smartphone', 950000, 15, 1, 'Samsung', true),
('MacBook Air M3', 'macbook-air-m3', 'Lightning fast laptop', 1850000, 5, 2, 'Apple', true);

SQL

echo ""
echo "✅ SQL script ready!"
echo ""
echo "========================================="
echo "📝 Next Steps:"
echo "========================================="
echo "1. Copy the SQL above"
echo "2. Go to Supabase Dashboard → SQL Editor"
echo "3. Paste and run the SQL"
echo "4. Verify tables are created"
echo "5. Run: npm install @supabase/supabase-js"
echo "6. Create lib/supabase.ts (next step)"
echo ""

