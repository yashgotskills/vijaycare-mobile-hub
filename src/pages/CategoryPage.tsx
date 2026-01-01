import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/shop/ProductGrid";
import { useProducts, useCategories, useBrands } from "@/hooks/useProducts";

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: products, isLoading } = useProducts({ limit: 50 });

  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  const currentCategory = categories?.find((c) => c.slug === slug);

  // Filter products
  let filteredProducts = products || [];
  
  if (currentCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category_id === currentCategory.id
    );
  }

  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter(
      (p) => p.brand_id && selectedBrands.includes(p.brand_id)
    );
  }

  filteredProducts = filteredProducts.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  // Sort products
  filteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating_average - a.rating_average;
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedBrands([]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={0}
          max={10000}
          step={100}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Brands</h3>
        <div className="space-y-2">
          {brands?.map((brand) => (
            <label
              key={brand.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => toggleBrand(brand.id)}
              />
              <span className="text-sm text-foreground">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate("/shop")} className="hover:text-primary">
            Home
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">
            {currentCategory?.name || "All Products"}
          </span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              {currentCategory?.name || "All Products"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {filteredProducts.length} products
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000) && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {selectedBrands.map((brandId) => {
              const brand = brands?.find((b) => b.id === brandId);
              return (
                <Button
                  key={brandId}
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleBrand(brandId)}
                >
                  {brand?.name}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              );
            })}
            {(priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPriceRange([0, 10000])}
              >
                ₹{priceRange[0]} - ₹{priceRange[1]}
                <X className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 bg-card border border-border/50 rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-4">Filters</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              columns={4}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
