import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bannerNewStock from "@/assets/banner-new-stock.webp";
import bannerCasesCollection from "@/assets/banner-cases-collection.webp";
import bannerAccessoriesSale from "@/assets/banner-accessories-sale.webp";
import bannerRepairService from "@/assets/banner-repair-service.webp";
import bannerIphoneCases from "@/assets/banner-iphone-cases.webp";

const banners = [
  { id: 1, image: bannerNewStock, alt: "VijayCare - New Stock Arrivals" },
  { id: 2, image: bannerCasesCollection, alt: "Premium Mobile Cases Collection" },
  { id: 3, image: bannerAccessoriesSale, alt: "Mobile Accessories Sale" },
  { id: 4, image: bannerRepairService, alt: "VijayCare Phone Repair Service" },
  { id: 5, image: bannerIphoneCases, alt: "Premium iPhone Cases" },
];

const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-muted">
      <div className="relative aspect-[2.5/1] md:aspect-[3.3/1]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={banners[currentIndex].image}
            alt={banners[currentIndex].alt}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
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
