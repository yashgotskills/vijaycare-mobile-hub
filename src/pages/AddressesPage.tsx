import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Plus, MapPin, Edit2, Trash2, Check, 
  Home, Building, Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ShopHeader from "@/components/shop/ShopHeader";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const AddressesPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const userPhone = localStorage.getItem("vijaycare_user");

  // Form state
  const [formData, setFormData] = useState({
    label: "home",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false,
  });

  useEffect(() => {
    if (!userPhone) {
      navigate("/");
      return;
    }
    fetchAddresses();
  }, [userPhone]);

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_phone", userPhone)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      label: "home",
      full_name: "",
      phone: userPhone || "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
      is_default: false,
    });
    setEditingAddress(null);
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        full_name: address.full_name,
        phone: address.phone,
        address_line1: address.address_line1,
        address_line2: address.address_line2 || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        is_default: address.is_default || false,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.phone || !formData.address_line1 || 
        !formData.city || !formData.state || !formData.pincode) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSaving(true);

    try {
      // If setting as default, unset others first
      if (formData.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_phone", userPhone);
      }

      if (editingAddress) {
        // Update existing
        const { error } = await supabase
          .from("addresses")
          .update({
            ...formData,
            address_line2: formData.address_line2 || null,
          })
          .eq("id", editingAddress.id);

        if (error) throw error;
        toast.success("Address updated successfully");
      } else {
        // Create new
        const { error } = await supabase.from("addresses").insert({
          ...formData,
          address_line2: formData.address_line2 || null,
          user_phone: userPhone,
        });

        if (error) throw error;
        toast.success("Address added successfully");
      }

      setIsDialogOpen(false);
      fetchAddresses();
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
      toast.success("Address deleted");
      fetchAddresses();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Unset all defaults first
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_phone", userPhone);

      // Set new default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;
      toast.success("Default address updated");
      fetchAddresses();
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error("Failed to update default address");
    }
  };

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
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Saved Addresses
              </h1>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : addresses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No addresses saved
                </h3>
                <p className="text-muted-foreground mb-6">
                  Add an address for faster checkout
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  Add Your First Address
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <AnimatePresence>
                {addresses.map((address) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className={`relative overflow-hidden ${
                      address.is_default ? "border-primary" : ""
                    }`}>
                      {address.is_default && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                          Default
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            address.label === "home" 
                              ? "bg-blue-500/10 text-blue-600" 
                              : "bg-orange-500/10 text-orange-600"
                          }`}>
                            {address.label === "home" ? (
                              <Home className="h-5 w-5" />
                            ) : (
                              <Building className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">
                                {address.full_name}
                              </span>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">
                                {address.label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.address_line1}
                              {address.address_line2 && `, ${address.address_line2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Phone: {address.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(address)}
                            className="gap-1"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(address.id)}
                            className="gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                          {!address.is_default && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(address.id)}
                              className="gap-1 ml-auto"
                            >
                              <Check className="h-4 w-4" />
                              Set as Default
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>

      {/* Address Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Edit Address" : "Add New Address"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Address Type */}
            <div>
              <Label className="mb-2 block">Address Type</Label>
              <RadioGroup
                value={formData.label}
                onValueChange={(value) => setFormData({ ...formData, label: value })}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home" className="flex items-center gap-1 cursor-pointer">
                    <Home className="h-4 w-4" /> Home
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="office" id="office" />
                  <Label htmlFor="office" className="flex items-center gap-1 cursor-pointer">
                    <Building className="h-4 w-4" /> Office
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Full Name */}
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter full name"
                className="mt-1"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                className="mt-1"
              />
            </div>

            {/* Address Line 1 */}
            <div>
              <Label htmlFor="address_line1">Address Line 1 *</Label>
              <Textarea
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                placeholder="House/Flat No., Building, Street"
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <Label htmlFor="address_line2">Address Line 2</Label>
              <Input
                id="address_line2"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                placeholder="Landmark (optional)"
                className="mt-1"
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Enter pincode"
                className="mt-1"
              />
            </div>

            {/* Default Address */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                Set as default address
              </Label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingAddress ? (
                  "Update Address"
                ) : (
                  "Add Address"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AddressesPage;