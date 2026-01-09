import { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Shield, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserRole {
  id: string;
  user_phone: string;
  user_id: string;
  role: "admin" | "user";
  created_at: string;
}

interface UsersTabProps {
  loading: boolean;
  onRefresh: () => void;
}

const UsersTab = ({ loading, onRefresh }: UsersTabProps) => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserRole | null>(null);
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("admin");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setUsers(data || []);
    }
    setFetching(false);
  };

  const handleAddUser = async () => {
    if (!newUserPhone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    // Validate phone format (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = newUserPhone.replace(/\D/g, "").slice(-10);
    
    if (!phoneRegex.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }

    setSaving(true);
    const userPhone = localStorage.getItem("vijaycare_user");
    
    // Set user context for RLS
    if (userPhone) {
      await supabase.rpc("set_user_context" as any, { user_phone: userPhone });
    }

    // Check if user already has this role
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_phone", cleanPhone)
      .eq("role", newUserRole)
      .single();

    if (existing) {
      toast.error(`This user already has ${newUserRole} role`);
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("user_roles").insert({
      user_phone: cleanPhone,
      user_id: crypto.randomUUID(), // Generate a UUID for user_id
      role: newUserRole,
    });

    if (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user: " + error.message);
    } else {
      toast.success(`${newUserRole === "admin" ? "Admin" : "User"} added successfully!`);
      setIsAddOpen(false);
      setNewUserPhone("");
      setNewUserRole("admin");
      fetchUsers();
      onRefresh();
    }
    setSaving(false);
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    const currentUserPhone = localStorage.getItem("vijaycare_user");
    
    // Prevent deleting yourself
    if (deleteUser.user_phone === currentUserPhone) {
      toast.error("You cannot remove your own admin access");
      setDeleteUser(null);
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", deleteUser.id);

    if (error) {
      toast.error("Failed to remove user: " + error.message);
    } else {
      toast.success("User role removed successfully");
      fetchUsers();
      onRefresh();
    }
    setDeleteUser(null);
  };

  const currentUserPhone = localStorage.getItem("vijaycare_user");

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Manage Admin Users</h3>
              <p className="text-sm text-muted-foreground">Add or remove admin access</p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Admin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="e.g., 9876543210"
                      type="tel"
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the 10-digit phone number used for login
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as "admin" | "user")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            User
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser} disabled={saving}>
                      {saving ? "Adding..." : "Add Admin"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users with Roles ({users.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {fetching || loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users with special roles found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.user_phone}
                        {user.user_phone === currentUserPhone && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? (
                            <><Shield className="w-3 h-3 mr-1" /> Admin</>
                          ) : (
                            <><User className="w-3 h-3 mr-1" /> User</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell>
                        {user.user_phone !== currentUserPhone ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteUser(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteUser?.role} access for {deleteUser?.user_phone}? 
              They will no longer be able to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersTab;