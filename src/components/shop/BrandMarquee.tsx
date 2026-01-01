import { motion } from "framer-motion";

const brands = [
  {
    name: "Apple",
    logo: "https://logo.clearbit.com/apple.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg",
  },
  {
    name: "Samsung",
    logo: "https://logo.clearbit.com/samsung.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/samsung.svg",
  },
  {
    name: "OnePlus",
    logo: "https://logo.clearbit.com/oneplus.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/oneplus.svg",
  },
  {
    name: "Xiaomi",
    logo: "https://logo.clearbit.com/mi.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/xiaomi.svg",
  },
  {
    name: "Oppo",
    logo: "https://logo.clearbit.com/oppo.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/oppo.svg",
  },
  {
    name: "Vivo",
    logo: "https://logo.clearbit.com/vivo.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vivo.svg",
  },
  {
    name: "Realme",
    logo: "https://logo.clearbit.com/realme.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/realme.svg",
  },
  {
    name: "Google",
    logo: "https://logo.clearbit.com/google.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg",
  },
  {
    name: "Nothing",
    logo: "https://logo.clearbit.com/nothing.tech?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nothing.svg",
  },
  {
    name: "Motorola",
    logo: "https://logo.clearbit.com/motorola.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/motorola.svg",
  },
] as const;

type Brand = (typeof brands)[number];

function BrandTile({ brand }: { brand: Brand }) {
  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center h-16 w-36 gap-2">
      <img
        src={brand.logo}
        alt={`${brand.name} brand logo`}
        className="max-h-10 max-w-full object-contain"
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget;
          // prevent infinite loop
          if (img.dataset.fallbackApplied === "1") return;
          img.dataset.fallbackApplied = "1";
          img.src = brand.fallback;
        }}
      />
      <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
    </div>
  );
}

const BrandMarquee = () => {
  return (
    <div className="overflow-hidden bg-card/50 py-8 border-y border-border/30">
      <div className="relative">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
          className="flex gap-16 items-center"
        >
          {Array.from({ length: 3 }).map((_, setIndex) => (
            <div key={setIndex} className="flex gap-16 items-center">
              {brands.map((brand) => (
                <BrandTile key={`${setIndex}-${brand.name}`} brand={brand} />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandMarquee;
