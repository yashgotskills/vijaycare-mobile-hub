import { motion } from "framer-motion";
import { Headphones, Music2, Zap, Battery, Cable, Speaker, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const accessories = [
  {
    id: 1,
    name: "Wireless Earbuds Pro",
    category: "Earbuds",
    price: 1999,
    originalPrice: 3999,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&h=300&fit=crop",
    icon: Music2,
  },
  {
    id: 2,
    name: "Over-Ear Headphones",
    category: "Headphones",
    price: 2499,
    originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    icon: Headphones,
  },
  {
    id: 3,
    name: "65W Fast Charger",
    category: "Chargers",
    price: 899,
    originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&h=300&fit=crop",
    icon: Zap,
  },
  {
    id: 4,
    name: "Power Bank 20000mAh",
    category: "Power Banks",
    price: 1299,
    originalPrice: 2499,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop",
    icon: Battery,
  },
  {
    id: 5,
    name: "USB-C Braided Cable",
    category: "Cables",
    price: 299,
    originalPrice: 599,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    icon: Cable,
  },
  {
    id: 6,
    name: "Bluetooth Speaker",
    category: "Speakers",
    price: 1799,
    originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
    icon: Speaker,
  },
];

const AccessoriesSection = () => {
  const { addToCart } = useCart();

  const handleAddToCart = (item: typeof accessories[0]) => {
    addToCart({
      id: item.id + 100, // Offset to avoid ID conflicts with iPhone cases
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      category: item.category,
    });
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-foreground">
              Accessories
            </h2>
            <p className="text-muted-foreground mt-1">
              Earbuds, Headphones, Chargers & More
            </p>
          </div>
          <button className="text-primary hover:text-primary/80 font-medium transition-colors">
            View All →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {accessories.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group bg-card border border-border/50 rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
                  {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">{item.category}</span>
              </div>
              
              <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-primary font-bold">₹{item.price.toLocaleString()}</span>
                <span className="text-muted-foreground text-xs line-through">
                  ₹{item.originalPrice.toLocaleString()}
                </span>
              </div>
              
              <Button
                size="sm"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleAddToCart(item)}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccessoriesSection;
