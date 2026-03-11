import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Package, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { DeviceModel, Brand, Product } from "@/types/product";

interface ModelsTabProps {
  loading: boolean;
  onRefresh: () => void;
}

const ModelsTab = ({ loading, onRefresh }: ModelsTabProps) => {
  const [models, setModels] = useState<(DeviceModel & { product_count: number })[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<DeviceModel | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", brand_id: "", image: "" });
  const [saving, setSaving] = useState(false);

  // Product assignment state
  const [assignModelId, setAssignModelId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [assignedProductIds, setAssignedProductIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState("");

  const adminPhone = localStorage.getItem("vijaycare_user") || "";

  useEffect(() => {
    fetchModels();
    fetchBrands();
  }, []);

  const fetchModels = async () => {
    const { data: modelsData } = await supabase
      .from("device_models")
      .select("*, brand:brands(*)")
      .order("name");

    if (!modelsData) return;

    // Get product counts
    const { data: counts } = await supabase
      .from("product_models")
      .select("model_id");

    const countMap: Record<string, number> = {};
    (counts || []).forEach((r: any) => {
      countMap[r.model_id] = (countMap[r.model_id] || 0) + 1;
    });

    setModels(
      (modelsData as unknown as DeviceModel[]).map((m) => ({
        ...m,
        product_count: countMap[m.id] || 0,
      }))
    );
  };

  const fetchBrands = async () => {
    const { data } = await supabase.from("brands").select("*").order("name");
    if (data) setBrands(data as Brand[]);
  };

  const generateSlug = (name: string) => {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return base;
  };

  const openCreateForm = () => {
    setEditingModel(null);
    setFormData({ name: "", slug: "", brand_id: "", image: "" });
    setShowForm(true);
  };

  const openEditForm = (model: DeviceModel) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      slug: model.slug,
      brand_id: model.brand_id || "",
      image: model.image || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Model name is required");
      return;
    }
    setSaving(true);
    const slug = formData.slug.trim() || generateSlug(formData.name);
    const modelData = { ...formData, slug };

    try {
      if (editingModel) {
        const { data, error } = await supabase.rpc("admin_update_model", {
          _admin_phone: adminPhone,
          _model_id: editingModel.id,
          _model_data: modelData as any,
        });
        if (error) throw error;
        const result = data as any;
        if (!result?.success) throw new Error(result?.error || "Failed");
        toast.success("Model updated");
      } else {
        const { data, error } = await supabase.rpc("admin_insert_model", {
          _admin_phone: adminPhone,
          _model_data: modelData as any,
        });
        if (error) throw error;
        const result = data as any;
        if (!result?.success) throw new Error(result?.error || "Failed");
        toast.success("Model created");
      }
      setShowForm(false);
      fetchModels();
    } catch (err: any) {
      toast.error(err.message || "Error saving model");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this model? All product assignments will be removed.")) return;
    const { data, error } = await supabase.rpc("admin_delete_model", {
      _admin_phone: adminPhone,
      _model_id: id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    const result = data as any;
    if (!result?.success) {
      toast.error(result?.error || "Failed");
      return;
    }
    toast.success("Model deleted");
    fetchModels();
  };

  // Product assignment
  const openAssignDialog = async (modelId: string) => {
    setAssignModelId(modelId);
    setProductSearch("");

    const [productsRes, assignedRes] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.from("product_models").select("product_id").eq("model_id", modelId),
    ]);

    setAllProducts((productsRes.data as unknown as Product[]) || []);
    setAssignedProductIds(new Set((assignedRes.data || []).map((r: any) => r.product_id)));
  };

  const toggleProductAssignment = async (productId: string) => {
    if (!assignModelId) return;
    const isAssigned = assignedProductIds.has(productId);

    try {
      if (isAssigned) {
        const { error } = await supabase.rpc("admin_unassign_product_from_model", {
          _admin_phone: adminPhone,
          _product_id: productId,
          _model_id: assignModelId,
        });
        if (error) throw error;
        setAssignedProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        const { error } = await supabase.rpc("admin_assign_product_to_model", {
          _admin_phone: adminPhone,
          _product_id: productId,
          _model_id: assignModelId,
        });
        if (error) throw error;
        setAssignedProductIds((prev) => new Set(prev).add(productId));
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Sort: assigned first
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aAssigned = assignedProductIds.has(a.id) ? 0 : 1;
    const bAssigned = assignedProductIds.has(b.id) ? 0 : 1;
    return aAssigned - bAssigned;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Device Models</h2>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="w-4 h-4" /> Create Model
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : models.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No models created yet. Create your first device model.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell className="font-medium">{model.name}</TableCell>
                <TableCell>{model.brand?.name || "—"}</TableCell>
                <TableCell>{model.product_count}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignDialog(model.id)}
                    >
                      <Package className="w-4 h-4 mr-1" /> Manage Products
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditForm(model)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(model.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Model Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModel ? "Edit Model" : "Create Model"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })
                }
                placeholder="e.g. iPhone 15 Pro Max"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Select
                value={formData.brand_id}
                onValueChange={(v) => setFormData({ ...formData, brand_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="Optional image URL"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : editingModel ? "Update Model" : "Create Model"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Products Dialog */}
      <Dialog open={!!assignModelId} onOpenChange={(open) => { if (!open) { setAssignModelId(null); fetchModels(); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Manage Products — {models.find((m) => m.id === assignModelId)?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-10"
              />
              {productSearch && (
                <button
                  onClick={() => setProductSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {assignedProductIds.size} products assigned. Click to toggle.
            </p>
            <div className="max-h-[50vh] overflow-y-auto space-y-1">
              {sortedProducts.map((product) => {
                const isAssigned = assignedProductIds.has(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleProductAssignment(product.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isAssigned
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-card border border-border/50 hover:bg-accent/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                        isAssigned ? "bg-primary text-primary-foreground" : "border border-border"
                      }`}
                    >
                      {isAssigned && <Check className="w-3 h-3" />}
                    </div>
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">₹{product.price}</p>
                    </div>
                  </button>
                );
              })}
              {sortedProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No products found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelsTab;
