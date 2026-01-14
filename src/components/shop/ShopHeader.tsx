import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Heart, Menu, X, LogOut, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import SearchBar from "./SearchBar";
import logo from "@/assets/logo.png";

const ShopHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();

  const handleLogout = () => {
    localStorage.removeItem("vijaycare_user");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/shop" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="VijayCare" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg sm:text-xl text-foreground leading-tight">
                VijayCare
              </span>
              <span className="hidden sm:block text-xs text-muted-foreground leading-tight">
                Where Mobile Meet Care
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex"
              onClick={() => navigate("/repair")}
              title="Repair Service"
            >
              <Wrench className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex relative"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="h-5 w-5" />
              {wishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistItems > 9 ? "9+" : wishlistItems}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hidden sm:flex text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden pb-4">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t border-border/50"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => { navigate("/repair"); setMobileMenuOpen(false); }}
              >
                <Wrench className="h-5 w-5 mr-2" />
                Repair Service
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => { navigate("/wishlist"); setMobileMenuOpen(false); }}
              >
                <Heart className="h-5 w-5 mr-2" />
                Wishlist {wishlistItems > 0 && `(${wishlistItems})`}
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => { navigate("/profile"); setMobileMenuOpen(false); }}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default ShopHeader;
