import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";
import shopPhoto from "@/assets/shop-photo.webp";
import AdminLoginDialog from "./AdminLoginDialog";

const Footer = () => {
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
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="VijayCare" className="h-12 w-12" />
              <div>
                <span className="font-display font-bold text-xl block">
                  Vijay<span className="text-accent">Care</span>
                </span>
                <span className="text-accent text-sm">Where Mobile Meet Care</span>
              </div>
            </div>
            <p className="text-background/70 mb-6">
              Your trusted destination for premium mobile accessories and expert repair services.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-background/10 hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
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
                    className="text-background/70 hover:text-accent transition-colors"
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
                    className="text-background/70 hover:text-accent transition-colors"
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
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-background/70">
                  Shipra Mall, Krishna Apra Shopping Plaza, Ghaziabad, Uttar Pradesh 201014
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <a href="tel:+918595355469" className="text-background/70 hover:text-accent">
                  +91 85953 55469
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a href="mailto:vijaycare010@gmail.com" className="text-background/70 hover:text-accent">
                  vijaycare010@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © {new Date().getFullYear()} VijayCare. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm items-center">
              <a href="#" className="text-background/60 hover:text-accent">
                Privacy Policy
              </a>
              <a href="#" className="text-background/60 hover:text-accent">
                Terms of Service
              </a>
              <a href="#" className="text-background/60 hover:text-accent">
                Refund Policy
              </a>
              <AdminLoginDialog />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
