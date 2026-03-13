import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./shared/components/ProtectedRoute";

// Auth
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";

// Home
import HomePage from "./features/home/pages/HomePage";

// Products
import PLPPage from "./features/products/pages/PLPPage";
import PDPPage from "./features/products/pages/PDPPage";

// Checkout
import CheckoutPage from "./features/checkout/pages/CheckoutPage";

// Orders
import OrdersPage from "./features/orders/pages/OrdersPage";
import OrderDetailPage from "./features/orders/pages/OrderDetailPage";

// Wishlist
import WishlistPage from "./features/wishlist/pages/WishlistPage";

// Admin
import DashboardPage from "./features/admin/pages/DashboardPage";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<PLPPage />} />
    <Route path="/products/:slug" element={<PDPPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Protected */}
    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
    <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
    <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

    {/* Admin */}
    <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
