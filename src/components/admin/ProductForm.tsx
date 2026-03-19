import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Product, Category, Brand, DeviceModel } from "@/types/product";
import { useBrands, useDeviceModels } from "@/hooks/useProducts";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  original_price: z.number().optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  sku: z.string().optional(),
  family_tag: z.string().optional(),
  stock_quantity: z.number().min(0).default(0),
  is_featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
});

const generateUniqueSlug = (name: string) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const suffix = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  return `${base}-${suffix}`;
};

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSuccess: () => void;
}

const ProductForm = ({ product, categories, onSuccess }: ProductFormProps) => {
  const { data: brands = [] } = useBrands();
  const { data: deviceModels = [] } = useDeviceModels();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploading, setUploading] = useState(false);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      slug: product?.slug || "",
      description: product?.description || "",
      short_description: product?.short_description || "",
      price: product?.price || 0,
      original_price: product?.original_price || undefined,
      discount_percentage: product?.discount_percentage || 0,
      category_id: product?.category_id || undefined,
      brand_id: product?.brand_id || undefined,
      sku: product?.sku || "",
      family_tag: product?.family_tag || "",
      stock_quantity: product?.stock_quantity || 0,
      is_featured: product?.is_featured || false,
      is_new: product?.is_new || false,
      is_bestseller: product?.is_bestseller || false,
    },
  });

  const selectedBrandId = form.watch("brand_id");
  const filteredModels = selectedBrandId
    ? deviceModels.filter((m) => m.brand_id === selectedBrandId)
    : [];

  // Load existing device model assignments for this product
  useEffect(() => {
    if (!product?.id) return;
    const fetchAssignedModels = async () => {
      const { data } = await supabase
        .from("product_models")
        .select("model_id")
        .eq("product_id", product.id);
      if (data) setSelectedModelIds(data.map((r: any) => r.model_id));
    };
    fetchAssignedModels();
  }, [product?.id]);

  const toggleModel = (modelId: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        const errorMessage = error.message?.includes("Payload too large") 
          ? `${file.name} is too large. Max size is 5MB.`
          : error.message?.includes("mime type") 
            ? `${file.name} is not a supported image format.`
            : `Failed to upload ${file.name}: ${error.message || "Unknown error"}`;
        toast.error(errorMessage);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(urlData.publicUrl);
    }

    setImages([...images, ...uploadedUrls]);
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ProductFormValues) => {
    setLoading(true);

    const slug = values.slug?.trim() 
      ? values.slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : (product?.slug || generateUniqueSlug(values.name));

    const productData = {
      name: values.name,
      slug,
      description: values.description || null,
      short_description: values.short_description || null,
      price: values.price,
      original_price: values.original_price || null,
      discount_percentage: values.discount_percentage || 0,
      category_id: values.category_id || null,
      brand_id: values.brand_id || null,
      sku: values.sku || null,
      family_tag: values.family_tag?.trim() || null,
      stock_quantity: values.stock_quantity,
      is_featured: values.is_featured,
      is_new: values.is_new,
      is_bestseller: values.is_bestseller,
      images,
    };

    try {
      const userPhone = localStorage.getItem("vijaycare_user");
      if (!userPhone) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      let productId = product?.id;

      if (product) {
        const { data, error } = await supabase.rpc("admin_update_product" as any, {
          _admin_phone: userPhone,
          _product_id: product.id,
          _product_data: productData,
        });

        if (error) throw error;
        if (data && !(data as any).success) throw new Error((data as any).error);
      } else {
        const { data, error } = await supabase.rpc("admin_insert_product" as any, {
          _admin_phone: userPhone,
          _product_data: productData,
        });

        if (error) throw error;
        if (data && !(data as any).success) throw new Error((data as any).error);
        productId = (data as any).id;
      }

      // Save device model assignments
      if (productId) {
        // Clear all existing assignments first
        const { data: existing } = await supabase
          .from("product_models")
          .select("model_id")
          .eq("product_id", productId);

        for (const row of existing || []) {
          await supabase.rpc("admin_unassign_product_from_model" as any, {
            _admin_phone: userPhone,
            _product_id: productId,
            _model_id: (row as any).model_id,
          });
        }

        // Assign selected models
        for (const modelId of selectedModelIds) {
          await supabase.rpc("admin_assign_product_to_model" as any, {
            _admin_phone: userPhone,
            _product_id: productId,
            _model_id: modelId,
          });
        }
      }

      toast.success(product ? "Product updated successfully" : "Product added successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Product save error:", error);
      let errorMessage = "Failed to save product. Please try again.";
      
      if (error.message?.includes("duplicate key")) {
        errorMessage = "A product with this slug already exists. Please use a different name/slug.";
      } else if (error.message?.includes("violates row-level security")) {
        errorMessage = "Permission denied. Please ensure you're logged in as admin.";
      } else if (error.message?.includes("violates foreign key")) {
        errorMessage = "Invalid category selected. Please choose a valid category.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, {
        description: "Check the form fields and try again.",
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Images */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Product Images</label>
          <div className="flex flex-wrap gap-2">
            {images.map((url, index) => (
              <div key={index} className="relative w-20 h-20">
                <img 
                  src={url} 
                  alt={`Product ${index + 1}`} 
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors">
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="w-5 h-5 text-muted-foreground" />
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (auto-generated if empty)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Leave empty for auto-generate" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price (₹) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="original_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_percentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount %</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brand_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="family_tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Family Tag</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g. silicone-case"
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Same tag = grouped together. Users can switch between models.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Device Model Assignment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Compatible Device Models</label>
          <p className="text-xs text-muted-foreground">
            Select which phone models this product fits. Products with same Family Tag + different models will show a model switcher.
          </p>
          {!selectedBrandId && (
            <p className="text-xs text-destructive">Select a brand above to see compatible device models.</p>
          )}
          <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-card/50 max-h-48 overflow-y-auto">
            {selectedBrandId && filteredModels.length === 0 ? (
              <p className="text-xs text-muted-foreground">No device models found for this brand. Add them in the Models tab first.</p>
            ) : !selectedBrandId ? (
              <p className="text-xs text-muted-foreground">Please select a brand first.</p>
            ) : (
              filteredModels.map((model) => {
                const isSelected = selectedModelIds.includes(model.id);
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => toggleModel(model.id)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {model.name}
                  </button>
                );
              })
            )}
          </div>
          {selectedModelIds.length > 0 && (
            <p className="text-xs text-muted-foreground">{selectedModelIds.length} model(s) selected</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Featured Product</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_bestseller"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Best Seller</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_new"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="!mt-0">New Arrival</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {product ? "Update Product" : "Add Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
