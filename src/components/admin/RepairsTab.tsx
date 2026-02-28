import { useState } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const repairStatusOptions = [
  "Pending",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled"
];

const repairStatusColors: Record<string, string> = {
  "Pending": "bg-yellow-500",
  "Confirmed": "bg-blue-500",
  "In Progress": "bg-purple-500",
  "Completed": "bg-green-500",
  "Cancelled": "bg-red-500"
};

interface RepairsTabProps {
  repairs: RepairRequest[];
  loading: boolean;
  onRefresh: () => void;
}

const RepairsTab = ({ repairs, loading, onRefresh }: RepairsTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const updateRepairStatus = async (repairId: string, newStatus: string) => {
    const userPhone = localStorage.getItem("vijaycare_user");
    if (!userPhone) {
      toast.error("Admin session not found.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc("admin_update_repair_status" as any, {
        _admin_phone: userPhone,
        _repair_id: repairId,
        _new_status: newStatus,
      });
      if (error) throw error;
      if (data && !(data as any).success) throw new Error((data as any).error);
      toast.success(`Repair status updated to ${newStatus}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = 
      repair.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.user_phone.includes(searchTerm) ||
      repair.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || repair.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by request number, phone or name..."
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
                {repairStatusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Repair Requests ({filteredRepairs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
            </div>
          ) : filteredRepairs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No repair requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Repair Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRepairs.map((repair) => (
                    <TableRow key={repair.id}>
                      <TableCell className="font-mono text-sm">
                        {repair.request_number}
                      </TableCell>
                      <TableCell>{repair.customer_name}</TableCell>
                      <TableCell>{repair.user_phone}</TableCell>
                      <TableCell>
                        {repair.brand} {repair.model || repair.device_type}
                      </TableCell>
                      <TableCell>{repair.repair_type}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(repair.preferred_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">{repair.preferred_time}</TableCell>
                      <TableCell>
                        <Badge className={`${repairStatusColors[repair.status]} text-white`}>
                          {repair.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={repair.status} 
                          onValueChange={(value) => updateRepairStatus(repair.id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {repairStatusOptions.map(status => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RepairsTab;
