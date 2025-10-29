"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../services/api";
import { AlertCircle, Loader, Search, Eye, Filter, Calendar } from "lucide-react"; // Added icons
import OrderStatusBadge from "../components/OrderStatusBadge"; // Component Badge cho Order Status
// THÊM: Component Badge cho Payment Status (tạo file mới nếu cần)
// import PaymentStatusBadge from "../components/PaymentStatusBadge";

// --- Helper Functions ---
const formatCurrency = (value) => {
    if (typeof value !== 'number') return "N/A";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const formatDate = (dateString, includeTime = false) => {
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

// --- Component ---
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL"); // THÊM
  const [startDateFilter, setStartDateFilter] = useState(""); // THÊM
  const [endDateFilter, setEndDateFilter] = useState(""); // THÊM

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // --- Fetch Data ---
  const fetchOrders = async (pageNum = 1, resetPage = false) => {
    if (resetPage) pageNum = 1; // Reset về trang 1 nếu filter thay đổi
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrders(
        pageNum - 1,
        10, // Size 10
        searchTerm,
        statusFilter !== "ALL" ? statusFilter : "",         // Gửi uppercase
        paymentStatusFilter !== "ALL" ? paymentStatusFilter : "", // Gửi uppercase
        startDateFilter,
        endDateFilter
      );
      const fetchedOrders = response.data.content || response.data.data || [];
      setOrders(fetchedOrders);
      setTotalPages(response.data.totalPages || response.data.pagination?.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to load orders";
      setError(errorMessage);
      console.error("Orders error:", err.response || err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters or page changes (debounced search might be better later)
  useEffect(() => {
    // Sử dụng debounce cho searchTerm nếu cần để tránh gọi API liên tục khi gõ
    const handler = setTimeout(() => {
        fetchOrders(page, false); // Fetch trang hiện tại khi page thay đổi
    }, 50); // Delay nhỏ để tránh gọi fetch trùng lặp khi page và filter cùng thay đổi
     return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]); // Chỉ fetch lại khi page thay đổi

    // Fetch lại từ trang 1 khi filter thay đổi
  useEffect(() => {
    const handler = setTimeout(() => {
       fetchOrders(1, true); // Reset về trang 1
    }, 300); // Debounce search term, status filters
     return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, paymentStatusFilter, startDateFilter, endDateFilter]);


  const handleViewOrder = (id) => {
    navigate(`/orders/${id}`);
  };

  // --- Render Error State ---
  if (error && !loading && orders.length === 0) {
     return ( /* ... giữ nguyên phần lỗi ... */
        <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Orders</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button onClick={() => fetchOrders(1, true)} className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">Try Again</button>
          </div>
        </div>
      </div>
     );
  }

  // --- Render Main Content ---
  return (
    <div className="space-y-6">
      {/* Page Header (Giữ nguyên) */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track customer orders</p>
      </div>

       {/* Display non-critical errors */}
       {error && ( <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm"><AlertCircle size={18} className="text-red-600 flex-shrink-0" /><p className="text-red-700">Could not load all orders: {error}</p></div> )}

      {/* Filters (CẬP NHẬT) */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"> {/* SỬA: grid-cols-5 */}
          {/* Search */}
          <div className="lg:col-span-1"> {/* Chiếm 1 cột */}
             <label htmlFor="search-order" className="block text-xs font-medium text-gray-500 mb-1">Search User</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="search-order"
                type="text"
                placeholder="Name or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Order Status Filter */}
          <div className="lg:col-span-1"> {/* Chiếm 1 cột */}
            <label htmlFor="order-status-filter" className="block text-xs font-medium text-gray-500 mb-1">Order Status</label>
            <select
              id="order-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter (THÊM) */}
          <div className="lg:col-span-1"> {/* Chiếm 1 cột */}
            <label htmlFor="payment-status-filter" className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
            <select
              id="payment-status-filter"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="ALL">All</option>
               {/* Đảm bảo value là UPPERCASE */}
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
              {/* <option value="REFUNDED">Refunded</option> */}
            </select>
          </div>

          {/* Date Filters (THÊM) */}
          <div className="lg:col-span-1"> {/* Chiếm 1 cột */}
             <label htmlFor="start-date-filter" className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
            <input
                id="start-date-filter"
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="lg:col-span-1"> {/* Chiếm 1 cột */}
             <label htmlFor="end-date-filter" className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
            <input
                id="end-date-filter"
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                 min={startDateFilter} // Ngăn chọn ngày kết thúc trước ngày bắt đầu
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Table (CẬP NHẬT: Thêm cột, sửa trường) */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? ( <div className="flex items-center justify-center h-64"><Loader size={32} className="animate-spin text-blue-600" /><p className="ml-3 text-gray-600">Loading orders...</p></div>
        ) : orders.length === 0 ? ( <div className="p-8 text-center"><p className="text-gray-500">No orders found matching your criteria.</p></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {/* Tăng min-width */}
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shipping</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ordered Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-100 transition-colors text-sm"> {/* Tăng hover */}
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                        <div>
                          <p className="font-medium">{order.userName || 'N/A'}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{order.userEmail || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-indigo-700">
                         {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-center">{order.totalItems ?? 0}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><OrderStatusBadge status={order.orderStatus} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{order.paymentStatus || 'N/A'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{order.paymentMethod || 'N/A'}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={order.shippingAddressDetails}> {/* Thêm title để xem full */}
                        {order.shippingAddressDetails || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(order.createdAt, true)}</td> {/* Hiển thị giờ */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(order.deliveryDate, true)}</td> {/* Hiển thị giờ */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button onClick={() => handleViewOrder(order.id)} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-100 px-2.5 py-1 rounded-md transition-all"> {/* Tăng padding */}
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination (Giữ nguyên logic disable) */}
            {totalPages > 1 && ( <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2"><p className="text-sm text-gray-600">Page {page} of {totalPages}</p><div className="flex gap-2"><button onClick={() => fetchOrders(page - 1)} disabled={page === 1 || loading} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Previous</button><button onClick={() => fetchOrders(page + 1)} disabled={page === totalPages || loading} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Next</button></div></div> )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;