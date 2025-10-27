const ReviewStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Pending Review",
    },
    APPROVED: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Approved",
    },
    REJECTED: {
      bg: "bg-red-100",
      text: "text-red-800",
      label: "Rejected",
    },
  }

  const config = statusConfig[status] || statusConfig.PENDING

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>
  )
}

export default ReviewStatusBadge
