export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_phone: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean | null
          label: string
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_phone: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean | null
          label?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_phone?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image: string | null
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          max_uses: number | null
          min_order_amount: number | null
          starts_at: string | null
          used_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          starts_at?: string | null
          used_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          min_order_amount?: number | null
          starts_at?: string | null
          used_count?: number | null
        }
        Relationships: []
      }
      device_models: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          image: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: Json | null
          id: string
          items: Json
          order_number: string
          payment_method: string | null
          status: string
          total_amount: number
          updated_at: string
          user_phone: string
        }
        Insert: {
          created_at?: string
          delivery_address?: Json | null
          id?: string
          items?: Json
          order_number: string
          payment_method?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_phone: string
        }
        Update: {
          created_at?: string
          delivery_address?: Json | null
          id?: string
          items?: Json
          order_number?: string
          payment_method?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_phone?: string
        }
        Relationships: []
      }
      product_models: {
        Row: {
          created_at: string
          id: string
          model_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_models_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_models_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          comparison_count: number | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          family_tag: string | null
          has_lifetime_warranty: boolean
          id: string
          images: Json | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          name: string
          original_price: number | null
          price: number
          rating_average: number | null
          review_count: number | null
          short_description: string | null
          sku: string | null
          slug: string
          specifications: Json | null
          stock_quantity: number
          updated_at: string
          variants: Json | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          comparison_count?: number | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          family_tag?: string | null
          has_lifetime_warranty?: boolean
          id?: string
          images?: Json | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name: string
          original_price?: number | null
          price: number
          rating_average?: number | null
          review_count?: number | null
          short_description?: string | null
          sku?: string | null
          slug: string
          specifications?: Json | null
          stock_quantity?: number
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          comparison_count?: number | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          family_tag?: string | null
          has_lifetime_warranty?: boolean
          id?: string
          images?: Json | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name?: string
          original_price?: number | null
          price?: number
          rating_average?: number | null
          review_count?: number | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          specifications?: Json | null
          stock_quantity?: number
          updated_at?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          updated_at: string
          user_phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_phone: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          updated_at?: string
          user_phone?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_phone: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_phone: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_phone?: string
        }
        Relationships: []
      }
      recently_viewed: {
        Row: {
          id: string
          product_id: string
          user_phone: string
          viewed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_phone: string
          viewed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_phone?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      repair_requests: {
        Row: {
          address: string
          brand: string
          created_at: string
          customer_name: string
          device_type: string
          id: string
          issue_description: string | null
          model: string | null
          preferred_date: string
          preferred_time: string
          repair_type: string
          request_number: string
          status: string
          updated_at: string
          user_phone: string
        }
        Insert: {
          address: string
          brand: string
          created_at?: string
          customer_name: string
          device_type: string
          id?: string
          issue_description?: string | null
          model?: string | null
          preferred_date: string
          preferred_time: string
          repair_type: string
          request_number: string
          status?: string
          updated_at?: string
          user_phone: string
        }
        Update: {
          address?: string
          brand?: string
          created_at?: string
          customer_name?: string
          device_type?: string
          id?: string
          issue_description?: string | null
          model?: string | null
          preferred_date?: string
          preferred_time?: string
          repair_type?: string
          request_number?: string
          status?: string
          updated_at?: string
          user_phone?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          images: Json | null
          is_verified: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_name: string | null
          user_phone: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_verified?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_name?: string | null
          user_phone: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: Json | null
          is_verified?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_name?: string | null
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          user_phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          user_phone: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          user_phone?: string
        }
        Relationships: []
      }
      warranty_claims: {
        Row: {
          admin_notes: string | null
          bill_number: string | null
          claim_number: string
          created_at: string
          customer_name: string
          id: string
          issue_description: string
          order_number: string | null
          photos: Json
          product_id: string | null
          product_name: string
          purchase_date: string | null
          purchase_source: string
          resolution: string | null
          status: string
          store_name: string | null
          updated_at: string
          user_phone: string
        }
        Insert: {
          admin_notes?: string | null
          bill_number?: string | null
          claim_number: string
          created_at?: string
          customer_name: string
          id?: string
          issue_description: string
          order_number?: string | null
          photos?: Json
          product_id?: string | null
          product_name: string
          purchase_date?: string | null
          purchase_source?: string
          resolution?: string | null
          status?: string
          store_name?: string | null
          updated_at?: string
          user_phone: string
        }
        Update: {
          admin_notes?: string | null
          bill_number?: string | null
          claim_number?: string
          created_at?: string
          customer_name?: string
          id?: string
          issue_description?: string
          order_number?: string | null
          photos?: Json
          product_id?: string | null
          product_name?: string
          purchase_date?: string | null
          purchase_source?: string
          resolution?: string | null
          status?: string
          store_name?: string | null
          updated_at?: string
          user_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranty_claims_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_assign_product_to_model: {
        Args: { _admin_phone: string; _model_id: string; _product_id: string }
        Returns: Json
      }
      admin_dashboard_stats: { Args: { _admin_phone: string }; Returns: Json }
      admin_delete_banner: {
        Args: { _admin_phone: string; _banner_id: string }
        Returns: Json
      }
      admin_delete_category: {
        Args: { _admin_phone: string; _category_id: string }
        Returns: Json
      }
      admin_delete_model: {
        Args: { _admin_phone: string; _model_id: string }
        Returns: Json
      }
      admin_delete_product: {
        Args: { _admin_phone: string; _product_id: string }
        Returns: Json
      }
      admin_insert_banner: {
        Args: { _admin_phone: string; _banner_data: Json }
        Returns: Json
      }
      admin_insert_category: {
        Args: { _admin_phone: string; _category_data: Json }
        Returns: Json
      }
      admin_insert_model: {
        Args: { _admin_phone: string; _model_data: Json }
        Returns: Json
      }
      admin_insert_product: {
        Args: { _admin_phone: string; _product_data: Json }
        Returns: Json
      }
      admin_list_banners: {
        Args: { _admin_phone: string }
        Returns: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "banners"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_orders: {
        Args: { _admin_phone: string }
        Returns: {
          created_at: string
          delivery_address: Json | null
          id: string
          items: Json
          order_number: string
          payment_method: string | null
          status: string
          total_amount: number
          updated_at: string
          user_phone: string
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_repair_requests: {
        Args: { _admin_phone: string }
        Returns: {
          address: string
          brand: string
          created_at: string
          customer_name: string
          device_type: string
          id: string
          issue_description: string | null
          model: string | null
          preferred_date: string
          preferred_time: string
          repair_type: string
          request_number: string
          status: string
          updated_at: string
          user_phone: string
        }[]
        SetofOptions: {
          from: "*"
          to: "repair_requests"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_list_warranty_claims: {
        Args: { _admin_phone: string }
        Returns: {
          admin_notes: string | null
          bill_number: string | null
          claim_number: string
          created_at: string
          customer_name: string
          id: string
          issue_description: string
          order_number: string | null
          photos: Json
          product_id: string | null
          product_name: string
          purchase_date: string | null
          purchase_source: string
          resolution: string | null
          status: string
          store_name: string | null
          updated_at: string
          user_phone: string
        }[]
        SetofOptions: {
          from: "*"
          to: "warranty_claims"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_unassign_product_from_model: {
        Args: { _admin_phone: string; _model_id: string; _product_id: string }
        Returns: Json
      }
      admin_update_banner: {
        Args: { _admin_phone: string; _banner_data: Json; _banner_id: string }
        Returns: Json
      }
      admin_update_category: {
        Args: {
          _admin_phone: string
          _category_data: Json
          _category_id: string
        }
        Returns: Json
      }
      admin_update_model: {
        Args: { _admin_phone: string; _model_data: Json; _model_id: string }
        Returns: Json
      }
      admin_update_order_status: {
        Args: { _admin_phone: string; _new_status: string; _order_id: string }
        Returns: Json
      }
      admin_update_product: {
        Args: { _admin_phone: string; _product_data: Json; _product_id: string }
        Returns: Json
      }
      admin_update_repair_status: {
        Args: { _admin_phone: string; _new_status: string; _repair_id: string }
        Returns: Json
      }
      admin_update_warranty_claim: {
        Args: {
          _admin_notes?: string
          _admin_phone: string
          _id: string
          _resolution?: string
          _status: string
        }
        Returns: {
          admin_notes: string | null
          bill_number: string | null
          claim_number: string
          created_at: string
          customer_name: string
          id: string
          issue_description: string
          order_number: string | null
          photos: Json
          product_id: string | null
          product_name: string
          purchase_date: string | null
          purchase_source: string
          resolution: string | null
          status: string
          store_name: string | null
          updated_at: string
          user_phone: string
        }
        SetofOptions: {
          from: "*"
          to: "warranty_claims"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_order: {
        Args: {
          _delivery_address: Json
          _items: Json
          _payment_method: string
          _total_amount: number
          _user_phone: string
        }
        Returns: {
          created_at: string
          delivery_address: Json | null
          id: string
          items: Json
          order_number: string
          payment_method: string | null
          status: string
          total_amount: number
          updated_at: string
          user_phone: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_repair_request: {
        Args: {
          _address: string
          _brand: string
          _customer_name: string
          _device_type: string
          _issue_description: string
          _model: string
          _preferred_date: string
          _preferred_time: string
          _repair_type: string
          _user_phone: string
        }
        Returns: {
          address: string
          brand: string
          created_at: string
          customer_name: string
          device_type: string
          id: string
          issue_description: string | null
          model: string | null
          preferred_date: string
          preferred_time: string
          repair_type: string
          request_number: string
          status: string
          updated_at: string
          user_phone: string
        }
        SetofOptions: {
          from: "*"
          to: "repair_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_warranty_claim: {
        Args: {
          _bill_number?: string
          _customer_name: string
          _issue_description: string
          _order_number?: string
          _photos?: Json
          _product_id?: string
          _product_name: string
          _purchase_date?: string
          _purchase_source?: string
          _store_name?: string
          _user_phone: string
        }
        Returns: {
          admin_notes: string | null
          bill_number: string | null
          claim_number: string
          created_at: string
          customer_name: string
          id: string
          issue_description: string
          order_number: string | null
          photos: Json
          product_id: string | null
          product_name: string
          purchase_date: string | null
          purchase_source: string
          resolution: string | null
          status: string
          store_name: string | null
          updated_at: string
          user_phone: string
        }
        SetofOptions: {
          from: "*"
          to: "warranty_claims"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_address: {
        Args: { _address_id: string; _user_phone: string }
        Returns: undefined
      }
      delete_push_subscription: {
        Args: { _endpoint: string }
        Returns: undefined
      }
      get_addresses: {
        Args: { _user_phone: string }
        Returns: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_phone: string
        }[]
        SetofOptions: {
          from: "*"
          to: "addresses"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_order_tracking: {
        Args: { _order_number: string }
        Returns: {
          created_at: string
          id: string
          items: Json
          order_number: string
          payment_method: string
          status: string
          total_amount: number
          updated_at: string
        }[]
      }
      get_orders_by_phone: {
        Args: { _user_phone: string }
        Returns: {
          created_at: string
          delivery_address: Json | null
          id: string
          items: Json
          order_number: string
          payment_method: string | null
          status: string
          total_amount: number
          updated_at: string
          user_phone: string
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_repair_requests_by_phone: {
        Args: { _user_phone: string }
        Returns: {
          address: string
          brand: string
          created_at: string
          customer_name: string
          device_type: string
          id: string
          issue_description: string | null
          model: string | null
          preferred_date: string
          preferred_time: string
          repair_type: string
          request_number: string
          status: string
          updated_at: string
          user_phone: string
        }[]
        SetofOptions: {
          from: "*"
          to: "repair_requests"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_warranty_claims_by_phone: {
        Args: { _user_phone: string }
        Returns: {
          admin_notes: string | null
          bill_number: string | null
          claim_number: string
          created_at: string
          customer_name: string
          id: string
          issue_description: string
          order_number: string | null
          photos: Json
          product_id: string | null
          product_name: string
          purchase_date: string | null
          purchase_source: string
          resolution: string | null
          status: string
          store_name: string | null
          updated_at: string
          user_phone: string
        }[]
        SetofOptions: {
          from: "*"
          to: "warranty_claims"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_phone: string
        }
        Returns: boolean
      }
      increment_coupon_usage: { Args: { _code: string }; Returns: undefined }
      is_valid_phone: { Args: { _phone: string }; Returns: boolean }
      save_address: {
        Args: {
          _address_id: string
          _address_line1: string
          _address_line2: string
          _city: string
          _full_name: string
          _is_default: boolean
          _label: string
          _phone: string
          _pincode: string
          _state: string
          _user_phone: string
        }
        Returns: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean | null
          label: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_phone: string
        }
        SetofOptions: {
          from: "*"
          to: "addresses"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_push_subscription: {
        Args: {
          _auth: string
          _endpoint: string
          _p256dh: string
          _user_phone: string
        }
        Returns: undefined
      }
      set_default_address: {
        Args: { _address_id: string; _user_phone: string }
        Returns: undefined
      }
      set_user_context: { Args: { user_phone: string }; Returns: undefined }
      validate_coupon: {
        Args: { _code: string; _subtotal: number }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
