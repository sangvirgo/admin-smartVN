// src/components/PrivateRoute.jsx

"use client"

import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const PrivateRoute = () => {
  // Lấy thêm isAdmin và isStaff từ context
  const { isAuthenticated, loading, isAdmin, isStaff } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // 1. Kiểm tra xem người dùng đã đăng nhập chưa
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // 2. Kiểm tra xem người dùng có phải là ADMIN hoặc STAFF không
  // (CUSTOMER sẽ thất bại ở đây)
  if (!isAdmin && !isStaff) {
    return <Navigate to="/unauthorized" replace />
  }

  // 3. Nếu đã đăng nhập VÀ là Admin/Staff, cho phép truy cập
  return <Outlet />
}

export default PrivateRoute