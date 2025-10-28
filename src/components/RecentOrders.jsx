"use client"

import { useEffect, useState } from "react"
import { orderService } from "../services/api"
import { AlertCircle, Loader } from "lucide-react"

const RecentOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getOrders(0, 5)
        setOrders(response.data.content || response.data.data || [])
      } catch (err) {
        setError("Failed to load orders")
        console.error("Orders error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
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
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Order #{order.id}</p>
                {/* SỬA: Thêm '?? 0' để cung cấp giá trị dự phòng
                  nếu 'order.total' là null hoặc undefined 
                */}
                <p className="text-sm text-gray-600">${(order.total ?? 0).toFixed(2)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default RecentOrders