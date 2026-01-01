import { motion } from "framer-motion";
import { Award, Users, ThumbsUp, Clock } from "lucide-react";

const stats = [
  {
    icon: Award,
    value: "10+",
    label: "Years Experience",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Happy Customers",
  },
  {
    icon: ThumbsUp,
    value: "99%",
    label: "Satisfaction Rate",
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Customer Support",
  },
];

const features = [
  "100% Genuine Products with Warranty",
  "Certified & Trained Technicians",
  "Free Doorstep Delivery on Select Orders",
  "Hassle-free Return & Exchange Policy",
  "Best Price Guarantee",
  "Secure Payment Options",
];

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-24 bg-hero-gradient text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-4">
            Why VijayaCare
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-2xl mx-auto">
            Your satisfaction is our priority. Here's why customers choose us for their mobile needs.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10"
            >
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-3xl md:text-4xl font-display font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-primary-foreground/70 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-primary-foreground/5 backdrop-blur-sm"
            >
              <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              <span className="text-primary-foreground/90">{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
