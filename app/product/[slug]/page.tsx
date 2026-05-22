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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-blue-600">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImage(idx)} className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.brand}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-500">{'★'.repeat(4)}{'☆'.repeat(1)}</div>
                <span className="text-sm text-gray-600">({product.review_count || 0} reviews)</span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold text-blue-600">RWF {selectedPrice.toLocaleString()}</span>
              </div>

              {Object.keys(variantGroups).length > 0 && (
                <div className="mb-6 space-y-4">
                  {Object.entries(variantGroups).map(([attrName, attrVariants]) => (
                    <div key={attrName}>
                      <label className="block text-sm font-medium mb-2 capitalize">Select {attrName}:</label>
                      <div className="flex flex-wrap gap-3">
                        {attrVariants.map((variant) => (
                          <button key={variant.id} onClick={() => handleVariantSelect(attrName, variant)} className={`px-4 py-2 border rounded-lg capitalize transition ${selectedVariants[attrName] === variant.attribute_value ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-300 hover:border-blue-400'}`}>
                            {variant.attribute_value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-4">
                {selectedStock > 0 ? (
                  <div className="text-green-600 font-medium">✓ In Stock ({selectedStock} units)</div>
                ) : (
                  <div className="text-red-600 font-medium">✗ Out of Stock</div>
                )}
              </div>

              {selectedStock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Quantity:</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border rounded-lg hover:bg-gray-100 flex items-center justify-center">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(selectedStock, quantity + 1))} className="w-10 h-10 border rounded-lg hover:bg-gray-100 flex items-center justify-center">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mb-6">
                <button onClick={addToCart} disabled={selectedStock === 0} className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50">
                  <ShoppingCart className="inline h-5 w-5 mr-2" />
                  Add to Cart
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-100">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="p-3 border rounded-lg hover:bg-gray-100">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span>Free delivery in Kigali within 24-48 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>1-year warranty on all products</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw className="h-4 w-4" />
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
