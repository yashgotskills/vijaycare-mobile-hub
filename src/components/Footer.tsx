import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";
import shopPhoto from "@/assets/shop-photo.webp";
import AdminLoginDialog from "./AdminLoginDialog";
import Magnetic from "@/components/motion/Magnetic";

const Footer = React.forwardRef<HTMLElement>((_, ref) => {
  const reduceMotion = useReducedMotion();
  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "Products", href: "#products" },
    { label: "Services", href: "#services" },
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const categories = [
    "Phone Cases",
    "Earbuds & Audio",
    "Power Banks",
    "Screen Guards",
    "Cables & Chargers",
    "Smart Watches",
  ];

  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/vijay.care?igsh=cWVoaXltaTR0cHhk",
      label: "Instagram",
    },
  ];

  return (
    <motion.footer
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 22, filter: "blur(10px)" }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduceMotion ? undefined : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="relative overflow-hidden border-t border-border/60 bg-card/70 text-foreground backdrop-blur-xl"
    >
      {/* Editorial ambience */}
      <div aria-hidden className="absolute inset-0 bg-ambient-mesh opacity-[0.22]" />
      <div aria-hidden className="absolute inset-0 bg-vignette" />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="VijayCare" className="h-12 w-12" />
              <div>
                <span className="font-display font-bold text-xl block">
                  Vijay<span className="text-accent">Care</span>
                </span>
                <span className="text-muted-foreground text-sm">Where Mobile Meet Care</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6">
              Your trusted destination for premium mobile accessories and expert repair services.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <Magnetic key={index} strength={10}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-background/60 dark:bg-background/20 border border-border/50 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Categories</h4>
            <ul className="space-y-3">
              {categories.map((category, index) => (
                <li key={index}>
                  <a
                    href="#products"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6">Contact Info</h4>
            <div className="mb-4">
              <img 
                src={shopPhoto} 
                alt="Vijay Care Shop" 
                className="w-full h-32 object-cover rounded-lg border border-border/60"
              />
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  Shipra Mall, Krishna Apra Shopping Plaza, Ghaziabad, Uttar Pradesh 201014
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <a href="tel:+918595355469" className="text-muted-foreground hover:text-foreground">
                  +91 85953 55469
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a href="mailto:vijaycare010@gmail.com" className="text-muted-foreground hover:text-foreground">
                  vijaycare010@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/60 relative">
        <div className="container mx-auto px-4 py-6 relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} VijayCare. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm items-center">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Refund Policy
              </a>
              <AdminLoginDialog />
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
