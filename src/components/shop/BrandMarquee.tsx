import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div 
      className="flex-shrink-0 flex flex-col items-center justify-center h-20 w-36 gap-2 cursor-pointer group"
      onClick={onClick}
    >
      <div className="rounded-md border border-border/40 bg-background/70 px-4 py-3 shadow-sm transition-all duration-300 group-hover:border-primary group-hover:shadow-md group-hover:scale-105">
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          className={`h-8 w-auto max-w-[100px] object-contain ${extraImgClass}`}
          loading="eager"
          referrerPolicy="no-referrer"
          draggable={false}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{brand.name}</span>
    </div>
  );
}

const BrandMarquee = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const dragStartTime = useRef(0);

  // Double brands for seamless loop
  const allBrands = [...brands, ...brands, ...brands];

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || isPaused || isDragging) return;

    const scrollContainer = scrollRef.current;
    let animationId: number;
    const scrollSpeed = 0.5;

    const animate = () => {
      if (scrollContainer && !isPaused && !isDragging) {
        scrollContainer.scrollLeft += scrollSpeed;
        
        // Reset scroll position for infinite loop
        const singleSetWidth = scrollContainer.scrollWidth / 3;
        if (scrollContainer.scrollLeft >= singleSetWidth * 2) {
          scrollContainer.scrollLeft = singleSetWidth;
        } else if (scrollContainer.scrollLeft <= 0) {
          scrollContainer.scrollLeft = singleSetWidth;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    // Initialize scroll position to middle set
    const singleSetWidth = scrollContainer.scrollWidth / 3;
    scrollContainer.scrollLeft = singleSetWidth;

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
    if (!scrollRef.current) return;
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
    <section
      aria-label="Supported phone brands"
      className="bg-card/50 py-8 border-y border-border/30 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 shadow-md hidden sm:flex"
        onClick={() => scrollByAmount('left')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-12"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 shadow-md hidden sm:flex"
        onClick={() => scrollByAmount('right')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </section>
  );
};

export default BrandMarquee;
