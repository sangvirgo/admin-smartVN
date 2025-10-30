"use client"

import { useState, useEffect } from "react"
// SỬA: Thêm Navigate
import { useNavigate, Navigate } from "react-router-dom"
import { productService } from "../services/api"
// SỬA: Thêm usePermissions
import { usePermissions } from "../hooks/usePermissions" 
import { ArrowLeft, AlertCircle, Loader, Plus, X, Upload } from "lucide-react"

const CreateProductPage = () => {
  const navigate = useNavigate()
  
  // SỬA: Lấy permissions
  const permissions = usePermissions()

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    description: "",
    color: "",
    weight: "",
    dimension: "",
    batteryType: "",
    batteryCapacity: "",
    ramCapacity: "",
    romCapacity: "",
    screenSize: "",
    connectionPort: "",
    detailedReview: "",
    powerfulPerformance: "",
    topLevelCategory: "",
    secondLevelCategory: "",
    variants: []
  })
  
  const [categories, setCategories] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [createdProductId, setCreatedProductId] = useState(null)

  // SỬA: Thêm kiểm tra quyền
  if (!permissions.canCreateProduct) {
    return <Navigate to="/products" replace />
  }

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories()
      setCategories(response.data.data || [])
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  // Handle basic form fields
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle variants
  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { size: "", quantity: 0, price: 0, discountPercent: 0 }]
    }))
  }

  const handleRemoveVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Validate file types
    const validFiles = files.filter(file => 
      file.type.startsWith('image/')
    )
    
    if (validFiles.length !== files.length) {
      setError("Chỉ chấp nhận file ảnh (jpg, png, webp, etc.)")
      return
    }
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    
    setImageFiles(prev => [...prev, ...validFiles])
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const handleRemoveImage = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index])
    
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Upload images for a product
const uploadImages = async (productId) => {
  if (imageFiles.length === 0) return

  setUploadingImages(true)
  
  // ✅ FIX: Upload từng ảnh một và handle lỗi riêng
  const results = []
  const errors = []
  
  for (let i = 0; i < imageFiles.length; i++) {
    try {
      console.log(`📸 Uploading image ${i + 1}/${imageFiles.length}`)
      await productService.uploadImage(productId, imageFiles[i])
      results.push(imageFiles[i].name)
    } catch (err) {
      console.error(`❌ Failed to upload image ${i + 1}:`, err)
      errors.push(imageFiles[i].name)
    }
  }
  
  setUploadingImages(false)
  
  if (errors.length > 0) {
    console.warn(`⚠️ ${errors.length}/${imageFiles.length} images failed`)
    // Không throw error nữa - product đã tạo thành công
  } else {
    console.log(`✅ All ${results.length} images uploaded`)
  }
}

  // Main submit handler
