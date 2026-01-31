import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CompareProvider } from "./contexts/CompareContext";
import ScrollToTop from "./components/ScrollToTop";
import AmbientBackground from "@/components/motion/AmbientBackground";
import PageTransition from "@/components/motion/PageTransition";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
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
            <ThemeProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <AmbientBackground />
                <PWAInstallPrompt />
                <Routes>
                 <Route
                   path="/"
                   element={
                     <PageTransition>
                       <ShopPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/cart"
                   element={
                     <PageTransition>
                       <CartPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/checkout"
                   element={
                     <PageTransition>
                       <CheckoutPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/profile"
                   element={
                     <PageTransition>
                       <ProfilePage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/wishlist"
                   element={
                     <PageTransition>
                       <WishlistPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/repair"
                   element={
                     <PageTransition>
                       <RepairRequestPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/product/:slug"
                   element={
                     <PageTransition>
                       <ProductDetailPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/category/:slug"
                   element={
                     <PageTransition>
                       <CategoryPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/categories"
                   element={
                     <PageTransition>
                       <CategoriesPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/order-success"
                   element={
                     <PageTransition>
                       <OrderSuccessPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/search"
                   element={
                     <PageTransition>
                       <SearchResultsPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/addresses"
                   element={
                     <PageTransition>
                       <AddressesPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/compare"
                   element={
                     <PageTransition>
                       <ComparePage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/track-order"
                   element={
                     <PageTransition>
                       <OrderTrackingPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/track-order/:orderNumber"
                   element={
                     <PageTransition>
                       <OrderTrackingPage />
                     </PageTransition>
                   }
                 />
                 <Route
                   path="/admin"
                   element={
                     <PageTransition>
                       <AdminPage />
                     </PageTransition>
                   }
                 />
                 {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                 <Route
                   path="*"
                   element={
                     <PageTransition>
                       <NotFound />
                     </PageTransition>
                   }
                 />
                </Routes>
              </BrowserRouter>
            </ThemeProvider>
          </TooltipProvider>
        </CompareProvider>
      </WishlistProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
