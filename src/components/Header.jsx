"use client"

import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { Menu, LogOut, User } from "lucide-react"

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Menu size={24} className="text-gray-600" />
      </button>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <User size={20} />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{user?.name || "User"}</p>
            <p className="text-gray-500 text-xs">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}

export default Header
