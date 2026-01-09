"use client"
import { CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { productService } from "../services/api"
import { AlertCircle, Loader, Plus, Search, Trash2, Edit2, Star, ImageOff, Package } from "lucide-react"
// SỬA: Bỏ useAuth, thêm usePermissions và PermissionWrapper
import { usePermissions } from "../hooks/usePermissions"
import PermissionWrapper from "../components/PermissionWrapper"
import InventoryManager from "../components/InventoryManager"

// --- Tiện ích --- (Giữ nguyên các hàm formatCurrency, formatDate, renderStars)
const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "N/A"
    }
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      return "Invalid Date"
    }
  }
  
  const renderStars = (rating) => {
    const roundedRating = Math.round(rating * 2) / 2 // Làm tròn đến 0.5
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < roundedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    )
  }

// --- Component ---
const ProductsPage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [categories, setCategories] = useState([])
  const [activeFilter, setActiveFilter] = useState("ALL") 
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const navigate = useNavigate()
  // SỬA: Lấy permissions
  const permissions = usePermissions()

  // SỬA: Hàm fetch categories (Giữ nguyên)
  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories()
      setCategories(response.data?.data || [])
      console.log('Categories', response.data?.data || [])
    } catch (err) {
      console.error("Failed to load categories:", err)
      setError("Không thể tải danh mục sản phẩm.")
      setCategories([]) 
    }
  }

  const handleOpenInventory = (product) => {
    setSelectedProduct(product)
  }

  // SỬA: Hàm fetch products (Giữ nguyên)
  const fetchProducts = async (pageNum = 1) => {
    try {
      setLoading(true)
      setError(null)

      let isActiveParam = null
      if (activeFilter === "ACTIVE") {
        isActiveParam = true
      } else if (activeFilter === "INACTIVE") {
        isActiveParam = false
      }

      const response = await productService.getProducts(
        pageNum - 1,
        10,
        searchTerm,
        categoryFilter !== "ALL" ? categoryFilter : null, 
        isActiveParam, 
      )

      const productData = response.data?.content || response.data?.data || []
      setProducts(productData)
      setTotalPages(response.data?.totalPages || response.data?.pagination?.totalPages || 1)
      setPage(pageNum)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Không thể tải danh sách sản phẩm.")
      console.error("Products error:", err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  // SỬA: Fetch categories khi component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // SỬA: Fetch products khi filter thay đổi
  useEffect(() => {
    fetchProducts(1) // Reset về trang 1 khi filter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, categoryFilter, activeFilter])

  // --- Giữ nguyên các hàm handleDelete, handleEdit, getLowestPrice, getTotalStock ---
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return

    try {
      setDeleting(id)
      setError(null)
      await productService.deleteProduct(id)
      fetchProducts(page) // Fetch lại trang hiện tại
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Xóa sản phẩm thất bại")
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
  try {
    setError(null)
    await productService.toggleActive(id)
    // Refresh products sau khi toggle
    fetchProducts(page)
  } catch (err) {
    setError(err.response?.data?.message || err.message || "Không thể thay đổi trạng thái")
  }
}

  const handleEdit = (id) => {
    navigate(`/products/${id}`)
  }

  const getLowestPrice = (inventories) => {
    if (!inventories || inventories.length === 0) return 0
    const prices = inventories.map((inv) => inv.discountedPrice ?? inv.price)
    return Math.min(...prices)
  }

  const getTotalStock = (inventories) => {
    if (!inventories) return 0
    return inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0)
  }
  // ---

  return (
    <div className="space-y-6">
      {/* Page Header (giữ nguyên) */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục sản phẩm của bạn</p>
        </div>
        {/* SỬA: Dùng PermissionWrapper */}
        <PermissionWrapper permission="canCreateProduct">
          <button
            onClick={() => navigate("/products/create")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Thêm sản phẩm
          </button>
        </PermissionWrapper>
      </div>

      {/* Thông báo lỗi (giữ nguyên) */}
      {error && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
           <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
           <p className="text-red-700 text-sm">{error}</p>
         </div>
       )}

      {/* Filters (giữ nguyên) */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            disabled={categories.length === 0} 
          >
            <option value="ALL">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Ngừng</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader size={24} className="animate-spin text-blue-600" />
            <p className="ml-2 text-gray-600">Đang tải sản phẩm...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {/* Giữ nguyên các th */}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thương hiệu</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Danh mục</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Giá từ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tồn kho</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Đã bán</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Đánh giá</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.imageUrl ? (
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={product.imageUrl}
                                alt={product.title || 'Product image'}
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} // Hide img on error
                              />
                            ) : null}
                            <div className={`h-10 w-10 rounded-md bg-gray-100 items-center justify-center ${product.imageUrl ? 'hidden' : 'flex'}`}>
                                <ImageOff size={20} className="text-gray-400" />
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 truncate" style={{maxWidth: '200px'}}>{product.title || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.brand || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.categoryName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(getLowestPrice(product.inventories))}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getTotalStock(product.inventories)}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.quantitySold || 0}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className='flex items-center gap-1'>
                            {renderStars(product.averageRating || 0)}
                            <span>({product.numRatings || 0})</span>
                        </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.active ? "Hoạt động" : "Ngừng"}
                        </span>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(product.createdAt)}</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* SỬA: Dùng PermissionWrapper */}
                        <div className="flex items-center gap-2">
                            {/* Quyền sửa sản phẩm (gồm toggle) */}
                            <PermissionWrapper permission="canEditProduct">
                              <button
                                onClick={() => handleToggleActive(product.id, product.active)}
                                className={`p-1 rounded transition-colors ${
                                  product.active 
                                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-100' 
                                    : 'text-green-600 hover:text-green-800 hover:bg-green-100'
                                }`}
                                title={product.active ? "Tắt sản phẩm" : "Bật sản phẩm"}
                              >
                                {product.active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                              </button>

                              <button
                                onClick={() => handleEdit(product.id)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <Edit2 size={18} />
                              </button>
                            </PermissionWrapper>
                            
                            {/* Quyền xóa sản phẩm */}
                            <PermissionWrapper permission="canDeleteProduct">
                              <button
                                onClick={() => handleDelete(product.id)}
                                disabled={deleting === product.id}
                                className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Xóa"
                              >
                                {deleting === product.id ? (
                                  <Loader size={18} className="animate-spin" />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </PermissionWrapper>
                            
                            <PermissionWrapper permission="canManageInventory">
                              <button
                                onClick={() => handleEdit(product.id)}
                                className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded transition-colors"
                                title="Quản lý kho hàng"
                              >
                                <Package size={18} />
                              </button>
                            </PermissionWrapper>

                                      {/* ===== THÊM NÚT QUẢN LÝ KHO CHO STAFF ===== */}
                            <PermissionWrapper permission="canManageInventory">
                              <button
                                onClick={() => handleOpenInventory(product)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                                title="Quản lý kho hàng"
                              >
                                <Package size={18} />
                              </button>
                            </PermissionWrapper>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination (giữ nguyên) */}
             {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchProducts(page - 1)}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => fetchProducts(page + 1)}
                    disabled={page === totalPages || loading}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
            {/* ===== THÊM MODAL CUỐI COMPONENT ===== */}
      {selectedProduct && (
        <InventoryManager
          productId={selectedProduct.id}
          productTitle={selectedProduct.title}
          onClose={() => setSelectedProduct(null)}
          onSuccess={() => {
            fetchProducts(page) // Refresh danh sách
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}

export default ProductsPage