import { motion } from "framer-motion";

const brands = [
  { name: "Apple", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/apple.svg" },
  { name: "Samsung", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/samsung.svg" },
  { name: "OnePlus", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/oneplus.svg" },
  { name: "Xiaomi", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/xiaomi.svg" },
  { name: "Oppo", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/oppo.svg" },
  { name: "Vivo", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/vivo.svg" },
  { name: "Realme", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/realme.svg" },
  { name: "Google", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg" },
  { name: "Nothing", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/nothing.svg" },
  { name: "Motorola", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/motorola.svg" },
];

const BrandMarquee = () => {
  return (
    <div className="overflow-hidden bg-card/50 py-6 border-y border-border/30">
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
          {/* First set */}
          {brands.map((brand, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 flex items-center justify-center h-12 w-32"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-8 max-w-full object-contain dark:invert"
                loading="lazy"
              />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {brands.map((brand, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 flex items-center justify-center h-12 w-32"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-8 max-w-full object-contain dark:invert"
                loading="lazy"
              />
            </div>
          ))}
          {/* Third set for extra smoothness */}
          {brands.map((brand, index) => (
            <div
              key={`third-${index}`}
              className="flex-shrink-0 flex items-center justify-center h-12 w-32"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-8 max-w-full object-contain dark:invert"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandMarquee;
