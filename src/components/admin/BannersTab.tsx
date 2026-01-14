import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Edit2, Upload, GripVertical, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface BannersTabProps {
  loading: boolean;
  onRefresh: () => void;
}

const BannersTab = ({ loading, onRefresh }: BannersTabProps) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const setUserContext = async () => {
    const userPhone = localStorage.getItem("vijaycare_user");
    if (userPhone) {
      await supabase.rpc("set_user_context" as any, { user_phone: userPhone });
    }
  };

  const fetchBanners = async () => {
    setFetchLoading(true);
    await setUserContext();
    
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      // Try fetching all banners for admin view
      const { data: allData, error: allError } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (!allError) {
        setBanners(allData || []);
      }
    } else {
      setBanners(data || []);
    }
    setFetchLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `banner-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, file);

    if (error) {
      toast.error("Failed to upload image");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Image uploaded!");
  };

  const resetForm = () => {
    setTitle("");
    setImageUrl("");
    setLink("");
    setIsActive(true);
    setEditingBanner(null);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setImageUrl(banner.image_url);
    setLink(banner.link || "");
    setIsActive(banner.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !imageUrl.trim()) {
      toast.error("Title and image are required");
      return;
    }

    setSaving(true);
    await setUserContext();

    const bannerData = {
      title,
      image_url: imageUrl,
      link: link || null,
      is_active: isActive,
      display_order: editingBanner?.display_order || banners.length,
    };

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", editingBanner.id);

        if (error) throw error;
        toast.success("Banner updated!");
      } else {
        const { error } = await supabase
          .from("banners")
          .insert([bannerData]);

        if (error) throw error;
        toast.success("Banner added!");
      }

      setDialogOpen(false);
      resetForm();
      fetchBanners();
      onRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBanner) return;

    await setUserContext();
    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", deletingBanner.id);

    if (error) {
      toast.error("Failed to delete banner");
    } else {
      toast.success("Banner deleted!");
      fetchBanners();
      onRefresh();
    }
    setDeletingBanner(null);
  };

  const toggleBannerActive = async (banner: Banner) => {
    await setUserContext();
    const { error } = await supabase
      .from("banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);

    if (error) {
      toast.error("Failed to update banner");
    } else {
      fetchBanners();
    }
  };

  if (fetchLoading || loading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Banners ({banners.length})</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingBanner ? "Edit Banner" : "Add New Banner"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Banner Image *</Label>
                    {imageUrl ? (
                      <div className="relative">
                        <img 
                          src={imageUrl} 
                          alt="Banner preview" 
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => setImageUrl("")}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                        {uploading ? (
                          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Click to upload banner image</span>
                            <span className="text-xs text-muted-foreground">Recommended: 1920x576</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Banner title"
                    />
                  </div>

                  {/* Link */}
                  <div className="space-y-2">
                    <Label htmlFor="link">Link (optional)</Label>
                    <Input
                      id="link"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Active</Label>
                    <Switch
                      id="active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleSave}
                    disabled={saving || !title.trim() || !imageUrl.trim()}
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingBanner ? "Update Banner" : "Add Banner"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No banners yet. Add your first banner!
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-shrink-0">
                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-32 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{banner.title}</h4>
                    {banner.link && (
                      <p className="text-sm text-muted-foreground truncate">{banner.link}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleBannerActive(banner)}
                      title={banner.is_active ? "Deactivate" : "Activate"}
                    >
                      {banner.is_active ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingBanner(banner)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingBanner} onOpenChange={() => setDeletingBanner(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBanner?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BannersTab;
