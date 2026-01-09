import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CompareProvider } from "./contexts/CompareContext";
import ScrollToTop from "./components/ScrollToTop";
import AuthPage from "./pages/AuthPage";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import RepairRequestPage from "./pages/RepairRequestPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesPage from "./pages/CategoriesPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import AddressesPage from "./pages/AddressesPage";
import ComparePage from "./pages/ComparePage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <WishlistProvider>
        <CompareProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<AuthPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/repair" element={<RepairRequestPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/order-success" element={<OrderSuccessPage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/addresses" element={<AddressesPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/track-order" element={<OrderTrackingPage />} />
                <Route path="/track-order/:orderNumber" element={<OrderTrackingPage />} />
                <Route path="/admin" element={<AdminPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CompareProvider>
      </WishlistProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
