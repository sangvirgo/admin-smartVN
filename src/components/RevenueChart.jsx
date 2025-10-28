import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const RevenueChart = ({ data }) => {
  // Hàm định dạng tiền tệ
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)

  // Hàm định dạng ngày
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan doanh thu</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {/* SỬA: dataKey="date" và dùng hàm format */}
          <XAxis dataKey="date" stroke="#6b7280" tickFormatter={formatDate} />
          {/* SỬA: Dùng hàm format cho YAxis */}
          <YAxis stroke="#6b7280" tickFormatter={(value) => `${value / 1000000}Tr`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
            formatter={(value) => [formatCurrency(value), "Doanh thu"]}
            labelFormatter={(label) => new Date(label).toLocaleDateString("vi-VN")}
          />
          <Legend formatter={() => "Doanh thu"} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: "#2563eb", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart