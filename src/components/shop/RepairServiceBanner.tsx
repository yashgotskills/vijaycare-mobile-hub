import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, ArrowRight, Shield, Clock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const RepairServiceBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          <div className="relative p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  <Wrench className="w-4 h-4" />
                  Repair Services
                </div>
                
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                  Expert Mobile Repair at Your Doorstep
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  Cracked screen? Battery issues? Our certified technicians will come to you. 
                  Book a repair visit now and get your device fixed at home.
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>90-Day Warranty</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Same Day Service</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Smartphone className="w-4 h-4 text-accent" />
                    <span>All Brands</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  onClick={() => navigate("/repair")}
                  className="gap-2"
                >
                  Book Repair Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Right - Service Cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: "Screen Repair", price: "₹999+", icon: "📱" },
                  { title: "Battery", price: "₹599+", icon: "🔋" },
                  { title: "Water Damage", price: "₹1499+", icon: "💧" },
                  { title: "Software Fix", price: "₹299+", icon: "⚙️" },
                ].map((service, index) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-background/80 backdrop-blur-sm rounded-xl p-4 border border-border/50"
                  >
                    <div className="text-2xl mb-2">{service.icon}</div>
                    <div className="font-medium text-foreground text-sm">{service.title}</div>
                    <div className="text-primary font-bold">{service.price}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RepairServiceBanner;
