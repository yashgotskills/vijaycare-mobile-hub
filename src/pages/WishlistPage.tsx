import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

const WishlistPage = () => {
  const navigate = useNavigate();
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
      category: item.category,
    });
    removeFromWishlist(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <ShopHeader />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Heart className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              Your wishlist is empty
            </h1>
            <p className="text-muted-foreground mb-6">
              Save items you love by clicking the heart icon.
            </p>
            <Button onClick={() => navigate("/shop")} size="lg">
              Continue Shopping
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
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/shop")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              My Wishlist ({items.length} items)
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-border/50 overflow-hidden group">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {item.category && (
                      <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-foreground">
                        ₹{item.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{item.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleMoveToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Move to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
