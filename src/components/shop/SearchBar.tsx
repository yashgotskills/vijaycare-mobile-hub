import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
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

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<typeof allProducts>([]);
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="w-full h-12 pl-12 pr-12 rounded-full bg-background border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden z-50"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
