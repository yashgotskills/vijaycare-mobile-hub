import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { Product } from "@/types/product";

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  const addToCompare = (product: Product) => {
    if (compareItems.length >= 4) {
      toast.error("Maximum 4 products can be compared");
      return;
    }
    if (compareItems.find(p => p.id === product.id)) {
      toast.info("Product already in compare list");
      return;
    }
    setCompareItems(prev => [...prev, product]);
    toast.success(`${product.name} added to compare`);
  };

  const removeFromCompare = (id: string) => {
    setCompareItems(prev => prev.filter(p => p.id !== id));
    toast.success("Product removed from compare");
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (id: string) => {
    return compareItems.some(p => p.id === id);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};
