"use client"

import { useState, useEffect } from "react" // Thêm useEffect
import { productService } from "../services/api"
import { AlertCircle, Loader, Plus, Trash2 } from "lucide-react"

// --- Tiện ích --- (Copy từ ProductDetailPage nếu cần)
const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0"; // Trả về chuỗi số
    return String(value); // Trả về chuỗi số
};

const ProductForm = ({ initialData, onSuccess, onCancel }) => { // Thêm onCancel prop
  // SỬA: Khởi tạo state dựa trên initialData mới
  const [formData, setFormData] = useState({
    title: "", // SỬA: name -> title
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
    categoryId: null, // SỬA: category -> categoryId
    active: true, // SỬA: isActive -> active
    inventories: [], // SỬA: variants -> inventories
    images: [], // Giữ nguyên
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState([]); // State cho danh mục

  // Lấy danh sách category khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            // Sử dụng axios trực tiếp nếu cần URL đầy đủ
            const response = await productService.getCategories();
            setCategories(response.data?.data || []);
        } catch (err) {
            console.error("Failed to load categories for form:", err);
            // Có thể set lỗi ở đây nếu cần
        }
    };
    fetchCategories();
  }, []);


  // SỬA: useEffect để cập nhật form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        brand: initialData.brand || "",
        description: initialData.description || "",
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
        categoryId: initialData.categoryId || null,
        active: initialData.active !== undefined ? initialData.active : true, // Xử lý undefined
        inventories: initialData.inventories || [],
        images: initialData.images || [],
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // --- SỬA: Các hàm xử lý inventories (thay cho variants) ---
  const handleAddInventory = () => {
    setFormData((prev) => ({
      ...prev,
      inventories: [...(prev.inventories || []), { size: "", quantity: 0, price: 0, discountPercent: 0 }],
    }))
  }

  const handleRemoveInventory = (index) => {
    setFormData((prev) => ({
      ...prev,
      inventories: prev.inventories.filter((_, i) => i !== index),
    }))
  }

  const handleInventoryChange = (index, field, value) => {
     // Chuyển đổi sang số nếu cần
     let processedValue = value;
     if (field === 'quantity' || field === 'price' || field === 'discountPercent') {
         processedValue = value === '' ? '' : Number(value); // Cho phép rỗng, sau đó chuyển thành số
     }

     setFormData((prev) => ({
       ...prev,
       inventories: prev.inventories.map((inv, i) =>
         i === index ? { ...inv, [field]: processedValue } : inv
       ),
     }));
   }
  // ---

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
        // Chuẩn bị dữ liệu gửi đi, đảm bảo các trường số là số
        const submitData = {
          ...formData,
          categoryId: formData.categoryId ? Number(formData.categoryId) : null,
          inventories: formData.inventories.map(inv => ({
            ...inv,
            quantity: inv.quantity === '' ? 0 : Number(inv.quantity), // Chuyển đổi quantity
            price: inv.price === '' ? 0 : Number(inv.price),         // Chuyển đổi price
            discountPercent: inv.discountPercent === '' ? 0 : Number(inv.discountPercent) // Chuyển đổi discount
          })),
        };

        // Loại bỏ discountedPrice vì backend sẽ tự tính
        submitData.inventories = submitData.inventories.map(({ discountedPrice, ...rest }) => rest);


      if (initialData?.id) { // Kiểm tra initialData.id thay vì chỉ initialData
        // SỬA: Gọi API update (giả sử tên hàm là updateProduct)
        await productService.updateProduct(initialData.id, submitData)
      } else {
        // SỬA: Gọi API create (giả sử tên hàm là createProduct)
        await productService.createProduct(submitData)
      }
      setSuccess(true)
      // Chờ một chút rồi gọi onSuccess
       setTimeout(() => {
            if (onSuccess) onSuccess(); // Gọi onSuccess nếu có
        }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save product")
      console.error("Form error:", err.response?.data || err)
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
          <p className="text-green-700 text-sm">Sản phẩm đã được lưu!</p>
        </div>
      )}

      {/* --- SỬA: Cập nhật các trường input --- */}

      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
            <input
              type="text"
              name="title" // SỬA: name -> title
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Tên sản phẩm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Thương hiệu"
            />
          </div>

           {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
            <select
                name="categoryId"
                value={formData.categoryId || ''} // Handle null/undefined case
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white" // Thêm bg-white
                >
                <option value="" disabled>-- Chọn danh mục --</option>
                {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                    </option>
                ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              placeholder="Mô tả sản phẩm"
            />
          </div>
        </div>
      </div>

       {/* Specifications */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thêm các input cho thông số */}
            <InputField label="Màu sắc" name="color" value={formData.color} onChange={handleChange} />
            <InputField label="Trọng lượng" name="weight" value={formData.weight} onChange={handleChange} />
            <InputField label="Kích thước" name="dimension" value={formData.dimension} onChange={handleChange} />
            <InputField label="Loại pin" name="batteryType" value={formData.batteryType} onChange={handleChange} />
            <InputField label="Dung lượng pin" name="batteryCapacity" value={formData.batteryCapacity} onChange={handleChange} />
            <InputField label="RAM" name="ramCapacity" value={formData.ramCapacity} onChange={handleChange} />
            <InputField label="ROM" name="romCapacity" value={formData.romCapacity} onChange={handleChange} />
            <InputField label="Kích thước màn hình" name="screenSize" value={formData.screenSize} onChange={handleChange} />
            <InputField label="Cổng kết nối" name="connectionPort" value={formData.connectionPort} onChange={handleChange} />
        </div>
      </div>

       {/* Detailed Content */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nội dung chi tiết</h2>
        <div className="space-y-4">
           <TextareaField label="Đánh giá chi tiết" name="detailedReview" value={formData.detailedReview} onChange={handleChange} rows={5}/>
           <TextareaField label="Hiệu năng mạnh mẽ" name="powerfulPerformance" value={formData.powerfulPerformance} onChange={handleChange} rows={3}/>
        </div>
      </div>


      {/* SỬA: Inventories (thay thế Variants) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Kho hàng (Biến thể)</h2>
          <button
            type="button"
            onClick={handleAddInventory}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Plus size={18} />
            Thêm biến thể
          </button>
        </div>

        <div className="space-y-3">
          {formData.inventories?.map((inventory, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end p-3 border rounded-lg">
              <InputField label="Kích cỡ/Loại" placeholder="VD: 256GB, Đỏ" value={inventory.size} onChange={(e) => handleInventoryChange(index, "size", e.target.value)} required/>
              <InputField label="Số lượng" type="number" placeholder="0" value={inventory.quantity} onChange={(e) => handleInventoryChange(index, "quantity", e.target.value)} min="0" required/>
              <InputField label="Giá gốc" type="number" placeholder="0" value={inventory.price} onChange={(e) => handleInventoryChange(index, "price", e.target.value)} step="1000" min="0" required/>
              <InputField label="Giảm giá (%)" type="number" placeholder="0" value={inventory.discountPercent} onChange={(e) => handleInventoryChange(index, "discountPercent", e.target.value)} min="0" max="100" />

              <button
                type="button"
                onClick={() => handleRemoveInventory(index)}
                className="p-2 h-10 mt-auto hover:bg-red-100 rounded-lg transition-colors text-red-600 flex items-center justify-center sm:col-start-5" // Căn chỉnh nút xóa
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
           {(!formData.inventories || formData.inventories.length === 0) && (
              <p className="text-sm text-gray-500 italic">Chưa có biến thể nào.</p>
            )}
        </div>
      </div>

      {/* SỬA: Status (dùng 'active') */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Đang hoạt động
        </label>
      </div>

      {/* Submit & Cancel */}
      <div className="flex gap-3 pt-4">
         {/* SỬA: Thêm nút Cancel */}
         {onCancel && (
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                Hủy
            </button>
         )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader size={18} className="animate-spin" />}
          {loading ? "Đang lưu..." : initialData?.id ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
        </button>
      </div>
    </form>
  )
}

// Helper components cho input và textarea
const InputField = ({ label, name, value, onChange, type = "text", placeholder = "", required = false, min, max, step }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name}
        value={value ?? ''} // Handle null/undefined
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm" // Giảm padding và font size
      />
    </div>
  );

  const TextareaField = ({ label, name, value, onChange, rows = 4, placeholder = "" }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={value ?? ''} // Handle null/undefined
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm" // Giảm padding và font size
      />
    </div>
  );


export default ProductForm