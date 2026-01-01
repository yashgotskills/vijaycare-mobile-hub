import { motion } from "framer-motion";
import { 
  Smartphone, 
  Headphones, 
  Battery, 
  Shield, 
  Cable,
  Watch
} from "lucide-react";

const categories = [
  {
    icon: Smartphone,
    title: "Phone Cases",
    description: "Premium protective cases for all models",
    count: "500+ Products",
    color: "217 91% 50%",
  },
  {
    icon: Headphones,
    title: "Earbuds & Audio",
    description: "Wireless earbuds and headphones",
    count: "200+ Products",
    color: "187 92% 50%",
  },
  {
    icon: Battery,
    title: "Power Banks",
    description: "Fast charging portable batteries",
    count: "150+ Products",
    color: "142 76% 45%",
  },
  {
    icon: Shield,
    title: "Screen Guards",
    description: "Tempered glass and film protectors",
    count: "300+ Products",
    color: "280 80% 55%",
  },
  {
    icon: Cable,
    title: "Cables & Chargers",
    description: "Fast charging cables and adapters",
    count: "400+ Products",
    color: "24 95% 55%",
  },
  {
    icon: Watch,
    title: "Smart Watches",
    description: "Fitness trackers and smartwatches",
    count: "100+ Products",
    color: "340 75% 55%",
  },
];

const ProductCategories = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Our Products
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our wide range of mobile accessories designed to enhance your digital lifestyle
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category, index) => (
            <motion.a
              key={index}
              href="#"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group relative bg-card rounded-2xl p-8 shadow-card hover:shadow-glow border border-border/50 overflow-hidden"
            >
              {/* Background glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 50%, hsl(${category.color}), transparent 70%)` }}
              />

              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300"
                style={{ backgroundColor: `hsl(${category.color} / 0.1)` }}
              >
                <category.icon
                  className="w-8 h-8"
                  style={{ color: `hsl(${category.color})` }}
                />
              </div>

              <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {category.title}
              </h3>
              <p className="text-muted-foreground mb-4">{category.description}</p>
              <span
                className="text-sm font-semibold"
                style={{ color: `hsl(${category.color})` }}
              >
                {category.count}
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductCategories;
