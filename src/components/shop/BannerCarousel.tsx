import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Optimized WebP banners
import bannerPowerBank from "@/assets/banner-power-bank.webp";
import bannerAerobuds from "@/assets/banner-aerobuds.webp";
import bannerIphoneCovers from "@/assets/banner-iphone-covers.webp";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link: string | null;
}

const fallbackBanners = [
  { id: "1", title: "Power Bank Collection", image_url: bannerPowerBank, link: null },
  { id: "2", title: "Aerobuds Special", image_url: bannerAerobuds, link: null },
  { id: "3", title: "iPhone Covers", image_url: bannerIphoneCovers, link: null },
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>(fallbackBanners);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("id, title, image_url, link")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      setBanners(data);
    }
  };

  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = () => {
    const banner = banners[currentIndex];
    if (banner.link) {
      window.location.href = banner.link;
    }
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-muted">
      <div className="relative aspect-[2.5/1] md:aspect-[3/1]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={banners[currentIndex].image_url}
            alt={banners[currentIndex].title}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 w-full h-full object-cover object-center ${banners[currentIndex].link ? 'cursor-pointer' : ''}`}
            onClick={handleBannerClick}
          />
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-lg transition-all"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-lg transition-all"
        >
          <ChevronRight className="h-6 w-6 text-foreground" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-background/60 hover:bg-background"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;
