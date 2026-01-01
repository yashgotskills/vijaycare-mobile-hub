import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronRight, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const allProducts = [
  { id: 1, name: "iPhone 15 Pro Max Case", category: "Cases" },
  { id: 2, name: "iPhone 15 Pro Case", category: "Cases" },
  { id: 3, name: "iPhone 14 Case", category: "Cases" },
  { id: 4, name: "Samsung Galaxy S24 Case", category: "Cases" },
  { id: 5, name: "OnePlus 12 Case", category: "Cases" },
  { id: 6, name: "AirPods Pro 2", category: "Audio" },
  { id: 7, name: "Samsung Earbuds", category: "Audio" },
  { id: 8, name: "Fast Charger 65W", category: "Chargers" },
  { id: 9, name: "Wireless Charger Pad", category: "Chargers" },
  { id: 10, name: "USB-C Cable 2m", category: "Cables" },
  { id: 11, name: "Lightning Cable", category: "Cables" },
  { id: 12, name: "Screen Protector iPhone 15", category: "Protection" },
  { id: 13, name: "Tempered Glass Samsung", category: "Protection" },
  { id: 14, name: "Phone Stand Holder", category: "Accessories" },
  { id: 15, name: "Car Phone Mount", category: "Accessories" },
  { id: 16, name: "Power Bank 20000mAh", category: "Power" },
  { id: 17, name: "MagSafe Battery Pack", category: "Power" },
  { id: 18, name: "Projector Mini", category: "Electronics" },
  { id: 19, name: "Bluetooth Speaker", category: "Audio" },
  { id: 20, name: "Smartwatch Band", category: "Wearables" },
];

const brands = [
  { name: "Apple", products: 245, series: ["iPhone 16", "iPhone 15", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone SE"] },
  { name: "Samsung", products: 312, series: ["Galaxy S24", "Galaxy S23", "Galaxy A54", "Galaxy Z Fold", "Galaxy Z Flip"] },
  { name: "OnePlus", products: 89, series: ["OnePlus 12", "OnePlus 11", "OnePlus Nord", "OnePlus Open"] },
  { name: "Xiaomi", products: 156, series: ["Xiaomi 14", "Xiaomi 13", "Redmi Note 13", "Redmi 13", "POCO F6"] },
  { name: "Oppo", products: 78, series: ["Find X7", "Reno 11", "Reno 10", "A Series"] },
  { name: "Vivo", products: 92, series: ["X100", "V30", "Y Series", "T Series"] },
  { name: "Realme", products: 67, series: ["GT 5", "12 Pro", "Narzo 70", "C Series"] },
  { name: "Google", products: 45, series: ["Pixel 8", "Pixel 7", "Pixel Fold"] },
  { name: "Nothing", products: 34, series: ["Phone 2a", "Phone 2", "Phone 1"] },
  { name: "Motorola", products: 56, series: ["Edge 50", "Razr 40", "G Series"] },
];

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<typeof allProducts>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<typeof brands[0] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowBrandPanel(false);
    } else {
      setSuggestions([]);
    }
  }, [query]);

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
    if (query.length === 0) {
      setShowBrandPanel(true);
    }
  };

  const handleBrandClick = (brand: typeof brands[0]) => {
    setSelectedBrand(brand);
  };

  const handleSeriesClick = (series: string) => {
    setQuery(`${selectedBrand?.name} ${series}`);
    setIsOpen(false);
    setShowBrandPanel(false);
    setSelectedBrand(null);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for products, brands and more..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          className="w-full h-12 pl-12 pr-12 rounded-full bg-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setShowBrandPanel(true);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {/* Product suggestions when typing */}
            {query.length > 0 && suggestions.length > 0 && (
              <div>
                {suggestions.map((product, index) => (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setQuery(product.name);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left"
                  >
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Brand panel when search is empty */}
            {showBrandPanel && query.length === 0 && (
              <div className="flex min-h-[400px]">
                {/* Brands list */}
                <div className="w-1/2 border-r border-border/30">
                  <div className="px-4 py-3 bg-muted/50 border-b border-border/30">
                    <h3 className="font-semibold text-foreground text-sm">Shop by Brand</h3>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {brands.map((brand, index) => (
                      <motion.button
                        key={brand.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleBrandClick(brand)}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left ${
                          selectedBrand?.name === brand.name ? "bg-accent/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-foreground font-medium">{brand.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {brand.products} products
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Series list */}
                <div className="w-1/2">
                  <div className="px-4 py-3 bg-muted/50 border-b border-border/30">
                    <h3 className="font-semibold text-foreground text-sm">
                      {selectedBrand ? `${selectedBrand.name} Models` : "Select a brand"}
                    </h3>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto">
                    {selectedBrand ? (
                      selectedBrand.series.map((series, index) => (
                        <motion.button
                          key={series}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleSeriesClick(series)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left"
                        >
                          <span className="text-foreground">{series}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {Math.floor(Math.random() * 50) + 10} items
                          </span>
                        </motion.button>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        <p className="text-sm">← Select a brand to view models</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No results */}
            {query.length > 0 && suggestions.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p>No products found for "{query}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
