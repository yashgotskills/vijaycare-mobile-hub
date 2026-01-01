import { useState } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Heart, Package, ChevronRight, Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";

// Mock data
const mockOrders = [
  { id: "ORD001", date: "2024-01-15", status: "Delivered", total: 2499, items: 2 },
  { id: "ORD002", date: "2024-01-10", status: "In Transit", total: 999, items: 1 },
  { id: "ORD003", date: "2024-01-05", status: "Processing", total: 4999, items: 3 },
];

const mockAddresses = [
  { id: 1, name: "Home", address: "123 Main Street, Apartment 4B", city: "Mumbai", state: "Maharashtra", pincode: "400001", phone: "9876543210", isDefault: true },
  { id: 2, name: "Office", address: "456 Business Park, Tower A", city: "Mumbai", state: "Maharashtra", pincode: "400051", phone: "9876543211", isDefault: false },
];

const mockWishlist = [
  { id: 1, name: "iPhone 15 Pro Max Case", price: 999, image: "https://images.unsplash.com/photo-1603791239531-1dda55e194a6?w=200" },
  { id: 2, name: "Samsung Galaxy S24 Ultra Cover", price: 899, image: "https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?w=200" },
  { id: 3, name: "Premium Wireless Earbuds", price: 2999, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200" },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const userPhone = localStorage.getItem("vijaycare_user") || "+91 9876543210";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "In Transit": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Processing": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default: return "bg-muted text-muted-foreground";
    }
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
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-heading font-bold text-foreground">My Account</h1>
                  <p className="text-muted-foreground">{userPhone}</p>
                </div>
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
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Addresses</span>
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
              
              {mockOrders.length > 0 ? (
                <div className="space-y-3">
                  {mockOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-foreground">{order.id}</span>
                                <Badge variant="outline" className={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {order.items} items • Ordered on {order.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-foreground">₹{order.total}</span>
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
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-foreground">Saved Addresses</h2>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add New
                </Button>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {mockAddresses.map((address) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className={`border-border/50 ${address.isDefault ? 'ring-2 ring-primary/30' : ''}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{address.name}</CardTitle>
                            {address.isDefault && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{address.address}</p>
                        <p className="text-sm text-muted-foreground">{address.city}, {address.state} - {address.pincode}</p>
                        <p className="text-sm text-muted-foreground mt-1">Phone: {address.phone}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-heading font-semibold text-foreground">My Wishlist</h2>
                <span className="text-sm text-muted-foreground">{mockWishlist.length} items</span>
              </div>
              
              {mockWishlist.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {mockWishlist.map((item) => (
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
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium text-foreground line-clamp-2 mb-2">{item.name}</h3>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground">₹{item.price}</span>
                            <Button size="sm">Add to Cart</Button>
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
                    <p className="text-muted-foreground">Your wishlist is empty</p>
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
