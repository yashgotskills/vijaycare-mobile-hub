import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, X, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { useCompare } from "@/contexts/CompareContext";

const ComparePage = () => {
  const navigate = useNavigate();
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  const specKeys = Array.from(
    new Set(compareItems.flatMap(p => Object.keys(p.specifications || {})))
  );

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <ShopHeader />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <GitCompare className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              No products to compare
            </h1>
            <p className="text-muted-foreground mb-6">
              Add products to compare their specs and prices.
            </p>
            <Button onClick={() => navigate("/shop")} size="lg">
              Browse Products
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ShopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                Compare Products ({compareItems.length})
              </h1>
            </div>
            <Button variant="outline" onClick={clearCompare}>
              Clear All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground bg-muted/50 sticky left-0 min-w-[150px]">
                    Product
                  </th>
                  {compareItems.map((product) => (
                    <th key={product.id} className="p-4 text-center min-w-[200px]">
                      <Card className="relative border-border/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => removeFromCompare(product.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <CardContent className="p-4">
                          <div className="aspect-square w-32 mx-auto mb-3 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                            {product.name}
                          </h3>
                        </CardContent>
                      </Card>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-foreground bg-muted/30 sticky left-0">
                    Price
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="space-y-1">
                        <span className="text-lg font-bold text-primary">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <div className="text-sm">
                            <span className="line-through text-muted-foreground">
                              ₹{product.original_price.toLocaleString()}
                            </span>
                            <span className="ml-2 text-green-600">
                              {product.discount_percentage}% off
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-foreground bg-muted/30 sticky left-0">
                    Rating
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{product.rating_average.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">
                          ({product.review_count})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Brand Row */}
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-foreground bg-muted/30 sticky left-0">
                    Brand
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="p-4 text-center text-muted-foreground">
                      {product.brand?.name || "-"}
                    </td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-foreground bg-muted/30 sticky left-0">
                    Category
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="p-4 text-center text-muted-foreground">
                      {product.category?.name || "-"}
                    </td>
                  ))}
                </tr>

                {/* Stock Row */}
                <tr className="border-b border-border/50">
                  <td className="p-4 font-medium text-foreground bg-muted/30 sticky left-0">
                    Availability
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.stock_quantity > 0 ? (
                        <span className="text-green-600 font-medium">In Stock</span>
                      ) : (
                        <span className="text-red-500 font-medium">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Dynamic Specs */}
                {specKeys.map((key) => (
                  <tr key={key} className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground bg-muted/30 sticky left-0 capitalize">
                      {key.replace(/_/g, " ")}
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="p-4 text-center text-muted-foreground">
                        {product.specifications?.[key] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ComparePage;
