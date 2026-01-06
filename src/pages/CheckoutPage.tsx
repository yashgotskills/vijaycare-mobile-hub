import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MapPin, CreditCard, Smartphone, 
  Banknote, Check, Truck, ShieldCheck, Loader2, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import CouponInput from "@/components/shop/CouponInput";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface DetectedAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

const paymentMethods = [
  { id: "razorpay", name: "Pay Online", icon: CreditCard, description: "UPI, Cards, NetBanking" },
  { id: "cod", name: "Cash on Delivery", icon: Banknote, description: "Pay when you receive" },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<string>("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  
  // Location detection state
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [detectedAddress, setDetectedAddress] = useState<DetectedAddress | null>(null);

  const subtotal = totalPrice;
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal + shipping - couponDiscount;

  // Load Razorpay script on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Request location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocationStatus("loading");

    // Try with high accuracy first, then fallback to low accuracy
    const tryGetPosition = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocode using OpenStreetMap Nominatim (free, no API key needed)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const data = await response.json();

            if (data && data.address) {
              const addr = data.address;
              setDetectedAddress({
                address: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(", ") || data.display_name?.split(",").slice(0, 2).join(",") || "Detected Location",
                city: addr.city || addr.town || addr.village || addr.county || "",
                state: addr.state || "",
                pincode: addr.postcode || "",
                lat: latitude,
                lng: longitude,
              });
              setLocationStatus("success");
              toast.success("Location detected successfully");
            } else {
              throw new Error("Could not parse address");
            }
          } catch {
            // Fallback: just show coordinates
            setDetectedAddress({
              address: "Detected Location",
              city: "",
              state: "",
              pincode: "",
              lat: latitude,
              lng: longitude,
            });
            setLocationStatus("success");
            toast.info("Location detected (address lookup failed)");
          }
        },
        (error) => {
          // If high accuracy failed due to timeout, try with low accuracy
          if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
            console.log("High accuracy failed, trying low accuracy...");
            tryGetPosition(false);
            return;
          }
          
          setLocationStatus("error");
          if (error.code === error.PERMISSION_DENIED) {
            toast.error("Location permission denied. Please allow location access.");
          } else if (error.code === error.TIMEOUT) {
            toast.error("Location request timed out. Please try again.");
          } else {
            toast.error("Could not detect your location. Please try again.");
          }
        },
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: highAccuracy ? 15000 : 30000,
          maximumAge: 60000 // Accept cached position up to 1 minute old
        }
      );
    };

    tryGetPosition(true);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (locationStatus !== "success" || !detectedAddress) {
      toast.error("Please allow location access to proceed");
      return;
    }

    const userPhone = localStorage.getItem("vijaycare_user");
    if (!userPhone) {
      toast.error("Please login to place order");
      navigate("/");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Save order to database first
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const { data: orderData, error: orderError } = await supabase.from("orders").insert({
        order_number: "", // Will be generated by trigger
        user_phone: userPhone,
        items: orderItems,
        total_amount: total,
        status: "Processing",
        delivery_address: {
          address: detectedAddress.address,
          city: detectedAddress.city,
          state: detectedAddress.state,
          pincode: detectedAddress.pincode,
          lat: detectedAddress.lat,
          lng: detectedAddress.lng
        },
        payment_method: selectedPayment
      }).select().single();

      if (orderError) throw orderError;

      // If Razorpay payment selected
      if (selectedPayment === "razorpay") {
        // Create Razorpay order
        const { data: razorpayData, error: rzError } = await supabase.functions.invoke(
          "create-razorpay-order",
          {
            body: {
              amount: total,
              currency: "INR",
              receipt: orderData.order_number,
              notes: { order_id: orderData.id }
            }
          }
        );

        if (rzError || !razorpayData?.orderId) {
          throw new Error("Failed to create payment order");
        }

        // Open Razorpay checkout
        const options = {
          key: razorpayData.keyId,
          amount: razorpayData.amount,
          currency: razorpayData.currency,
          name: "Vijay Care",
          description: "Order Payment",
          order_id: razorpayData.orderId,
          handler: async function (response: any) {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              "verify-razorpay-payment",
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: orderData.id
                }
              }
            );

            if (verifyError || !verifyData?.verified) {
              toast.error("Payment verification failed");
              return;
            }

            // Success!
            clearCart();
            toast.success("Payment successful! Order confirmed.");
            navigate(`/track-order/${orderData.order_number}`);
          },
          prefill: {
            contact: userPhone,
          },
          theme: {
            color: "#f97316",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              toast.info("Payment cancelled");
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        return; // Don't set processing to false yet
      }

      // COD flow
      // Try to send push notification (non-blocking)
      supabase.functions.invoke("send-push-notification", {
        body: {
          user_phone: userPhone,
          title: "Order Confirmed! 🎉",
          body: `Your order of ₹${total.toLocaleString()} has been placed successfully.`,
          data: { type: "order_confirmed" }
        }
      }).catch(console.error);
      
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/track-order/${orderData.order_number}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <ShopHeader />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Truck className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
              No items to checkout
            </h1>
            <p className="text-muted-foreground mb-6">
              Add some items to your cart first.
            </p>
            <Button onClick={() => navigate("/shop")} size="lg">
              Continue Shopping
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ShopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/cart")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Checkout
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Address & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address - Auto Detected */}
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {locationStatus === "loading" && (
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-muted/30">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Detecting your location...</span>
                    </div>
                  )}

                  {locationStatus === "error" && (
                    <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/5">
                      <p className="text-sm text-destructive mb-3">
                        Could not detect your location. Please allow location access.
                      </p>
                      <Button variant="outline" size="sm" onClick={requestLocation} className="gap-2">
                        <Navigation className="w-4 h-4" />
                        Try Again
                      </Button>
                    </div>
                  )}

                  {locationStatus === "success" && detectedAddress && (
                    <div className="relative flex items-start gap-3 p-4 rounded-lg border border-primary bg-primary/5">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">Current Location</span>
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">{detectedAddress.address}</p>
                        {(detectedAddress.city || detectedAddress.state || detectedAddress.pincode) && (
                          <p className="text-sm text-muted-foreground">
                            {[detectedAddress.city, detectedAddress.state, detectedAddress.pincode].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={requestLocation} className="text-xs">
                        Refresh
                      </Button>
                    </div>
                  )}

                  {locationStatus === "idle" && (
                    <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-3">
                        We need your location to deliver your order.
                      </p>
                      <Button variant="outline" size="sm" onClick={requestLocation} className="gap-2">
                        <Navigation className="w-4 h-4" />
                        Detect My Location
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={selectedPayment} 
                    onValueChange={setSelectedPayment}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`relative flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                          selectedPayment === method.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <method.icon className="w-5 h-5 text-primary" />
                        </div>
                        <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                          <span className="font-semibold text-foreground">{method.name}</span>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </Label>
                        {selectedPayment === method.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="border-border/50 sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Coupon */}
                  <CouponInput
                    subtotal={subtotal}
                    appliedCode={appliedCoupon}
                    appliedDiscount={couponDiscount}
                    onApply={(discount, code) => {
                      setCouponDiscount(discount);
                      setAppliedCoupon(code);
                    }}
                    onRemove={() => {
                      setCouponDiscount(0);
                      setAppliedCoupon(null);
                    }}
                  />

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium text-foreground">
                        {shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span>-₹{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₹{total.toLocaleString()}</span>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || locationStatus !== "success"}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Secure checkout with SSL encryption</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
