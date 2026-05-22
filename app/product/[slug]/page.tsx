'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus } from 'lucide-react';
import ProductReviews from '@/components/product/ProductReviews';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  brand: string;
  rating: number;
  review_count: number;
  category_id: number;
  category?: { name: string; slug: string };
}

interface Variant {
  id: number;
  product_id: number;
  attribute_name: string;
  attribute_value: string;
  price_adjustment: number;
  stock: number;
  sku: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedStock, setSelectedStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      const slug = params.slug as string;
      
      const { data: productData } = await supabase
        .from('products')
        .select(`*, categories!inner (name, slug)`)
        .eq('slug', slug)
        .single();

      if (!productData) {
        router.push('/products');
        return;
      }

      setProduct(productData);
      setSelectedPrice(productData.price);
      setSelectedStock(productData.stock);

      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productData.id);

      if (variantsData && variantsData.length > 0) {
        setVariants(variantsData);
      }

      setLoading(false);
    }

    fetchProduct();
  }, [params.slug, router]);

  const variantGroups = variants.reduce((groups, variant) => {
    if (!groups[variant.attribute_name]) {
      groups[variant.attribute_name] = [];
    }
    groups[variant.attribute_name].push(variant);
    return groups;
  }, {} as Record<string, Variant[]>);

  const handleVariantSelect = (attributeName: string, variant: Variant) => {
    setSelectedVariants(prev => ({
      ...prev,
      [attributeName]: variant.attribute_value
    }));
    setSelectedPrice(product!.price + variant.price_adjustment);
    setSelectedStock(variant.stock);
  };

  const addToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    alert(`Added ${quantity} x ${product?.name} to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : ['/placeholder.jpg'];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm">
          <ol className="flex items-center gap-1.5 text-slate-500">
            <li><Link href="/" className="hover:text-blue-600 font-medium transition-colors">Home</Link></li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li><Link href="/products" className="hover:text-blue-600 font-medium transition-colors">Products</Link></li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li className="text-slate-800 font-semibold truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>

        {/* Product Main Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6 lg:p-8">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-100">
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Product images">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      role="tab"
                      aria-selected={selectedImage === idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${selectedImage === idx ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-400'}`}
                    >
                      <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">{product.name}</h1>
              <p className="text-slate-500 font-medium mb-4">{product.brand}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-500 text-lg" aria-label={`Rating: ${product.rating || 4} out of 5`}>
                  {'★'.repeat(Math.floor(product.rating || 4))}
                  {'☆'.repeat(5 - Math.floor(product.rating || 4))}
                </div>
                <span className="text-sm text-slate-600 font-medium">({product.review_count || 0} reviews)</span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-slate-600 text-sm leading-relaxed mb-5 border-b border-slate-100 pb-5">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="mb-5 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-blue-600">RWF {selectedPrice.toLocaleString()}</span>
                {product.compare_at_price && (
                  <span className="text-slate-400 line-through text-lg">RWF {product.compare_at_price.toLocaleString()}</span>
                )}
              </div>

              {/* Variants */}
              {Object.keys(variantGroups).length > 0 && (
                <div className="mb-6 space-y-4">
                  {Object.entries(variantGroups).map(([attrName, attrVariants]) => (
                    <div key={attrName}>
                      <label className="block text-sm font-semibold text-slate-800 mb-2 capitalize">
                        Select {attrName}:
                      </label>
                      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={`Choose ${attrName}`}>
                        {attrVariants.map((variant) => (
                          <button
                            key={variant.id}
                            role="radio"
                            aria-checked={selectedVariants[attrName] === variant.attribute_value}
                            onClick={() => handleVariantSelect(attrName, variant)}
                            className={`px-4 py-2 border-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${selectedVariants[attrName] === variant.attribute_value ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600'}`}
                          >
                            {variant.attribute_value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-4">
                {selectedStock > 0 ? (
                  <div className="text-green-700 font-semibold text-sm flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                    In Stock ({selectedStock} units available)
                  </div>
                ) : (
                  <div className="text-red-600 font-semibold text-sm flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Quantity */}
              {selectedStock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Quantity:</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Decrease quantity"
                      className="w-10 h-10 border-2 border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-slate-900 text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedStock, quantity + 1))}
                      aria-label="Increase quantity"
                      className="w-10 h-10 border-2 border-slate-200 rounded-xl hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center text-slate-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={addToCart}
                  disabled={selectedStock === 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                  Add to Cart
                </button>
                <button
                  aria-label="Add to wishlist"
                  className="p-3.5 border-2 border-slate-200 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-500 text-slate-500 transition-all duration-200"
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  aria-label="Share product"
                  className="p-3.5 border-2 border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 text-slate-500 transition-all duration-200"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* WhatsApp Order */}
              <a
                href={`https://wa.me/250790663921?text=Hi!%20I'd%20like%20to%20order:%20${encodeURIComponent(product.name)}%20(RWF%20${selectedPrice.toLocaleString()})`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300 mb-6 text-sm"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white flex-shrink-0" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Order via WhatsApp
              </a>

              {/* Shipping Info */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Truck className="h-4 w-4 text-blue-500 flex-shrink-0" aria-hidden="true" />
                  <span>Free delivery in Kigali within 24–48 hours</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <Shield className="h-4 w-4 text-indigo-500 flex-shrink-0" aria-hidden="true" />
                  <span>1-year warranty on all products</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-700">
                  <RotateCcw className="h-4 w-4 text-orange-500 flex-shrink-0" aria-hidden="true" />
                  <span>14-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product && (
          <div className="mt-8">
            <ProductReviews productId={product.id} productName={product.name} />
          </div>
        )}
      </div>
    </div>
  );
}
