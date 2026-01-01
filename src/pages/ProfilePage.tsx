import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Heart, Package, ChevronRight, Trash2, Wrench, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import NotificationToggle from "@/components/NotificationToggle";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: unknown;
}

interface RepairRequest {
  id: string;
  request_number: string;
  created_at: string;
  status: string;
  device_type: string;
  brand: string;
  repair_type: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  const userPhone = localStorage.getItem("vijaycare_user") || "";
  const { addToCart } = useCart();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairRequests, setRepairRequests] = useState<RepairRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userPhone) {
      navigate("/");
      return;
    }
    fetchUserData();
  }, [userPhone, navigate]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_phone", userPhone)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch repair requests
      const { data: repairsData, error: repairsError } = await supabase
        .from("repair_requests")
        .select("*")
        .eq("user_phone", userPhone)
        .order("created_at", { ascending: false });

      if (repairsError) throw repairsError;
      setRepairRequests(repairsData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      image: item.image,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "in transit":
      case "in progress":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "processing":
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ShopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Profile Header */}
          <Card className="mb-6 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-heading font-bold text-foreground">My Account</h1>
                    <p className="text-muted-foreground">+91 {userPhone}</p>
                  </div>
                </div>
                <NotificationToggle />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="repairs" className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:inline">Repairs</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-foreground">Order History</h2>
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/50 animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-12 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-foreground">{order.order_number}</span>
                                <Badge variant="outline" className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {Array.isArray(order.items) ? order.items.length : 0} items • Ordered on {formatDate(order.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-foreground">₹{Number(order.total_amount).toLocaleString()}</span>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="p-8 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button onClick={() => navigate("/shop")}>Start Shopping</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Repairs Tab */}
            <TabsContent value="repairs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-foreground">Repair Requests</h2>
                <Button size="sm" onClick={() => navigate("/repair")}>New Request</Button>
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border-border/50 animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-12 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : repairRequests.length > 0 ? (
                <div className="space-y-3">
                  {repairRequests.map((repair) => (
                    <motion.div
                      key={repair.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-foreground">{repair.request_number}</span>
                                <Badge variant="outline" className={getStatusColor(repair.status)}>
                                  {repair.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {repair.brand} {repair.device_type} • {repair.repair_type}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Requested on {formatDate(repair.created_at)}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="p-8 text-center">
                    <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">No repair requests yet</p>
                    <Button onClick={() => navigate("/repair")}>Request Repair</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-foreground">My Wishlist</h2>
                <span className="text-sm text-muted-foreground">{wishlistItems.length} items</span>
              </div>
              
              {wishlistItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlistItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-border/50 overflow-hidden group">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-foreground line-clamp-2 mb-2">{item.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">₹{item.price}</span>
                            <Button size="sm" onClick={() => handleAddToCart(item)}>Add to Cart</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="border-border/50">
                  <CardContent className="p-8 text-center">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
                    <Button onClick={() => navigate("/shop")}>Explore Products</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
