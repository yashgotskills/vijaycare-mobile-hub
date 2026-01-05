import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Package, Truck, CheckCircle2, Clock, 
  MapPin, Phone, Calendar, Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  items: any;
  delivery_address: any;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
}

const statusSteps = [
  { key: "Processing", label: "Order Placed", icon: Package },
  { key: "Confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "Shipped", label: "Shipped", icon: Truck },
  { key: "Out for Delivery", label: "Out for Delivery", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOrder, setSearchOrder] = useState(orderNumber || "");

  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  // Real-time subscription
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel('order-tracking')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`
        },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const fetchOrder = async (orderNum: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNum)
      .single();

    if (error || !data) {
      setOrder(null);
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrder.trim()) {
      navigate(`/track-order/${searchOrder.trim()}`);
      fetchOrder(searchOrder.trim());
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    const index = statusSteps.findIndex(s => s.key === order.status);
    return index >= 0 ? index : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-500";
      case "Out for Delivery": return "bg-blue-500";
      case "Shipped": return "bg-purple-500";
      case "Confirmed": return "bg-orange-500";
      case "Cancelled": return "bg-red-500";
      default: return "bg-yellow-500";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ShopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Track Your Order
            </h1>
          </div>

          {/* Search Box */}
          <Card className="mb-8 border-border/50">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Enter Order Number (e.g., ORD20260103XXXX)"
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button type="submit" size="lg">
                  Track Order
                </Button>
              </form>
            </CardContent>
          </Card>

          {loading ? (
            <div className="text-center py-16">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground animate-spin mb-4" />
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          ) : order ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Order Timeline */}
              <div className="lg:col-span-2">
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Order #{order.order_number}
                      </CardTitle>
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Timeline */}
                    <div className="relative mt-6">
                      {statusSteps.map((step, index) => {
                        const currentIndex = getCurrentStepIndex();
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="flex gap-4 pb-8 last:pb-0">
                            {/* Line */}
                            {index < statusSteps.length - 1 && (
                              <div 
                                className={`absolute left-5 w-0.5 h-16 ${
                                  isCompleted ? 'bg-primary' : 'bg-border'
                                }`}
                                style={{ top: `${index * 72 + 40}px` }}
                              />
                            )}
                            
                            {/* Icon */}
                            <div 
                              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isCompleted 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                            >
                              <StepIcon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-2">
                              <p className={`font-semibold ${
                                isCompleted ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Updated: {new Date(order.updated_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Details Sidebar */}
              <div className="space-y-6">
                {/* Delivery Address */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {order.delivery_address ? (
                      <>
                        <p>{order.delivery_address.address}</p>
                        <p>{order.delivery_address.city}, {order.delivery_address.state}</p>
                        <p>{order.delivery_address.pincode}</p>
                      </>
                    ) : (
                      <p>Address not available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Box className="w-4 h-4 text-primary" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.items?.map((item: any, index: number) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img 
                            src={item.image || "/placeholder.svg"} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-primary">₹{order.total_amount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Info */}
                <Card className="border-border/50">
                  <CardContent className="p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Ordered on {new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>Payment: {order.payment_method || "COD"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : orderNumber ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Order Not Found
              </h2>
              <p className="text-muted-foreground">
                We couldn't find an order with this number. Please check and try again.
              </p>
            </div>
          ) : (
            <div className="text-center py-16">
              <Truck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Enter Your Order Number
              </h2>
              <p className="text-muted-foreground">
                Use the search box above to track your order status in real-time.
              </p>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
