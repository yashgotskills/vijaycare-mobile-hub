import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WarrantyClaim {
  id: string;
  claim_number: string;
  user_phone: string;
  customer_name: string;
  product_name: string;
  purchase_source: string;
  order_number: string | null;
  bill_number: string | null;
  store_name: string | null;
  purchase_date: string | null;
  issue_description: string;
  status: string;
  admin_notes: string | null;
  resolution: string | null;
  created_at: string;
}

const statusOptions = ["Pending", "Under Review", "Approved", "Rejected", "Replaced"];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-500",
  "Under Review": "bg-blue-500",
  Approved: "bg-green-500",
  Rejected: "bg-red-500",
  Replaced: "bg-purple-500",
};

interface WarrantyTabProps {
  claims: WarrantyClaim[];
  loading: boolean;
  onRefresh: () => void;
}

const WarrantyTab = ({ claims, loading, onRefresh }: WarrantyTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const updateClaim = async (id: string, status: string) => {
    const adminPhone = localStorage.getItem("vijaycare_user");
    if (!adminPhone) {
      toast.error("Admin session not found.");
      return;
    }
    try {
      const { error } = await supabase.rpc("admin_update_warranty_claim" as any, {
        _admin_phone: adminPhone,
        _id: id,
        _status: status,
        _admin_notes: notes[id]?.trim() || null,
      });
      if (error) throw error;
      toast.success(`Claim marked as ${status}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update claim");
    }
  };

  const filtered = claims.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.claim_number.toLowerCase().includes(term) ||
      c.user_phone.includes(searchTerm) ||
      c.customer_name.toLowerCase().includes(term) ||
      c.product_name.toLowerCase().includes(term);
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
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
                placeholder="Search by claim number, phone, name or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Proof</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading claims...
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No warranty claims found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">{c.claim_number}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{c.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{c.user_phone}</div>
                  </TableCell>
                  <TableCell className="max-w-[160px]">{c.product_name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.purchase_source === "offline" ? (
                      <>
                        <div>Bill {c.bill_number}</div>
                        <div>{c.store_name || "Store"}</div>
                        <div>{c.purchase_date}</div>
                      </>
                    ) : (
                      <div>Order {c.order_number}</div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {c.issue_description}
                    </p>
                    {c.admin_notes && (
                      <p className="text-xs mt-1">Note: {c.admin_notes}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[c.status] || "bg-muted"} text-white`}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[220px] space-y-2">
                    <Textarea
                      rows={2}
                      placeholder="Admin note (optional)"
                      value={notes[c.id] ?? ""}
                      onChange={(e) => setNotes((p) => ({ ...p, [c.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Select onValueChange={(v) => updateClaim(c.id, v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onRefresh}>Refresh claims</Button>
      </div>
    </div>
  );
};

export default WarrantyTab;
