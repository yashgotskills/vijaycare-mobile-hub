import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useReducedMotion } from "framer-motion";
import { editorialStagger } from "@/lib/motion";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
}

const ProductGrid = ({ products, isLoading, columns = 6 }: ProductGridProps) => {
  const reduceMotion = useReducedMotion();
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };

  if (isLoading) {
    return (
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {Array.from({ length: columns * 2 }).map((_, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <Skeleton className="aspect-square" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={editorialStagger}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? undefined : "show"}
      className={`grid ${gridCols[columns]} gap-4`}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 18, filter: "blur(8px)" }
          }
          animate={
            reduceMotion
              ? undefined
              : { opacity: 1, y: 0, filter: "blur(0px)" }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  delay: index * 0.03,
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }
          }
        >
          <ProductCard product={product} index={index} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;
