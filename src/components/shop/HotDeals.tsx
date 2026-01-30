import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Flame, Zap, TrendingUp, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Magnetic from "@/components/motion/Magnetic";
import ProductGrid from "./ProductGrid";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/types/product";

const useHotDeals = (limit: number = 12) => {
  return useQuery({
    queryKey: ["hot-deals", limit],
    queryFn: async () => {
      // Fetch products that are featured, bestseller, or new
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .or("is_featured.eq.true,is_bestseller.eq.true,is_new.eq.true")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as unknown as Product[];
    },
  });
};

const HotDeals = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useHotDeals(12);
  const reduceMotion = useReducedMotion();
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 23,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset to initial values when countdown ends
          return { hours: 5, minutes: 23, seconds: 45 };
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, "0");

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(10px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduceMotion ? undefined : { duration: 0.65, ease: "easeOut" }}
      className="py-14 md:py-16 bg-gradient-to-r from-destructive/10 via-accent/10 to-primary/10"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 md:mb-10">
          <div className="flex items-center gap-3">
            <motion.div
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
              transition={reduceMotion ? undefined : { repeat: Infinity, duration: 1.1 }}
              className="p-2 bg-destructive rounded-xl shadow-card"
            >
              <Flame className="h-6 w-6 text-destructive-foreground fill-destructive-foreground" />
            </motion.div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-tight">
                Hot Deals
              </h2>
              <p className="text-muted-foreground mt-1">
                Featured, bestsellers & new arrivals in one place
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Deal Tags */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                <Zap className="h-3 w-3" /> Flash
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-600 text-xs font-medium rounded-full">
                <TrendingUp className="h-3 w-3" /> Bestseller
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-600 text-xs font-medium rounded-full">
                <Sparkles className="h-3 w-3" /> New
              </span>
            </div>

            {/* Countdown Timer */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(8px)" }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={reduceMotion ? undefined : { duration: 0.55, ease: "easeOut", delay: 0.06 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-muted-foreground">Ends in</span>
              <div className="flex gap-1 items-center">
                <Magnetic strength={10}>
                  <div className="bg-foreground text-background px-3 py-2 rounded-xl font-mono font-bold shadow-card">
                    {formatTime(timeLeft.hours)}
                  </div>
                </Magnetic>
                <span className="text-foreground/80 font-bold text-xl">:</span>
                <Magnetic strength={10}>
                  <div className="bg-foreground text-background px-3 py-2 rounded-xl font-mono font-bold shadow-card">
                    {formatTime(timeLeft.minutes)}
                  </div>
                </Magnetic>
                <span className="text-foreground/80 font-bold text-xl">:</span>
                <Magnetic strength={10}>
                  <div className="bg-foreground text-background px-3 py-2 rounded-xl font-mono font-bold shadow-card">
                    {formatTime(timeLeft.seconds)}
                  </div>
                </Magnetic>
              </div>
            </motion.div>
          </div>
        </div>

        <ProductGrid products={products || []} isLoading={isLoading} columns={6} />

        <div className="flex justify-center mt-8">
          <Magnetic strength={12}>
            <Button variant="outline" size="lg" onClick={() => navigate("/categories")}>
              View All Products
            </Button>
          </Magnetic>
        </div>
      </div>
    </motion.section>
  );
};

export default HotDeals;
