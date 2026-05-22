'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Suggestion {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: { name: string }[] | null;
}

export function SearchBar({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, price, images, category:categories(name)')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(6);

      setSuggestions(data ?? []);
      setOpen(true);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  };

  const handleSuggestionClick = () => {
    setOpen(false);
    setQuery('');
  };

  const showDropdown = open && query.length >= 2;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search products..."
          className="w-full rounded-full border border-gray-300 pl-9 pr-9 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {loading && (
            <div className="p-4 text-center text-sm text-gray-500">Searching…</div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No products found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <>
              <ul>
                {suggestions.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/product/${s.slug}`}
                      onClick={handleSuggestionClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                        {s.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.images[0]}
                            alt={s.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-lg">📦</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                        <p className="text-xs text-gray-500">
                          {(Array.isArray(s.category) ? (s.category as { name: string }[])[0]?.name : (s.category as { name: string } | null)?.name) ?? ''} · RWF {s.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t px-4 py-2 bg-gray-50">
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  See all results for &ldquo;{query}&rdquo; →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
