'use client';

import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Heart, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function WishlistPage() {
  const { items, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const handleAddToCart = async (productId: number) => {
    setAddingToCart(productId);
    await addToCart(productId, null, 1);
    setAddingToCart(null);
  };

  const getShareUrl = () => {
    return window.location.href;
  };

  const shareWishlist = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Wishlist - Fresh Talent Store',
          text: 'Check out my wishlist on Fresh Talent Store!',
          url: url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(url);
      alert('Wishlist link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-gray-600 mt-1">{items.length} saved items</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={shareWishlist}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Heart className="h-4 w-4" />
              Share Wishlist
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
            <Link href="/products">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                <Link href={`/product/${item.product?.slug}`}>
                  <div className="aspect-square bg-gray-100 relative">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                        📦
                      </div>
                    )}
                    {item.product?.compare_at_price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round(((item.product.compare_at_price - item.product.price) / item.product.compare_at_price) * 100)}%
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4">
                  <Link href={`/product/${item.product?.slug}`}>
                    <h3 className="font-semibold text-lg hover:text-blue-600 transition">
                      {item.product?.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">{item.product?.rating || 4.5}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-blue-600">
                      RWF {item.product?.price.toLocaleString()}
                    </span>
                    {item.product?.compare_at_price && (
                      <span className="text-sm text-gray-400 line-through">
                        RWF {item.product.compare_at_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAddToCart(item.product_id)}
                      disabled={addingToCart === item.product_id}
                      className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {addingToCart === item.product_id ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="p-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
