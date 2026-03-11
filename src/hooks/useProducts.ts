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
      // If filtering by model, first get product IDs from junction table
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

      if (modelProductIds) {
        query = query.in("id", modelProductIds);
      }
      if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
      }
      if (options?.brandId) {
        query = query.eq("brand_id", options.brandId);
      }
      if (options?.featured) {
        query = query.eq("is_featured", true);
      }
      if (options?.bestseller) {
        query = query.eq("is_bestseller", true);
      }
      if (options?.isNew) {
        query = query.eq("is_new", true);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

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
      // Get all product IDs in this category
      const { data: categoryProducts } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", categoryId!);

      if (!categoryProducts || categoryProducts.length === 0) return [];

      const productIds = categoryProducts.map((p) => p.id);

      // Get model IDs that have at least one product in this category
      const { data: productModels } = await supabase
        .from("product_models")
        .select("model_id")
        .in("product_id", productIds);

      if (!productModels || productModels.length === 0) return [];

      const uniqueModelIds = [...new Set(productModels.map((pm: any) => pm.model_id))];

      // Fetch those models
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
