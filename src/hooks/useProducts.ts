import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category, Brand, DeviceModel } from "@/types/product";

export const useProducts = (options?: {
  categorySlug?: string;
  categoryId?: string;
  brandId?: string;
  brandSlug?: string;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  limit?: number;
  modelId?: string;
}) => {
  return useQuery({
    queryKey: ["products", options],
    queryFn: async () => {
      let modelProductIds: string[] | null = null;
      if (options?.modelId) {
        const { data: pm } = await supabase
          .from("product_models")
          .select("product_id")
          .eq("model_id", options.modelId);
        modelProductIds = (pm || []).map((r: any) => r.product_id);
        if (modelProductIds.length === 0) return [];
      }

      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .order("created_at", { ascending: false });

      if (modelProductIds) query = query.in("id", modelProductIds);
      if (options?.categoryId) query = query.eq("category_id", options.categoryId);
      if (options?.brandId) query = query.eq("brand_id", options.brandId);
      if (options?.featured) query = query.eq("is_featured", true);
      if (options?.bestseller) query = query.eq("is_bestseller", true);
      if (options?.isNew) query = query.eq("is_new", true);
      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Product[];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as Product | null;
    },
    enabled: !!slug,
  });
};

export const useProductFamilyVariants = (
  productId: string | undefined,
  familyTag: string | null | undefined,
  categoryId: string | null | undefined,
) => {
  return useQuery({
    queryKey: ["product-family-variants", productId, familyTag, categoryId],
    queryFn: async () => {
      if (!familyTag || !categoryId) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq("family_tag", familyTag)
        .eq("category_id", categoryId)
        .neq("id", productId!)
        .order("name");

      if (error) throw error;
      return data as unknown as Product[];
    },
    enabled: !!productId && !!familyTag && !!categoryId,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Brand[];
    },
  });
};

export const useDeviceModels = () => {
  return useQuery({
    queryKey: ["device-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("device_models")
        .select("*, brand:brands(*)")
        .order("name");

      if (error) throw error;
      return data as unknown as DeviceModel[];
    },
  });
};

export const useModelsForCategory = (categoryId: string | undefined) => {
  return useQuery({
    queryKey: ["models-for-category", categoryId],
    queryFn: async () => {
      const { data: categoryProducts } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", categoryId!);

      if (!categoryProducts || categoryProducts.length === 0) return [];

      const productIds = categoryProducts.map((p) => p.id);
      const { data: productModels } = await supabase
        .from("product_models")
        .select("model_id")
        .in("product_id", productIds);

      if (!productModels || productModels.length === 0) return [];

      const uniqueModelIds = [...new Set(productModels.map((pm: any) => pm.model_id))];
      const { data: models, error } = await supabase
        .from("device_models")
        .select("*, brand:brands(*)")
        .in("id", uniqueModelIds)
        .order("name");

      if (error) throw error;
      return models as unknown as DeviceModel[];
    },
    enabled: !!categoryId,
  });
};

export const useProductReviews = (productId: string) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};

export const useRecentlyViewed = (userPhone: string) => {
  return useQuery({
    queryKey: ["recently-viewed", userPhone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recently_viewed")
        .select(`
          *,
          product:products(*)
        `)
        .eq("user_phone", userPhone)
        .order("viewed_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!userPhone,
  });
};
