"use client"
import InventoryManager from "../components/InventoryManager"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { productService } from "../services/api"
import ProductForm from "../components/ProductForm" // Import form
import { AlertCircle, Loader, ArrowLeft, Edit, Star, ImageOff, CheckCircle, XCircle, Package } from "lucide-react" 
// SỬA: Thêm usePermissions
import { usePermissions } from "../hooks/usePermissions"

// --- Tiện ích --- (Copy từ ProductsPage nếu cần)
const formatCurrency = (value) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleString("vi-VN", { dateStyle: 'short', timeStyle: 'short' });
    } catch (e) {
        return "Invalid Date";
    }
};

const renderStars = (rating) => {
    const roundedRating = Math.round(rating * 2) / 2;
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={18} className={i < roundedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}/>
        ))}
      </div>
    );
};
// ---

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false); 
  const [showInventoryManager, setShowInventoryManager] = useState(false)
  
  // SỬA: Lấy permissions
  const permissions = usePermissions()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null); // Reset lỗi
        const response = await productService.getProductById(id);
        // SỬA: Lấy dữ liệu từ response.data.data
        if (response.data && response.data.data) {
          setProduct(response.data.data);
          console.log('Product Detail Data:', response.data.data);
        } else {
           throw new Error("Dữ liệu sản phẩm không hợp lệ.");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load product";
        setError(errorMessage);
        console.error("Product detail error:", err.response || err);
        setProduct(null); // Đảm bảo product là null khi lỗi
      } finally {
        setLoading(false);
      }
    }

    fetchProduct()
  }, [id])

  // Hàm xử lý sau khi update thành công
  const handleUpdateSuccess = () => {
      setIsEditing(false); // Chuyển về chế độ xem
      // Tùy chọn: fetch lại dữ liệu mới nhất (để đảm bảo)
      // fetchProduct(); // Bỏ comment nếu muốn fetch lại
      // Hoặc chỉ đơn giản là quay về danh sách: navigate("/products");
      navigate("/products"); // Quay về danh sách sau khi sửa thành công
  };

    const handleInventorySuccess = () => {
    // Refresh product data
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductById(id)
        if (response.data?.data) {
          setProduct(response.data.data)
        }
      } catch (err) {
        console.error("Refresh error:", err)
      }
    }
    fetchProduct()
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]"> {/* Giảm chiều cao */}
        <Loader size={32} className="animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Đang tải chi tiết sản phẩm...</p>
      </div>
    )
  }

  // --- Giữ nguyên phần hiển thị lỗi ---
    if (error && !product) { // Chỉ hiện lỗi nếu không có product
        return (
          <div className="space-y-6 p-6">
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft size={20} />
              Quay lại danh sách sản phẩm
            </button>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
              <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Lỗi khi tải sản phẩm</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )
      }

  // Nếu không loading, không lỗi, nhưng không có product (trường hợp hiếm)
  if (!product && !loading && !error) {
     return (
        <div className="p-6 text-center text-gray-500">
            Không tìm thấy thông tin sản phẩm.
             <button onClick={() => navigate("/products")} className="mt-4 text-blue-600 hover:underline">
                Quay lại danh sách
             </button>
        </div>
     );
  }


  return (
    <div className="space-y-6 p-4 md:p-6"> {/* Thêm padding */}
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <button onClick={() => navigate("/products")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
            {/* SỬA: Hiển thị title sản phẩm hoặc tiêu đề chung */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 line-clamp-1">
                {isEditing ? `Chỉnh sửa: ${product.title}` : (product.title || "Chi tiết sản phẩm")}
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
                {isEditing ? "Cập nhật thông tin sản phẩm" : "Xem thông tin chi tiết và quản lý kho"}
            </p>
            </div>
        </div>


        <div className="flex items-center gap-2">
          {/* Nút quản lý kho cho STAFF */}
          {permissions.canManageInventory && !isEditing && (
            <button
              onClick={() => setShowInventoryManager(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Package size={18} />
              Quản lý Kho
            </button>
          )}
        
          {/* Existing edit button for ADMIN */}
          {permissions.canEditProduct && !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          ) : (
            isEditing && (
              <button
                onClick={() => setIsEditing(false)} 
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <XCircle size={18} />
                Hủy bỏ
              </button>
            )
          )}
        </div>
      </div>

      {/* SỬA: Hiển thị Form hoặc Chi tiết */}
      {isEditing && permissions.canEditProduct ? ( // Thêm kiểm tra quyền ở đây
        // Chế độ chỉnh sửa
        <div className="max-w-4xl mx-auto"> {/* Căn giữa form */}
          <ProductForm
            initialData={product}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setIsEditing(false)} // Truyền hàm cancel
           />
        </div>
      ) : (
        // Chế độ xem chi tiết
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cột trái: Ảnh và Thông tin cơ bản */}
          <div className="lg:col-span-1 space-y-6">
             {/* Product Images */}
             <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Hình ảnh sản phẩm</h2>
                {product.images && product.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                    {product.images.map((img) => (
                        <div key={img.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                            src={img.downloadUrl}
                            alt={img.fileName || product.title || 'Product image'}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = 'placeholder.png'} // Placeholder nếu ảnh lỗi
                        />
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">Chưa có hình ảnh.</p>
                )}
             </div>

             {/* Basic Info */}
             <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
                <InfoItem label="Thương hiệu" value={product.brand} />
                <InfoItem label="Danh mục" value={product.categoryName} />
                <InfoItem label="Trạng thái" value={product.active ?
                    <span className="text-green-600 font-medium flex items-center"><CheckCircle size={16} className="mr-1"/> Hoạt động</span> :
                    <span className="text-red-600 font-medium flex items-center"><XCircle size={16} className="mr-1"/> Ngừng</span>} />
                <InfoItem label="Ngày tạo" value={formatDate(product.createdAt)} />
                <InfoItem label="Cập nhật lần cuối" value={formatDate(product.updatedAt)} />
             </div>

              {/* Ratings & Sales */}
             <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá & Doanh số</h2>
                <InfoItem label="Đánh giá trung bình">
                    <div className="flex items-center gap-2">
                        {renderStars(product.averageRating || 0)}
                        <span className="text-sm text-gray-600">({product.numRatings || 0} lượt)</span>
                    </div>
                </InfoItem>
                <InfoItem label="Số lượng đã bán" value={product.quantitySold || 0} />
             </div>

          </div>

          {/* Cột phải: Mô tả, Thông số, Kho hàng */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {product.description && (
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <SpecItem label="Màu sắc" value={product.color} />
                    <SpecItem label="Trọng lượng" value={product.weight} />
                    <SpecItem label="Kích thước" value={product.dimension} />
                    <SpecItem label="Loại Pin" value={product.batteryType} />
                    <SpecItem label="Dung lượng Pin" value={product.batteryCapacity} />
                    <SpecItem label="RAM" value={product.ramCapacity} />
                    <SpecItem label="Bộ nhớ trong" value={product.romCapacity} />
                    <SpecItem label="Màn hình" value={product.screenSize} />
                    <SpecItem label="Cổng kết nối" value={product.connectionPort} />
                </div>
            </div>

             {/* Detailed Content */}
             {(product.detailedReview || product.powerfulPerformance) && (
                <div className="bg-white rounded-lg shadow p-4 space-y-4">
                    {product.detailedReview && (
                        <div>
                            <h3 className="text-md font-semibold text-gray-800 mb-1">Đánh giá chi tiết</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{product.detailedReview}</p>
                        </div>
                    )}
                     {product.powerfulPerformance && (
                        <div>
                            <h3 className="text-md font-semibold text-gray-800 mb-1">Hiệu năng mạnh mẽ</h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{product.powerfulPerformance}</p>
                        </div>
                    )}
                </div>
             )}


            {/* Inventories */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kho hàng & Biến thể</h2>
              {product.inventories && product.inventories.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích cỡ/Loại</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá gốc</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá bán</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {product.inventories.map((inv) => (
                            <tr key={inv.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{inv.size || 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{inv.quantity ?? 0}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 line-through">{formatCurrency(inv.price)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">{inv.discountPercent ?? 0}%</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">{formatCurrency(inv.discountedPrice)}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Chưa có thông tin kho hàng.</p>
              )}
            </div>
          </div>
        </div>
      )}

        {showInventoryManager && (
        <InventoryManager
          productId={product.id}
          productTitle={product.title}
          onClose={() => setShowInventoryManager(false)}
          onSuccess={handleInventorySuccess}
        />
      )}
    </div>
  )
}

// Helper components cho hiển thị chi tiết
const InfoItem = ({ label, value, children }) => (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {value !== undefined && <p className="text-sm text-gray-900 mt-0.5">{value || 'N/A'}</p>}
        {children}
    </div>
);

const SpecItem = ({ label, value }) => {
    if (!value) return null; // Không hiển thị nếu không có giá trị
    return (
        <div>
            <span className="font-medium text-gray-600">{label}:</span>
            <span className="text-gray-800 ml-1">{value}</span>
        </div>
    );
};


export default ProductDetailPage