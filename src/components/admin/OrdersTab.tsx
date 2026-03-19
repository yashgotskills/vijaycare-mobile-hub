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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedModel?: string;
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

type JsonRecord = Record<string, unknown>;

const toRecord = (value: unknown): JsonRecord | null => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as JsonRecord;
};

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const pickString = (record: JsonRecord, keys: string[], fallback = ""): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
};

const pickNumber = (record: JsonRecord, keys: string[], fallback = 0): number => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return fallback;
};

const normalizeDeliveryAddress = (value: unknown): DeliveryAddress | null => {
  const parsed = parseMaybeJson(value);
  const record = toRecord(parsed);

  if (!record) return null;

  return {
    full_name: pickString(record, ["full_name", "fullName", "name"]),
    phone: pickString(record, ["phone", "mobile"]),
    address: pickString(record, ["address", "address_line1", "addressLine1", "street"]),
    city: pickString(record, ["city", "town"]),
    state: pickString(record, ["state", "province"]),
    pincode: pickString(record, ["pincode", "pin", "postal_code", "zip"]),
  };
};

const normalizeOrderItems = (value: unknown): OrderItem[] => {
  const parsed = parseMaybeJson(value);

  let rawItems: unknown[] = [];
  if (Array.isArray(parsed)) {
    rawItems = parsed;
  } else {
    const record = toRecord(parsed);
    if (record) {
      const nestedItems = parseMaybeJson(record.items);
      if (Array.isArray(nestedItems)) {
        rawItems = nestedItems;
      } else {
        rawItems = [record];
      }
    }
  }

  return rawItems
    .map((entry, index) => {
      const record = toRecord(parseMaybeJson(entry));
      if (!record) return null;

      const name = pickString(record, ["name", "product_name", "productName", "title"], "Unnamed Product");
      const price = pickNumber(record, ["price", "unit_price", "unitPrice", "amount"]);
      const quantity = Math.max(1, pickNumber(record, ["quantity", "qty", "count"], 1));
      const image = pickString(record, ["image", "image_url", "imageUrl", "product_image", "productImage"], "");
      const selectedModel = pickString(record, ["selectedModel", "selected_model", "model", "device_model", "deviceModel"], "");

      return {
        id: (record.id as string | number | undefined) ?? `${name}-${index}`,
        name,
        price,
        quantity,
        image: image || undefined,
        selectedModel: selectedModel || null,
      };
    })
    .filter((item): item is OrderItem => Boolean(item));
};

const formatCurrency = (amount: number | null | undefined) => `₹${Number(amount || 0).toLocaleString()}`;

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

  const filteredOrders = orders.filter((order) => {
    const addr = normalizeDeliveryAddress(order.delivery_address);
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (order.order_number || "").toLowerCase().includes(search) ||
      (order.user_phone || "").includes(searchTerm) ||
      (addr?.full_name || "").toLowerCase().includes(search);

    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
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
                {statusOptions.map((status) => (
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
                const addr = normalizeDeliveryAddress(order.delivery_address);
                const orderItems = normalizeOrderItems(order.items);
                const firstItem = orderItems[0];
                const isExpanded = expandedOrderId === order.id;
                const paymentLabel =
                  order.payment_method === "razorpay"
                    ? "Online (Razorpay)"
                    : order.payment_method === "cod" || !order.payment_method
                      ? "Cash on Delivery"
                      : order.payment_method;

                return (
                  <div key={order.id} className="border border-border rounded-lg overflow-hidden">
                    <div
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-semibold">{order.order_number}</span>
                            <Badge className={`${statusColors[order.status] || "bg-muted-foreground"} text-white text-xs`}>
                              {order.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {addr?.full_name || "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {order.user_phone}
                            </span>
                          </div>

                          {firstItem && (
                            <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                              <Package className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{firstItem.name}</span>
                              {firstItem.selectedModel && (
                                <Badge variant="outline" className="text-[10px] gap-1 max-w-[180px] truncate">
                                  <Smartphone className="h-3 w-3" />
                                  {firstItem.selectedModel}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 ml-11 md:ml-0">
                        {firstItem?.image && (
                          <img
                            src={firstItem.image}
                            alt={firstItem.name}
                            className="hidden sm:block h-10 w-10 rounded-md object-cover border border-border/60"
                            loading="lazy"
                          />
                        )}

                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                          <p className="text-xs text-muted-foreground">
                            {orderItems.length} item{orderItems.length !== 1 ? "s" : ""} · {paymentLabel}
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
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-semibold flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-primary" />
                              Delivery Address
                            </h4>
                            {addr ? (
                              <div className="text-sm text-muted-foreground pl-5 space-y-0.5">
                                <p className="font-medium text-foreground">{addr.full_name || "N/A"}</p>
                                <p>{addr.address || "N/A"}</p>
                                <p>{[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ") || "N/A"}</p>
                                <p className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {addr.phone || order.user_phone}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground pl-5">No address provided</p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-sm font-semibold">Order Info</h4>
                            <div className="text-sm text-muted-foreground space-y-0.5">
                              <p>Date: {new Date(order.created_at).toLocaleString()}</p>
                              <p>Payment: {paymentLabel}</p>
                              <p>Total: <span className="font-semibold text-foreground">{formatCurrency(order.total_amount)}</span></p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-1.5">
                            <Package className="h-4 w-4 text-primary" />
                            Items Ordered
                          </h4>

                          {orderItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No item details found for this order.</p>
                          ) : (
                            <div className="space-y-2">
                              {orderItems.map((item, idx) => (
                                <div key={`${item.id}-${idx}`} className="flex items-center gap-3 bg-background rounded-md p-2 border border-border/50">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded"
                                      loading="lazy"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                      <span>Qty: {item.quantity}</span>
                                      <span>{formatCurrency(item.price)}</span>
                                      {item.selectedModel && (
                                        <Badge variant="outline" className="text-xs gap-1">
                                          <Smartphone className="h-3 w-3" />
                                          {item.selectedModel}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm font-semibold">
                                    {formatCurrency((item.price || 0) * (item.quantity || 1))}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
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
