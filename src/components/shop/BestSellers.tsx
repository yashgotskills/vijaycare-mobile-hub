import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "./ProductGrid";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Magnetic from "@/components/motion/Magnetic";

const BestSellers = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts({ bestseller: true, limit: 6 });
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <motion.div
            className="flex items-center gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduceMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
          >
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                Best Sellers
              </h2>
              <p className="text-muted-foreground mt-1">
                Most loved by our customers
              </p>
            </div>
          </motion.div>
          <Magnetic strength={12}>
            <Button variant="outline" onClick={() => navigate("/categories")}>
              View All
            </Button>
          </Magnetic>
        </div>

        <ProductGrid products={products || []} isLoading={isLoading} columns={6} />
      </div>
    </section>
  );
};

export default BestSellers;
