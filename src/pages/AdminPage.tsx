import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, RefreshCw, Bell, Users, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import AdminStats from "@/components/admin/AdminStats";
import OrdersTab from "@/components/admin/OrdersTab";
import RepairsTab from "@/components/admin/RepairsTab";
import ProductsTab from "@/components/admin/ProductsTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import UsersTab from "@/components/admin/UsersTab";
import BannersTab from "@/components/admin/BannersTab";
import type { Product, Category } from "@/types/product";

interface Order {
  id: string;
  order_number: string;
  user_phone: string;
  status: string;
  total_amount: number;
  items: any;
  payment_method: string | null;
  created_at: string;
}

interface RepairRequest {
  id: string;
  request_number: string;
  user_phone: string;
  customer_name: string;
  device_type: string;
  brand: string;
  model: string | null;
  repair_type: string;
  issue_description: string | null;
  address: string;
  preferred_date: string;
  preferred_time: string;
  status: string;
  created_at: string;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRepairs: 0,
    pendingRepairs: 0
  });

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  // Real-time order notifications
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new as Order;
          toast.success(`🎉 New Order Received!`, {
            description: `Order #${newOrder.order_number} - ₹${newOrder.total_amount?.toLocaleString()}`,
            duration: 10000,
            action: {
              label: "View",
              onClick: () => setActiveTab("orders")
            }
          });
          
          setNewOrdersCount(prev => prev + 1);
          setOrders(prev => [newOrder, ...prev]);
          fetchStats();
          
          // Play notification sound
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2telejiDTIHb/tRXJd+QgNr+2lUl35CA2v7ZVibfj4Ha/9lVJt6Pgdr/2FUm3o+B2v/YVCfej4Ha/9hUJ9+Pgdr+2FQn34+B2v7XVCjfjoHa/9dTKN6Ogdr/11Mo3o6B2v/WUyjfjoLa/tZTKd6Ogdr+1lIp3o2C2v/WUinfjoLZ/9VSKt6Ogtn+1VIq346C2f7UUivei4TZ/tNTK96LhNn+0lMr3omF2f7RVCzeiIbZ/tBULN+Hidn+z1Ut34eJ2f7OVS3fhova/s1WLt+FjNr+zFYu34SM2v7LVy/fg43a/slYL9+Cjtr+yFgw34GO2v7HWTD/gI/Z/sZZMf9+kdn+xFoy/32T2f7DWzL/e5Ta/sJbM/96ldr+wFw0/3mW2v6+XDX/d5fa/rxdNv92mdr+ul43/3Sa2v64Xzj/c5za/rZgOf9xntr+tGE6/2+g2v6yYTv/baHa/q9jPP9rotj+rWQ8/2qk2P6rZT3/aKbY/qhmPv9np9j+p2Y+/2ao2P6lZz//ZKrY/qNoQP9iq9j+oWlB/2Cs1/6faUL/Xq7X/p1qQ/9cr9f+m2tE/1uw1/6Za0X/WbLW/pdsSP9Xstb+lG1I/1W11v6SbUn/U7bV/pBuSv9Rt9X+jm9L/0+41P6Mb0z/TbnU/otwTf9LutP+iHFP/0m70/6GclD/R7zS/oNzUv9FvdH+gHNU/0O+0f59dVb/Qb/Q/nt2WP8/wND+eHda/z3Azv51eFz/OsHO/nN5Xv84ws3+cHpg/zbDzf5te2L/M8TM/mp9ZP8wxMz+aH5m/y7Fy/5lf2n/K8bK/mKAa/8ox8n+YIJu/ybIyP5dhHH/I8nH/lqGdP8gyMf+V4h3/x7Jxv5Uinr/G8rF/lGNff8YysT+To+A/xXLw/5LkYT/Es3C/keUh/8Pz8H+RJaK/wzPwP5AmI7/CtHA/j2bkf8H0sD+Op2V/wTTv/43n5n/Adt//jShm/8F3H7+MKSf/wjffP4upp7/C+F7/imooP8O43n+J6ui/xDkeP8krqL/E+Z2/yGxo/8V6HT/HrOj/xfqcf8btqP/Gety/xi4ov8c7HD/FLui/x7ub/8SvaH/IO9u/w+/oP8h8W3/DcGe/yPybP8Kw5z/JPRq/wjFmv8l9Wn/BseY/yb3Z/8Eypb/J/hl/wLMk/8n+WT/AM2R/yj6Y/8AzY//KPti/wDOjf8p/GD/AM+L/yn9X/8A0Ij/Kf5e/wHRhf8p/13/AtKD/yn/W/8D04D/KgBa/wTUfv8qAVn/BdV7/yoCWP8G1nj/KgNX/wfXdf8qBFX/CNh0/yoFVP8J2XH/KgZT/wrac/8pB1H/C9tx/ykIT/8M3HD/KQlO/w3db/8pCk3/D95t/ykLTP8Q327/KQxL/xHgbP8oDEr/EuFr/ygNSf8T4mr/KA1I/xTjaf8oDkf/FeRn/ygOR/8W5Gb/KA9G/xflZf8oEEX/GOZk/ygRRP8Z52P/KBJD/xrnYv8oE0P/G+hh/ygUQv8c6WD/KBVB/x3pX/8oFkD/Hupd/ygXP/8f617/JxhA/yDsXv8nGT//Ie1c/ycaP/8i7Vv/JxpA/yPuWv8nG0D/JO9Z/yccQP8l8Fj/Jx0//ybxV/8nHkD/J/JW/ycfQP8o8lX/JyBA/yn0VP8nIUH/KvVT/yciQf8r9lL/JyNB/yz3Uf8nJEL/LfhQ/yclQv8u+U//JyZD/y/5Tv8nJkT/MPpN/ycnRP8x+0z/JyhF/zL8S/8nKEb/M/xK/ycoRv80/Un/JylH/zX+R/8nKkj/Nv9G/ycqSP83/0X/JytI/zj/RP8nLEn/Of9D');
            audio.volume = 0.5;
            audio.play();
          } catch (e) {
            // Ignore audio errors
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const checkAdminAndFetch = async () => {
    const userPhone = localStorage.getItem("vijaycare_user");
    if (!userPhone) {
      toast.error("Please login first");
      navigate("/");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_phone", userPhone)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      toast.error("Access denied. Admin only.");
      navigate("/shop");
      return;
    }

    setIsAdmin(true);
    fetchAll();
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchOrders(),
      fetchRepairs(),
      fetchProducts(),
      fetchCategories(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setOrders(data || []);
  };

  const fetchRepairs = async () => {
    const { data, error } = await supabase
      .from("repair_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setRepairs(data || []);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select(`*, category:categories(*), brand:brands(*)`)
      .order("created_at", { ascending: false });

    if (!error) setProducts((data as unknown as Product[]) || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (!error) setCategories(data || []);
  };

  const fetchStats = async () => {
    const [ordersResult, repairsResult] = await Promise.all([
      supabase.from("orders").select("status, total_amount"),
      supabase.from("repair_requests").select("status")
    ]);

    const allOrders = ordersResult.data || [];
    const allRepairs = repairsResult.data || [];

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const pendingOrders = allOrders.filter(o => 
      ["Processing", "Confirmed", "Shipped", "Out for Delivery"].includes(o.status)
    ).length;
    const deliveredOrders = allOrders.filter(o => o.status === "Delivered").length;
    const pendingRepairs = allRepairs.filter(r => 
      ["Pending", "Confirmed", "In Progress"].includes(r.status)
    ).length;

    setStats({
      totalOrders: allOrders.length,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      totalRepairs: allRepairs.length,
      pendingRepairs
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Checking access...</p>
        </div>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/shop")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
                Admin Dashboard
              </h1>
              {newOrdersCount > 0 && (
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <Bell className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">{newOrdersCount} new</span>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => {
              fetchAll();
              setNewOrdersCount(0);
            }} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          <AdminStats stats={stats} />

          <Tabs value={activeTab} onValueChange={(val) => {
            setActiveTab(val);
            if (val === "orders") setNewOrdersCount(0);
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="orders" className="gap-2 relative">
                Orders ({orders.length})
                {newOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {newOrdersCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="repairs" className="gap-2">
                Repairs ({repairs.length})
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-2">
                Categories ({categories.length})
              </TabsTrigger>
              <TabsTrigger value="banners" className="gap-2">
                <Image className="w-4 h-4" />
                Banners
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <OrdersTab 
                orders={orders} 
                loading={loading} 
                onRefresh={() => { fetchOrders(); fetchStats(); }} 
              />
            </TabsContent>

            <TabsContent value="repairs">
              <RepairsTab 
                repairs={repairs} 
                loading={loading} 
                onRefresh={() => { fetchRepairs(); fetchStats(); }} 
              />
            </TabsContent>

            <TabsContent value="products">
              <ProductsTab 
                products={products}
                categories={categories}
                loading={loading} 
                onRefresh={fetchProducts} 
              />
            </TabsContent>

            <TabsContent value="categories">
              <CategoriesTab 
                categories={categories}
                loading={loading} 
                onRefresh={fetchCategories} 
              />
            </TabsContent>

            <TabsContent value="banners">
              <BannersTab 
                loading={loading} 
                onRefresh={fetchAll} 
              />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab 
                loading={loading} 
                onRefresh={fetchAll} 
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;