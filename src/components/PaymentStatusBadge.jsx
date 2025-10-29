// src/components/PaymentStatusBadge.jsx

const PaymentStatusBadge = ({ status }) => {
  // Define styles based on PaymentStatus enum
  const statusConfig = {
    PENDING: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Pending",
    },
    COMPLETED: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Completed",
    },
    FAILED: {
      bg: "bg-red-100",
      text: "text-red-800",
      label: "Failed",
    },
    CANCELLED: {
      bg: "bg-gray-100", // Using gray for cancelled payment
      text: "text-gray-700",
      label: "Cancelled",
    },
    REFUNDED: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Refunded",
    },
  };

  // Ensure status is uppercase and handle null/undefined
  const upperStatus = status?.toUpperCase() || 'PENDING';
  const config = statusConfig[upperStatus] || statusConfig.PENDING; // Default to PENDING

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default PaymentStatusBadge;