import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MiniCartProps {
  trigger: React.ReactNode;
}

const MiniCart = ({ trigger }: MiniCartProps) => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({totalItems} items)
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Your cart is empty</p>
            <p className="text-muted-foreground mb-4">
              Add items to start shopping
            </p>
            <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 bg-secondary/30 rounded-lg p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm line-clamp-2">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-primary">
                          ₹{item.price.toLocaleString()}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded bg-background hover:bg-muted transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded bg-background hover:bg-muted transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-lg">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => navigate("/cart")}>
                  View Cart
                </Button>
                <Button onClick={() => navigate("/checkout")}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MiniCart;
