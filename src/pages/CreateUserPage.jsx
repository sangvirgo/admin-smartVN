"use client"

import { useNavigate } from "react-router-dom"
import UserForm from "../components/UserForm"
import { ArrowLeft } from "lucide-react"

const CreateUserPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/users")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
          <p className="text-gray-600 mt-1">Add a new user to the system</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <UserForm onSuccess={() => navigate("/users")} />
      </div>
    </div>
  )
}

export default CreateUserPage
