import { motion } from "framer-motion";

const brands = [
  { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", color: "#555555" },
  { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg", color: "#1428a0" },
  { name: "OnePlus", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9e/OnePlus_logo.svg", color: "#f50514" },
  { name: "Xiaomi", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg", color: "#ff6900" },
  { name: "Oppo", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0a/OPPO_LOGO_2019.svg", color: "#1a9f4a" },
  { name: "Vivo", logo: "https://upload.wikimedia.org/wikipedia/commons/1/10/Vivo_logo_2019.svg", color: "#415fff" },
  { name: "Realme", logo: "https://upload.wikimedia.org/wikipedia/commons/9/91/Realme_logo.svg", color: "#f5c900" },
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", color: "#4285f4" },
  { name: "Nothing", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Nothing_logo.svg", color: "#000000" },
  { name: "Motorola", logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Motorola-logo.svg", color: "#5c92fa" },
];

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
          {/* First set */}
          {brands.map((brand, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 flex flex-col items-center justify-center h-16 w-36 gap-2"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-10 max-w-full object-contain"
                loading="lazy"
              />
              <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {brands.map((brand, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 flex flex-col items-center justify-center h-16 w-36 gap-2"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-10 max-w-full object-contain"
                loading="lazy"
              />
              <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
            </div>
          ))}
          {/* Third set for extra smoothness */}
          {brands.map((brand, index) => (
            <div
              key={`third-${index}`}
              className="flex-shrink-0 flex flex-col items-center justify-center h-16 w-36 gap-2"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-h-10 max-w-full object-contain"
                loading="lazy"
              />
              <span className="text-xs font-medium text-muted-foreground">{brand.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandMarquee;
