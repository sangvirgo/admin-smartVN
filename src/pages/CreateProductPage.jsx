"use client"

import { useNavigate } from "react-router-dom"
import ProductForm from "../components/ProductForm"
import { ArrowLeft } from "lucide-react"

const CreateProductPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/products")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
          <p className="text-gray-600 mt-1">Add a new product to your catalog</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <ProductForm onSuccess={() => navigate("/products")} />
      </div>
    </div>
  )
}

export default CreateProductPage
