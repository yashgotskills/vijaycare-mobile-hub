import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "./ProductGrid";
import { useNavigate } from "react-router-dom";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts({ featured: true, limit: 6 });

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              Featured Products
            </h2>
            <p className="text-muted-foreground mt-1">
              Handpicked items just for you
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/categories")}>
            View All
          </Button>
        </div>

        <ProductGrid products={products || []} isLoading={isLoading} columns={6} />
      </div>
    </section>
  );
};

export default FeaturedProducts;
