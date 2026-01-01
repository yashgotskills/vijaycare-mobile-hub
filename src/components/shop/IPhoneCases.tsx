import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const iphoneCases = [
  {
    id: 1,
    name: "iPhone 15 Pro Max Clear Case",
    price: 999,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&q=80",
    discount: "33% OFF",
  },
  {
    id: 2,
    name: "iPhone 15 Pro Leather Case",
    price: 1299,
    originalPrice: 1999,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&q=80",
    discount: "35% OFF",
  },
  {
    id: 3,
    name: "iPhone 14 Silicone Case",
    price: 799,
    originalPrice: 1199,
    image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=400&q=80",
    discount: "33% OFF",
  },
  {
    id: 4,
    name: "iPhone 15 MagSafe Case",
    price: 1499,
    originalPrice: 2299,
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80",
    discount: "35% OFF",
  },
  {
    id: 5,
    name: "iPhone 14 Pro Armor Case",
    price: 899,
    originalPrice: 1399,
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&q=80",
    discount: "36% OFF",
  },
  {
    id: 6,
    name: "iPhone 13 Slim Case",
    price: 599,
    originalPrice: 999,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    discount: "40% OFF",
  },
];

const IPhoneCases = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (product: typeof iphoneCases[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: "iPhone Cases",
    });
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
              iPhone Cases
            </h2>
            <p className="text-muted-foreground mt-1">
              Premium protection for your iPhone
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {iphoneCases.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
                  {product.discount}
                </span>
                <button className="absolute top-2 right-2 bg-background/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                  <Heart className="h-4 w-4 text-foreground" />
                </button>
              </div>

              <div className="p-3">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg font-bold text-foreground">
                    ₹{product.price}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.originalPrice}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Button variant="outline">View All iPhone Cases</Button>
        </div>
      </div>
    </section>
  );
};

export default IPhoneCases;
