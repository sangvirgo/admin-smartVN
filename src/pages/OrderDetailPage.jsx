"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../services/api";
import {
  AlertCircle, Loader, ArrowLeft, CheckCircle, Clock, Truck, Package, Check, // Added Check
  User, Mail, Phone, MapPin, CreditCard, Hash, CalendarDays, Box, CircleDollarSign
} from "lucide-react";
import OrderStatusBadge from "../components/OrderStatusBadge";
import PaymentStatusBadge from "../components/PaymentStatusBadge"; // Import the new badge

// --- Helper Functions (Giữ nguyên) ---
const formatCurrency = (value) => { /* ... */
    if (typeof value !== 'number') return "N/A";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};
const formatDate = (dateString, includeTime = true) => { /* ... */
     if (!dateString) return "N/A";
    try {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        if (includeTime) {
            options.hour = "2-digit";
            options.minute = "2-digit";
        }
        return new Date(dateString).toLocaleString("vi-VN", options);
    } catch (e) { return "Invalid Date"; }
};

// --- Main Component ---
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [availableStatuses, setAvailableStatuses] = useState([]); // State for valid next statuses

  // Fetch Order Data (Giữ nguyên logic lấy data.data)
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true); setError(null); setUpdateError(null);
      try {
        const response = await orderService.getOrderById(id);
        if (response.data && response.data.data) {
             const orderData = response.data.data;
             setOrder(orderData);
             setNewStatus(orderData.orderStatus || ""); // Set initial status
             updateAvailableStatuses(orderData.orderStatus); // Calculate available statuses
        } else { throw new Error("Invalid order data structure."); }
      } catch (err) { /* ... error handling ... */
          const errorMessage = err.response?.data?.message || err.message || "Failed to load order";
        setError(errorMessage);
        console.error("Order detail error:", err.response || err);
        setOrder(null);
      } finally { setLoading(false); }
    };
    fetchOrder();
  }, [id]);

  // Function to determine valid next statuses based on current status
  const updateAvailableStatuses = (currentStatus) => {
    let nextOptions = [];
    // Based on validateStatusTransition logic
    if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") {
        nextOptions = []; // No transitions allowed
    } else if (currentStatus === "PENDING") {
        nextOptions = ["CONFIRMED", "CANCELLED"];
    } else if (currentStatus === "CONFIRMED") {
        nextOptions = ["SHIPPED", "CANCELLED"];
    } else if (currentStatus === "SHIPPED") {
        nextOptions = ["DELIVERED"]; // Cannot cancel after shipped based on Java code
    }
    // Include the current status as the first option (for display)
    const currentOption = currentStatus ? [currentStatus] : [];
    setAvailableStatuses([...currentOption, ...nextOptions.filter(s => s !== currentStatus)]);
  };


  // Handle Status Update (Giữ nguyên logic, đảm bảo newStatus là uppercase)
  const handleStatusUpdate = async () => {
    if (!order || newStatus === order.orderStatus || !availableStatuses.includes(newStatus)) return;

    setUpdating(true); setUpdateError(null);
    try {
      await orderService.updateStatus(id, newStatus); // newStatus should already be uppercase
      setOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      updateAvailableStatuses(newStatus); // Update available statuses after successful change
      alert("Order status updated successfully!");
    } catch (err) { /* ... error handling ... */
        const errorMsg = err.response?.data?.message || err.message || "Failed to update order status";
      setUpdateError(errorMsg);
      console.error("Update status error:", err.response || err);
    } finally { setUpdating(false); }
  };

  // Get Status Icon (Giữ nguyên)
  const getStatusIcon = (status) => { /* ... */
       const icons = {
          PENDING: Clock, CONFIRMED: Package, SHIPPED: Truck,
          DELIVERED: CheckCircle, CANCELLED: AlertCircle,
        };
        return icons[status?.toUpperCase()] || Box;
   };

   // --- Render Loading/Error/Not Found (Giữ nguyên) ---
   if (loading) { /* ... */ return ( <div className="flex items-center justify-center min-h-[calc(100vh-150px)]"><Loader size={32} className="animate-spin text-blue-600" /><p className="ml-3 text-gray-600">Loading order details...</p></div> ); }
   if (error && !order) { /* ... */ return ( <div className="p-6 space-y-4"><button onClick={() => navigate("/orders")} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"><ArrowLeft size={20} /> Back to Orders</button><div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start"><AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" /><div><h3 className="text-lg font-semibold text-red-900">Error Loading Order</h3><p className="text-red-700 text-sm mt-1">{error}</p><button onClick={() => window.location.reload()} className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Reload Page</button></div></div></div> ); }
   if (!order && !loading && !error) { /* ... */ return ( <div className="p-6 text-center text-gray-500">Order not found.<button onClick={() => navigate("/orders")} className="mt-4 text-blue-600 hover:underline">Back to Orders List</button></div> ); }
   if (!order) return null; // Should not happen if loading/error handled

  const CurrentStatusIcon = getStatusIcon(order.orderStatus);

  // --- Render Order Details ---
  return (
    <div className="space-y-6">
      {/* Page Header (Giữ nguyên) */}
      <div className="flex items-center gap-4">
        { /* ... Back button ... */ }
          <button onClick={() => navigate("/orders")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft size={24} className="text-gray-600" /></button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-gray-600 mt-1">Details and status tracking</p>
        </div>
      </div>

      {/* Update Error Message (Giữ nguyên) */}
      {updateError && ( <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm items-center"><AlertCircle size={18} className="text-red-600 flex-shrink-0" /><p className="text-red-700">Update failed: {updateError}</p></div> )}
       {/* General Fetch Error (Giữ nguyên) */}
       {error && ( <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2 text-sm items-center"><AlertCircle size={18} className="text-yellow-600 flex-shrink-0" /><p className="text-yellow-700">Warning: Could not fetch latest data. {error}</p></div> )}

      {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ----- Main Content (Left Column) ----- */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Status & Update (CẬP NHẬT SELECT OPTIONS) */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                 { /* ... Current status badge ... */ }
                   <div>
                   <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Status</h2>
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
                 { /* ... Status icon ... */ }
                  <div className={`p-3 rounded-lg ${ order.orderStatus === "DELIVERED" ? "bg-green-100" : order.orderStatus === "CANCELLED" ? "bg-red-100" : "bg-blue-100" }`}> <CurrentStatusIcon size={28} className={ order.orderStatus === "DELIVERED" ? "text-green-600" : order.orderStatus === "CANCELLED" ? "text-red-600" : "text-blue-600" } /> </div>
              </div>

              {/* Update Status Section */}
              <div className="space-y-3 border-t pt-4">
                <label htmlFor="update-status-select" className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                  <select
                    id="update-status-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)} // Value is already uppercase from options
                    // Disable if no transitions possible or already completed/cancelled
                    disabled={updating || availableStatuses.length <= 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {/* Render only available status options */}
                    {availableStatuses.map(statusOption => (
                        <option key={statusOption} value={statusOption}>
                           {/* Capitalize first letter for display */}
                           {statusOption.charAt(0).toUpperCase() + statusOption.slice(1).toLowerCase()}
                        </option>
                    ))}
                     {/* Show message if no options */}
                     {availableStatuses.length <= 1 && order.orderStatus && (
                        <option value={order.orderStatus} disabled>
                            {order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED"
                                ? "Cannot change status"
                                : "No valid transitions"}
                        </option>
                     )}
                  </select>
                 {/* Show button only if a valid transition is selected */}
                {newStatus && newStatus !== order.orderStatus && availableStatuses.includes(newStatus) && (
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {updating ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                    {updating ? "Updating..." : `Update to ${newStatus.charAt(0) + newStatus.slice(1).toLowerCase()}`}
                  </button>
                )}
              </div>
            </div>

            {/* Order Items (Giữ nguyên) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({order.totalItems ?? 0})</h2>
              <div className="space-y-3">
                 {order.orderItems?.length > 0 ? order.orderItems.map((item) => ( <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"> <div className="flex-1 pr-4"> <p className="font-medium text-gray-900 text-sm">{item.productTitle}</p>{item.size && <p className="text-xs text-gray-600 mt-0.5">Variant: {item.size}</p>}<p className="text-xs text-gray-500">Product ID: {item.productId}</p></div> <div className="text-right flex-shrink-0"> <p className="text-xs text-gray-600">Qty: {item.quantity}</p> <p className="font-semibold text-sm text-blue-600 mt-0.5">{formatCurrency(item.discountedPrice)}</p>{item.price !== item.discountedPrice && ( <p className="text-xs text-gray-500 line-through">{formatCurrency(item.price)}</p> )}</div> </div> )) : ( <p className="text-sm text-gray-500 italic">No items found.</p> )}
              </div>
            </div>

            {/* Timeline (Giữ nguyên nếu có) */}
            {/* ... */}
          </div>

          {/* ----- Sidebar (Right Column) (CẬP NHẬT Payment Status) ----- */}
          <div className="space-y-6">

            {/* Customer Info (Giữ nguyên) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3 text-sm">
                <InfoItem icon={User} label="Name" value={order.userName || 'N/A'} />
                <InfoItem icon={Mail} label="Email" value={order.userEmail || 'N/A'} />
                <InfoItem icon={Hash} label="User ID" value={order.userId} />
              </div>
            </div>

            {/* Shipping Address (Giữ nguyên) */}
            <div className="bg-white rounded-lg shadow p-6"> <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2> <div className="space-y-1 text-sm text-gray-700"><p>{order.shippingAddressDetails || 'N/A'}</p></div> </div>

            {/* Order Summary (Giữ nguyên) */}
            <div className="bg-white rounded-lg shadow p-6"> <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2> <div className="space-y-2 text-sm border-t pt-3"><div className="flex justify-between items-center pt-2 border-t mt-2"><span className="text-base font-semibold text-gray-900">Total</span><span className="text-lg font-bold text-blue-700">{formatCurrency(order.totalPrice)}</span></div></div> </div>

            {/* Order & Payment Info (CẬP NHẬT: Dùng PaymentStatusBadge) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <InfoItem icon={CalendarDays} label="Order Date" value={formatDate(order.createdAt, true)} />
                <InfoItem icon={CreditCard} label="Payment Method" value={order.paymentMethod || 'N/A'} />
                {/* SỬA: Dùng PaymentStatusBadge */}
                <InfoItem icon={CircleDollarSign} label="Payment Status" value={<PaymentStatusBadge status={order.paymentStatus} />} />
                <InfoItem icon={Truck} label="Delivery Date" value={formatDate(order.deliveryDate, true)} />
              </div>
            </div>
          </div>{/* End Sidebar */}
        </div>{/* End Grid */}
    </div> // End Main Container
  );
};

// --- Helper Component for Info Items (Giữ nguyên) ---
const InfoItem = ({ icon: Icon, label, value }) => ( /* ... */
    <div className="flex items-start py-1.5">
        {Icon && <Icon size={16} className="text-gray-500 mt-0.5 mr-2.5 flex-shrink-0" />}
        <div className={!Icon ? 'ml-[calc(16px+0.625rem)]' : ''}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            <div className="text-sm text-gray-800 mt-0.5">{value}</div>
        </div>
    </div>
);


export default OrderDetailPage;