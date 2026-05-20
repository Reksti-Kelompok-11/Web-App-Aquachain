"use client"

import { useState, useEffect, useMemo } from "react"
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

type TimeFilter = "24jam" | "7hari" | "30hari"

const getFhiBarColor = (status: string) => {
  switch (status) {
    case "good": return "#22c55e"
    case "warning": return "#eab308"
    case "danger": return "#ef4444"
    default: return "#22c55e"
  }
}

export default function Analitik() {
  // state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7hari")
  const [rawTelemetry, setRawTelemetry] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fhiHistoryData, setFhiHistoryData] = useState<any[]>([]);
  const [alertHistoryData, setAlertHistoryData] = useState<any[]>([]);

  const timeFilters = [
    { key: "24jam" as const, label: "24 Jam Terakhir" },
    { key: "7hari" as const, label: "7 Hari Terakhir" },
    { key: "30hari" as const, label: "30 Hari Terakhir" },
  ]

  // fetch data
  const [fhiScore, setFhiScore] = useState(100);
  const [currentAlerts, setCurrentAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = "https://backend-aqua-chain.vercel.app";
        
        const [telemetryRes, fhiRes, alertsRes] = await Promise.all([
          fetch(`${API_BASE}/api/telemetry/pond-001?limit=100`),
          fetch(`${API_BASE}/api/telemetry/fhiHistory/pond-001`),
          fetch(`${API_BASE}/api/telemetry/alertsHistory/pond-001`)
        ]);

        if (telemetryRes.ok) {
          const data = await telemetryRes.json();
          setRawTelemetry(data.reverse());
        }

        if (fhiRes.ok) {
          const fhiHistoryData = await fhiRes.json();
          
          const formattedFhi = fhiHistoryData.reverse().map((d: any) => ({
            date: new Date(d.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            fhi: d.fhi,
            status: d.status
          }));
          setFhiHistoryData(formattedFhi);
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json();
          const formattedAlerts = alertsData.map((d: any) => ({
            tanggal: new Date(d.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
            parameter: d.parameter,
            status: d.status
          }));
          setAlertHistoryData(formattedAlerts);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi API BE:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // grafik tren
  const trendData = useMemo(() => {
    let sliceCount = rawTelemetry.length;
    if (timeFilter === "24jam") sliceCount = Math.min(24, rawTelemetry.length);
    if (timeFilter === "7hari") sliceCount = Math.min(70, rawTelemetry.length);

    return rawTelemetry.slice(-sliceCount).map(d => {
      const dateObj = new Date(d.timestamp);
      let formattedTime = "";
      
      // Logika dinamis untuk Sumbu X
      if (timeFilter === "24jam") {
        formattedTime = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      } else if (timeFilter === "7hari") {
        formattedTime = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
      } else {
        formattedTime = dateObj.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      }

      return {
        date: formattedTime,
        // fullTime ini yang akan dipakai oleh Tooltip semua grafik
        fullTime: dateObj.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        pH: d.ph,
        kekeruhan: d.turbidity,
        suhu: d.temperature
      };
    });
  }, [rawTelemetry, timeFilter]);

  // loading
  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-slate-100 items-center justify-center">
        <p className="text-slate-600 font-medium animate-pulse">Menyusun analitik data kolam...</p>
      </div>
    )
  }

  // tampilan utama UI
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
                  <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    labelFormatter={(value, payload) => payload[0]?.payload?.fullTime || value}
                    formatter={(value: number) => [`${value}`, "Kekeruhan"]}
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
                  <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 0.5', 'dataMax + 0.5']} tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    labelFormatter={(value, payload) => payload[0]?.payload?.fullTime || value}
                    formatter={(value: number) => [`${value}`, "pH"]}
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

            {/* Grafik Suhu */}
            <div>
              <div className="flex items-center justify-end mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="text-sm text-slate-600">Suhu (°C)</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(value) => value.toFixed(1)} />
                  <Tooltip
                    labelFormatter={(value, payload) => payload[0]?.payload?.fullTime} // Gunakan waktu lengkap
                    formatter={(value: number) => [`${value}°C`, "Suhu"]}
                  />
                  <Line type="monotone" dataKey="suhu" stroke="#f97316" strokeWidth={2} dot={false} />
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
              Kondisi Filter Terakhir
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fhiHistoryData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  formatter={(value: number) => [`${value}%`, "FHI"]}
                />
                <Legend 
                  formatter={() => <span className="text-slate-600 font-medium">Skor FHI (%)</span>} 
                  iconType="circle" 
                />
                <Bar dataKey="fhi" radius={[4, 4, 0, 0]}>
                  {fhiHistoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getFhiBarColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Peringatan Dini Table */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm overflow-hidden flex flex-col border-2 border-amber-300 relative">
            <div className="absolute inset-0 bg-amber-400/10 animate-pulse pointer-events-none"></div>
            
            <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                <AlertTriangle className="text-white" size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Peringatan Dini Tercatat</h3>
                <p className="text-amber-100 text-xs">Anomali terdeteksi dalam periode ini</p>
              </div>
              <div className="ml-auto bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                {alertHistoryData.length} Alert
              </div>
            </div>

            <div className="overflow-x-auto flex-1 relative">
              <table className="w-full text-sm">
                <thead className="bg-amber-100/50 border-b border-amber-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-amber-800 uppercase text-xs tracking-wider">Tanggal</th>
                    <th className="text-left py-3 px-4 font-semibold text-amber-800 uppercase text-xs tracking-wider">Parameter Anomali</th>
                    <th className="text-left py-3 px-4 font-semibold text-amber-800 uppercase text-xs tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 bg-white/70">
                  {alertHistoryData.length > 0 ? alertHistoryData.map((alert, index) => (
                    <tr key={index} className="hover:bg-amber-50 transition-colors">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-medium">{alert.tanggal}</td>
                      <td className="py-3 px-4 text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        {alert.parameter}
                      </td>
                      <td className="py-3 px-4">
                        <AlertStatusBadge status={alert.status as any} />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-amber-700">Tidak ada anomali terdeteksi.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}