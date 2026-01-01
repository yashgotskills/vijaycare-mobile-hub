import { motion } from "framer-motion";
import { 
  Wrench, 
  RefreshCw, 
  Cpu, 
  Droplets,
  Smartphone,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Wrench,
    title: "Screen Repair",
    description: "Cracked or broken screen? We'll restore it to like-new condition with genuine parts.",
    price: "Starting ₹999",
  },
  {
    icon: RefreshCw,
    title: "Battery Replacement",
    description: "Extend your phone's life with a new battery. Same-day service available.",
    price: "Starting ₹599",
  },
  {
    icon: Cpu,
    title: "Software Solutions",
    description: "OS updates, data recovery, virus removal, and performance optimization.",
    price: "Starting ₹299",
  },
  {
    icon: Droplets,
    title: "Water Damage Repair",
    description: "Expert water damage assessment and recovery. Don't lose your precious data.",
    price: "Starting ₹1499",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              Expert Services
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6">
              Professional Mobile
              <br />
              <span className="text-gradient">Repair Services</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our certified technicians use only genuine parts and provide warranty on all repairs. Trust your device with the experts.
            </p>

            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-foreground">Quick Turnaround</div>
                  <div className="text-sm text-muted-foreground">Most repairs in 24 hours</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="font-bold text-foreground">All Brands</div>
                  <div className="text-sm text-muted-foreground">iPhone, Samsung, OnePlus & more</div>
                </div>
              </div>
            </div>

            <Button size="lg">
              Book a Repair
            </Button>
          </motion.div>

          {/* Right - service cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-glow transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-gradient flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {service.description}
                </p>
                <span className="text-primary font-bold">{service.price}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
