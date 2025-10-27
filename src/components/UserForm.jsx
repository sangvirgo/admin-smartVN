"use client"

import { useState } from "react"
import { userService } from "../services/api"
import { AlertCircle, Loader } from "lucide-react"

const UserForm = ({ initialData, onSuccess }) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      email: "",
      password: "",
      role: "STAFF",
      isActive: true,
    },
  )
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      if (initialData) {
        // Update existing user
        const { password, ...updateData } = formData
        if (password) {
          updateData.password = password
        }
        await userService.update(initialData.id, updateData)
      } else {
        // Create new user
        await userService.create(formData)
      }
      setSuccess(true)
      setTimeout(() => onSuccess(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user")
      console.error("Form error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">User saved successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password {initialData && "(leave blank to keep current)"}
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!initialData}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          >
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-600"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Active User
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          {loading ? "Saving..." : initialData ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  )
}

export default UserForm
