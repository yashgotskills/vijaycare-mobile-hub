export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  category_id: string | null;
  brand_id: string | null;
  sku: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  images: string[];
  variants: ProductVariant[];
  specifications: Record<string, string>;
  rating_average: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  brand?: Brand;
}

export interface ProductVariant {
  type: 'color' | 'size';
  name: string;
  value: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image: string | null;
  parent_id: string | null;
  description: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
}

export interface Review {
  id: string;
  product_id: string;
  user_phone: string;
  user_name: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  images: string[];
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

export interface Address {
  id: string;
  user_phone: string;
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

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  is_active: boolean;
  expires_at: string | null;
}
