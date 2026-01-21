import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleBrandClick = (slug: string, name: string) => {
    // Only navigate if not dragging
    if (!isDragging) {
      navigate(`/search?brand=${slug}&q=${encodeURIComponent(name)}`);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
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
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section
      aria-label="Supported phone brands"
      className="bg-card/50 py-8 border-y border-border/30"
    >
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {brands.map((brand) => (
          <BrandTile 
            key={brand.name} 
            brand={brand} 
            onClick={() => handleBrandClick(brand.slug, brand.name)}
          />
        ))}
      </div>
    </section>
  );
};

export default BrandMarquee;
