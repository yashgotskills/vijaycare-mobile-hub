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
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{brand.name}</span>
    </div>
  );
}

const BrandMarquee = () => {
  const navigate = useNavigate();
  
  // Double the brands for seamless loop
  const allBrands = [...brands, ...brands];

  const handleBrandClick = (slug: string, name: string) => {
    // Navigate to search results filtered by brand
    navigate(`/search?brand=${slug}&q=${encodeURIComponent(name)}`);
  };

  return (
    <section
      aria-label="Supported phone brands"
      className="overflow-hidden bg-card/50 py-8 border-y border-border/30"
    >
      <div className="marquee-container">
        <div className="marquee-content">
          {allBrands.map((brand, index) => (
            <BrandTile 
              key={`${brand.name}-${index}`} 
              brand={brand} 
              onClick={() => handleBrandClick(brand.slug, brand.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
