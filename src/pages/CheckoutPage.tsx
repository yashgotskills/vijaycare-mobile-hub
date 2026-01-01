import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, MapPin, Plus, CreditCard, Smartphone, 
  Banknote, Check, Truck, ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

const savedAddresses: Address[] = [
  { id: 1, name: "Home", address: "123 Main Street, Apartment 4B", city: "Mumbai", state: "Maharashtra", pincode: "400001", phone: "9876543210", isDefault: true },
  { id: 2, name: "Office", address: "456 Business Park, Tower A", city: "Mumbai", state: "Maharashtra", pincode: "400051", phone: "9876543211", isDefault: false },
];

const paymentMethods = [
  { id: "cod", name: "Cash on Delivery", icon: Banknote, description: "Pay when you receive" },
  { id: "upi", name: "UPI Payment", icon: Smartphone, description: "GPay, PhonePe, Paytm" },
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState<number>(savedAddresses.find(a => a.isDefault)?.id || 1);
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const subtotal = totalPrice;
  const shipping = subtotal > 500 ? 0 : 49;
  const total = subtotal + shipping;

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.address || !newAddress.city || !newAddress.pincode || !newAddress.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    toast.success("Address added successfully");
    setIsAddingAddress(false);
    setNewAddress({ name: "", address: "", city: "", state: "", pincode: "", phone: "" });
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    clearCart();
    toast.success("Order placed successfully!");
    navigate("/shop");
    setIsProcessing(false);
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
              {/* Delivery Address */}
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                      Delivery Address
                    </CardTitle>
                    <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Plus className="w-4 h-4" />
                          Add New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Address</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="name">Address Label</Label>
                              <Input 
                                id="name" 
                                placeholder="Home, Office, etc."
                                value={newAddress.name}
                                onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input 
                                id="phone" 
                                placeholder="10-digit number"
                                value={newAddress.phone}
                                onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="address">Full Address</Label>
                            <Input 
                              id="address" 
                              placeholder="House no., Street, Landmark"
                              value={newAddress.address}
                              onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input 
                                id="city" 
                                placeholder="City"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input 
                                id="state" 
                                placeholder="State"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="pincode">Pincode</Label>
                              <Input 
                                id="pincode" 
                                placeholder="6-digit"
                                value={newAddress.pincode}
                                onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                              />
                            </div>
                          </div>
                          <Button className="w-full" onClick={handleAddAddress}>
                            Save Address
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={String(selectedAddress)} 
                    onValueChange={(val) => setSelectedAddress(Number(val))}
                    className="space-y-3"
                  >
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`relative flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                          selectedAddress === addr.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedAddress(addr.id)}
                      >
                        <RadioGroupItem value={String(addr.id)} id={`addr-${addr.id}`} className="mt-1" />
                        <Label htmlFor={`addr-${addr.id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{addr.name}</span>
                            {addr.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.address}</p>
                          <p className="text-sm text-muted-foreground">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">Phone: {addr.phone}</p>
                        </Label>
                        {selectedAddress === addr.id && (
                          <Check className="w-5 h-5 text-primary absolute top-4 right-4" />
                        )}
                      </div>
                    ))}
                  </RadioGroup>
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
                    disabled={isProcessing}
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
