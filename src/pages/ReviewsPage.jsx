"use client"

import { useEffect, useState } from "react"
import { reviewService } from "../services/api"
// SỬA: Bỏ useAuth, thêm usePermissions và PermissionWrapper
import { usePermissions } from "../hooks/usePermissions"
import PermissionWrapper from "../components/PermissionWrapper"
import { AlertCircle, Loader, Star, Trash2 } from "lucide-react"

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState(null)
  
  // SỬA: Lấy permissions
  const permissions = usePermissions()

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true)
      setError(null) 
      
      const response = await reviewService.getReviews(
        pageNum - 1,
        10
      )
      
      setReviews(response.data.content || response.data.data || [])
      setTotalPages(response.data.totalPages || response.data.pagination?.totalPages || 1)
      setPage(pageNum)
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách đánh giá")
      console.error("Reviews error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Tải dữ liệu lần đầu
  useEffect(() => {
    fetchReviews(1)
  }, []) 

  // Hàm xử lý xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này không?")) return

    try {
      setDeletingId(id)
      setError(null)
      await reviewService.deleteReview(id)
      fetchReviews(page) 
    } catch (err) {
      setError(err.response?.data?.message || "Xóa đánh giá thất bại")
    } finally {
      setDeletingId(null)
    }
  }

  // Hàm render sao
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
        ))}
      </div>
    )
  }
  
  // Hàm format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Invalid Date"
    }
  }

  // Giao diện khi có lỗi
  if (error && !loading && reviews.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Lỗi khi tải đánh giá</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600 mt-1">Quản lý và kiểm duyệt đánh giá của khách hàng</p>
      </div>

      {/* Hiển thị lỗi (nếu có lỗi nhưng vẫn còn data cũ) */}
      {error && (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
           <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
           <p className="text-red-700 text-sm">{error}</p>
         </div>
       )}

      {/* Danh sách Reviews */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <Loader size={24} className="animate-spin text-blue-600" />
            <p className="ml-2 text-gray-600">Đang tải đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg shadow">
            <p className="text-gray-500">Không tìm thấy đánh giá nào.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <li key={review.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    {/* Thông tin chính */}
                    <div className="flex-1 min-w-0">
                      {/* Tên sản phẩm */}
                      <p className="text-sm font-semibold text-blue-600">{review.productTitle}</p>
                      
                      {/* Đánh giá (sao + nội dung) */}
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-gray-800">({review.rating}/5)</span>
                      </div>
                      <p className="text-gray-800 mt-2 text-base leading-relaxed">{review.reviewContent}</p>
                    </div>

                    {/* SỬA: Dùng PermissionWrapper */}
                    <PermissionWrapper permission="canDeleteReviews">
                      <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={deletingId === review.id}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-3 py-2 text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === review.id ? (
                            <Loader size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          Xóa
                        </button>
                      </div>
                    </PermissionWrapper>
                    
                  </div>

                  {/* Thông tin phụ (Người dùng, Ngày) */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                    <div>
                      <p className="font-medium">{review.userName}</p>
                      <p>{review.userEmail}</p>
                    </div>
                    <div className="mt-2 sm:mt-0 sm:text-right">
                      <p>Ngày tạo: {formatDate(review.createdAt)}</p>
                      {review.updatedAt !== review.createdAt && (
                         <p>Cập nhật: {formatDate(review.updatedAt)}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchReviews(page - 1)}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => fetchReviews(page + 1)}
                    disabled={page === totalPages || loading}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsPage