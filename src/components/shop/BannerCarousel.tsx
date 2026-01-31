import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// New full-width banners
import bannerIphone16HotDeals from "@/assets/banner-iphone-16-hot-deals.png";
import bannerAerobuds from "@/assets/banner-aerobuds-new.png";
import bannerPowerBank from "@/assets/banner-powerbank-new.png";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link: string | null;
}

const fallbackBanners = [
  { id: "1", title: "iPhone 16 Hot Deals", image_url: bannerIphone16HotDeals, link: null },
  { id: "2", title: "Aerobuds", image_url: bannerAerobuds, link: null },
  { id: "3", title: "Power Banks", image_url: bannerPowerBank, link: null },
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState<Banner[]>(fallbackBanners);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const pauseAutoScroll = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 8000);
  };

  useEffect(() => {
    if (banners.length === 0 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    pauseAutoScroll();
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    pauseAutoScroll();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    pauseAutoScroll();
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
    <div className="relative w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className={`w-full ${banners[currentIndex].link ? "cursor-pointer" : ""}`}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -60 }}
          transition={{
            duration: reduceMotion ? 0.2 : 0.5,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
          }}
          onClick={handleBannerClick}
        >
          <img
            src={banners[currentIndex].image_url}
            alt={banners[currentIndex].title}
            className="w-full h-auto object-contain"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-border/30 transition-all z-10"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5 text-foreground" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 backdrop-blur-md p-2.5 rounded-full shadow-lg border border-border/30 transition-all z-10"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5 text-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-6"
                : "bg-white/50 hover:bg-white/70 w-2"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
