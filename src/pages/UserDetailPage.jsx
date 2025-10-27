"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { userService } from "../services/api"
import UserForm from "../components/UserForm"
import { AlertCircle, Loader, ArrowLeft } from "lucide-react"

const UserDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getById(id)
        setUser(response.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user")
        console.error("User detail error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={24} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/users")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Back to Users
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading User</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/users")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
          <p className="text-gray-600 mt-1">Update user information</p>
        </div>
      </div>

      {/* Form */}
      {user && (
        <div className="max-w-2xl">
          <UserForm initialData={user} onSuccess={() => navigate("/users")} />
        </div>
      )}
    </div>
  )
}

export default UserDetailPage
