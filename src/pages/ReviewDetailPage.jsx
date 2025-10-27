"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { reviewService } from "../services/api"
import { AlertCircle, Loader, ArrowLeft, Star, Check, X } from "lucide-react"
import ReviewStatusBadge from "../components/ReviewStatusBadge"

const ReviewDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [actionError, setActionError] = useState(null)

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await reviewService.getById(id)
        setReview(response.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load review")
        console.error("Review detail error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReview()
  }, [id])

  const handleApprove = async () => {
    try {
      setUpdating(true)
      setActionError(null)
      await reviewService.updateStatus(id, "APPROVED")
      setReview((prev) => ({ ...prev, status: "APPROVED" }))
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to approve review")
    } finally {
      setUpdating(false)
    }
  }

  const handleReject = async () => {
    try {
      setUpdating(true)
      setActionError(null)
      await reviewService.updateStatus(id, "REJECTED")
      setReview((prev) => ({ ...prev, status: "REJECTED" }))
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject review")
    } finally {
      setUpdating(false)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={20} className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={24} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (error && !review) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/reviews")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Back to Reviews
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Review</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/reviews")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Review Details</h1>
          <p className="text-gray-600 mt-1">Review moderation and management</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{actionError}</p>
        </div>
      )}

      {review && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{review.title}</h2>
                    <p className="text-gray-600 mt-1">by {review.reviewerName}</p>
                  </div>
                  <ReviewStatusBadge status={review.status} />
                </div>

                <div className="mb-4">{renderStars(review.rating)}</div>

                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>

              {/* Helpful Stats */}
              {review.helpfulCount !== undefined && (
                <div className="border-t border-gray-200 pt-4 flex gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Helpful</p>
                    <p className="text-2xl font-bold text-gray-900">{review.helpfulCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Not Helpful</p>
                    <p className="text-2xl font-bold text-gray-900">{review.notHelpfulCount}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium text-gray-900">{review.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">SKU</p>
                  <p className="font-medium text-gray-900">{review.productSku}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{review.productCategory}</p>
                </div>
              </div>
            </div>

            {/* Reviewer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviewer Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{review.reviewerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{review.reviewerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verified Purchase</p>
                  <p className="font-medium text-gray-900">
                    {review.verifiedPurchase ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-600">No</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Moderation Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Moderation</h2>

              {review.status === "PENDING" ? (
                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    disabled={updating}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {updating && <Loader size={18} className="animate-spin" />}
                    <Check size={18} />
                    Approve Review
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={updating}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {updating && <Loader size={18} className="animate-spin" />}
                    <X size={18} />
                    Reject Review
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    This review has already been <span className="font-medium">{review.status.toLowerCase()}</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Review Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Submitted</p>
                  <p className="font-medium text-gray-900">{new Date(review.createdAt).toLocaleString()}</p>
                </div>
                {review.updatedAt && (
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-900">{new Date(review.updatedAt).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Review ID</p>
                  <p className="font-medium text-gray-900 font-mono text-xs">{review.id}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
              <div className="space-y-3">
                {review.statusHistory?.map((entry, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      {index < review.statusHistory.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-gray-900">{entry.status}</p>
                      <p className="text-xs text-gray-600">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewDetailPage
