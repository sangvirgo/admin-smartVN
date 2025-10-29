import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { productService } from "../services/api"
import { AlertCircle, Loader, Plus, X, Upload, Trash2, Check } from "lucide-react"

const ProductForm = ({ initialData = null, onSuccess, onCancel }) => {
  const navigate = useNavigate()
  const isEditMode = !!initialData

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    brand: "",
    categoryId: "",
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
  })

  const [inventories, setInventories] = useState([])
  const [categories, setCategories] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [newImageFiles, setNewImageFiles] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories()
        setCategories(response.data?.data || [])
      } catch (err) {
        console.error("Failed to load categories:", err)
      }
    }
    fetchCategories()
  }, [])

  // Load initial data for edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        brand: initialData.brand || "",
        categoryId: initialData.categoryId || "",
        color: initialData.color || "",
        weight: initialData.weight || "",
        dimension: initialData.dimension || "",
        batteryType: initialData.batteryType || "",
        batteryCapacity: initialData.batteryCapacity || "",
        ramCapacity: initialData.ramCapacity || "",
        romCapacity: initialData.romCapacity || "",
        screenSize: initialData.screenSize || "",
        connectionPort: initialData.connectionPort || "",
        detailedReview: initialData.detailedReview || "",
        powerfulPerformance: initialData.powerfulPerformance || "",
      })
      setInventories(initialData.inventories?.map(inv => ({
        id: inv.id,
        size: inv.size || "",
        quantity: inv.quantity || 0,
        price: inv.price || 0,
        discountPercent: inv.discountPercent || 0,
        isExisting: true
      })) || [])
      setExistingImages(initialData.images || [])
    }
  }, [initialData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Inventory handlers
  const addInventory = () => {
    setInventories([...inventories, { 
      size: "", 
      quantity: 0, 
      price: 0, 
      discountPercent: 0,
      isExisting: false 
    }])
  }

  const updateInventory = (index, field, value) => {
    const updated = [...inventories]
    updated[index][field] = field === 'size' ? value : Number(value) || 0
    setInventories(updated)
  }

  // Image handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setNewImageFiles(prev => [...prev, ...files])
  }

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const markImageForDeletion = (imageId) => {
    if (!imagesToDelete.includes(imageId)) {
      setImagesToDelete(prev => [...prev, imageId])
    }
  }

  const unmarkImageForDeletion = (imageId) => {
    setImagesToDelete(prev => prev.filter(id => id !== imageId))
  }

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let productId = initialData?.id

      // Step 1: Create/Update product
      if (isEditMode) {
        await productService.updateProduct(productId, formData)
      } else {
        const response = await productService.createProduct(formData)
        productId = response.data?.data?.id || response.data?.id
      }

      if (!productId) {
        throw new Error("Không lấy được Product ID")
      }

      // Step 2: Handle inventories
      for (const inv of inventories) {
        const invData = {
          size: inv.size,
          quantity: inv.quantity,
          price: inv.price,
          discountPercent: inv.discountPercent
        }

        if (inv.isExisting && inv.id) {
          // Update existing inventory
          await productService.updateInventory(productId, inv.id, invData)
        } else {
          // Add new inventory
          await productService.addInventory(productId, invData)
        }
      }

      // Step 3: Delete marked images
      for (const imageId of imagesToDelete) {
        await productService.deleteImage(imageId)
      }

      // Step 4: Upload new images
      for (const file of newImageFiles) {
        await productService.uploadImage(productId, file)
      }

      setSuccess(true)
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          navigate("/products")
        }
      }, 1500)

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Có lỗi xảy ra"
      setError(errorMsg)
      console.error("Form submission error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <Check size={20} className="text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm">
            {isEditMode ? "Cập nhật thành công!" : "Tạo sản phẩm thành công!"}
          </p>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thương hiệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Technical Specs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Thông số kỹ thuật</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trọng lượng</label>
            <input
              type="text"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="VD: 200g"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước</label>
            <input
              type="text"
              name="dimension"
              value={formData.dimension}
              onChange={handleInputChange}
              placeholder="VD: 160x75x8mm"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Màn hình</label>
            <input
              type="text"
              name="screenSize"
              value={formData.screenSize}
              onChange={handleInputChange}
              placeholder="VD: 6.5 inch"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RAM</label>
            <input
              type="text"
              name="ramCapacity"
              value={formData.ramCapacity}
              onChange={handleInputChange}
              placeholder="VD: 8GB"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bộ nhớ</label>
            <input
              type="text"
              name="romCapacity"
              value={formData.romCapacity}
              onChange={handleInputChange}
              placeholder="VD: 256GB"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại Pin</label>
            <input
              type="text"
              name="batteryType"
              value={formData.batteryType}
              onChange={handleInputChange}
              placeholder="VD: Li-Po"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dung lượng Pin</label>
            <input
              type="text"
              name="batteryCapacity"
              value={formData.batteryCapacity}
              onChange={handleInputChange}
              placeholder="VD: 5000mAh"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cổng kết nối</label>
            <input
              type="text"
              name="connectionPort"
              value={formData.connectionPort}
              onChange={handleInputChange}
              placeholder="VD: USB-C"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Additional Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Nội dung chi tiết</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá chi tiết</label>
          <textarea
            name="detailedReview"
            value={formData.detailedReview}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hiệu năng mạnh mẽ</label>
          <textarea
            name="powerfulPerformance"
            value={formData.powerfulPerformance}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Inventories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Kho hàng & Giá</h3>
          <button
            type="button"
            onClick={addInventory}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus size={16} />
            Thêm biến thể
          </button>
        </div>

        {inventories.map((inv, index) => (

          <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Biến thể #{index + 1}</span>
              {/* Removed delete button - backend doesn't support inventory deletion */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Kích cỡ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={inv.size}
                  onChange={(e) => updateInventory(index, 'size', e.target.value)}
                  required
                  placeholder="VD: 128GB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={inv.quantity}
                  onChange={(e) => updateInventory(index, 'quantity', e.target.value)}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={inv.price}
                  onChange={(e) => updateInventory(index, 'price', e.target.value)}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Giảm giá (%)</label>
                <input
                  type="number"
                  value={inv.discountPercent}
                  onChange={(e) => updateInventory(index, 'discountPercent', e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {inventories.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-4">
            Chưa có biến thể nào. Nhấn "Thêm biến thể" để bắt đầu.
          </p>
        )}
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Hình ảnh sản phẩm</h3>

        {/* Existing Images */}
        {isEditMode && existingImages.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {existingImages.map(img => {
                const markedForDeletion = imagesToDelete.includes(img.id)
                return (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.downloadUrl}
                      alt={img.fileName}
                      className={`w-full aspect-square object-cover rounded-lg ${
                        markedForDeletion ? 'opacity-40' : ''
                      }`}
                    />
                    {markedForDeletion ? (
                      <button
                        type="button"
                        onClick={() => unmarkImageForDeletion(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600"
                        title="Khôi phục"
                      >
                        <Check size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Đánh dấu xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    {markedForDeletion && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Sẽ xóa
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isEditMode ? 'Thêm ảnh mới' : 'Tải ảnh lên'}
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <Upload size={18} />
              <span className="text-sm font-medium">Chọn file</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">
              {newImageFiles.length} file đã chọn
            </span>
          </div>

          {newImageFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {newImageFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel || (() => navigate("/products"))}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading || inventories.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          {isEditMode ? "Cập nhật" : "Tạo sản phẩm"}
        </button>
      </div>
    </form>
  )
}

export default ProductForm