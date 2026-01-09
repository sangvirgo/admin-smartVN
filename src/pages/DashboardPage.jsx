"use client"

import { useEffect, useState } from "react"
// SỬA: Thêm Navigate
import { Navigate } from "react-router-dom" 
import { dashboardService } from "../services/api"
import StatCard from "../components/StatCard"
import RevenueChart from "../components/RevenueChart"
// SỬA: Thêm usePermissions
import { usePermissions } from "../hooks/usePermissions"
import {
  AlertCircle,
  Loader,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Filter,
  Clock, 
  CheckCircle,
  XCircle, 
  Truck, 
  PackageCheck, 
  UserPlus, 
  Wallet, 
  Archive, 
  CalendarCheck, 
} from "lucide-react"

// --- Tiện ích (Giữ nguyên) ---

// Hàm định dạng tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return "0 ₫"
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value)
}

// Hàm lấy ngày theo định dạng YYYY-MM-DD
const getISODate = (date) => date.toISOString().split("T")[0]

// --- Component Thẻ Thống Kê Chi Tiết (MỚI) ---
// Component phụ mới để hiển thị chi tiết (thay thế QuickStatItem)
const DetailStatCard = ({
  icon: Icon,
  label,
  value,
  colorClass = "text-blue-600",
  bgColorClass = "bg-blue-100",
}) => (
  <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
    <div
      className={`flex-shrink-0 p-3 rounded-lg ${bgColorClass} ${colorClass}`}
    >
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
)

