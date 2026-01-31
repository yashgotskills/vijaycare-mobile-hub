import { motion } from "framer-motion";
import { ArrowRight, Shield, Truck, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const features = [
    { icon: Shield, text: "Genuine Products" },
    { icon: Truck, text: "Fast Delivery" },
    { icon: Headphones, text: "24/7 Support" },
  ];

  return (
    <section id="home" className="relative w-full">
      {/* Background */}
      <div className="relative w-full">
        <img
          src={heroBg}
          alt="Mobile accessories"
          className="w-full h-auto object-contain"
        />
        <div className="absolute inset-0 bg-hero-gradient opacity-80" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-semibold backdrop-blur-sm border border-accent/30">
              #1 Mobile Accessories Store
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-6 leading-tight"
          >
            Your One-Stop
            <br />
            <span className="text-gradient">Mobile Care</span>
            <br />
            Destination
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl"
          >
            Premium mobile accessories, expert repairs, and trusted services — all under one roof. Enhance your mobile experience with VijayaCare.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            <Button variant="hero" size="xl">
              Explore Products
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Our Services
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-6 md:gap-10"
          >
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-primary-foreground/80">
                <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-accent" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
    </section>
  );
};

export default HeroSection;
