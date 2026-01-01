import { motion } from "framer-motion";
import { Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CouponBanner = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText("NEW1");
    setCopied(true);
    toast({
      title: "Coupon Copied!",
      description: "Use NEW1 at checkout for 30% off",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-accent via-primary to-accent bg-[length:200%_100%] animate-[gradient_3s_ease_infinite] py-2.5 px-4"
    >
      <div className="container mx-auto flex items-center justify-center gap-3 text-primary-foreground">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span className="font-medium text-sm md:text-base">
          Use code{" "}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 bg-background/20 px-2 py-0.5 rounded font-bold hover:bg-background/30 transition-colors"
          >
            NEW1
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>{" "}
          for 30% OFF on your first order!
        </span>
        <Sparkles className="h-4 w-4 animate-pulse" />
      </div>
    </motion.div>
  );
};

export default CouponBanner;
