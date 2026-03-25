import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronRight, Smartphone, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBrands } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";

interface AISearchResult {
  models: { id: string; name: string; slug: string; brand_name: string; brand_slug: string }[];
  products: { id: string; name: string; slug: string; price: number; image: string | null; category: string; brand: string }[];
}

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<{ name: string; slug: string } | null>(null);
  const [aiResults, setAiResults] = useState<AISearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: brands } = useBrands();

  const searchWithAI = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setAiResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { query: searchQuery },
      });
      if (error) throw error;
      setAiResults(data as AISearchResult);
    } catch (err) {
      console.error("AI search error:", err);
      setAiResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      setShowBrandPanel(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => searchWithAI(query), 400);
    } else {
      setAiResults(null);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchWithAI]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowBrandPanel(false);
        setSelectedBrand(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsOpen(true);
    if (query.length === 0) setShowBrandPanel(true);
  };

  const handleBrandClick = (brand: { name: string; slug: string }) => setSelectedBrand(brand);

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleModelClick = (modelSlug: string, brandSlug: string) => {
    navigate(`/category/phone-cases?model=${modelSlug}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleBrandSearch = (brandSlug: string) => {
    navigate(`/search?brand=${brandSlug}`);
    setIsOpen(false);
    setShowBrandPanel(false);
    setSelectedBrand(null);
  };

  const hasModels = aiResults?.models && aiResults.models.length > 0;
  const hasProducts = aiResults?.products && aiResults.products.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search phones, models, accessories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            className="w-full h-12 pl-12 pr-12 rounded-full bg-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
          />
          {query ? (
            <button
              type="button"
              onClick={() => { setQuery(""); setShowBrandPanel(true); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60" />
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            {/* AI-powered results when typing */}
            {query.length > 0 && (
              <>
                {isSearching && !aiResults ? (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                    <span className="text-sm text-muted-foreground">AI searching...</span>
                  </div>
                ) : (
                  <>
                    {/* Device Model Results */}
                    {hasModels && (
                      <div>
                        <div className="px-4 py-2 bg-primary/5 border-b border-border/30 flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Device Models</span>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3">
                          {aiResults!.models.map((model, index) => (
                            <motion.button
                              key={model.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03 }}
                              onClick={() => handleModelClick(model.slug, model.brand_slug)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
                            >
                              <Smartphone className="h-3.5 w-3.5" />
                              {model.name}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Results */}
                    {hasProducts && (
                      <div>
                        {hasModels && (
                          <div className="px-4 py-2 bg-muted/30 border-y border-border/30">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Products</span>
                          </div>
                        )}
                        {aiResults!.products.map((product, index) => (
                          <motion.button
                            key={product.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleProductClick(product.slug)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={product.image || "https://placehold.co/100"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-medium truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.brand} • {product.category}</p>
                            </div>
                            <span className="text-primary font-semibold">₹{product.price.toLocaleString()}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {!hasModels && !hasProducts && !isSearching && (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        <p>No results found for "{query}"</p>
                      </div>
                    )}

                    {(hasModels || hasProducts) && (
                      <button
                        onClick={handleSearch}
                        className="w-full px-4 py-3 text-primary font-medium hover:bg-accent/30 transition-colors border-t border-border/30"
                      >
                        See all results for "{query}"
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            {/* Brand panel when search is empty */}
            {showBrandPanel && query.length === 0 && brands && (
              <div className="flex min-h-[300px]">
                <div className="w-1/2 border-r border-border/30">
                  <div className="px-4 py-3 bg-muted/50 border-b border-border/30">
                    <h3 className="font-semibold text-foreground text-sm">Shop by Brand</h3>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto">
                    {brands.map((brand, index) => (
                      <motion.button
                        key={brand.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleBrandClick({ name: brand.name, slug: brand.slug })}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left ${
                          selectedBrand?.slug === brand.slug ? "bg-accent/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-primary" />
                          <p className="text-foreground font-medium">{brand.name}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="px-4 py-3 bg-muted/50 border-b border-border/30">
                    <h3 className="font-semibold text-foreground text-sm">
                      {selectedBrand ? selectedBrand.name : "Select a brand"}
                    </h3>
                  </div>
                  <div className="p-4">
                    {selectedBrand ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <p className="text-sm text-muted-foreground">Browse all {selectedBrand.name} products</p>
                        <button
                          onClick={() => handleBrandSearch(selectedBrand.slug)}
                          className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          View All {selectedBrand.name}
                        </button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center h-[150px] text-muted-foreground">
                        <p className="text-sm">← Select a brand to browse</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
