import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();
    
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (error || !promo) {
      return NextResponse.json({ valid: false, error: 'Invalid promo code' });
    }
    
    // Check if expired
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Promo code has expired' });
    }
    
    // Check if started
    if (promo.starts_at && new Date(promo.starts_at) > new Date()) {
      return NextResponse.json({ valid: false, error: 'Promo code not yet active' });
    }
    
    // Check minimum order
    if (promo.minimum_order > 0 && subtotal < promo.minimum_order) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum order of RWF ${promo.minimum_order.toLocaleString()} required` 
      });
    }
    
    // Check usage limit
    if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
      return NextResponse.json({ valid: false, error: 'Promo code usage limit reached' });
    }
    
    // Calculate discount
    let discountAmount = 0;
    let newSubtotal = subtotal;
    
    if (promo.discount_type === 'percentage') {
      discountAmount = (subtotal * promo.discount_value) / 100;
      newSubtotal = subtotal - discountAmount;
    } else if (promo.discount_type === 'fixed') {
      discountAmount = Math.min(promo.discount_value, subtotal);
      newSubtotal = subtotal - discountAmount;
    }
    // free_shipping handled separately
    
    return NextResponse.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discountAmount,
        new_subtotal: newSubtotal,
      },
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
