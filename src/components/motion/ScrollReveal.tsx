import React from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type ScrollRevealProps = {
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  once?: boolean;
};

const ScrollReveal = ({
  as = "div",
  className = "",
  children,
  rootMargin,
  threshold,
  once,
}: ScrollRevealProps) => {
  const ref = useScrollReveal<HTMLElement>({ rootMargin, threshold, once });
  const Comp = as as any;

  return (
    <Comp ref={ref} className={`reveal ${className}`} data-reveal="out">
      {children}
    </Comp>
  );
};

export default ScrollReveal;
