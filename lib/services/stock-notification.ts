// Stock notification service
// This can be expanded to send email/SMS alerts

export interface StockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  threshold: number;
}

export async function checkLowStockAndNotify() {
  const { supabase } = await import('@/lib/supabase');
  const threshold = parseInt(localStorage.getItem('stockThreshold') || '10');
  
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, stock')
    .lt('stock', threshold);
  
  if (lowStockProducts && lowStockProducts.length > 0) {
    // In production, this could send an email or SMS
    console.log(`⚠️ Low Stock Alert: ${lowStockProducts.length} products need attention`);
    
    // Could also store in a notifications table
    const { error } = await supabase
      .from('notifications')
      .insert({
        type: 'low_stock',
        message: `${lowStockProducts.length} products are running low on stock`,
        data: lowStockProducts,
        created_at: new Date().toISOString(),
        is_read: false,
      });
    
    if (error) {
      console.error('Failed to save notification:', error);
    }
  }
  
  return lowStockProducts;
}

// Run check every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    checkLowStockAndNotify();
  }, 60 * 60 * 1000); // Every hour
}
