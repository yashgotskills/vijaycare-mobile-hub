import { useReducedMotion } from "framer-motion";

/**
 * Ambient, editorial-style background layer.
 * Purely visual: fixed behind all pages, reduced-motion safe.
 */
const AmbientBackground = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      {/* Base */}
      <div className="absolute inset-0 bg-background" />

      {/* Soft spotlight mesh */}
      <div className="absolute -inset-[20%] opacity-[0.35] bg-ambient-mesh" />

      {/* Moving glow layers (disabled on reduced motion) */}
      {!reduceMotion && (
        <>
          <div className="absolute -inset-[30%] bg-ambient-orb-1 mix-blend-multiply opacity-[0.35]" />
          <div className="absolute -inset-[35%] bg-ambient-orb-2 mix-blend-multiply opacity-[0.25]" />
        </>
      )}

      {/* Grain */}
      <div className={reduceMotion ? "absolute inset-0 bg-grain opacity-[0.10]" : "absolute inset-0 bg-grain opacity-[0.12] animate-grain"} />

      {/* Vignette */}
      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
};

export default AmbientBackground;
