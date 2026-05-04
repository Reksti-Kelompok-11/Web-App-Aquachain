"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { 
  CheckCircle2, 
  XCircle, 
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Wheat,
  Target,
  AlertOctagon,
  Zap,
  Clock
} from "lucide-react"

// Dummy data - easy to replace with API fetch later
const summaryData = {
  sisaPakan: {
    value: 46,
    unit: "Kg",
    description: "Cukup untuk 2 hari ke depan",
    trend: "stable",
    percentage: 65 // percentage of tank capacity
  },
  pakanTerdistribusi: {
    value: 18.7,
    unit: "Kg",
    target: 22.5,
    description: "Dari target harian 22.5 Kg",
    trend: "up",
    percentage: 83 // percentage of target achieved
  },
  pakanDibatalkan: {
    value: 3.8,
    unit: "Kg",
    count: 1,
    description: "1 jadwal dibatalkan karena pH tinggi",
    trend: "warning"
  }
}

const riwayatPakan = [
  { id: 1, tanggal: "12 Apr 2026", waktu: "18:00", target: 3.8, aktual: 0, status: "dibatalkan", alasan: "pH tinggi (8.7)" },
  { id: 2, tanggal: "12 Apr 2026", waktu: "12:00", target: 10.7, aktual: 10.7, status: "terkirim", alasan: null },
  { id: 3, tanggal: "12 Apr 2026", waktu: "06:00", target: 8, aktual: 8, status: "terkirim", alasan: null },
  { id: 4, tanggal: "11 Apr 2026", waktu: "18:00", target: 7.5, aktual: 7.5, status: "terkirim", alasan: null },
  { id: 5, tanggal: "11 Apr 2026", waktu: "12:00", target: 6, aktual: 6, status: "terkirim", alasan: null },
  { id: 6, tanggal: "11 Apr 2026", waktu: "06:00", target: 5.5, aktual: 5.5, status: "terkirim", alasan: null },
  { id: 7, tanggal: "10 Apr 2026", waktu: "18:00", target: 7, aktual: 7, status: "terkirim", alasan: null },
  { id: 8, tanggal: "10 Apr 2026", waktu: "12:00", target: 6.5, aktual: 6.5, status: "terkirim", alasan: null },
  { id: 9, tanggal: "10 Apr 2026", waktu: "06:00", target: 5, aktual: 5, status: "terkirim", alasan: null },
  { id: 10, tanggal: "09 Apr 2026", waktu: "18:00", target: 8, aktual: 0, status: "dibatalkan", alasan: "Suhu tinggi (33°C)" },
  { id: 11, tanggal: "09 Apr 2026", waktu: "12:00", target: 7, aktual: 7, status: "terkirim", alasan: null },
  { id: 12, tanggal: "09 Apr 2026", waktu: "06:00", target: 6, aktual: 6, status: "terkirim", alasan: null },
  { id: 13, tanggal: "08 Apr 2026", waktu: "18:00", target: 7.5, aktual: 7.5, status: "terkirim", alasan: null },
  { id: 14, tanggal: "08 Apr 2026", waktu: "12:00", target: 6.5, aktual: 6.5, status: "terkirim", alasan: null },
  { id: 15, tanggal: "08 Apr 2026", waktu: "06:00", target: 5.5, aktual: 5.5, status: "terkirim", alasan: null },
]

// Get unique dates for filter
const uniqueDates = [...new Set(riwayatPakan.map(item => item.tanggal))]

type FilterType = "semua" | "terkirim" | "dibatalkan"
const ITEMS_PER_PAGE = 5

