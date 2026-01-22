import { motion, useReducedMotion } from "framer-motion";
import { useCategories } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Smartphone, Shield, Zap, Headphones, Battery, Package 
} from "lucide-react";
import Magnetic from "@/components/motion/Magnetic";

const iconMap: Record<string, React.ElementType> = {
  Smartphone: Smartphone,
  Shield: Shield,
  Zap: Zap,
  Headphones: Headphones,
  Battery: Battery,
  Package: Package,
};

const CategoryGrid = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  const reduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 md:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <h2 className="text-xl md:text-2xl font-bold font-display text-foreground tracking-tight">
            Shop by Category
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quick picks to start your search.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories?.map((category, index) => {
            const IconComponent = iconMap[category.icon || "Package"] || Package;
            return (
              <motion.div
                key={category.id}
                initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(8px)" }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-80px" }}
                transition={reduceMotion ? undefined : { delay: index * 0.03, duration: 0.55, ease: "easeOut" }}
              >
                <Magnetic strength={12}>
                  <div
                    onClick={() => navigate(`/category/${category.slug}`)}
                    className="group flex flex-col items-center gap-2 p-4 bg-card/70 backdrop-blur-md border border-border/60 rounded-2xl hover:shadow-card hover:border-primary/25 transition-all cursor-pointer"
                  >
                    <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/15 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground text-center">
                      {category.name}
                    </span>
                  </div>
                </Magnetic>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
