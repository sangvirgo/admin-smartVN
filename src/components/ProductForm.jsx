"use client"

import { useState, useEffect } from "react"
import { productService } from "../services/api"
import { AlertCircle, Loader, Plus } from "lucide-react" // Xóa Trash2 khỏi import

// --- Tiện ích ---
const formatCurrency = (value) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return "0";
    return String(numValue);
};

const ProductForm = ({ initialData, onSuccess, onCancel }) => {
  // Khởi tạo state không có categoryId
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
    active: true,
    inventories: [],
    images: [],
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
        active: initialData.active !== undefined ? initialData.active : true,
        // Đảm bảo inventories là một mảng, ngay cả khi API trả về null
        inventories: Array.isArray(initialData.inventories) ? initialData.inventories : [],
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

  // --- Các hàm xử lý inventories ---
  const handleAddInventory = () => {
    setFormData((prev) => ({
      ...prev,
      inventories: [...(prev.inventories || []), { size: "", quantity: '', price: '', discountPercent: '' }], // Khởi tạo giá trị số là chuỗi rỗng
    }))
  }

  // Xóa hàm handleRemoveInventory vì không còn nút xóa
  // const handleRemoveInventory = (index) => { ... }

  const handleInventoryChange = (index, field, value) => {
     let processedValue = value;
     if (field === 'quantity' || field === 'price' || field === 'discountPercent') {
         processedValue = value; // Giữ nguyên là chuỗi để cho phép xóa
     } else if (field === 'size') {
         processedValue = String(value);
     }

     setFormData((prev) => {
        // Đảm bảo inventories luôn là mảng
        const currentInventories = Array.isArray(prev.inventories) ? prev.inventories : [];
        return {
            ...prev,
            inventories: currentInventories.map((inv, i) =>
                i === index ? { ...inv, [field]: processedValue } : inv
            ),
        };
     });
   }
  // ---

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
        // Chuẩn bị dữ liệu inventories để gửi đi
        const processedInventories = (formData.inventories || []).map(inv => {
            const quantity = inv.quantity === '' || isNaN(Number(inv.quantity)) ? 0 : Number(inv.quantity);
            const price = inv.price === '' || isNaN(Number(inv.price)) ? 0 : Number(inv.price);
            const discountPercent = inv.discountPercent === '' || isNaN(Number(inv.discountPercent)) ? 0 : Number(inv.discountPercent);

            // Chỉ bao gồm id nếu nó tồn tại (cho update)
            const inventoryPayload = {
                size: String(inv.size || ''), // Đảm bảo size là chuỗi
                quantity: quantity,
                price: price,
                discountPercent: discountPercent,
            };
            if (inv.id) {
                inventoryPayload.id = inv.id;
            }
            return inventoryPayload;
        });


        // Dữ liệu cuối cùng để gửi
        const submitData = {
          ...formData, // Lấy các trường thông tin sản phẩm khác
          inventories: processedInventories, // Sử dụng inventories đã xử lý
        };

         // Loại bỏ các trường không cần thiết khác nếu có (ví dụ: images nếu backend không xử lý)
         delete submitData.images;


      if (initialData?.id) {
        // Gọi API updateProduct với toàn bộ thông tin sản phẩm và inventories
        await productService.updateProduct(initialData.id, submitData)
      } else {
        // Gọi API createProduct
        // Khi tạo mới, backend sẽ bỏ qua 'id' trong inventories nếu có
        await productService.createProduct(submitData)
      }
      setSuccess(true)
       setTimeout(() => {
            if (onSuccess) onSuccess();
        }, 1500);
    } catch (err) {
      // Cố gắng hiển thị lỗi cụ thể hơn từ backend nếu có
      let errorMessage = "Lưu sản phẩm thất bại";
      if (err.response?.data) {
          if (typeof err.response.data === 'string') {
              errorMessage = err.response.data;
          } else if (err.response.data.message) {
              errorMessage = err.response.data.message;
          } else if (err.response.data.error) {
               errorMessage = err.response.data.error;
          }
          // Check for validation errors (nếu backend trả về dạng object)
          else if (typeof err.response.data === 'object') {
             const validationErrors = Object.values(err.response.data).flat().join(', ');
             if (validationErrors) errorMessage += `: ${validationErrors}`;
          }
      } else if (err.message) {
          errorMessage = err.message;
      }

      setError(errorMessage);
      console.error("Form error:", err.response || err);
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Messages Error/Success */}
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

      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Tên sản phẩm" name="title" value={formData.title} onChange={handleChange} required placeholder="Tên sản phẩm"/>
          <InputField label="Thương hiệu" name="brand" value={formData.brand} onChange={handleChange} placeholder="Thương hiệu"/>
          <div className="md:col-span-2">
            <TextareaField label="Mô tả" name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả sản phẩm"/>
          </div>
        </div>
      </div>

       {/* Specifications */}
       <div>
         <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Giảm gap-y */}
             <InputField label="Màu sắc" name="color" value={formData.color} onChange={handleChange} />
             <InputField label="Trọng lượng (g)" name="weight" value={formData.weight} onChange={handleChange} placeholder="VD: 220"/>
             <InputField label="Kích thước (mm)" name="dimension" value={formData.dimension} onChange={handleChange} placeholder="VD: 161.4 x 75.3 x 8.5"/>
             <InputField label="Loại pin" name="batteryType" value={formData.batteryType} onChange={handleChange} placeholder="VD: Li-Po"/>
             <InputField label="Dung lượng pin (mAh)" name="batteryCapacity" value={formData.batteryCapacity} onChange={handleChange} placeholder="VD: 5000"/>
             <InputField label="RAM (GB)" name="ramCapacity" value={formData.ramCapacity} onChange={handleChange} placeholder="VD: 16"/>
             <InputField label="ROM (GB)" name="romCapacity" value={formData.romCapacity} onChange={handleChange} placeholder="VD: 512"/>
             <InputField label="Kích thước màn hình (inch)" name="screenSize" value={formData.screenSize} onChange={handleChange} placeholder="VD: 6.73"/>
             <InputField label="Cổng kết nối" name="connectionPort" value={formData.connectionPort} onChange={handleChange} placeholder="VD: USB Type-C"/>
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

      {/* Inventories */}
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
          {(formData.inventories || []).map((inventory, index) => (
             // Sửa: Giảm padding, thu gọn khoảng cách cột
            <div key={inventory.id || `new-${index}`} className="grid grid-cols-4 gap-3 items-end p-3 border rounded-lg">
                <InputField
                    label="Kích cỡ/Loại"
                    placeholder="VD: 256GB"
                    value={inventory.size}
                    onChange={(e) => handleInventoryChange(index, "size", e.target.value)}
                    required
                />
                <InputField label="Số lượng" type="number" placeholder="0" value={inventory.quantity} onChange={(e) => handleInventoryChange(index, "quantity", e.target.value)} min="0" required/>
                <InputField label="Giá gốc (VNĐ)" type="number" placeholder="0" value={inventory.price} onChange={(e) => handleInventoryChange(index, "price", e.target.value)} step="1000" min="0" required/>
                <InputField label="Giảm giá (%)" type="number" placeholder="0" value={inventory.discountPercent} onChange={(e) => handleInventoryChange(index, "discountPercent", e.target.value)} min="0" max="100" />
                {/* Nút Xóa đã được loại bỏ */}
                {/*
                <button
                    type="button"
                    onClick={() => handleRemoveInventory(index)}
                    className="p-2 h-10 mt-auto hover:bg-red-100 rounded-lg transition-colors text-red-600 flex items-center justify-center sm:col-start-5" // Căn chỉnh nút xóa
                >
                    <Trash2 size={18} />
                 </button>
                 */}
            </div>
          ))}
           {(!formData.inventories || formData.inventories.length === 0) && (
              <p className="text-sm text-gray-500 italic">Chưa có biến thể nào.</p>
            )}
        </div>
      </div>

      {/* Status */}
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
// Sửa: Thêm lớp CSS `h-10` để cố định chiều cao input
const InputField = ({ label, name, value, onChange, type = "text", placeholder = "", required = false, min, max, step }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        // Thêm h-10 và giảm padding py-1.5
        className="w-full h-10 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
      />
    </div>
  );

  const TextareaField = ({ label, name, value, onChange, rows = 4, placeholder = "" }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
      />
    </div>
  );

export default ProductForm