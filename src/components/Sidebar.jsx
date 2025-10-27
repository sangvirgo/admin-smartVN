"use client"

import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LayoutDashboard, Users, Package, ShoppingCart, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react"

const Sidebar = ({ isOpen }) => {
  const { isAdmin } = useAuth()
  const location = useLocation()

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "Users",
      path: "/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      label: "Products",
      path: "/products",
      icon: Package,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "Orders",
      path: "/orders",
      icon: ShoppingCart,
      roles: ["ADMIN", "STAFF"],
    },
    {
      label: "Reviews",
      path: "/reviews",
      icon: MessageSquare,
      roles: ["ADMIN", "STAFF"],
    },
  ]

  const visibleMenuItems = menuItems.filter((item) => {
    if (isAdmin) return true
    return item.roles.includes("STAFF")
  })

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
