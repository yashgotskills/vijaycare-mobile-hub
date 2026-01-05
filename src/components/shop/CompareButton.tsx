import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";
import { Product } from "@/types/product";

interface CompareButtonProps {
  product: Product;
  size?: "sm" | "default" | "icon";
}

const CompareButton = ({ product, size = "icon" }: CompareButtonProps) => {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  if (size === "icon") {
    return (
      <Button
        variant={inCompare ? "default" : "outline"}
        size="icon"
        onClick={handleClick}
        className={`${inCompare ? "bg-primary" : ""}`}
      >
        <GitCompare className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={inCompare ? "default" : "outline"}
      size={size}
      onClick={handleClick}
      className="gap-2"
    >
      <GitCompare className="w-4 h-4" />
      {inCompare ? "Remove from Compare" : "Compare"}
    </Button>
  );
};

export default CompareButton;
