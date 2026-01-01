import { motion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import motorolaLogo from "@/assets/brands/motorola.svg";
import nothingLogo from "@/assets/brands/nothing.svg";
import oppoLogo from "@/assets/brands/oppo.svg";
import realmeLogo from "@/assets/brands/realme.svg";
import vivoLogo from "@/assets/brands/vivo.svg";

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
    // Use local, colored SVG to avoid flaky CDNs and keep consistent brand color.
    logo: oppoLogo,
    fallback: "https://cdn.simpleicons.org/oppo/05BA5A",
  },
  {
    name: "Vivo",
    logo: vivoLogo,
    fallback: "https://cdn.simpleicons.org/vivo/415FFF",
  },
  {
    name: "Realme",
    logo: realmeLogo,
    fallback: "https://logo.clearbit.com/realme.com?size=128",
  },
  {
    name: "Google",
    logo: "https://logo.clearbit.com/google.com?size=128",
    fallback: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg",
  },
  {
    name: "Nothing",
    // Brand is black; invert in dark mode so it stays visible.
    logo: nothingLogo,
    fallback: "https://logo.clearbit.com/nothing.tech?size=128",
  },
  {
    name: "Motorola",
    logo: motorolaLogo,
    fallback: "https://cdn.simpleicons.org/motorola/2D78D2",
  },
] as const;

type Brand = (typeof brands)[number];

function BrandTile({ brand }: { brand: Brand }) {
  const extraImgClass = brand.name === "Nothing" ? "dark:invert" : "";

  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center h-16 w-36 gap-2">
      <div className="rounded-md border border-border/40 bg-background/70 px-3 py-2 shadow-sm">
        <img
          src={brand.logo}
          alt={`${brand.name} brand logo`}
          className={`max-h-10 max-w-full object-contain ${extraImgClass}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            if (!brand.fallback) return;
            const img = e.currentTarget;
            // prevent infinite loop
            if (img.dataset.fallbackApplied === "1") return;
            img.dataset.fallbackApplied = "1";
            img.src = brand.fallback;
          }}
        />
      </div>
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
          className="flex w-max items-center"
        >
          <div ref={firstSetRef} className="flex gap-16 items-center pr-16">
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
