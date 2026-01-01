import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category, Brand } from "@/types/product";

export const useProducts = (options?: {
  categorySlug?: string;
  brandSlug?: string;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["products", options],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .order("created_at", { ascending: false });

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
