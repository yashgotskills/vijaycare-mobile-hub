import { useState } from "react";
import { Ticket, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CouponInputProps {
  subtotal: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCode: string | null;
  appliedDiscount: number;
  userPhone?: string;
}

const CouponInput = ({ subtotal, onApply, onRemove, appliedCode, appliedDiscount, userPhone }: CouponInputProps) => {
  const [code, setCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validateCoupon = async () => {
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidating(true);

    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast.error("Invalid coupon code");
        return;
      }

      // Check expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error("This coupon has expired");
        return;
      }

      // Check start date
      if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
        toast.error("This coupon is not yet active");
        return;
      }

      // Check minimum order amount
      if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        toast.error(`Minimum order amount is ₹${coupon.min_order_amount.toLocaleString()}`);
        return;
      }

      // Check max uses
      if (coupon.max_uses && coupon.used_count && coupon.used_count >= coupon.max_uses) {
        toast.error("This coupon has reached its usage limit");
        return;
      }

      // Coupon-specific rules can be added here if needed.

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === "percentage") {
        discount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount_amount) {
          discount = Math.min(discount, coupon.max_discount_amount);
        }
      } else {
        discount = coupon.discount_value;
      }

      onApply(discount, coupon.code);
      toast.success(`Coupon applied! You save ₹${discount.toLocaleString()}`);
      setCode("");
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidating(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-600">
            {appliedCode} applied
          </span>
          <span className="text-sm text-green-600">
            (-₹{appliedDiscount.toLocaleString()})
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="pl-10 uppercase"
            disabled={isValidating}
          />
        </div>
        <Button
          variant="outline"
          onClick={validateCoupon}
          disabled={isValidating || !code.trim()}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CouponInput;
