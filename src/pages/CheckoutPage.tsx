import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MapPin, CreditCard, 
  Banknote, Check, Truck, Loader2, Navigation,
  Home, Building, Plus, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import CouponInput from "@/components/shop/CouponInput";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

interface SavedAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface DetectedAddress {
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

type AddressSource = "saved" | "detected" | "manual";

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
  
  // Address state
  const [addressSource, setAddressSource] = useState<AddressSource>("saved");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  
  // Location detection state
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [detectedAddress, setDetectedAddress] = useState<DetectedAddress | null>(null);
  
  // Manual address form
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState<DetectedAddress | null>(null);
  const [manualForm, setManualForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const userPhone = localStorage.getItem("vijaycare_user");

  const subtotal = totalPrice;
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal + shipping - couponDiscount;

  // Get the active delivery address based on source
  const getActiveAddress = (): DetectedAddress | null => {
    if (addressSource === "saved" && selectedSavedAddressId) {
      const saved = savedAddresses.find(a => a.id === selectedSavedAddressId);
      if (saved) {
        return {
          address: `${saved.address_line1}${saved.address_line2 ? `, ${saved.address_line2}` : ""}`,
          city: saved.city,
          state: saved.state,
          pincode: saved.pincode,
        };
      }
    }
    if (addressSource === "detected" && detectedAddress) {
      return detectedAddress;
    }
    if (addressSource === "manual" && manualAddress) {
      return manualAddress;
    }
    return null;
  };

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

  // Fetch saved addresses on mount
  useEffect(() => {
    if (userPhone) {
      fetchSavedAddresses();
    } else {
      setIsLoadingAddresses(false);
    }
  }, [userPhone]);

  const fetchSavedAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_phone", userPhone)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setSavedAddresses(data || []);
      
      // Auto-select default or first address
      if (data && data.length > 0) {
        const defaultAddr = data.find(a => a.is_default) || data[0];
        setSelectedSavedAddressId(defaultAddr.id);
        setAddressSource("saved");
      } else {
        // No saved addresses, try location detection
        setAddressSource("detected");
        requestLocation();
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
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
              setDetectedAddress({
                address: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(", ") || data.display_name?.split(",").slice(0, 2).join(",") || "Detected Location",
                city: addr.city || addr.town || addr.village || addr.county || "",
                state: addr.state || "",
                pincode: addr.postcode || "",
                lat: latitude,
                lng: longitude,
              });
              setLocationStatus("success");
              if (addressSource === "detected") {
                toast.success("Location detected successfully");
              }
            } else {
              throw new Error("Could not parse address");
            }
          } catch {
            setDetectedAddress({
              address: "Detected Location",
              city: "",
              state: "",
              pincode: "",
              lat: latitude,
              lng: longitude,
            });
            setLocationStatus("success");
          }
        },
        (error) => {
          if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
            tryGetPosition(false);
            return;
          }
          setLocationStatus("error");
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

  const handleManualAddressSubmit = () => {
    if (!manualForm.address || !manualForm.city || !manualForm.state || !manualForm.pincode) {
      toast.error("Please fill all address fields");
      return;
    }
    
    setManualAddress({
      address: manualForm.address,
      city: manualForm.city,
      state: manualForm.state,
      pincode: manualForm.pincode,
    });
    setAddressSource("manual");
    setIsManualDialogOpen(false);
    toast.success("Address added successfully");
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const activeAddress = getActiveAddress();
    if (!activeAddress) {
      toast.error("Please select or enter a delivery address");
      return;
    }

    if (!userPhone) {
      toast.error("Please login to place order");
      navigate("/");
      return;
    }

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
        user_phone: userPhone,
        items: orderItems,
        total_amount: total,
        status: "Processing",
        delivery_address: {
          address: activeAddress.address,
          city: activeAddress.city,
          state: activeAddress.state,
          pincode: activeAddress.pincode,
          lat: activeAddress.lat,
          lng: activeAddress.lng
        },
        payment_method: selectedPayment
      }).select().single();

      if (orderError) throw orderError;

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
        return;
      }

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

  const activeAddress = getActiveAddress();

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
                      onClick={() => navigate("/addresses")}
                      className="gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingAddresses ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-muted/30">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Loading addresses...</span>
                    </div>
                  ) : (
                    <>
                      {/* Saved Addresses */}
                      {savedAddresses.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Saved Addresses</Label>
                          <RadioGroup
                            value={addressSource === "saved" ? selectedSavedAddressId || "" : ""}
                            onValueChange={(id) => {
                              setSelectedSavedAddressId(id);
                              setAddressSource("saved");
                            }}
                            className="space-y-2"
                          >
                            {savedAddresses.map((addr) => (
                              <div
                                key={addr.id}
                                className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                                  addressSource === "saved" && selectedSavedAddressId === addr.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border/50 hover:border-primary/30'
                                }`}
                                onClick={() => {
                                  setSelectedSavedAddressId(addr.id);
                                  setAddressSource("saved");
                                }}
                              >
                                <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                                <div className={`p-2 rounded-lg ${
                                  addr.label === "home" 
                                    ? "bg-blue-500/10 text-blue-600" 
                                    : "bg-orange-500/10 text-orange-600"
                                }`}>
                                  {addr.label === "home" ? <Home className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-foreground text-sm">{addr.full_name}</span>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">{addr.label}</span>
                                    {addr.is_default && (
                                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {addr.address_line1}{addr.address_line2 && `, ${addr.address_line2}`}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {addr.city}, {addr.state} - {addr.pincode}
                                  </p>
                                </div>
                                {addressSource === "saved" && selectedSavedAddressId === addr.id && (
                                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                )}
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}

                      {/* Use Current Location */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Or use current location</Label>
                        <div
                          className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                            addressSource === "detected" && locationStatus === "success"
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 hover:border-primary/30'
                          }`}
                          onClick={() => {
                            if (locationStatus === "success") {
                              setAddressSource("detected");
                            } else {
                              requestLocation();
                              setAddressSource("detected");
                            }
                          }}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {locationStatus === "loading" ? (
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            ) : (
                              <Navigation className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            {locationStatus === "loading" && (
                              <span className="text-muted-foreground">Detecting your location...</span>
                            )}
                            {locationStatus === "error" && (
                              <div>
                                <p className="text-sm text-destructive mb-1">Could not detect location</p>
                                <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); requestLocation(); }} className="p-0 h-auto text-primary">
                                  Try again
                                </Button>
                              </div>
                            )}
                            {locationStatus === "success" && detectedAddress && (
                              <>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-foreground text-sm">Current Location</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{detectedAddress.address}</p>
                                {(detectedAddress.city || detectedAddress.state || detectedAddress.pincode) && (
                                  <p className="text-sm text-muted-foreground">
                                    {[detectedAddress.city, detectedAddress.state, detectedAddress.pincode].filter(Boolean).join(", ")}
                                  </p>
                                )}
                              </>
                            )}
                            {locationStatus === "idle" && (
                              <span className="text-muted-foreground">Click to detect your location</span>
                            )}
                          </div>
                          {addressSource === "detected" && locationStatus === "success" && (
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Manual Address Entry */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Or enter address manually</Label>
                        {manualAddress ? (
                          <div
                            className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                              addressSource === "manual"
                                ? 'border-primary bg-primary/5'
                                : 'border-border/50 hover:border-primary/30'
                            }`}
                            onClick={() => setAddressSource("manual")}
                          >
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-foreground text-sm">Manual Address</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{manualAddress.address}</p>
                              <p className="text-sm text-muted-foreground">
                                {[manualAddress.city, manualAddress.state, manualAddress.pincode].filter(Boolean).join(", ")}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); setIsManualDialogOpen(true); }}
                              className="text-xs"
                            >
                              Edit
                            </Button>
                            {addressSource === "manual" && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full gap-2 justify-start"
                            onClick={() => setIsManualDialogOpen(true)}
                          >
                            <Plus className="w-4 h-4" />
                            Enter address manually
                          </Button>
                        )}
                      </div>
                    </>
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
                    userPhone={userPhone || undefined}
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
                  {activeAddress && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Delivering to:</p>
                      <p className="text-sm text-foreground line-clamp-2">{activeAddress.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {[activeAddress.city, activeAddress.pincode].filter(Boolean).join(" - ")}
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !activeAddress}
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

                  {!activeAddress && (
                    <p className="text-xs text-destructive text-center">
                      Please select a delivery address
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />

      {/* Manual Address Dialog */}
      <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Delivery Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="manual_address">Full Address *</Label>
              <Textarea
                id="manual_address"
                value={manualForm.address}
                onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                placeholder="House/Flat No., Building, Street, Landmark"
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="manual_city">City *</Label>
                <Input
                  id="manual_city"
                  value={manualForm.city}
                  onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                  placeholder="City"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="manual_state">State *</Label>
                <Input
                  id="manual_state"
                  value={manualForm.state}
                  onChange={(e) => setManualForm({ ...manualForm, state: e.target.value })}
                  placeholder="State"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="manual_pincode">Pincode *</Label>
              <Input
                id="manual_pincode"
                value={manualForm.pincode}
                onChange={(e) => setManualForm({ ...manualForm, pincode: e.target.value })}
                placeholder="Enter pincode"
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleManualAddressSubmit} className="flex-1">
                Use This Address
              </Button>
              <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage;
