// src/pages/UnauthorizedPage.jsx

"use client"

import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { AlertTriangle, LogOut } from "lucide-react"

const UnauthorizedPage = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <AlertTriangle
            size={48}
            className="text-red-500 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-6">
            Tài khoản của bạn (<strong>{user?.email || "User"}</strong>) với vai trò{" "}
            <strong>{user?.role || "Không xác định"}</strong> không có quyền truy
            cập vào trang quản trị này.
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage