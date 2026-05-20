"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import {
  Activity,
  Thermometer,
  Eye,
  Wheat,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { StatusBadge, LogStatusDot, MetricStatus } from "@/components/status-badges"

type PondStatus = "aman" | "waspada" | "bahaya"
type Pond = {
  id: string
  name: string
  fish_type: string
  capacity: number
  status: PondStatus
}
type TelemetryByPond = Record<string, { ph: number; suhu: number; kekeruhan: number }>
type LogItem = { waktu: string; aktivitas: string; hash_code: string; status: string }

const getKekeruhanDomain = (data: { kekeruhan: number }[]) => {
  const maxKekeruhan = Math.max(...data.map((d) => d.kekeruhan))
  if (maxKekeruhan <= 10) return [0, 10]
  if (maxKekeruhan <= 20) return [0, 20]
  if (maxKekeruhan <= 50) return [0, 50]
  return [0, 100]
}

const getPoolStatusMeta = (status: PondStatus) => {
  if (status === "bahaya") {
    return {
      label: "Bahaya",
      card: "bg-red-100 border-2 border-red-300",
      title: "text-red-700",
      iconBg: "bg-red-500",
      badge: "bg-red-500 text-white",
      metricStatus: "bahaya" as MetricStatus,
    }
  }
  if (status === "waspada") {
    return {
      label: "Waspada",
      card: "bg-yellow-100 border-2 border-yellow-300",
      title: "text-yellow-700",
      iconBg: "bg-yellow-500",
      badge: "bg-yellow-500 text-white",
      metricStatus: "waspada" as MetricStatus,
    }
  }
  return {
    label: "Aman",
    card: "bg-green-100 border-2 border-green-300",
    title: "text-green-700",
    iconBg: "bg-green-500",
    badge: "bg-green-500 text-white",
    metricStatus: "aman" as MetricStatus,
  }
}

const getMetricStatus = (
  metric: "ph" | "suhu" | "kekeruhan" | "pakan",
  telemetry: { ph: number; suhu: number; kekeruhan: number },
): MetricStatus => {
  if (metric === "ph") {
    if (telemetry.ph < 6.5 || telemetry.ph > 8.5) return "bahaya"
    if (telemetry.ph < 7 || telemetry.ph > 8) return "waspada"
    return "aman"
  }
  if (metric === "suhu") {
    if (telemetry.suhu < 20 || telemetry.suhu > 33) return "bahaya"
    if (telemetry.suhu < 25 || telemetry.suhu > 30) return "waspada"
    return "aman"
  }
  if (metric === "kekeruhan") {
    if (telemetry.kekeruhan > 100) return "bahaya"
    if (telemetry.kekeruhan > 10) return "waspada"
    return "aman"
  }
  return "aman"
}

const getShortHash = (hash: string) => {
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

export default function Dashboard() {
  const [ponds, setPonds] = useState<Pond[]>([])
  const [telemetry, setTelemetry] = useState<TelemetryByPond>({})
  const [isLoading, setIsLoading] = useState(true)
  const [pakanStatus, setPakanStatus] = useState<"aman" | "bahaya">("aman")
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [lastSynced, setLastSynced] = useState<string>("");
  const [dashboardChartData, setDashboardChartData] = useState<any[]>([])
  const [pondOverallStatus, setPondOverallStatus] = useState<"aman" | "waspada" | "bahaya">("aman")

  const [activePondId, setActivePondId] = useState<string>("")
  const activePond = useMemo(
    () => ponds.find((pond) => pond.id === activePondId) ?? ponds[0],
    [activePondId, ponds],
  )
  const activeTelemetry = activePond && telemetry[activePond.id] ? telemetry[activePond.id] : { ph: 0, suhu: 0, kekeruhan: 0 }
  const pondStatusMeta = getPoolStatusMeta(pondOverallStatus)

  const kekeruhanDomain = getKekeruhanDomain(dashboardChartData)

  // Calculate pond status based on telemetry
  const calculatePondStatus = (tel: { ph: number; suhu: number; kekeruhan: number }): PondStatus => {
    const phStatus = getMetricStatus("ph", tel)
    const suhuStatus = getMetricStatus("suhu", tel)
    const kekeruhanStatus = getMetricStatus("kekeruhan", tel)
    
    if (phStatus === "bahaya" || suhuStatus === "bahaya" || kekeruhanStatus === "bahaya") {
      return "bahaya"
    }
    if (phStatus === "waspada" || suhuStatus === "waspada" || kekeruhanStatus === "waspada") {
      return "waspada"
    }
    return "aman"
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = "https://backend-aqua-chain.vercel.app"
        
        const [pondsRes, telemetryRes, feedRes, fhiRes] = await Promise.all([
          fetch(`${API_BASE}/api/ponds`),
          fetch(`${API_BASE}/api/telemetry/pond-001?limit=7`),
          fetch(`${API_BASE}/api/feeder/pond-001/logs?limit=5`),
          fetch(`${API_BASE}/api/telemetry/fhi/pond-001`),
        ])

        if (!pondsRes.ok || !telemetryRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const pondsData = await pondsRes.json()
        const telemetryData = await telemetryRes.json()
        const feedData = feedRes.ok ? await feedRes.json() : []

        if (fhiRes.ok) {
          const fhiData = await fhiRes.json()
          const fhiValue = fhiData.fhi;
          let finalStatus = "aman";
          if (fhiValue < 50) {
            finalStatus = "bahaya";
          } else if (fhiValue < 80) {
            finalStatus = "waspada";
          }
          setPondOverallStatus(finalStatus);
        }

        if (feedData.length > 0) {
          const latestFeed = feedData[0];
          // Tentukan status kartu pakan
          setPakanStatus((latestFeed.status === "success" || latestFeed.status === "terkirim") ? "aman" : "bahaya");
          
          // Mapping buat tabel log mini
          const mappedLogs = feedData.map((log: any) => {
             const d = new Date(log.actual_time || log.scheduled_time);
             const isSuccess = log.status?.toLowerCase() === "completed" || log.status?.toLowerCase() === "success" || log.status?.toLowerCase() === "terkirim";
             return {
               id: log.log_id,
               waktu: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
               aktivitas: `Pakan ${log.target_dosage}Kg ${isSuccess ? 'Sukses' : 'Dibatalkan'}`,
               statusType: isSuccess ? 'info' : 'warning',
               hash_code: log.log_id.split('-')[0]
             }
          });
          setRecentLogs(mappedLogs);
        }

        // Transform ponds data
        const transformedPonds: Pond[] = pondsData.map((pond: any) => ({
          id: pond.pond_id,
          name: pond.name,
          fish_type: pond.fish_type,
          capacity: pond.capacity,
          status: "aman" as PondStatus, // Will be calculated based on telemetry
        }))

        // Transform telemetry data (get latest for each pond)
        const telemetryMap: TelemetryByPond = {}
        if (telemetryData.length > 0) {
          const latest = telemetryData[0] // Already ordered by timestamp desc
          telemetryMap["pond-001"] = {
            ph: latest.ph,
            suhu: latest.temperature,
            kekeruhan: latest.turbidity,
          }
          const chartFormatted = [...telemetryData].reverse().map((d: any) => ({
            time: new Date(d.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            pH: d.ph,
            kekeruhan: d.turbidity
          }));
          setDashboardChartData(chartFormatted);

          // Update pond status based on telemetry
          transformedPonds.forEach((pond: Pond) => {
            if (pond.id === "pond-001" && telemetryMap["pond-001"]) {
              pond.status = calculatePondStatus(telemetryMap["pond-001"])
            }
          })
        }

        setPonds(transformedPonds)
        setTelemetry(telemetryMap)
        setLastSynced(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
        
        if (transformedPonds.length > 0) {
          setActivePondId(transformedPonds[0].id)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 5000)
    return () => clearInterval(intervalId)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-slate-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <PageHeader
          title=""
          description="Berikut adalah ringkasan metrik kualitas air dan operasional pakan kolam Anda."
          showGreeting={true}
          userName="Darryl"
        />

        <div className={`${pondStatusMeta.card} rounded-xl p-6 mb-6 shadow-md`}>
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-14 h-14 rounded-full ${pondStatusMeta.iconBg} flex items-center justify-center flex-shrink-0 shadow-[0_0_18px_rgba(15,23,42,0.22)]`}
            >
              {activePond.status === "aman" && <CheckCircle2 size={28} className="text-white" />}
              {activePond.status === "waspada" && <AlertTriangle size={28} className="text-white" />}
              {activePond.status === "bahaya" && <XCircle size={28} className="text-white" />}
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${pondStatusMeta.title}`}>Kondisi {pondStatusMeta.label}</h2>
              <p className="text-slate-700">{activePond.name} - Terakhir sinkron: {lastSynced || "--:--"}</p>
              <p className="text-sm text-slate-500">
                {activePond.fish_type || "Belum diatur"} - {activePond.capacity || 0} Ekor
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            {ponds.map((pond) => {
              const status = getPoolStatusMeta(pond.status)
              return (
                <button
                  key={pond.id}
                  onClick={() => setActivePondId(pond.id)}
                  className={`px-5 py-3 rounded-lg transition-all duration-300 text-left ${
                    activePondId === pond.id
                      ? "bg-white shadow-lg border-2 border-cyan-500"
                      : "bg-white/70 hover:bg-white hover:shadow border-2 border-transparent"
                  }`}
                >
                  <p className="font-semibold text-slate-800">{pond.name}</p>
                  <p className="text-xs text-slate-500">{pond.fish_type || "Belum diatur"} - {pond.capacity || 0} Ekor</p>
                  <span className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${status.badge}`}>
                    {status.label}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 min-h-[168px] flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg flex items-center justify-center shrink-0">
                    <Activity className="text-white" size={20} />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-semibold text-slate-700">pH</span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">Normal 6.5-9.0</span>
                  </div>
                </div>
                <StatusBadge status={getMetricStatus("ph", activeTelemetry)} />
              </div>
              <p className="text-3xl font-bold text-blue-600 mt-4 text-center">pH {activeTelemetry.ph.toFixed(1)}</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 min-h-[168px] flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg flex items-center justify-center shrink-0">
                    <Thermometer className="text-white" size={20} />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-semibold text-slate-700">Suhu</span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">Normal 24-30°C</span>
                  </div>
                </div>
                <StatusBadge status={getMetricStatus("suhu", activeTelemetry)} />
              </div>
              <p className="text-3xl font-bold text-orange-500 mt-4 text-center">{activeTelemetry.suhu}°C</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 min-h-[168px] flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg flex items-center justify-center shrink-0">
                    <Eye className="text-white" size={20} />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-semibold text-slate-700">Kekeruhan</span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">Normal 0-10%</span>
                  </div>
                </div>
                <StatusBadge status={getMetricStatus("kekeruhan", activeTelemetry)} />
              </div>
              <p className="text-3xl font-bold text-indigo-600 mt-4 text-center">{activeTelemetry.kekeruhan}%</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 min-h-[168px] flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg flex items-center justify-center shrink-0">
                    <Wheat className="text-white" size={20} />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-semibold text-slate-700">Pakan</span>
                    <span className="text-xs text-slate-500 whitespace-nowrap">Status distribusi</span>
                  </div>
                </div>
                <StatusBadge status={pakanStatus} />
              </div>
              <p className="text-3xl font-bold text-teal-600 mt-4 text-center">
                {pakanStatus === "bahaya" ? "Tertunda" : "Terpenuhi"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm h-[430px] flex flex-col">
            <h3 className="text-xl font-bold text-cyan-700 mb-4 text-center">Grafik Fluktuasi Air</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke="#67b3e8"
                    domain={[0, 14]}
                    ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
                    label={{ value: "pH", angle: -90, position: "insideLeft", fill: "#67b3e8", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#f5a962"
                    domain={kekeruhanDomain}
                    label={{ value: "Kekeruhan (%)", angle: 90, position: "insideRight", fill: "#f5a962", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === "Tingkat pH") return [value, "pH"]
                      return [`${value}%`, "Kekeruhan"]
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="pH" name="Tingkat pH" fill="#67b3e8" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="kekeruhan" name="Kekeruhan (%)" fill="#f5a962" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[430px]">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 text-center">Log</h3>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">Waktu</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">Aktivitas</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">Hash Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentLogs.length > 0 ? (
                      recentLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{log.waktu}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <LogStatusDot status={log.statusType as any} />
                              <span className="text-slate-700">{log.aktivitas}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded text-xs font-mono uppercase">
                              {log.hash_code}
                            </code>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">-</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <LogStatusDot status="info" />
                            <span className="text-slate-700">Belum ada aktivitas pakan</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded text-xs font-mono">
                            -
                          </code>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <Link
                href="/blockchain"
                className="w-full text-sm text-cyan-600 hover:text-cyan-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Shield size={14} />
                Lihat Semua di Audit Blockchain
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
