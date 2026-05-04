"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { AlertStatusBadge } from "@/components/status-badges"

// ============================================
// DATA - Mudah untuk di-replace dengan API fetch
// ============================================

// Data tren mingguan (7 hari)
const weeklyTrendData = [
  { date: "06/04", pH: 7.2, kekeruhan: 3 },
  { date: "07/04", pH: 7.0, kekeruhan: 5 },
  { date: "08/04", pH: 7.5, kekeruhan: 8 },
  { date: "09/04", pH: 7.3, kekeruhan: 4 },
  { date: "10/04", pH: 7.8, kekeruhan: 6 },
  { date: "11/04", pH: 7.1, kekeruhan: 3 },
  { date: "12/04", pH: 7.4, kekeruhan: 2 },
]

// Data tren 24 jam
const dailyTrendData = [
  { date: "00:00", pH: 7.1, kekeruhan: 4 },
  { date: "04:00", pH: 7.0, kekeruhan: 4 },
  { date: "08:00", pH: 7.2, kekeruhan: 5 },
  { date: "12:00", pH: 7.4, kekeruhan: 6 },
  { date: "16:00", pH: 7.3, kekeruhan: 5 },
  { date: "20:00", pH: 7.2, kekeruhan: 4 },
]

// Data tren 30 hari
const monthlyTrendData = [
  { date: "W1", pH: 7.2, kekeruhan: 5 },
  { date: "W2", pH: 7.4, kekeruhan: 8 },
  { date: "W3", pH: 7.1, kekeruhan: 4 },
  { date: "W4", pH: 7.3, kekeruhan: 3 },
]

// Data FHI mingguan (Filter Health Index)
const fhiData = [
  { date: "06/04", fhi: 85, status: "good" },
  { date: "07/04", fhi: 78, status: "good" },
  { date: "08/04", fhi: 45, status: "warning" },
  { date: "09/04", fhi: 92, status: "good" },
  { date: "10/04", fhi: 25, status: "danger" },
  { date: "11/04", fhi: 88, status: "good" },
  { date: "12/04", fhi: 95, status: "good" },
]

// Data peringatan dini
const alertData = [
  { tanggal: "06 April 2026", parameter: "pH melampaui batas", status: "auto" as const },
  { tanggal: "08 April 2026", parameter: "Kekeruhan air naik drastis", status: "resolved" as const },
  { tanggal: "09 April 2026", parameter: "pH melampaui batas", status: "auto" as const },
  { tanggal: "11 April 2026", parameter: "Kekeruhan air naik drastis", status: "resolved" as const },
  { tanggal: "12 April 2026", parameter: "Kekeruhan air naik drastis", status: "resolved" as const },
]

// ============================================
// HELPERS
// ============================================

type TimeFilter = "24jam" | "7hari" | "30hari"

const getTrendData = (filter: TimeFilter) => {
  switch (filter) {
    case "24jam":
      return dailyTrendData
    case "7hari":
      return weeklyTrendData
    case "30hari":
      return monthlyTrendData
    default:
      return weeklyTrendData
  }
}

const getFhiBarColor = (status: string) => {
  switch (status) {
    case "good":
      return "#22c55e"
    case "warning":
      return "#eab308"
    case "danger":
      return "#ef4444"
    default:
      return "#22c55e"
  }
}

// ============================================
// COMPONENT
// ============================================

export default function Analitik() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7hari")
  const trendData = getTrendData(timeFilter)

  const timeFilters = [
    { key: "24jam" as const, label: "24 Jam Terakhir" },
    { key: "7hari" as const, label: "7 Hari Terakhir" },
    { key: "30hari" as const, label: "30 Hari Terakhir" },
  ]

  return (
    <div className="flex h-screen w-full bg-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <PageHeader
          title="Analitik Kualitas Air"
          description="Evaluasi tren kualitas air dan riwayat peringatan dini Filter Health Index."
        />

        {/* Time Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {timeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key)}
              className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                timeFilter === filter.key
                  ? "bg-cyan-600 text-white shadow-lg"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Tren Fluktuasi Charts */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">
            Tren Fluktuasi pH dan Kekeruhan
          </h3>

          <div className="grid grid-cols-1 gap-8">
            {/* Kekeruhan Chart */}
            <div>
              <div className="flex items-center justify-end mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="text-sm text-slate-600">Kekeruhan (%)</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 20]} ticks={[0, 4, 8, 12, 16, 20]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Kekeruhan"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="kekeruhan"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* pH Chart */}
            <div>
              <div className="flex items-center justify-end mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                  <span className="text-sm text-slate-600">pH</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [value, "pH"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="pH"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* FHI and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FHI Bar Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
              Kondisi Filter Mingguan
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fhiData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "FHI"]}
                />
                <Legend formatter={() => "FHI (%)"} />
                <Bar dataKey="fhi" radius={[4, 4, 0, 0]}>
                  {fhiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getFhiBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peringatan Dini Table - Enhanced Warning Style */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm overflow-hidden flex flex-col border-2 border-amber-300 relative">
            {/* Animated Warning Glow Effect */}
            <div className="absolute inset-0 bg-amber-400/10 animate-pulse pointer-events-none"></div>
            
            {/* Header with Warning Styling */}
            <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                <AlertTriangle className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Peringatan Dini Tercatat</h3>
                <p className="text-amber-100 text-xs">Anomali terdeteksi dalam periode ini</p>
              </div>
              {/* Alert Count Badge */}
              <div className="ml-auto bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                {alertData.length} Alert
              </div>
            </div>

            <div className="overflow-x-auto flex-1 relative">
              <table className="w-full text-sm">
                <thead className="bg-amber-100/50 border-b border-amber-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-amber-800 uppercase text-xs tracking-wider">
                      Tanggal
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-amber-800 uppercase text-xs tracking-wider">
                      Parameter Anomali
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-amber-800 uppercase text-xs tracking-wider">
                      Status Penanganan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 bg-white/70">
                  {alertData.map((alert, index) => (
                    <tr key={index} className="hover:bg-amber-50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">{alert.tanggal}</td>
                      <td className="py-3 px-4 text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        {alert.parameter}
                      </td>
                      <td className="py-3 px-4">
                        <AlertStatusBadge status={alert.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer with Warning Colors */}
            <div className="p-4 border-t border-amber-200 bg-amber-100/50 relative">
              <div className="flex justify-between items-center text-sm">
                <span className="text-amber-800 font-medium">
                  Total Peringatan: <strong className="text-amber-900">{alertData.length}</strong>
                </span>
                <span className="text-green-700 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {alertData.filter(a => a.status === "resolved").length} Normal Kembali
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