export default function LogPakanPage() {
  const [statusFilter, setStatusFilter] = useState<FilterType>("semua")
  const [dateFilter, setDateFilter] = useState<string>("semua")
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter logic
  const filteredRiwayat = riwayatPakan.filter(item => {
    const statusMatch = statusFilter === "semua" || item.status === statusFilter
    const dateMatch = dateFilter === "semua" || item.tanggal === dateFilter
    return statusMatch && dateMatch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredRiwayat.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedRiwayat = filteredRiwayat.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset page when filter changes
  const handleStatusFilter = (filter: FilterType) => {
    setStatusFilter(filter)
    setShowStatusDropdown(false)
    setCurrentPage(1)
  }

  const handleDateFilter = (date: string) => {
    setDateFilter(date)
    setShowDateDropdown(false)
    setCurrentPage(1)
  }

  const getStatusBadge = (status: string, alasan: string | null) => {
    if (status === "terkirim") {
      return (
        <div className="flex items-center gap-2">
          <span className="text-green-700 font-medium">Terkirim</span>
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
            <CheckCircle2 className="text-white" size={14} />
          </div>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-red-700 font-medium">Dibatalkan</span>
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shadow-sm animate-pulse">
            <XCircle className="text-white" size={14} />
          </div>
        </div>
        {alasan && (
          <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{alasan}</span>
        )}
      </div>
    )
  }

  const getAktualColor = (target: number, aktual: number) => {
    if (aktual === 0) return "text-red-600"
    if (aktual >= target) return "text-green-600"
    if (aktual >= target * 0.8) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="flex h-screen w-full bg-slate-100">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <PageHeader
            title="Log Pakan & Auto-Feeder"
            description="Pantau riwayat distribusi auto-feeder dan intervensi smart logic."
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
            {/* Sisa Pakan Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <Wheat className="text-white" size={24} />
                </div>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full font-medium">Stok</span>
              </div>
              <p className="text-sm text-slate-500 mb-1">Sisa Pakan di Wadah</p>
              <p className="text-4xl font-bold text-cyan-600 mb-2">
                {summaryData.sisaPakan.value} <span className="text-2xl">Kg</span>
              </p>
              {/* Progress bar for tank capacity */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${summaryData.sisaPakan.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">{summaryData.sisaPakan.description}</p>
            </div>

            {/* Pakan Terdistribusi Card */}
            <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Target className="text-white" size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full font-medium">
                  <Zap size={12} />
                  <span>Hari ini</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-1">Pakan Terdistribusi</p>
              <p className="text-4xl font-bold text-green-600 mb-2">
                {summaryData.pakanTerdistribusi.value} <span className="text-2xl">Kg</span>
              </p>
              {/* Progress bar for target */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${summaryData.pakanTerdistribusi.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">
                {summaryData.pakanTerdistribusi.description}
                <span className="text-green-600 font-medium ml-1">
                  ({summaryData.pakanTerdistribusi.percentage}%)
                </span>
              </p>
            </div>

            {/* Pakan Dibatalkan Card - Enhanced Warning */}
            <div className="relative rounded-xl shadow-lg overflow-hidden">
              {/* Animated background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-orange-600"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
              
              {/* Pulsing border effect */}
              <div className="absolute inset-0 border-2 border-red-300/50 rounded-xl animate-pulse"></div>
              
              {/* Animated warning stripes */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]"></div>
              
              <div className="relative p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg animate-bounce">
                    <AlertOctagon className="text-white" size={26} />
                  </div>
                  <div className="flex items-center gap-1 text-white text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold shadow-lg">
                    <XCircle size={14} className="animate-pulse" />
                    <span>{summaryData.pakanDibatalkan.count} Jadwal</span>
                  </div>
                </div>
                <p className="text-sm text-red-100 mb-1">Pakan Dibatalkan Otomatis</p>
                <p className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  {summaryData.pakanDibatalkan.value} <span className="text-2xl">Kg</span>
                </p>
                <div className="flex items-center gap-2 text-white/90 text-xs bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <AlertOctagon size={14} className="flex-shrink-0" />
                  <span>{summaryData.pakanDibatalkan.description}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-800">Riwayat Eksekusi Pakan</h3>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {/* Date Filter */}
                <div className="relative">
                  <button
                    onClick={() => { setShowDateDropdown(!showDateDropdown); setShowStatusDropdown(false) }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                  >
                    <Calendar size={16} />
                    <span>
                      {dateFilter === "semua" ? "Semua Tanggal" : dateFilter}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${showDateDropdown ? "rotate-180" : ""}`} />
                  </button>
                  
                  {showDateDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => handleDateFilter("semua")}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${dateFilter === "semua" ? "text-cyan-600 bg-cyan-50" : "text-slate-700"}`}
                      >
                        Semua Tanggal
                      </button>
                      {uniqueDates.map(date => (
                        <button
                          key={date}
                          onClick={() => handleDateFilter(date)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${dateFilter === date ? "text-cyan-600 bg-cyan-50" : "text-slate-700"}`}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <button
                    onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowDateDropdown(false) }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                  >
                    <Filter size={16} />
                    <span>
                      {statusFilter === "semua" ? "Semua Status" : statusFilter === "terkirim" ? "Terkirim" : "Dibatalkan"}
                    </span>
                    <ChevronDown size={16} className={`transition-transform ${showStatusDropdown ? "rotate-180" : ""}`} />
                  </button>
                  
                  {showStatusDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                      <button
                        onClick={() => handleStatusFilter("semua")}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${statusFilter === "semua" ? "text-cyan-600 bg-cyan-50" : "text-slate-700"}`}
                      >
                        Semua Status
                      </button>
                      <button
                        onClick={() => handleStatusFilter("terkirim")}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${statusFilter === "terkirim" ? "text-cyan-600 bg-cyan-50" : "text-slate-700"}`}
                      >
                        <CheckCircle2 size={14} className="text-green-500" />
                        Terkirim
                      </button>
                      <button
                        onClick={() => handleStatusFilter("dibatalkan")}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${statusFilter === "dibatalkan" ? "text-cyan-600 bg-cyan-50" : "text-slate-700"}`}
                      >
                        <XCircle size={14} className="text-red-500" />
                        Dibatalkan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        Tanggal & Waktu
                      </div>
                    </th>
                    <th className="text-center py-4 px-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                      Target (Kg)
                    </th>
                    <th className="text-center py-4 px-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                      Aktual (Kg)
                    </th>
                    <th className="text-right py-4 px-5 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRiwayat.length > 0 ? (
                    paginatedRiwayat.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50 transition-colors ${
                          item.status === "dibatalkan" ? "bg-red-50/50" : ""
                        }`}
                      >
                        <td className="py-4 px-5 text-slate-700 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium">{item.tanggal}</span>
                            <span className="text-xs text-slate-500">{item.waktu}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center text-slate-600 font-medium">
                          {item.target}
                        </td>
                        <td className={`py-4 px-5 text-center font-bold ${getAktualColor(item.target, item.aktual)}`}>
                          {item.aktual}
                        </td>
                        <td className="py-4 px-5 text-right">
                          {getStatusBadge(item.status, item.alasan)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        Tidak ada data yang sesuai filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredRiwayat.length)} dari {filteredRiwayat.length} data
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg font-medium text-sm transition-colors ${
                        currentPage === page
                          ? "bg-cyan-600 text-white shadow-lg"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Table Footer - Stats */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
                <span className="text-slate-600">
                  Total: <strong>{riwayatPakan.length}</strong> eksekusi
                </span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle2 size={14} />
                    {riwayatPakan.filter(r => r.status === "terkirim").length} Terkirim
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600">
                    <XCircle size={14} />
                    {riwayatPakan.filter(r => r.status === "dibatalkan").length} Dibatalkan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
