import { motion, useReducedMotion } from "framer-motion";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Magnetic from "@/components/motion/Magnetic";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const discountPercentage = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: parseInt(product.id.slice(0, 8), 16),
      name: product.name,
      price: product.price,
      originalPrice: product.original_price || product.price,
      image: product.images[0] || "",
      category: product.category?.name,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const numericId = parseInt(product.id.slice(0, 8), 16);
    if (isInWishlist(numericId)) {
      removeFromWishlist(numericId);
    } else {
      addToWishlist({
        id: numericId,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price || product.price,
        image: product.images[0] || "",
        category: product.category?.name,
      });
    }
  };

  const numericId = parseInt(product.id.slice(0, 8), 16);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduceMotion ? undefined : { delay: index * 0.04, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      onClick={() => navigate(`/product/${product.slug}`)}
      className="group relative bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden hover:shadow-card hover:border-primary/25 transition-all cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0] || "https://placehold.co/400x400?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700"
          loading="lazy"
        />

        {/* Spotlight */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-primary/10 to-accent/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercentage > 0 && (
            <Badge className="bg-accent text-accent-foreground text-xs font-bold">
              {discountPercentage}% OFF
            </Badge>
          )}
          {product.is_new && (
            <Badge className="bg-primary text-primary-foreground text-xs">NEW</Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-secondary text-secondary-foreground text-xs">BESTSELLER</Badge>
          )}
        </div>

        {/* Stock warning */}
        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <Badge className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground text-xs">
            Only {product.stock_quantity} left!
          </Badge>
        )}

        {/* Action buttons - always visible on touch, hover on desktop */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Magnetic strength={8}>
            <button
              onClick={handleToggleWishlist}
              aria-label={isInWishlist(numericId) ? "Remove from wishlist" : "Add to wishlist"}
              className={`p-2 sm:p-1.5 rounded-full backdrop-blur-md border border-border/60 transition-all ${
                isInWishlist(numericId)
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-background/70 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-background/90"
              }`}
            >
              <Heart className={`h-4 w-4 ${isInWishlist(numericId) ? "fill-current" : ""}`} />
            </button>
          </Magnetic>
          <Magnetic strength={8}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.slug}`);
              }}
              aria-label="View details"
              className="p-2 sm:p-1.5 rounded-full bg-background/70 backdrop-blur-md border border-border/60 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-background/90 transition-all"
            >
              <Eye className="h-4 w-4" />
            </button>
          </Magnetic>
        </div>
      </div>

      <div className="p-3">
        {/* Category & Brand */}
        <div className="flex items-center gap-2 mb-1">
          {product.category && (
            <span className="text-xs text-muted-foreground">{product.category.name}</span>
          )}
          {product.brand && (
            <span className="text-xs text-primary font-medium">{product.brand.name}</span>
          )}
        </div>

        {/* Product name */}
        <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex items-center gap-0.5 bg-accent text-accent-foreground text-xs px-1.5 py-0.5 rounded">
              <span>{product.rating_average.toFixed(1)}</span>
              <Star className="h-3 w-3 fill-current" />
            </div>
            <span className="text-xs text-muted-foreground">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-foreground">
            ₹{product.price.toLocaleString()}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.original_price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Magnetic strength={12}>
          <Button
            size="sm"
            className="w-full mt-3"
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </Magnetic>
      </div>
    </motion.div>
  );
};

export default ProductCard;
