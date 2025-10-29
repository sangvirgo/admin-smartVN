const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Pending",
    },
    CONFIRMED: {
      bg: "bg-cyan-100", // Ví dụ màu cyan
      text: "text-cyan-800",
      label: "Confirmed",
    },
    SHIPPED: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      label: "Shipped",
    },
    DELIVERED: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Delivered",
    },
    CANCELLED: {
      bg: "bg-red-100",
      text: "text-red-800",
      label: "Cancelled",
    },
  }

  const config = statusConfig[status] || statusConfig.PENDING

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>
  )
}

export default OrderStatusBadge
