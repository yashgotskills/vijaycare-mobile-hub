import ShopHeader from "@/components/shop/ShopHeader";
import CouponBanner from "@/components/shop/CouponBanner";
import BannerCarousel from "@/components/shop/BannerCarousel";
import BrandMarquee from "@/components/shop/BrandMarquee";
import CategoryGrid from "@/components/shop/CategoryGrid";
import TrustBadges from "@/components/shop/TrustBadges";
import HotDeals from "@/components/shop/HotDeals";
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

        {/* Hot Deals - Combined Flash Sale, Featured, Bestsellers, New Arrivals */}
        <HotDeals />
      </main>

      <CompareFloatingButton />
      <Footer />
    </div>
  );
};

export default ShopPage;
