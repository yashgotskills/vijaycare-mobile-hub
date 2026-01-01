import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/shop/ProductGrid";
import { useProducts, useCategories, useBrands } from "@/hooks/useProducts";

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get("q") || "";
  const brandFilter = searchParams.get("brand") || "";
  
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    brandFilter ? [brandFilter] : []
  );
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      // Text search
      const matchesQuery = !query || 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(query.toLowerCase()) ||
        product.brand?.name?.toLowerCase().includes(query.toLowerCase());

      // Price range
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      // Categories
      const matchesCategory = selectedCategories.length === 0 || 
        (product.category && selectedCategories.includes(product.category.slug));

      // Brands
      const matchesBrand = selectedBrands.length === 0 || 
        (product.brand && selectedBrands.includes(product.brand.slug));

      return matchesQuery && matchesPrice && matchesCategory && matchesBrand;
    });
  }, [products, query, priceRange, selectedCategories, selectedBrands]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "rating":
        return sorted.sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const toggleBrand = (slug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 100000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchParams((params) => {
      params.delete("brand");
      return params;
    });
  };

  const activeFiltersCount = selectedCategories.length + selectedBrands.length + 
    (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-foreground mb-4">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          max={100000}
          step={500}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-4">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox
                  id={`cat-${category.slug}`}
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={() => toggleCategory(category.slug)}
                />
                <label
                  htmlFor={`cat-${category.slug}`}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands && brands.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-4">Brands</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${brand.slug}`}
                  checked={selectedBrands.includes(brand.slug)}
                  onCheckedChange={() => toggleBrand(brand.slug)}
                />
                <label
                  htmlFor={`brand-${brand.slug}`}
                  className="text-sm text-foreground cursor-pointer"
                >
                  {brand.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">
              {query ? `Search results for "${query}"` : brandFilter ? `${brands?.find(b => b.slug === brandFilter)?.name || "Brand"} Products` : "All Products"}
            </h1>
            <p className="text-muted-foreground">
              {sortedProducts.length} products found
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-1">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltersContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map((slug) => {
              const category = categories?.find((c) => c.slug === slug);
              return category ? (
                <Badge key={slug} variant="secondary" className="gap-1">
                  {category.name}
                  <button onClick={() => toggleCategory(slug)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
            {selectedBrands.map((slug) => {
              const brand = brands?.find((b) => b.slug === slug);
              return brand ? (
                <Badge key={slug} variant="secondary" className="gap-1">
                  {brand.name}
                  <button onClick={() => toggleBrand(slug)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
            {(priceRange[0] > 0 || priceRange[1] < 100000) && (
              <Badge variant="secondary" className="gap-1">
                ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                <button onClick={() => setPriceRange([0, 100000])}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </h3>
              <FiltersContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <ProductGrid products={sortedProducts} columns={4} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No products found</h2>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;