import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/product/${product.slug}`)}
      className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0] || "https://placehold.co/400x400?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercentage > 0 && (
            <Badge className="bg-accent text-accent-foreground text-xs font-bold">
              {discountPercentage}% OFF
            </Badge>
          )}
          {product.is_new && (
            <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
          )}
          {product.is_bestseller && (
            <Badge className="bg-orange-500 text-white text-xs">BESTSELLER</Badge>
          )}
        </div>

        {/* Stock warning */}
        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <Badge className="absolute bottom-2 left-2 bg-red-500/90 text-white text-xs">
            Only {product.stock_quantity} left!
          </Badge>
        )}

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            onClick={handleToggleWishlist}
            className={`p-1.5 rounded-full transition-all ${
              isInWishlist(numericId)
                ? "bg-red-500 text-white"
                : "bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-background"
            }`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(numericId) ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.slug}`); }}
            className="p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 hover:bg-background transition-all"
          >
            <Eye className="h-4 w-4" />
          </button>
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
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
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
        <Button
          size="sm"
          className="w-full mt-3 bg-primary hover:bg-primary/90"
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
