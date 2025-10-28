"use client"

import { useEffect, useState } from "react"
import { dashboardService } from "../services/api"
import StatCard from "../components/StatCard"
import RevenueChart from "../components/RevenueChart"
import RecentOrders from "../components/RecentOrders"
import RecentReviews from "../components/RecentReviews"
import { AlertCircle, Loader, Users, Package, ShoppingCart, DollarSign, Filter } from "lucide-react"

// --- Tiện ích ---

// Hàm định dạng tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return "0 ₫"
  }
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

// Hàm lấy ngày theo định dạng YYYY-MM-DD
const getISODate = (date) => date.toISOString().split("T")[0]

// --- Component ---

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [filteredTotalRevenue, setFilteredTotalRevenue] = useState(0) // Dành riêng cho thẻ Doanh thu

  // State cho bộ lọc
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7) // Mặc định 7 ngày trước
    return getISODate(d)
  })
  const [endDate, setEndDate] = useState(getISODate(new Date())) // Mặc định hôm nay

  // State tải dữ liệu
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingChart, setLoadingChart] = useState(true)
  const [error, setError] = useState(null)

  // Hàm tải dữ liệu tổng quan (chỉ chạy 1 lần)
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
  }, [])

  // Xử lý khi nhấn nút "Áp dụng"
  const handleFilterApply = () => {
    fetchRevenueData(startDate, endDate)
  }

  if (loadingStats) {
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan doanh nghiệp của bạn.</p>
        </div>
        
        {/* SỬA: Thêm bộ lọc ngày */}
        <div className="flex items-end gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
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
            {loadingChart ? <Loader size={20} className="animate-spin" /> : <Filter size={20} />}
            Áp dụng
          </button>
        </div>
      </div>

      {/* Lỗi chung */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* SỬA: Thẻ này lấy từ state 'filteredTotalRevenue' */}
        <StatCard
          title="Tổng Doanh Thu (Lọc)"
          value={formatCurrency(filteredTotalRevenue)}
          icon="DollarSign"
          color="orange"
        />
        {/* Các thẻ này lấy từ state 'stats' (API getOverview) */}
        <StatCard
          title="Tổng Đơn Hàng"
          value={stats?.totalOrders?.toLocaleString("vi-VN") || 0}
          icon="ShoppingCart"
          color="purple"
        />
        <StatCard
          title="Tổng Khách Hàng"
          value={stats?.totalUsers?.toLocaleString("vi-VN") || 0}
          icon="Users"
          color="blue"
        />
        <StatCard
          title="Tổng Sản Phẩm"
          value={stats?.totalProducts?.toLocaleString("vi-VN") || 0}
          icon="Package"
          color="green"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 relative">
          {/* SỬA: Thêm spinner khi biểu đồ đang tải */}
          {loadingChart && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
              <Loader size={32} className="animate-spin text-blue-600" />
            </div>
          )}
          <RevenueChart data={chartData} />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan nhanh</h2>
          {stats && (
            <div className="space-y-4">
              <QuickStatItem
                icon={<DollarSign size={20} className="text-green-600" />}
                label="Doanh thu hôm nay"
                value={formatCurrency(stats.revenueToday)}
              />
              <QuickStatItem
                icon={<ShoppingCart size={20} className="text-orange-600" />}
                label="Đơn hàng chờ xử lý"
                value={stats.pendingOrders.toLocaleString("vi-VN")}
              />
              <QuickStatItem
                icon={<Users size={20} className="text-blue-600" />}
                label="Khách hàng mới (Tháng)"
                value={stats.newUsersThisMonth.toLocaleString("vi-VN")}
              />
              <QuickStatItem
                icon={<Package size={20} className="text-purple-600" />}
                label="Sản phẩm hoạt động"
                value={stats.activeProducts.toLocaleString("vi-VN")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders and Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders />
        <RecentReviews />
      </div>
    </div>
  )
}

// Component phụ cho "Tổng quan nhanh"
const QuickStatItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-base font-bold text-gray-900">{value}</span>
  </div>
)

export default DashboardPage