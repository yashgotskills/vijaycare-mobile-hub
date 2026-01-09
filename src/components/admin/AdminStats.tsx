import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, TrendingUp, Package, Users, Wrench } from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalRepairs: number;
    pendingRepairs: number;
  };
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
              <p className="text-xl font-bold text-foreground">{stats.totalOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-xl font-bold text-foreground">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-yellow-500/10">
              <Package className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Orders</p>
              <p className="text-xl font-bold text-foreground">{stats.pendingOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivered</p>
              <p className="text-xl font-bold text-foreground">{stats.deliveredOrders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-500/10">
              <Wrench className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Repairs</p>
              <p className="text-xl font-bold text-foreground">{stats.totalRepairs}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/10">
              <Wrench className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Repairs</p>
              <p className="text-xl font-bold text-foreground">{stats.pendingRepairs}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
