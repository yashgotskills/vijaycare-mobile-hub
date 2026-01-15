import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MapPin, CreditCard, 
  Banknote, Check, Truck, Loader2, Navigation,
  Plus, User, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import CouponInput from "@/components/shop/CouponInput";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
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
  
  // Customer details form
  const [customerForm, setCustomerForm] = useState<DeliveryAddress>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Location detection state
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocationStatus("loading");

    const tryGetPosition = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { "Accept-Language": "en" } }
            );
            const data = await response.json();

            if (data && data.address) {
              const addr = data.address;
              setCustomerForm(prev => ({
                ...prev,
                address: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(", ") || data.display_name?.split(",").slice(0, 2).join(",") || "",
                city: addr.city || addr.town || addr.village || addr.county || "",
                state: addr.state || "",
                pincode: addr.postcode || "",
              }));
              setLocationStatus("success");
              toast.success("Location detected! Please verify the address.");
            } else {
              throw new Error("Could not parse address");
            }
          } catch {
            setLocationStatus("error");
            toast.error("Could not get address from location");
          }
        },
        (error) => {
          if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
            tryGetPosition(false);
            return;
          }
          setLocationStatus("error");
          toast.error("Could not detect location. Please enter address manually.");
        },
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: highAccuracy ? 15000 : 30000,
          maximumAge: 60000
        }
      );
    };

    tryGetPosition(true);
  };

  const validateForm = (): boolean => {
    if (!customerForm.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!customerForm.phone.trim() || customerForm.phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (!customerForm.address.trim()) {
      toast.error("Please enter your delivery address");
      return false;
    }
    if (!customerForm.city.trim()) {
      toast.error("Please enter your city");
      return false;
    }
    if (!customerForm.state.trim()) {
      toast.error("Please enter your state");
      return false;
    }
    if (!customerForm.pincode.trim() || customerForm.pincode.length < 6) {
      toast.error("Please enter a valid pincode");
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Store user phone for order tracking
    localStorage.setItem("vijaycare_user", customerForm.phone);

    setIsProcessing(true);
    
    try {
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const { data: orderData, error: orderError } = await supabase.from("orders").insert({
        order_number: "",
        user_phone: customerForm.phone,
        items: orderItems,
        total_amount: total,
        status: "Processing",
        delivery_address: {
          full_name: customerForm.fullName,
          phone: customerForm.phone,
          address: customerForm.address,
          city: customerForm.city,
          state: customerForm.state,
          pincode: customerForm.pincode,
        },
        payment_method: selectedPayment
      }).select().single();

      if (orderError) throw orderError;

      // Update coupon usage if applied
      if (appliedCoupon) {
        const { data: couponData } = await supabase
          .from("coupons")
          .select("used_count")
          .eq("code", appliedCoupon)
          .single();
        
        if (couponData) {
          await supabase
            .from("coupons")
            .update({ used_count: (couponData.used_count || 0) + 1 })
            .eq("code", appliedCoupon);
        }
      }

      if (selectedPayment === "razorpay") {
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

        const options = {
          key: razorpayData.keyId,
          amount: razorpayData.amount,
          currency: razorpayData.currency,
          name: "Vijay Care",
          description: "Order Payment",
          order_id: razorpayData.orderId,
          handler: async function (response: any) {
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

            clearCart();
            toast.success("Payment successful! Order confirmed.");
            navigate(`/track-order/${orderData.order_number}`);
          },
          prefill: {
            contact: customerForm.phone,
            name: customerForm.fullName,
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
        return;
      }

      // COD order - send notification
      supabase.functions.invoke("send-push-notification", {
        body: {
          user_phone: customerForm.phone,
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
            {/* Left Column - Customer Details & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={customerForm.fullName}
                        onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={customerForm.phone}
                          onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          placeholder="10-digit phone number"
                          className="pl-10"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                      Delivery Address
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={requestLocation}
                      disabled={locationStatus === "loading"}
                      className="gap-1"
                    >
                      {locationStatus === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                      Detect Location
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea
                      id="address"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      placeholder="House/Flat No., Building, Street, Landmark"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={customerForm.city}
                        onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                        placeholder="City"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={customerForm.state}
                        onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                        placeholder="State"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={customerForm.pincode}
                        onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        placeholder="6-digit pincode"
                        className="mt-1"
                        maxLength={6}
                      />
                    </div>
                  </div>
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
                    onApply={(discount, code) => {
                      setAppliedCoupon(code);
                      setCouponDiscount(discount);
                    }}
                    onRemove={() => {
                      setAppliedCoupon(null);
                      setCouponDiscount(0);
                    }}
                    appliedCode={appliedCoupon}
                    appliedDiscount={couponDiscount}
                    userPhone={customerForm.phone || undefined}
                  />

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={shipping === 0 ? "text-green-600" : "text-foreground"}>
                        {shipping === 0 ? "Free" : `₹${shipping}`}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Coupon Discount</span>
                        <span className="text-green-600">-₹{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground text-lg">₹{total.toLocaleString()}</span>
                  </div>

                  {/* Delivery Address Summary */}
                  {customerForm.address && customerForm.city && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Delivering to:</p>
                      <p className="text-sm font-medium text-foreground">{customerForm.fullName}</p>
                      <p className="text-sm text-foreground line-clamp-2">{customerForm.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {customerForm.city}, {customerForm.state} - {customerForm.pincode}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Place Order • ₹${total.toLocaleString()}`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By placing this order, you agree to our Terms & Conditions
                  </p>
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
