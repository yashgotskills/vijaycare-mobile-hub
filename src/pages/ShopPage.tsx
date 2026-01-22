import ShopHeader from "@/components/shop/ShopHeader";
import CouponBanner from "@/components/shop/CouponBanner";
import BannerCarousel from "@/components/shop/BannerCarousel";
import BrandMarquee from "@/components/shop/BrandMarquee";
import CategoryGrid from "@/components/shop/CategoryGrid";
import TrustBadges from "@/components/shop/TrustBadges";
import FlashSale from "@/components/shop/FlashSale";
import FeaturedProducts from "@/components/shop/FeaturedProducts";
import BestSellers from "@/components/shop/BestSellers";
import NewArrivals from "@/components/shop/NewArrivals";
import CompareFloatingButton from "@/components/shop/CompareFloatingButton";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/motion/ScrollReveal";

const ShopPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <CouponBanner />
      <ShopHeader />
      
      <main>
        {/* Banner Carousel */}
        <ScrollReveal as="section" className="container mx-auto px-4 py-8">
          <BannerCarousel />
        </ScrollReveal>

        {/* Trust Badges */}
        <TrustBadges />

        {/* Category Grid */}
        <CategoryGrid />

        {/* Brand Marquee */}
        <BrandMarquee />

        {/* Flash Sale */}
        <FlashSale />

        {/* Featured Products */}
        <FeaturedProducts />

        {/* Best Sellers */}
        <BestSellers />

        {/* New Arrivals */}
        <NewArrivals />
      </main>

      <CompareFloatingButton />
      <Footer />
    </div>
  );
};

export default ShopPage;
