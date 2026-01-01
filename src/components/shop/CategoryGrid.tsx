import { motion } from "framer-motion";
import { useCategories } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Smartphone, Shield, Zap, Headphones, Battery, Package 
} from "lucide-react";

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

  if (isLoading) {
    return (
      <section className="py-8">
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
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold font-display text-foreground mb-6">
          Shop by Category
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories?.map((category, index) => {
            const IconComponent = iconMap[category.icon || "Package"] || Package;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="group flex flex-col items-center gap-2 p-4 bg-card border border-border/50 rounded-xl hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground text-center">
                  {category.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
