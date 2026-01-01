import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import RepairServiceBanner from "@/components/shop/RepairServiceBanner";
import Footer from "@/components/Footer";

const ShopPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("vijaycare_user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <CouponBanner />
      <ShopHeader />
      
      <main>
        {/* Banner Carousel */}
        <section className="container mx-auto px-4 py-6">
          <BannerCarousel />
        </section>

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

        {/* Repair Service Banner */}
        <RepairServiceBanner />

        {/* Best Sellers */}
        <BestSellers />

        {/* New Arrivals */}
        <NewArrivals />
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;
