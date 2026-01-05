import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/contexts/CompareContext";

const CompareFloatingButton = () => {
  const navigate = useNavigate();
  const { compareItems } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          size="lg"
          onClick={() => navigate("/compare")}
          className="rounded-full shadow-lg gap-2 pr-6"
        >
          <GitCompare className="w-5 h-5" />
          Compare ({compareItems.length})
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompareFloatingButton;
