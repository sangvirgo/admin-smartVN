"use client"

import { useEffect, useState } from "react"
import { reviewService } from "../services/api"
import { AlertCircle, Loader, Star } from "lucide-react"

const RecentReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewService.getReviews(0, 5)
        setReviews(response.data.content || response.data.data || [])
      } catch (err) {
        setError("Failed to load reviews")
        console.error("Reviews error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <Loader size={24} className="animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{review.productName}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(review.status)}`}>
                  {review.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentReviews
