import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Magnetic from "@/components/motion/Magnetic";

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

    if (!error && data) {
      setBanners(data.length > 0 ? data : fallbackBanners);
    }
  };

  // Pause auto-scroll temporarily after user interaction
  const pauseAutoScroll = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 8000); // Resume after 8 seconds of no interaction
  };

  useEffect(() => {
    if (banners.length === 0 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  // Cleanup timeout on unmount
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
    <div className="relative w-full overflow-hidden rounded-2xl bg-muted shadow-card border border-border/50">
      <div className="relative aspect-[2.15/1] md:aspect-[3/1]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className={`absolute inset-0 ${banners[currentIndex].link ? "cursor-pointer" : ""}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 90 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -90 }}
            transition={{
              duration: reduceMotion ? 0.2 : 0.6,
              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
            }}
            onClick={handleBannerClick}
          >
            {/* Image (subtle parallax/zoom) */}
            <motion.img
              src={banners[currentIndex].image_url}
              alt={banners[currentIndex].title}
              className="absolute inset-0 w-full h-full object-cover object-center"
              initial={reduceMotion ? { scale: 1 } : { scale: 1.06 }}
              animate={reduceMotion ? { scale: 1 } : { scale: 1.01 }}
              transition={{
                duration: reduceMotion ? 0 : 4.2,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
              }}
              loading="eager"
            />

            {/* Editorial overlays */}
            <div className="absolute inset-0 bg-hero-gradient opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-foreground/10 to-transparent" />

            <div className="absolute inset-0 p-5 md:p-10 flex items-end">
              <div className="max-w-xl">
                <motion.p
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.12, duration: 0.5 }}
                  className="text-primary-foreground/80 text-xs md:text-sm font-medium tracking-wide"
                >
                  VijayCare Collection
                </motion.p>
                <motion.h2
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{
                    delay: reduceMotion ? 0 : 0.16,
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                  }}
                  className="mt-1 text-xl md:text-3xl font-display font-bold text-primary-foreground leading-tight"
                >
                  {banners[currentIndex].title}
                </motion.h2>

                <motion.div
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.22, duration: 0.55 }}
                  className="mt-3"
                >
                  <Magnetic strength={12}>
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBannerClick();
                      }}
                      className={banners[currentIndex].link ? "" : "opacity-90"}
                    >
                      Explore
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Magnetic>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <Magnetic strength={10}>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 backdrop-blur-md p-2 rounded-full shadow-card border border-border/50 transition-all"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6 text-foreground" />
          </button>
        </Magnetic>
        <Magnetic strength={10}>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 backdrop-blur-md p-2 rounded-full shadow-card border border-border/50 transition-all"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6 text-foreground" />
          </button>
        </Magnetic>

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
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;
