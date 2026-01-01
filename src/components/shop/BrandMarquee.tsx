import { motion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

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
    // Clearbit often fails for this domain; use brand-colored Simple Icons CDN.
    logo: "https://cdn.simpleicons.org/oppo",
    fallback: "https://cdn.simpleicons.org/oppo",
  },
  {
    name: "Vivo",
    logo: "https://cdn.simpleicons.org/vivo",
    fallback: "https://cdn.simpleicons.org/vivo",
  },
  {
    name: "Realme",
    logo: "https://cdn.simpleicons.org/realme",
    fallback: "https://cdn.simpleicons.org/realme",
  },
  {
    name: "Google",
    logo: "https://logo.clearbit.com/google.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg",
  },
  {
    name: "Nothing",
    logo: "https://cdn.simpleicons.org/nothing",
    fallback: "https://cdn.simpleicons.org/nothing",
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
  const firstSetRef = useRef<HTMLDivElement | null>(null);
  const [setWidth, setSetWidth] = useState(0);

  useLayoutEffect(() => {
    const el = firstSetRef.current;
    if (!el) return;

    const update = () => setSetWidth(el.scrollWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const duration = useMemo(() => {
    // Keep speed consistent across viewport sizes.
    const pxPerSecond = 70;
    return setWidth ? setWidth / pxPerSecond : 0;
  }, [setWidth]);

  return (
    <section
      aria-label="Supported phone brands"
      className="overflow-hidden bg-card/50 py-8 border-y border-border/30"
    >
      <div className="relative">
        <motion.div
          animate={setWidth ? { x: [0, -setWidth] } : undefined}
          transition={
            setWidth
              ? {
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration,
                    ease: "linear",
                  },
                }
              : undefined
          }
          className="flex w-max gap-16 items-center"
        >
          <div ref={firstSetRef} className="flex gap-16 items-center">
            {brands.map((brand) => (
              <BrandTile key={`a-${brand.name}`} brand={brand} />
            ))}
          </div>

          <div className="flex gap-16 items-center" aria-hidden="true">
            {brands.map((brand) => (
              <BrandTile key={`b-${brand.name}`} brand={brand} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandMarquee;
