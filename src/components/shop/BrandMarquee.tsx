import motorolaLogo from "@/assets/brands/motorola.svg";
import nothingLogo from "@/assets/brands/nothing.svg";
import oppoLogo from "@/assets/brands/oppo.svg";
import realmeLogo from "@/assets/brands/realme.svg";
import vivoLogo from "@/assets/brands/vivo.svg";

const brands = [
  { name: "Apple", logo: "https://cdn.simpleicons.org/apple/000000" },
  { name: "Samsung", logo: "https://cdn.simpleicons.org/samsung/1428A0" },
  { name: "OnePlus", logo: "https://cdn.simpleicons.org/oneplus/F5010C" },
  { name: "Xiaomi", logo: "https://cdn.simpleicons.org/xiaomi/FF6900" },
  { name: "Oppo", logo: oppoLogo },
  { name: "Vivo", logo: vivoLogo },
  { name: "Realme", logo: realmeLogo },
  { name: "Google", logo: "https://cdn.simpleicons.org/google/4285F4" },
  { name: "Nothing", logo: nothingLogo },
  { name: "Motorola", logo: motorolaLogo },
];

function BrandTile({ brand }: { brand: { name: string; logo: string } }) {
  const extraImgClass = brand.name === "Nothing" ? "dark:invert" : "";

  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center h-20 w-36 gap-2">
      <div className="rounded-md border border-border/40 bg-background/70 px-4 py-3 shadow-sm">
        <img
          src={brand.logo}
          alt={`${brand.name} logo`}
          className={`h-8 w-auto max-w-[100px] object-contain ${extraImgClass}`}
          loading="eager"
          referrerPolicy="no-referrer"
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
    </div>
  );
}

const BrandMarquee = () => {
  // Double the brands for seamless loop
  const allBrands = [...brands, ...brands];

  return (
    <section
      aria-label="Supported phone brands"
      className="overflow-hidden bg-card/50 py-8 border-y border-border/30"
    >
      <div className="marquee-container">
        <div className="marquee-content">
          {allBrands.map((brand, index) => (
            <BrandTile key={`${brand.name}-${index}`} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
