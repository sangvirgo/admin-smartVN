"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { authService } from "../services/api"
import { AlertCircle, Loader } from "lucide-react"
import axiosInstance from "../services/axios" // Thêm dòng này

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

const handleSubmit = async (e) => {
  e.preventDefault()
  setError("")
  setLoading(true)

  try {
    const response = await axiosInstance.post("/login", {
      email,
      password,
    })
    
    const { accessToken, user } = response.data.data
    
    // Lưu token với key giống Customer
    localStorage.setItem("accessToken", accessToken) 
    localStorage.setItem("user", JSON.stringify(user))
    
    login(user, accessToken)
    navigate("/dashboard")
  } catch (err) {
    setError(err.message || "Login failed. Please try again.")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* <p className="text-center text-gray-600 text-sm mt-6">Demo credentials: admin@example.com / password123</p> */}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
