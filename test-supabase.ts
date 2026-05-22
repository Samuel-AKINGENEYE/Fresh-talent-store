import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Key:', supabaseAnonKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('\n📊 Fetching categories...');
  
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log(`✅ Connected successfully! Found ${data?.length || 0} categories:`);
  data?.forEach((cat: any) => {
    console.log(`   - ${cat.icon || '📁'} ${cat.name} (${cat.slug})`);
  });
  
  // Test products as well
  console.log('\n📦 Fetching products...');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .limit(3);
  
  if (productsError) {
    console.error('❌ Products error:', productsError.message);
  } else {
    console.log(`✅ Found ${products?.length || 0} products:`);
    products?.forEach((product: any) => {
      console.log(`   - ${product.name} (RWF ${product.price.toLocaleString()})`);
    });
  }
}

test();
