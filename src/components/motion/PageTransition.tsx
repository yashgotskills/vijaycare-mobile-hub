import { motion, useReducedMotion } from "framer-motion";
import type { PropsWithChildren } from "react";

type PageTransitionProps = PropsWithChildren<{ className?: string }>;

const PageTransition = ({ children, className }: PageTransitionProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10, filter: "blur(8px)" }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
