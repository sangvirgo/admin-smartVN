"use client"

import { useState } from "react"
import { productService } from "../services/api"
import { AlertCircle, Loader, Plus, Trash2 } from "lucide-react"

const ProductForm = ({ initialData, onSuccess }) => {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      description: "",
      sku: "",
      category: "ELECTRONICS",
      price: "",
      cost: "",
      stock: "",
      isActive: true,
      variants: [],
      images: [],
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

  const handleAddVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", value: "", price: 0 }],
    }))
  }

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  const handleVariantChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        cost: Number.parseFloat(formData.cost),
        stock: Number.parseInt(formData.stock),
      }

      if (initialData) {
        await productService.update(initialData.id, submitData)
      } else {
        await productService.create(submitData)
      }
      setSuccess(true)
      setTimeout(() => onSuccess(), 1500)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product")
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
          <p className="text-green-700 text-sm">Product saved successfully!</p>
        </div>
      )}

      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="SKU-001"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Product description"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="ELECTRONICS">Electronics</option>
              <option value="CLOTHING">Clothing</option>
              <option value="BOOKS">Books</option>
              <option value="HOME">Home & Garden</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
            <input
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
          <button
            type="button"
            onClick={handleAddVariant}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus size={18} />
            Add Variant
          </button>
        </div>

        <div className="space-y-3">
          {formData.variants.map((variant, index) => (
            <div key={index} className="flex gap-3 items-end">
              <input
                type="text"
                placeholder="Variant name (e.g., Color)"
                value={variant.name}
                onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Value (e.g., Red)"
                value={variant.value}
                onChange={(e) => handleVariantChange(index, "value", e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
              <input
                type="number"
                placeholder="Price"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, "price", Number.parseFloat(e.target.value))}
                step="0.01"
                min="0"
                className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
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
          Active Product
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
