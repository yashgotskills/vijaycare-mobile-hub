import { useEffect, useRef } from "react";

type ScrollRevealOptions = {
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
};

/**
 * Global, Framer-free scroll reveal.
 * Adds data-reveal="in" when the element enters viewport.
 */
export function useScrollReveal<T extends HTMLElement>(
  opts: ScrollRevealOptions = {}
) {
  const { rootMargin = "-80px 0px", threshold = 0.12, once = true } = opts;
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion (CSS also handles this, but skip observer work)
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduceMotion) {
      el.dataset.reveal = "in";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = "in";
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            (entry.target as HTMLElement).dataset.reveal = "out";
          }
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return ref;
}
