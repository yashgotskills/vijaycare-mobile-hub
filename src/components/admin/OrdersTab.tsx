import { useState } from "react";
import { Search, Filter, RefreshCw, ChevronDown, ChevronUp, MapPin, Phone, User, Package, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedModel?: string | null;
}

interface DeliveryAddress {
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Order {
  id: string;
  order_number: string;
  user_phone: string;
  status: string;
  total_amount: number;
  items: any;
  delivery_address: any;
  payment_method: string | null;
  created_at: string;
}

const statusOptions = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

const statusColors: Record<string, string> = {
  "Processing": "bg-yellow-500",
  "Confirmed": "bg-orange-500",
  "Shipped": "bg-purple-500",
  "Out for Delivery": "bg-blue-500",
  "Delivered": "bg-green-500",
  "Cancelled": "bg-red-500"
};

interface OrdersTabProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

const OrdersTab = ({ orders, loading, onRefresh }: OrdersTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const userPhone = localStorage.getItem("vijaycare_user");
    if (!userPhone) {
      toast.error("Admin session not found.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("admin_update_order_status" as any, {
        _admin_phone: userPhone,
        _order_id: orderId,
        _new_status: newStatus,
      });
      if (error) throw error;
      if (data && !(data as any).success) throw new Error((data as any).error);
      toast.success(`Order status updated to ${newStatus}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const filteredOrders = orders.filter(order => {
    const addr = order.delivery_address as DeliveryAddress | null;
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_phone.includes(searchTerm) ||
      (addr?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, phone, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const addr = order.delivery_address as DeliveryAddress | null;
                const orderItems = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div key={order.id} className="border border-border rounded-lg overflow-hidden">
                    {/* Order Summary Row */}
                    <div
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold">{order.order_number}</span>
                            <Badge className={`${statusColors[order.status]} text-white text-xs`}>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {addr?.full_name || "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.user_phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-11 md:ml-0">
                        <div className="text-right">
                          <p className="font-semibold">₹{order.total_amount?.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {orderItems.length} item{orderItems.length !== 1 ? "s" : ""} · {order.payment_method || "COD"}
                          </p>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-36 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(status => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Delivery Address */}
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-semibold flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-primary" />
                              Delivery Address
                            </h4>
                            {addr ? (
                              <div className="text-sm text-muted-foreground pl-5 space-y-0.5">
                                <p className="font-medium text-foreground">{addr.full_name}</p>
                                <p>{addr.address}</p>
                                <p>{[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}</p>
                                <p className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {addr.phone || order.user_phone}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground pl-5">No address provided</p>
                            )}
                          </div>

                          {/* Order Info */}
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-semibold">Order Info</h4>
                            <div className="text-sm text-muted-foreground space-y-0.5">
                              <p>Date: {new Date(order.created_at).toLocaleString()}</p>
                              <p>Payment: {order.payment_method === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery"}</p>
                              <p>Total: <span className="font-semibold text-foreground">₹{order.total_amount?.toLocaleString()}</span></p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Items List */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-primary" />
                            Items Ordered
                          </h4>
                          <div className="space-y-2">
                            {orderItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-background rounded-md p-2 border border-border/50">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{item.name}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Qty: {item.quantity}</span>
                                    <span>₹{item.price?.toLocaleString()}</span>
                                    {item.selectedModel && (
                                      <Badge variant="outline" className="text-xs gap-1">
                                        <Smartphone className="h-3 w-3" />
                                        {item.selectedModel}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm font-semibold">
                                  ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersTab;
