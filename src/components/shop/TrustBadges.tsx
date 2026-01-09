import { Shield, Truck, RefreshCw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

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
  return (
    <section className="py-8 bg-primary/5 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <badge.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
