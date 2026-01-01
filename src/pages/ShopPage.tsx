import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShopHeader from "@/components/shop/ShopHeader";
import CouponBanner from "@/components/shop/CouponBanner";
import BannerCarousel from "@/components/shop/BannerCarousel";
import BrandMarquee from "@/components/shop/BrandMarquee";
import IPhoneCases from "@/components/shop/IPhoneCases";
import AccessoriesSection from "@/components/shop/AccessoriesSection";
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

        {/* Brand Marquee */}
        <BrandMarquee />

        {/* iPhone Cases */}
        <IPhoneCases />

        {/* Repair Service Banner */}
        <RepairServiceBanner />

        {/* Accessories */}
        <AccessoriesSection />
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;
