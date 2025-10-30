"use client"

import { Link, useLocation } from "react-router-dom"
// SỬA: Bỏ useAuth, thay bằng usePermissions
import { usePermissions } from "../hooks/usePermissions"
import { LayoutDashboard, Users, Package, ShoppingCart, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"

const Sidebar = ({ isOpen }) => {
  // SỬA: Lấy permissions
  const permissions = usePermissions()
  const location = useLocation()

  // SỬA: Dùng cờ 'show' từ permissions
  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      show: permissions.canViewDashboard,
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
      show: permissions.canViewUsers,
    },
    {
      label: "Products",
      path: "/products",
      icon: Package,
      show: permissions.canViewProducts,
    },
    {
      label: "Orders",
      path: "/orders",
      icon: ShoppingCart,
      show: permissions.canViewOrders,
    },
    {
      label: "Reviews",
      path: "/reviews",
      icon: MessageSquare,
      show: permissions.canViewReviews,
    },
  ]

  // SỬA: Lọc dựa trên cờ 'show'
  const visibleMenuItems = menuItems.filter((item) => item.show)

  const isActive = (path) => location.pathname === path

  return (
    <aside className={`${isOpen ? "w-64" : "w-20"} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold">Admin</h1>}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
              title={!isOpen ? item.label : ""}
            >
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
          title={isOpen ? "" : "Toggle sidebar"}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar