import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface RecentProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
}

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    const userPhone = localStorage.getItem("vijaycare_user");
    if (!userPhone) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("recently_viewed")
        .select(`
          product_id,
          viewed_at,
          products:product_id (
            id,
            name,
            slug,
            price,
            images
          )
        `)
        .eq("user_phone", userPhone)
        .order("viewed_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const recentProducts = data
        ?.filter(item => item.products)
        .map(item => ({
          id: (item.products as any).id,
          name: (item.products as any).name,
          slug: (item.products as any).slug,
          price: (item.products as any).price,
          images: (item.products as any).images || []
        })) || [];

      setProducts(recentProducts);
    } catch (error) {
      console.error("Error fetching recently viewed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-heading font-bold text-foreground">
            Recently Viewed
          </h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex-shrink-0 w-36"
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-border/50"
                onClick={() => navigate(`/product/${product.slug}`)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                    <img
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2 mb-1">
                    {product.name}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    ₹{product.price.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
