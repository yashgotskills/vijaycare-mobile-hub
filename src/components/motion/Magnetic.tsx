import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";
import { useMemo, useState } from "react";

type MagneticProps = PropsWithChildren<{
  className?: string;
  strength?: number; // px at max
}>;

const Magnetic = ({ children, className, strength = 10 }: MagneticProps) => {
  const reduceMotion = useReducedMotion();
  const [xy, setXy] = useState({ x: 0, y: 0 });

  const transition = useMemo(
    () => ({ type: "spring" as const, stiffness: 260, damping: 22, mass: 0.6 }),
    [],
  );

  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={{ x: xy.x, y: xy.y }}
      transition={transition}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setXy({ x: px * strength, y: py * strength });
      }}
      onMouseLeave={() => setXy({ x: 0, y: 0 })}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
