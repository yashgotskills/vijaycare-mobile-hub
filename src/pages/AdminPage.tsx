import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Package, RefreshCw } from "lucide-react";
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
            </div>
            <Button variant="outline" onClick={fetchAll} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          <AdminStats stats={stats} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="orders" className="gap-2">
                Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="repairs" className="gap-2">
                Repairs ({repairs.length})
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                Products ({products.length})
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
          </Tabs>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminPage;
