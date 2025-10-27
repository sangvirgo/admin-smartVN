"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ordersAPI } from "../services/api"
import { AlertCircle, Loader, ArrowLeft, CheckCircle, Clock, Truck, Package } from "lucide-react"
import OrderStatusBadge from "../components/OrderStatusBadge"

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getById(id)
        setOrder(response.data)
        setNewStatus(response.data.status)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order")
        console.error("Order detail error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return

    try {
      setUpdating(true)
      await ordersAPI.updateStatus(id, newStatus)
      setOrder((prev) => ({ ...prev, status: newStatus }))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: Clock,
      PROCESSING: Package,
      SHIPPED: Truck,
      DELIVERED: CheckCircle,
      CANCELLED: AlertCircle,
    }
    return icons[status] || Package
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size={24} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Order</h3>
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
        <button onClick={() => navigate("/orders")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-gray-600 mt-1">Order details and tracking</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {order && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div
                  className={`p-4 rounded-lg ${
                    order.status === "DELIVERED"
                      ? "bg-green-100"
                      : order.status === "CANCELLED"
                        ? "bg-red-100"
                        : "bg-blue-100"
                  }`}
                >
                  {(() => {
                    const Icon = getStatusIcon(order.status)
                    return (
                      <Icon
                        size={32}
                        className={
                          order.status === "DELIVERED"
                            ? "text-green-600"
                            : order.status === "CANCELLED"
                              ? "text-red-600"
                              : "text-blue-600"
                        }
                      />
                    )
                  })()}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                {newStatus !== order.status && (
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {updating && <Loader size={18} className="animate-spin" />}
                    {updating ? "Updating..." : "Update Status"}
                  </button>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      {item.variant && <p className="text-sm text-gray-600">{item.variant}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.timeline?.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      {index < order.timeline.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-gray-900">{event.status}</p>
                      <p className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
                      {event.note && <p className="text-sm text-gray-500 mt-1">{event.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{order.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                </p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">${order.shipping?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium text-gray-900">${order.tax?.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">${order.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Order Date</p>
                  <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900">{order.paymentMethod}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage
