import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Package, Truck, MapPin, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import confetti from "canvas-confetti";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [orderNumber] = useState(() => {
    const stored = localStorage.getItem("vijaycare_last_order");
    return stored || "ORD" + Date.now().toString().slice(-8);
  });

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  const steps = [
    { icon: Check, label: "Order Placed", completed: true },
    { icon: Package, label: "Processing", completed: false },
    { icon: Truck, label: "Shipped", completed: false },
    { icon: MapPin, label: "Delivered", completed: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <ShopHeader />

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center"
        >
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for shopping with us. Your order has been confirmed.
          </p>

          {/* Order Number */}
          <div className="bg-secondary/50 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-xl font-bold text-foreground font-mono">{orderNumber}</p>
          </div>

          {/* Order Timeline */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-green-500 text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2 text-muted-foreground">{step.label}</span>
                {index < steps.length - 1 && (
                  <div className="absolute w-12 h-0.5 bg-border transform translate-x-10" />
                )}
              </div>
            ))}
          </div>

          {/* Estimated Delivery */}
          <div className="bg-primary/10 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground">Estimated Delivery</p>
            <p className="text-lg font-semibold text-foreground">
              {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate("/profile")}>
              <Package className="h-4 w-4 mr-2" />
              Track Order
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/shop")}>
              Continue Shopping
            </Button>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Invoice
              </Button>
              <Button variant="ghost" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
