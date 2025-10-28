"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from localStorage
useEffect(() => {
  const token = localStorage.getItem("accessToken") // Đổi từ "token"
  const userData = localStorage.getItem("user")

  if (token && userData) {
    try {
      setUser(JSON.parse(userData))
    } catch (err) {
      console.error("Failed to parse user data:", err)
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
    }
  }
  setLoading(false)
}, [])

const login = (userData, token) => {
  localStorage.setItem("accessToken", token) // Đổi từ "token"
  localStorage.setItem("user", JSON.stringify(userData))
  setUser(userData)
  setError(null)
}

const logout = () => {
  localStorage.removeItem("accessToken") // Đổi từ "token"
  localStorage.removeItem("user")
  setUser(null)
}

  const isAuthenticated = !!user
  const isAdmin = user?.role === "ADMIN"
  const isStaff = user?.role === "STAFF"

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
