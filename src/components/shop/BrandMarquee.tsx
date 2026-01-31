import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Magnetic from "@/components/motion/Magnetic";
import motorolaLogo from "@/assets/brands/motorola.svg";
import nothingLogo from "@/assets/brands/nothing.svg";
import oppoLogo from "@/assets/brands/oppo.svg";
import realmeLogo from "@/assets/brands/realme.svg";
import vivoLogo from "@/assets/brands/vivo.svg";

const brands = [
  { name: "Apple", logo: "https://cdn.simpleicons.org/apple/000000", slug: "apple" },
  { name: "Samsung", logo: "https://cdn.simpleicons.org/samsung/1428A0", slug: "samsung" },
  { name: "OnePlus", logo: "https://cdn.simpleicons.org/oneplus/F5010C", slug: "oneplus" },
  { name: "Xiaomi", logo: "https://cdn.simpleicons.org/xiaomi/FF6900", slug: "xiaomi" },
  { name: "Oppo", logo: oppoLogo, slug: "oppo" },
  { name: "Vivo", logo: vivoLogo, slug: "vivo" },
  { name: "Realme", logo: realmeLogo, slug: "realme" },
  { name: "Google", logo: "https://cdn.simpleicons.org/google/4285F4", slug: "google" },
  { name: "Nothing", logo: nothingLogo, slug: "nothing" },
  { name: "Motorola", logo: motorolaLogo, slug: "motorola" },
];

function BrandTile({ brand, onClick }: { brand: { name: string; logo: string; slug: string }; onClick: () => void }) {
  const extraImgClass = brand.name === "Nothing" ? "dark:invert" : "";

  return (
    <Magnetic strength={10}>
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center h-16 sm:h-20 w-28 sm:w-36 gap-1.5 sm:gap-2 cursor-pointer group"
        onClick={onClick}
      >
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-card group-hover:scale-[1.04]">
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            className={`h-6 sm:h-8 w-auto max-w-[80px] sm:max-w-[100px] object-contain ${extraImgClass}`}
            loading="eager"
            referrerPolicy="no-referrer"
            draggable={false}
          />
        </div>
        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {brand.name}
        </span>
      </div>
    </Magnetic>
  );
}

const BrandMarquee = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragStartTime = useRef(0);

  // Double brands for seamless loop (only 2 sets needed)
  const allBrands = [...brands, ...brands];

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || isPaused || isDragging) return;

    const scrollContainer = scrollRef.current;
    let animationId: number;
    const scrollSpeed = 0.5;

    const animate = () => {
      if (scrollContainer && !isPaused && !isDragging) {
        scrollContainer.scrollLeft += scrollSpeed;
        
        // Reset scroll position for infinite loop - when we reach end of first set, jump back to start
        const singleSetWidth = scrollContainer.scrollWidth / 2;
        if (scrollContainer.scrollLeft >= singleSetWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    // Start from the beginning
    scrollContainer.scrollLeft = 0;

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, isDragging]);

  const handleBrandClick = (slug: string, name: string) => {
    // Only navigate if it was a quick tap, not a drag
    if (Date.now() - dragStartTime.current < 200) {
      navigate(`/search?brand=${slug}&q=${encodeURIComponent(name)}`);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStartTime.current = Date.now();
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStartTime.current = Date.now();
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <motion.section
      aria-label="Supported phone brands"
      initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(10px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduceMotion ? undefined : { duration: 0.65, ease: "easeOut" }}
      className="bg-card/40 backdrop-blur-md py-10 md:py-12 border-y border-border/40 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-display font-bold text-foreground tracking-tight">Shop by Brand</h2>
          <p className="text-sm text-muted-foreground mt-1">Swipe, drag, or tap—filters apply instantly.</p>
        </div>
      </div>

      {/* Left Arrow */}
      <Magnetic strength={10}>
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/70 backdrop-blur-md shadow-card hidden sm:flex"
          onClick={() => scrollByAmount('left')}
          aria-label="Scroll brands left"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Magnetic>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-12 touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {allBrands.map((brand, index) => (
          <BrandTile 
            key={`${brand.name}-${index}`} 
            brand={brand} 
            onClick={() => handleBrandClick(brand.slug, brand.name)}
          />
        ))}
      </div>

      {/* Right Arrow */}
      <Magnetic strength={10}>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-background/70 backdrop-blur-md shadow-card hidden sm:flex"
          onClick={() => scrollByAmount('right')}
          aria-label="Scroll brands right"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Magnetic>
    </motion.section>
  );
};

export default BrandMarquee;