const handleSubmit = async (e) => {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    // Validate categories
    if (!formData.topLevelCategory || !formData.secondLevelCategory) {
      throw new Error("Vui lòng chọn đầy đủ danh mục cấp 1 và cấp 2")
    }

    // Validate variants
    if (formData.variants.length === 0) {
      throw new Error("Vui lòng thêm ít nhất một biến thể sản phẩm")
    }

    // Prepare product data
    const productData = {
      title: formData.title,
      brand: formData.brand,
      description: formData.description,
      color: formData.color,
      weight: formData.weight,
      dimension: formData.dimension,
      batteryType: formData.batteryType,
      batteryCapacity: formData.batteryCapacity,
      ramCapacity: formData.ramCapacity,
      romCapacity: formData.romCapacity,
      screenSize: formData.screenSize,
      connectionPort: formData.connectionPort,
      detailedReview: formData.detailedReview,
      powerfulPerformance: formData.powerfulPerformance,
      topLevelCategory: formData.topLevelCategory,
      secondLevelCategory: formData.secondLevelCategory,
      variants: formData.variants.map(v => ({
        size: v.size,
        quantity: Number(v.quantity) || 0,
        price: Number(v.price) || 0,
        discountPercent: Number(v.discountPercent) || 0
      }))
    }

    console.log("📤 Sending product data:", productData)

    // Step 1: Create product
    const response = await productService.createProduct(productData)
    
    // ✅ FIX: Backend trả về nested data
    console.log("📥 Response structure:", response.data)
    const newProductId = response.data?.data?.id || response.data?.id
    
    console.log("✅ Created product ID:", newProductId)

    if (!newProductId) {
      throw new Error("Không nhận được ID sản phẩm từ server")
    }

    setCreatedProductId(newProductId)

    // Step 2: Upload images if any
    if (imageFiles.length > 0) {
      console.log(`📸 Uploading ${imageFiles.length} images for product ${newProductId}`)
      await uploadImages(newProductId)
    }

    // Success - redirect after a short delay
    setTimeout(() => {
      navigate("/products")
    }, 1500)

  } catch (err) {
    let errorMessage = "Tạo sản phẩm thất bại"
    
    console.error("❌ Full error:", err)
    console.error("❌ Error response:", err.response)
    
    if (err.response?.data) {
      if (typeof err.response.data === 'string') {
        errorMessage = err.response.data
      } else if (err.response.data.message) {
        errorMessage = err.response.data.message
      } else if (err.response.data.error) {
        errorMessage = err.response.data.error
      } else if (typeof err.response.data === 'object') {
        const validationErrors = Object.entries(err.response.data)
          .filter(([key]) => key !== 'data' && key !== 'status') // Skip metadata
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('; ')
        if (validationErrors) errorMessage = validationErrors
      }
    } else if (err.message) {
      errorMessage = err.message
    }

    setError(errorMessage)
  } finally {
    setLoading(false)
  }
}

  // Get second level categories based on top level selection
  const getSecondLevelCategories = () => {
    if (!formData.topLevelCategory || !Array.isArray(categories)) return []
    const topCategory = categories.find(cat => cat.name === formData.topLevelCategory)
    return Array.isArray(topCategory?.subCategories) ? topCategory.subCategories : []
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/products")} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={loading}
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo sản phẩm mới</h1>
          <p className="text-gray-600 mt-1">Thêm sản phẩm vào danh mục của bạn</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-lg shadow p-6 space-y-6">
        
        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        {createdProductId && !error && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              ✓ Sản phẩm đã được tạo thành công! {uploadingImages && "Đang upload ảnh..."}
            </p>
          </div>
        )}

        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="Tên sản phẩm" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
              placeholder="VD: iPhone 16 Pro Max"
            />
            <InputField 
              label="Thương hiệu" 
              name="brand" 
              value={formData.brand} 
              onChange={handleChange}
              required
              placeholder="VD: Apple"
            />
            <div className="md:col-span-2">
              <TextareaField 
                label="Mô tả" 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                required
                placeholder="Mô tả ngắn gọn về sản phẩm"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh mục</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <SelectField
              label="Danh mục cấp 1"
              name="topLevelCategory"
              value={formData.topLevelCategory}
              onChange={handleChange}
              required
              options={(categories || []).map(cat => ({ 
                value: cat.name, 
                label: cat.name 
              }))}
            />

            <SelectField
              label="Danh mục cấp 2"
              name="secondLevelCategory"
              value={formData.secondLevelCategory}
              onChange={handleChange}
              required
              disabled={!formData.topLevelCategory}
              options={getSecondLevelCategories().map(cat => ({ value: cat.name, label: cat.name }))}
            />

          </div>
        </div>

        {/* Specifications */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Màu sắc" name="color" value={formData.color} onChange={handleChange} placeholder="VD: Titan Tự Nhiên" />
            <InputField label="Trọng lượng" name="weight" value={formData.weight} onChange={handleChange} placeholder="VD: 225 g" />
            <InputField label="Kích thước" name="dimension" value={formData.dimension} onChange={handleChange} placeholder="VD: 160.8 x 77.2 x 8.3 mm" />
            <InputField label="Loại pin" name="batteryType" value={formData.batteryType} onChange={handleChange} placeholder="VD: Li-Ion" />
            <InputField label="Dung lượng pin" name="batteryCapacity" value={formData.batteryCapacity} onChange={handleChange} placeholder="VD: 4676 mAh" />
            <InputField label="RAM" name="ramCapacity" value={formData.ramCapacity} onChange={handleChange} placeholder="VD: 8 GB" />
            <InputField label="ROM" name="romCapacity" value={formData.romCapacity} onChange={handleChange} placeholder="VD: 256 GB" />
            <InputField label="Kích thước màn hình" name="screenSize" value={formData.screenSize} onChange={handleChange} placeholder="VD: 6.9 inch" />
            <InputField label="Cổng kết nối" name="connectionPort" value={formData.connectionPort} onChange={handleChange} placeholder="VD: Type-C" />
          </div>
        </div>

        {/* Detailed Content */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung chi tiết</h2>
          <div className="space-y-4">
            <TextareaField 
              label="Đánh giá chi tiết" 
              name="detailedReview" 
              value={formData.detailedReview} 
              onChange={handleChange}
              rows={4}
              placeholder="Đánh giá chi tiết về sản phẩm"
            />
            <TextareaField 
              label="Hiệu năng mạnh mẽ" 
              name="powerfulPerformance" 
              value={formData.powerfulPerformance} 
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả về hiệu năng của sản phẩm"
            />
          </div>
        </div>

        {/* Variants (Inventories) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Biến thể sản phẩm</h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Plus size={18} />
              Thêm biến thể
            </button>
          </div>

          <div className="space-y-3">
            {formData.variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-5 gap-3 items-end p-3 border rounded-lg">
                <InputField
                  label="Kích cỡ/Loại"
                  placeholder="VD: 256GB"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                  required
                />
                <InputField 
                  label="Số lượng" 
                  type="number" 
                  placeholder="0" 
                  value={variant.quantity} 
                  onChange={(e) => handleVariantChange(index, "quantity", e.target.value)} 
                  min="0" 
                  required
                />
                <InputField 
                  label="Giá (VNĐ)" 
                  type="number" 
                  placeholder="0" 
                  value={variant.price} 
                  onChange={(e) => handleVariantChange(index, "price", e.target.value)} 
                  step="1000" 
                  min="0" 
                  required
                />
                <InputField 
                  label="Giảm giá (%)" 
                  type="number" 
                  placeholder="0" 
                  value={variant.discountPercent} 
                  onChange={(e) => handleVariantChange(index, "discountPercent", e.target.value)} 
                  min="0" 
                  max="100"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                  className="p-2 h-10 hover:bg-red-50 rounded-lg transition-colors text-red-600 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            
            {formData.variants.length === 0 && (
              <p className="text-sm text-gray-500 italic">Chưa có biến thể nào. Vui lòng thêm ít nhất một biến thể.</p>
            )}
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh sản phẩm</h2>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Click để upload</span> hoặc kéo thả
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (MAX. 5MB)</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              multiple
              onChange={handleImageSelect}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            * Ảnh sẽ được upload sau khi tạo sản phẩm thành công
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-lg transition-colors"
            disabled={loading || uploadingImages}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {(loading || uploadingImages) && <Loader size={18} className="animate-spin" />}
            {loading ? "Đang tạo sản phẩm..." : uploadingImages ? "Đang upload ảnh..." : "Tạo sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  )
}

// Helper Components
const InputField = ({ label, name, value, onChange, type = "text", placeholder = "", required = false, min, max, step, disabled = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className="w-full h-10 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm disabled:bg-gray-100"
    />
  </div>
)

const TextareaField = ({ label, name, value, onChange, rows = 4, placeholder = "", required = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
    />
  </div>
)

const SelectField = ({ label, name, value, onChange, options = [], required = false, disabled = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {label}{required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full h-10 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm disabled:bg-gray-100"
    >
      <option value="">-- Chọn {label} --</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

export default CreateProductPage