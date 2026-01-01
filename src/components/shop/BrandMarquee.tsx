import { useLayoutEffect, useRef, useState } from "react";

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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [duration, setDuration] = useState(0);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const update = () => {
      // Measure just the first set (half of the duplicated content)
      const setWidth = el.scrollWidth / 2;
      const pxPerSecond = 70;
      setDuration(setWidth / pxPerSecond);
    };
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section
      aria-label="Supported phone brands"
      className="overflow-hidden bg-card/50 py-8 border-y border-border/30"
    >
      <div
        ref={trackRef}
        className="flex w-max items-center gap-16 marquee-track"
        style={
          duration
            ? ({ "--marquee-duration": `${duration}s` } as React.CSSProperties)
            : undefined
        }
      >
        {/* First set */}
        {brands.map((brand) => (
          <BrandTile key={`a-${brand.name}`} brand={brand} />
        ))}
        {/* Duplicate set for seamless loop */}
        {brands.map((brand) => (
          <BrandTile key={`b-${brand.name}`} brand={brand} aria-hidden />
        ))}
      </div>
    </section>
  );
};

export default BrandMarquee;
