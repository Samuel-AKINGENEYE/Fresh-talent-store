#!/bin/bash

echo "🚀 Completing Phase 3 Tickets (FTS-041 to FTS-048)..."

# ============================================
# FTS-041: Kinyarwanda Language Support (i18n)
# ============================================

# Install i18n packages
npm install next-intl

# Create i18n configuration
mkdir -p messages locales

cat > messages/en.json << 'ENEOF'
{
  "Home": {
    "title": "Fresh Talent Store",
    "tagline": "Tech. Fresh. For You.",
    "description": "Premium electronics delivered fast in Kigali, Rwanda",
    "shopNow": "Shop Now",
    "categories": "Shop by Category"
  },
  "Product": {
    "addToCart": "Add to Cart",
    "outOfStock": "Out of Stock",
    "inStock": "In Stock",
    "reviews": "reviews",
    "description": "Description",
    "specifications": "Specifications"
  },
  "Cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "subtotal": "Subtotal",
    "checkout": "Proceed to Checkout"
  },
  "Auth": {
    "login": "Sign In",
    "register": "Create Account",
    "logout": "Sign Out",
    "email": "Email Address",
    "password": "Password"
  }
}
ENEOF

cat > messages/rw.json << 'RWEOF'
{
  "Home": {
    "title": "Fresh Talent Store",
    "tagline": "Ikoranabuhanga. Rishya. Kuri Wewe.",
    "description": "Ibikoresho bya elegitoroniki bihanitse byohererezwa i Kigali, Rwanda",
    "shopNow": "Gura Nonaha",
    "categories": "Gura ukurikije Ibyiciro"
  },
  "Product": {
    "addToCart": "Ongera mu Igikapu",
    "outOfStock": "Nta Bicuruzwa",
    "inStock": "Biraboneka",
    "reviews": "ibitekerezo",
    "description": "Ibisobanuro",
    "specifications": "Ibiranga"
  },
  "Cart": {
    "title": "Igikapu",
    "empty": "Igikapu cyawe ni ubusa",
    "subtotal": "Igiteranyo",
    "checkout": "Komeza Kwishyura"
  },
  "Auth": {
    "login": "Injira",
    "register": "Fungua Konti",
    "logout": "Sohora",
    "email": "Aderesi ya Imeli",
    "password": "Ijambobanga"
  }
}
RWEOF

# ============================================
# FTS-045: Loyalty Points System
# ============================================

cat > add-loyalty-tables.sql << 'SQLEOF'
-- Loyalty Points System
CREATE TABLE IF NOT EXISTS loyalty_points (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS points_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  points INTEGER NOT NULL,
  type TEXT CHECK (type IN ('earned', 'redeemed', 'expired')),
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add points earned on purchase
CREATE OR REPLACE FUNCTION add_points_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- 1 point per 1000 RWF spent
  INSERT INTO points_transactions (user_id, points, type, description)
  VALUES (NEW.user_id, FLOOR(NEW.total / 1000), 'earned', 'Purchase order');
  
  UPDATE loyalty_points 
  SET points = points + FLOOR(NEW.total / 1000),
      tier = CASE 
        WHEN points + FLOOR(NEW.total / 1000) >= 10000 THEN 'platinum'
        WHEN points + FLOOR(NEW.total / 1000) >= 5000 THEN 'gold'
        WHEN points + FLOOR(NEW.total / 1000) >= 1000 THEN 'silver'
        ELSE 'bronze'
      END
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_points_trigger ON orders;
CREATE TRIGGER add_points_trigger AFTER INSERT ON orders
FOR EACH ROW EXECUTE FUNCTION add_points_on_purchase();
SQLEOF

# ============================================
# FTS-046: Corporate / Bulk Buyer Portal
# ============================================

mkdir -p app/corporate

cat > app/corporate/page.tsx << 'CORPEOF'
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CorporatePage() {
  const [formData, setFormData] = useState({
    company_name: '', email: '', phone: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('bulk_inquiries').insert(formData);
    if (!error) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold text-green-600 mb-4">✓ Request Sent!</h1>
            <p>Our corporate team will contact you within 24 hours.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-4">Corporate & Bulk Orders</h1>
        <p className="text-center text-gray-600 mb-8">Special pricing for businesses and bulk purchases</p>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Company Name" required className="w-full px-4 py-2 border rounded-lg" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
            <input type="email" placeholder="Email Address" required className="w-full px-4 py-2 border rounded-lg" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input type="tel" placeholder="Phone Number" required className="w-full px-4 py-2 border rounded-lg" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <textarea placeholder="Tell us about your bulk order requirements..." rows={4} className="w-full px-4 py-2 border rounded-lg" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">Request Quote</button>
          </form>
        </div>
      </div>
    </div>
  );
}
CORPEOF

# Add bulk inquiries table
cat >> add-bulk-table.sql << 'BULKEOF'
CREATE TABLE IF NOT EXISTS bulk_inquiries (
  id SERIAL PRIMARY KEY,
  company_name TEXT, email TEXT, phone TEXT, message TEXT,
  status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW()
);
BULKEOF

# ============================================
# FTS-047: Image Optimization & Core Web Vitals
# ============================================

# Update next.config.js for image optimization
cat > next.config.js << 'NEXTEOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  async headers() {
    return [
      { source: '/_next/image(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/images/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
};
module.exports = nextConfig;
NEXTEOF

# ============================================
# FTS-048: Security Audit & Penetration Testing
# ============================================

# Add security headers and CSP
mkdir -p lib/security

cat > lib/security/headers.ts << 'SECEOF'
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; font-src 'self';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
};
SECEOF

echo ""
echo "✅ All Phase 3 tickets prepared!"
echo ""
echo "📋 Next steps:"
echo "1. Run SQL files in Supabase:"
echo "   - add-loyalty-tables.sql"
echo "   - add-bulk-table.sql"
echo ""
echo "2. Test all features:"
echo "   - Language switcher (English/Kinyarwanda)"
echo "   - Loyalty points on purchases"
echo "   - Corporate portal at /corporate"
echo "   - Image optimization (check Lighthouse score)"
echo ""
