"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, PackageSearch, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

const PAGE_SIZE = 10;

interface Product {
  id: string | number;
  name: string;
  brand?: string;
  category?: string;
  nutri_score: string;
  energy?: number;
  sugars?: number;
  sodium?: number;
  saturated_fat?: number;
  image_url?: string;
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [page, setPage] = useState(0);

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Debounced search effect for initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setProducts([]);
      setHasMore(true);
      if (query.trim()) {
        fetchProducts(query, 0, true);
      }
    }, 300);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Infinite scroll effect
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore && query.trim()) {
      fetchProducts(query, page + 1, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, hasMore, loading, loadingMore, query, page]);

  const fetchProducts = useCallback(async (searchTerm: string, pageNum: number, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .ilike('name', `%${searchTerm}%`)
        .range(from, to);

      if (error) throw error;

      const fetchedData = (data || []) as Product[];
      
      if (isInitial) {
        setProducts(fetchedData);
      } else {
        setProducts((prev) => [...prev, ...fetchedData]);
      }

      setPage(pageNum);
      
      // Check if we've loaded all available products
      if (count !== null && fetchedData.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (err) {
      console.error("Search error:", err);
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  const getNutriColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-nutri-a';
      case 'B': return 'bg-nutri-b';
      case 'C': return 'bg-nutri-c';
      case 'D': return 'bg-nutri-d';
      case 'E': return 'bg-nutri-e';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] overflow-hidden pb-24">
      {/* Ex-3 Color Splashes (Subtle) */}
      <div className="color-splash top-[-50px] right-[-100px] w-[350px] h-[350px] bg-brand-500 opacity-[0.03]" />
      <div className="color-splash bottom-[100px] left-[-150px] w-[400px] h-[400px] bg-sky-500 opacity-[0.03]" />

      {/* Sleek Minimal Header (Ex-1 style) */}
      <header className="px-6 pt-14 pb-8 z-10 relative">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Explore<span className="text-brand-500 font-medium">Global</span>
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Global Nutrition Database</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
            <TrendingUp size={18} />
          </div>
        </div>
        
        {/* Search Bar Refinement */}
        <div className="relative group">
          {loading ? (
            <Loader2 className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-500 animate-spin" size={18} />
          ) : (
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-500 transition-colors" size={18} />
          )}
          <input 
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-6 bg-white border border-slate-100 focus:border-brand-500/30 rounded-2xl text-slate-800 font-medium placeholder:text-slate-300 shadow-sm focus:ring-4 focus:ring-brand-500/5 transition-all outline-none"
          />
        </div>
      </header>

      {/* Results Section */}
      <main className="px-6 space-y-6 z-10">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-medium text-slate-400">
            {products.length} {query ? "results found" : "curated items"}
          </h2>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {products.length > 0 ? (
              <>
                {products.map((item, index) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      key={`${item.id}-${index}`}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`bg-white rounded-3xl p-3 pr-5 flex flex-col group cursor-pointer hover:border-brand-500/20 shadow-sm border ${isExpanded ? 'border-brand-500/30 ring-4 ring-brand-500/5' : 'border-slate-100'} transition-all`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner group-hover:bg-brand-50 transition-colors relative overflow-hidden">
                            {item.image_url ? (
                              <Image src={item.image_url} alt={item.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
                            ) : (
                              <PackageSearch className="text-slate-200" size={24} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900 leading-tight text-base">{item.name}</h3>
                            <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-brand-500 rounded-full opacity-50" />
                              {item.brand || item.category || "Generic"}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`${getNutriColor(item.nutri_score)} w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                          {item.nutri_score}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 pb-1 px-1">
                              <div className="w-full h-px bg-slate-100 mb-3" />
                              <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Energy</p>
                                  <p className="text-sm font-semibold text-slate-700">{item.energy ?? '-'}<span className="text-[10px] ml-0.5 text-slate-400 font-medium">kcal</span></p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Fat</p>
                                  <p className="text-sm font-semibold text-slate-700">{item.saturated_fat ?? '-'}<span className="text-[10px] ml-0.5 text-slate-400 font-medium">g</span></p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Sugars</p>
                                  <p className="text-sm font-semibold text-slate-700">{item.sugars ?? '-'}<span className="text-[10px] ml-0.5 text-slate-400 font-medium">g</span></p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">Salt</p>
                                  <p className="text-sm font-semibold text-slate-700">{item.sodium ?? '-'}<span className="text-[10px] ml-0.5 text-slate-400 font-medium">g</span></p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
                
                {/* Intersection Observer target component */}
                {hasMore && products.length > 0 && (
                  <div ref={ref} className="py-8 flex justify-center items-center">
                    {loadingMore ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">Loading more...</span>
                      </div>
                    ) : (
                      <div className="h-6 w-px bg-transparent" />
                    )}
                  </div>
                )}
                
                {/* End of list indicator */}
                {!hasMore && products.length > 0 && (
                  <div className="py-8 text-center">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">End of results</p>
                  </div>
                )}
              </>
            ) : !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                  <PackageSearch className="text-slate-200" size={32} />
                </div>
                <p className="text-slate-400 font-medium text-sm">
                  {query ? "No products found." : "Start typing to search the global database..."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
