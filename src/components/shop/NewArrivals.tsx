import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "./ProductGrid";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Magnetic from "@/components/motion/Magnetic";

const NewArrivals = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts({ isNew: true, limit: 6 });
  const reduceMotion = useReducedMotion();

  if (!products?.length && !isLoading) return null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <motion.div
            className="flex items-center gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={reduceMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
          >
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                New Arrivals
              </h2>
              <p className="text-muted-foreground mt-1">
                Fresh additions to our collection
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

export default NewArrivals;
