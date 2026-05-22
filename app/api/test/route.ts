import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) throw catError;
    
    // Test products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*, categories(name)')
      .limit(5);
    
    if (prodError) throw prodError;
    
    return NextResponse.json({
      success: true,
      categories: categories?.length || 0,
      products: products?.length || 0,
      sample: products?.slice(0, 2)
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
