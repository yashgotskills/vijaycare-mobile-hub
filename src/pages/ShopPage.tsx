import ShopHeader from "@/components/shop/ShopHeader";
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
      <ShopHeader />
      
      <main className="pt-16 md:pt-20">
        {/* Banner Carousel - Full Width */}
        <ScrollReveal as="section" className="w-full">
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
