"use client"

import { useEffect, useState } from "react"
import { dashboardService } from "../services/api"
import StatCard from "../components/StatCard"
import RevenueChart from "../components/RevenueChart"
import RecentOrders from "../components/RecentOrders"
import RecentReviews from "../components/RecentReviews"
import { AlertCircle, Loader } from "lucide-react"

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [statsRes, chartRes] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getRevenueChart(),
        ])
        setStats(statsRes.data)
        setChartData(chartRes.data)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data")
        console.error("Dashboard error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Dashboard</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} change={stats.usersChange} icon="Users" color="blue" />
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            change={stats.productsChange}
            icon="Package"
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            change={stats.ordersChange}
            icon="ShoppingCart"
            color="purple"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change={stats.revenueChange}
            icon="DollarSign"
            color="orange"
          />
        </div>
      )}

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        {chartData && (
          <div className="lg:col-span-2">
            <RevenueChart data={chartData} />
          </div>
        )}

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Pending Orders</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.pendingOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Pending Reviews</span>
              <span className="text-2xl font-bold text-orange-600">{stats?.pendingReviews || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Users</span>
              <span className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</span>
            </div>
          </div>
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

export default DashboardPage
