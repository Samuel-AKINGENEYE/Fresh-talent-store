'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { AlertTriangle, Package, TrendingDown, Bell } from 'lucide-react';

interface LowStockProduct {
  id: number;
  name: string;
  slug: string;
  stock: number;
  price: number;
  images: string[];
  threshold: number;
}

export default function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [criticalStockProducts, setCriticalStockProducts] = useState<LowStockProduct[]>([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadLowStockProducts();
    // Load threshold from localStorage
    const savedThreshold = localStorage.getItem('stockThreshold');
    if (savedThreshold) {
      setThreshold(parseInt(savedThreshold));
    }
  }, []);

  const loadLowStockProducts = async () => {
    setLoading(true);
    
    // Get products with stock below threshold
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, stock, price, images')
      .lt('stock', threshold)
      .order('stock', { ascending: true });
    
    if (data) {
      const withThreshold = data.map(p => ({ ...p, threshold }));
      const critical = withThreshold.filter(p => p.stock <= 3);
      const low = withThreshold.filter(p => p.stock > 3 && p.stock <= threshold);
      setCriticalStockProducts(critical);
      setLowStockProducts(low);
    }
    setLoading(false);
  };

  const updateThreshold = (newThreshold: number) => {
    setThreshold(newThreshold);
    localStorage.setItem('stockThreshold', newThreshold.toString());
    loadLowStockProducts();
    setShowSettings(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalLowStock = lowStockProducts.length + criticalStockProducts.length;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
          {totalLowStock > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {totalLowStock}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 border-b">
          <p className="text-sm text-gray-700 mb-2">Alert when stock falls below:</p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-24 px-3 py-1 border rounded-lg"
              min="1"
              max="50"
            />
            <button
              onClick={() => updateThreshold(threshold)}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={() => loadLowStockProducts()}
              className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100"
            >
              Refresh
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Current threshold: {threshold} units</p>
        </div>
      )}

      {/* Critical Stock (≤3) */}
      {criticalStockProducts.length > 0 && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-red-700">Critical Stock (≤3 units)</h3>
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {criticalStockProducts.length}
            </span>
          </div>
          <div className="space-y-2">
            {criticalStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <p className="font-medium hover:text-blue-600">{product.name}</p>
                    </Link>
                    <p className="text-xs text-gray-500">RWF {product.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-bold text-lg">{product.stock} left</p>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <button className="text-xs text-blue-600 hover:text-blue-700">
                      Restock Now →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock */}
      {lowStockProducts.length > 0 && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-yellow-700">Low Stock ({threshold} units or less)</h3>
            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
              {lowStockProducts.length}
            </span>
          </div>
          <div className="space-y-2">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <p className="font-medium hover:text-blue-600">{product.name}</p>
                    </Link>
                    <p className="text-xs text-gray-500">RWF {product.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-600 font-semibold">{product.stock} units remaining</p>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <button className="text-xs text-blue-600 hover:text-blue-700">
                      Update Stock →
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Low Stock */}
      {totalLowStock === 0 && (
        <div className="p-8 text-center">
          <Package className="h-12 w-12 text-green-300 mx-auto mb-3" />
          <p className="text-gray-500">All products have sufficient stock!</p>
          <p className="text-xs text-gray-400 mt-1">Threshold: {threshold} units</p>
        </div>
      )}
    </div>
  );
}
