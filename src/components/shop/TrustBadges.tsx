import { Shield, Truck, RefreshCw, Headphones } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Magnetic from "@/components/motion/Magnetic";

const badges = [
  {
    icon: Shield,
    title: "Genuine Products",
    description: "100% authentic guarantee",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Free shipping",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "7-day return policy",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help",
  },
];

const TrustBadges = () => {
  const reduceMotion = useReducedMotion();
  return (
    <section className="py-8 md:py-10 bg-card/40 backdrop-blur-md border-y border-border/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(8px)" }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={reduceMotion ? undefined : { delay: index * 0.06, duration: 0.55, ease: "easeOut" }}
            >
              <Magnetic strength={10}>
                <div className="group flex items-center gap-3 p-3 rounded-2xl border border-border/50 bg-background/60 dark:bg-background/20 backdrop-blur-md hover:shadow-card hover:border-primary/20 transition-all">
                  <div className="p-2 rounded-xl shrink-0 bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <badge.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{badge.title}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              </Magnetic>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
