'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { SlidersHorizontal, Grid3x3, List, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  rating: number;
  review_count: number;
  stock: number;
  category_id: number;
  brand: string;
  category?: { name: string; slug: string };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000000 });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique brands from products
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      setCategories(categoriesData || []);

      // Fetch products with category info
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner (name, slug)
        `)
        .eq('is_active', true);
      
      if (productsData) {
        setProducts(productsData);
        // Set max price for filter
        const maxPrice = Math.max(...productsData.map(p => p.price), 2000000);
        setPriceRange(prev => ({ ...prev, max: maxPrice }));
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    // Apply price filter
    filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    // Apply rating filter
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange, selectedBrands, minRating, sortBy, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange({ min: 0, max: 2000000 });
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy('newest');
    setSearchQuery('');
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shop Electronics</h1>
          <p className="text-gray-600">Discover the best deals on premium electronics</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products by name or brand..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Sort Dropdown */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {(selectedCategory || selectedBrands.length > 0 || minRating > 0) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">!</span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex gap-2 border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Filter */}
              <div>
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => setSelectedCategory(null)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 className="font-medium mb-2">Price Range (RWF)</h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min={0}
                    max={2000000}
                    step={50000}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm">
                    <span>0 RWF</span>
                    <span>Up to {priceRange.max.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Brands</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="text-blue-600 rounded"
                        />
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Filter */}
              <div>
                <h4 className="font-medium mb-2">Minimum Rating</h4>
                <div className="flex gap-2">
                  {[4, 3, 2, 1].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      className={`px-3 py-1 rounded text-sm ${
                        minRating === rating
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {rating}+ ★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {(selectedCategory || selectedBrands.length > 0 || minRating > 0 || searchQuery) && (
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700">
              Clear all filters
            </button>
          )}
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 hover:text-blue-700">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) {
  const discount = product.compare_at_price 
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <Link href={`/product/${product.slug}`}>
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-48 h-48 bg-gray-100 flex-shrink-0">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">📱</div>
            )}
            {discount > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discount}%
              </div>
            )}
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.category?.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm font-medium">{product.rating || 4.5}</span>
                <span className="text-xs text-gray-400">({product.review_count || 0} reviews)</span>
              </div>
            </div>
            <div className="mt-auto pt-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  RWF {product.price.toLocaleString()}
                </span>
                {product.compare_at_price && (
                  <span className="text-sm text-gray-400 line-through">
                    RWF {product.compare_at_price.toLocaleString()}
                  </span>
                )}
              </div>
              <button className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer">
        <div className="relative aspect-square bg-gray-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">📱</div>
          )}
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-1">{product.category?.name}</p>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-medium">{product.rating || 4.5}</span>
            <span className="text-xs text-gray-400">({product.review_count || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">
              RWF {product.price.toLocaleString()}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-gray-400 line-through">
                {product.compare_at_price.toLocaleString()}
              </span>
            )}
          </div>
          <button className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium">
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