// --- Component Chính ---

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [filteredTotalRevenue, setFilteredTotalRevenue] = useState(0)

  // State cho bộ lọc
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return getISODate(d)
  })
  const [endDate, setEndDate] = useState(getISODate(new Date()))

  // State tải dữ liệu
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingChart, setLoadingChart] = useState(true)
  const [error, setError] = useState(null)

  // SỬA: Lấy permissions
  const permissions = usePermissions()

  // SỬA: Thêm kiểm tra quyền truy cập
  if (!permissions.canViewDashboard) {
    // Nếu không phải Admin, điều hướng về trang Products
    return <Navigate to="/products" replace />
  }

  // Hàm tải dữ liệu tổng quan (chạy 1 lần)
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoadingStats(true)
        const statsRes = await dashboardService.getOverview()
        setStats(statsRes.data.data)
        console.log("statsRes.data", statsRes.data.data)
      } catch (err) {
        setError(err.response?.data?.message || "Lỗi tải dữ liệu tổng quan")
        console.error("Lỗi Overview:", err)
      } finally {
        setLoadingStats(false)
      }
    }
    fetchOverview()
  }, [])

  // Hàm tải dữ liệu doanh thu (chạy khi lọc)
  const fetchRevenueData = async (start, end) => {
    try {
      setLoadingChart(true)
      const chartRes = await dashboardService.getRevenueChart(start, end)
      console.log("chartRes.data", chartRes.data.data)
      const data = chartRes.data.data
      setChartData(Array.isArray(data?.dataPoints) ? data.dataPoints : [])
      setFilteredTotalRevenue(data.totalRevenue || 0)
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải dữ liệu doanh thu")
      console.error("Lỗi Revenue Chart:", err)
    } finally {
      setLoadingChart(false)
    }
  }

  // Tải dữ liệu doanh thu lần đầu
  useEffect(() => {
    fetchRevenueData(startDate, endDate)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Xử lý khi nhấn nút "Áp dụng"
  const handleFilterApply = () => {
    fetchRevenueData(startDate, endDate)
  }

  // (Giữ nguyên)
  if (loadingStats || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header + Bộ lọc ngày (Giữ nguyên) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan doanh nghiệp của bạn.</p>
        </div>
        <div className="flex items-end gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Từ ngày
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Đến ngày
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <button
            onClick={handleFilterApply}
            disabled={loadingChart}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-blue-400"
          >
            {loadingChart ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              <Filter size={20} />
            )}
            Áp dụng
          </button>
        </div>
      </div>

      {/* Lỗi chung (Giữ nguyên) */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Statistics Cards (Giữ nguyên 4 thẻ chính) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Doanh Thu (Theo lọc)"
          value={formatCurrency(filteredTotalRevenue)}
          change={0} // Tạm thời ẩn % thay đổi
          icon="DollarSign"
          color="orange"
        />
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats.totalOrders.toLocaleString("vi-VN")}
          change={0}
          icon="ShoppingCart"
          color="purple"
        />
        <StatCard
          title="Tổng Khách Hàng"
          value={stats.totalUsers.toLocaleString("vi-VN")}
          change={0}
          icon="Users"
          color="blue"
        />
        <StatCard
          title="Tổng Sản Phẩm"
          value={stats.totalProducts.toLocaleString("vi-VN")}
          change={0}
          icon="Package"
          color="green"
        />
      </div>

      {/* SỬA: Bố cục mới (Biểu đồ + Chi tiết) */}
      <div className="space-y-6">
        {/* Revenue Chart (Full width) */}
        <div className="relative">
          {loadingChart && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
              <Loader size={32} className="animate-spin text-blue-600" />
            </div>
          )}
          <RevenueChart data={chartData} />
        </div>

        {/* (MỚI) Khu vực Thống kê chi tiết */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Chi tiết tổng quan
          </h2>
          
          {/* Lưới Doanh thu */}
          <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-4">Doanh thu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailStatCard
              icon={DollarSign}
              label="Doanh thu hôm nay"
              value={formatCurrency(stats.revenueToday ?? 0)} // Xử lý null
              colorClass="text-green-600"
              bgColorClass="bg-green-100"
            />
            <DetailStatCard
              icon={CalendarCheck}
              label="Doanh thu tháng này"
              value={formatCurrency(stats.revenueThisMonth)}
              colorClass="text-green-700"
              bgColorClass="bg-green-100"
            />
            <DetailStatCard
              icon={Wallet}
              label="Tổng doanh thu (Tất cả)"
              value={formatCurrency(stats.totalRevenue)}
              colorClass="text-green-800"
              bgColorClass="bg-green-100"
            />
          </div>

          {/* Lưới Đơn hàng */}
          <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-6">Trạng thái đơn hàng</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <DetailStatCard
              icon={Clock}
              label="Chờ xử lý"
              value={stats.pendingOrders.toLocaleString("vi-VN")}
              colorClass="text-yellow-600"
              bgColorClass="bg-yellow-100"
            />
            <DetailStatCard
              icon={CheckCircle}
              label="Đã xác nhận"
              value={stats.confirmedOrders.toLocaleString("vi-VN")}
              colorClass="text-blue-600"
              bgColorClass="bg-blue-100"
            />
            <DetailStatCard
              icon={Truck}
              label="Đang giao"
              value={stats.shippedOrders.toLocaleString("vi-VN")}
              colorClass="text-purple-600"
              bgColorClass="bg-purple-100"
            />
            <DetailStatCard
              icon={PackageCheck}
              label="Đã giao"
              value={stats.deliveredOrders.toLocaleString("vi-VN")}
              colorClass="text-green-600"
              bgColorClass="bg-green-100"
            />
            <DetailStatCard
              icon={XCircle}
              label="Đã hủy"
              value={stats.cancelledOrders.toLocaleString("vi-VN")}
              colorClass="text-red-600"
              bgColorClass="bg-red-100"
            />
          </div>

          {/* Lưới Người dùng & Sản phẩm */}
          <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-6">Người dùng & Sản phẩm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailStatCard
              icon={UserPlus}
              label="Khách hàng mới (Tháng)"
              value={stats.newUsersThisMonth.toLocaleString("vi-VN")}
              colorClass="text-cyan-600"
              bgColorClass="bg-cyan-100"
            />
            <DetailStatCard
              icon={Archive}
              label="Sản phẩm hoạt động"
              value={stats.activeProducts.toLocaleString("vi-VN")}
              colorClass="text-indigo-600"
              bgColorClass="bg-indigo-100"
            />
            <DetailStatCard
              icon={Users}
              label="Tổng nhân viên"
              value={stats.totalStaff.toLocaleString("vi-VN")}
              colorClass="text-gray-700"
              bgColorClass="bg-gray-200"
            />
          </div>
        </div>
      </div>

    </div>
  )
}

// (ĐÃ XÓA) Component phụ cho "Tổng quan nhanh"
// const QuickStatItem = ({ icon, label, value }) => ( ... )

export default DashboardPage