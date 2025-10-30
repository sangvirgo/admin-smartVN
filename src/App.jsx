// src/App.jsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext" // SỬA: Thêm useAuth
import PrivateRoute from "./components/PrivateRoute"
import Layout from "./components/Layout"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import UsersPage from "./pages/UsersPage"
import UserDetailPage from "./pages/UserDetailPage"
import ProductsPage from "./pages/ProductsPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import CreateProductPage from "./pages/CreateProductPage"
import OrdersPage from "./pages/OrdersPage"
import OrderDetailPage from "./pages/OrderDetailPage"
import ReviewsPage from "./pages/ReviewsPage"

// (MỚI) Import trang không có quyền
import UnauthorizedPage from "./pages/UnauthorizedPage"

// THÊM: Component redirect thông minh
const SmartRedirect = () => {
  const { isAdmin, isAuthenticated, loading } = useAuth()

  // Nếu đang kiểm tra auth, không render gì cả
  if (loading) {
    return null; 
  }

  // Nếu chưa đăng nhập, PrivateRoute sẽ xử lý, nhưng đây là fallback
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Nếu đã đăng nhập, điều hướng theo vai trò
  return <Navigate to={isAdmin ? "/dashboard" : "/products"} replace />
}


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/create" element={<CreateProductPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
            </Route>
          </Route>

          {/* SỬA: Thay thế redirect cũ bằng SmartRedirect */}
          <Route path="/" element={<SmartRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App