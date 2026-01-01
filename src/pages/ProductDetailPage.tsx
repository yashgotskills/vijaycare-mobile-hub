import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RefreshCw,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/shop/ProductGrid";
import ReviewForm from "@/components/shop/ReviewForm";
import { useProduct, useProducts, useProductReviews } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useProduct(slug || "");
  const { data: reviews, refetch: refetchReviews } = useProductReviews(product?.id || "");
  const { data: relatedProducts } = useProducts({ limit: 4 });
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ShopHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <ShopHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const numericId = parseInt(product.id.slice(0, 8), 16);
  const discountPercentage = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: numericId,
        name: product.name,
        price: product.price,
        originalPrice: product.original_price || product.price,
        image: product.images[0] || "",
        category: product.category?.name,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  const handleToggleWishlist = () => {
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

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const images = product.images.length > 0 ? product.images : ["https://placehold.co/800x800?text=No+Image"];

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
          {product.category && (
            <>
              <button 
                onClick={() => navigate(`/category/${product.category?.slug}`)}
                className="hover:text-primary"
              >
                {product.category.name}
              </button>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div 
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square bg-muted rounded-xl overflow-hidden"
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discountPercentage > 0 && (
                  <Badge className="bg-accent text-accent-foreground">
                    {discountPercentage}% OFF
                  </Badge>
                )}
                {product.is_new && <Badge className="bg-green-500 text-white">NEW</Badge>}
                {product.is_bestseller && <Badge className="bg-orange-500 text-white">BESTSELLER</Badge>}
              </div>
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <span className="text-sm text-primary font-medium">{product.brand.name}</span>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground">
              {product.name}
            </h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded">
                  <span className="font-semibold">{product.rating_average.toFixed(1)}</span>
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="text-muted-foreground">
                  {product.review_count} ratings
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-foreground">
                ₹{product.price.toLocaleString()}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.original_price.toLocaleString()}
                  </span>
                  <Badge variant="secondary" className="text-green-600">
                    Save ₹{(product.original_price - product.price).toLocaleString()}
                  </Badge>
                </>
              )}
            </div>

            {/* Short description */}
            <p className="text-muted-foreground">{product.short_description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock_quantity > 0 ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  {product.stock_quantity < 10 && (
                    <span className="text-red-500 text-sm">
                      (Only {product.stock_quantity} left!)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-red-500 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">Quantity:</span>
              <div className="flex items-center gap-2 bg-secondary rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-secondary/80 rounded-l-lg transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="p-2 hover:bg-secondary/80 rounded-r-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleBuyNow}
                disabled={product.stock_quantity === 0}
              >
                <Zap className="h-5 w-5 mr-2" />
                Buy Now
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleToggleWishlist}
              >
                <Heart className={`h-5 w-5 mr-2 ${isInWishlist(numericId) ? "fill-red-500 text-red-500" : ""}`} />
                {isInWishlist(numericId) ? "In Wishlist" : "Add to Wishlist"}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Genuine Product</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description, Specifications, Reviews */}
        <Tabs defaultValue="description" className="mt-12">
          <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Description
            </TabsTrigger>
            <TabsTrigger 
              value="specifications"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
            >
              Reviews ({product.review_count})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="py-6">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {product.description || "No description available."}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="py-6">
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="grid gap-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex py-2 border-b border-border">
                    <span className="w-1/3 text-muted-foreground">{key}</span>
                    <span className="w-2/3 text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No specifications available.</p>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="py-6">
            {/* Write Review Button */}
            {!showReviewForm && (
              <Button 
                onClick={() => setShowReviewForm(true)}
                variant="outline"
                className="mb-6 gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Write a Review
              </Button>
            )}

            {/* Review Form */}
            {showReviewForm && product && (
              <div className="mb-6">
                <ReviewForm
                  productId={product.id}
                  onSuccess={() => {
                    setShowReviewForm(false);
                    refetchReviews();
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {/* Reviews List */}
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-secondary/30 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 bg-green-600 text-white text-sm px-2 py-0.5 rounded">
                        {review.rating}
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <span className="font-medium">{review.user_name || "Anonymous"}</span>
                      {review.is_verified && (
                        <Badge variant="outline" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="font-semibold text-foreground">{review.title}</h4>
                    )}
                    <p className="text-muted-foreground text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              !showReviewForm && (
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              )
            )}
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold font-display text-foreground mb-6">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts} columns={4} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
