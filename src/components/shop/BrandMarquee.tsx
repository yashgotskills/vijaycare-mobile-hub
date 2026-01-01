import { motion } from "framer-motion";

const brands = [
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "OnePlus", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9e/OnePlus_logo.svg" },
  { name: "Xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg" },
  { name: "Oppo", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/OPPO_LOGO_2019.svg" },
  { name: "Vivo", logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Vivo_logo_2019.svg" },
  { name: "Realme", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Realme_logo.svg" },
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Nothing", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Nothing_Logo.svg" },
  { name: "Motorola", logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Motorola-logo.svg" },
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
              className="flex-shrink-0 flex items-center justify-center h-12 w-32 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-8 max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {brands.map((brand, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 flex items-center justify-center h-12 w-32 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-8 max-w-full object-contain"
                loading="lazy"
              />
            </div>
          ))}
          {/* Third set for extra smoothness */}
          {brands.map((brand, index) => (
            <div
              key={`third-${index}`}
              className="flex-shrink-0 flex items-center justify-center h-12 w-32 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-8 max-w-full object-contain"
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
