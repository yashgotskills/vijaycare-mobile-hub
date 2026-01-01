import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Smartphone, Shield, Zap, Headphones, Battery, Package,
  ChevronRight
} from "lucide-react";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { useCategories } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, React.ElementType> = {
  Smartphone: Smartphone,
  Shield: Shield,
  Zap: Zap,
  Headphones: Headphones,
  Battery: Battery,
  Package: Package,
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();

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
          <span className="text-foreground">All Categories</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-8">
          Shop by Category
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories?.map((category, index) => {
              const IconComponent = iconMap[category.icon || "Package"] || Package;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/category/${category.slug}`)}
                  className="group bg-card border border-border/50 rounded-xl p-6 hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoriesPage;
