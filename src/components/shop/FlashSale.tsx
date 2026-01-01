import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import ProductGrid from "./ProductGrid";

const FlashSale = () => {
  const { data: products, isLoading } = useProducts({ limit: 4 });
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
    <section className="py-12 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="p-2 bg-red-500 rounded-lg"
            >
              <Zap className="h-6 w-6 text-white fill-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground">
                Flash Sale
              </h2>
              <p className="text-muted-foreground">
                Hurry! Limited time offers
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ends in:</span>
            <div className="flex gap-1">
              <div className="bg-foreground text-background px-3 py-2 rounded-lg font-mono font-bold">
                {formatTime(timeLeft.hours)}
              </div>
              <span className="text-foreground font-bold text-xl">:</span>
              <div className="bg-foreground text-background px-3 py-2 rounded-lg font-mono font-bold">
                {formatTime(timeLeft.minutes)}
              </div>
              <span className="text-foreground font-bold text-xl">:</span>
              <div className="bg-foreground text-background px-3 py-2 rounded-lg font-mono font-bold">
                {formatTime(timeLeft.seconds)}
              </div>
            </div>
          </div>
        </div>

        <ProductGrid products={products || []} isLoading={isLoading} columns={4} />
      </div>
    </section>
  );
};

export default FlashSale;
