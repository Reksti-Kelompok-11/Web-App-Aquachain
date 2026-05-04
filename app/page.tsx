"use client"

import { useMemo, useState } from "react"
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
    if (telemetry.ph < 6.5 || telemetry.ph > 8.2) return "bahaya"
    if (telemetry.ph < 6.8 || telemetry.ph > 7.8) return "waspada"
    return "aman"
  }
  if (metric === "suhu") {
    if (telemetry.suhu < 24 || telemetry.suhu > 31) return "bahaya"
    if (telemetry.suhu < 25 || telemetry.suhu > 29) return "waspada"
    return "aman"
  }
  if (metric === "kekeruhan") {
    if (telemetry.kekeruhan > 20) return "bahaya"
    if (telemetry.kekeruhan > 10) return "waspada"
    return "aman"
  }
  return getMetricStatus("ph", telemetry) === "bahaya" ||
    getMetricStatus("suhu", telemetry) === "bahaya" ||
    getMetricStatus("kekeruhan", telemetry) === "bahaya"
    ? "bahaya"
    : "aman"
}

const getShortHash = (hash: string) => {
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

export default function Dashboard() {
  // Dummy data (mudah diganti dari backend)
  const [dummyPonds] = useState<Pond[]>([
    { id: "A1", name: "Kolam A1", fish_type: "Lele", capacity: 3000, status: "aman" },
    { id: "A2", name: "Kolam A2", fish_type: "Lele", capacity: 2800, status: "waspada" },
    { id: "B1", name: "Kolam B1", fish_type: "Nila", capacity: 3200, status: "bahaya" },
  ])
  const [dummyTelemetry] = useState<TelemetryByPond>({
    A1: { ph: 7.2, suhu: 27, kekeruhan: 5 },
    A2: { ph: 7.8, suhu: 29, kekeruhan: 12 },
    B1: { ph: 8.5, suhu: 32, kekeruhan: 25 },
  })
  const [dummyLogs] = useState<LogItem[]>([
    { waktu: "08:00:12", aktivitas: "Pakan otomatis 50g", hash_code: "0x9e4a6f271ad19b8f8a1c7462f1259a0f", status: "success" },
    { waktu: "12:00:45", aktivitas: "Pakan batal (pH 8.5)", hash_code: "0x3b1c2d8f7e913cb6f6a9d50c2f8e66d1", status: "warning" },
    { waktu: "14:30:22", aktivitas: "Pakan otomatis 50g", hash_code: "0x7f2aa61ce9d30cb3e4ba6f8f2ffdcf92", status: "success" },
    { waktu: "15:45:08", aktivitas: "Sensor kalibrasi", hash_code: "0x8a3be17a4480f6fbc2d511ea6732af12", status: "info" },
    { waktu: "16:20:33", aktivitas: "Pakan otomatis 50g", hash_code: "0x5c1d77ef8e71ce5f911b0224799dbd8d", status: "success" },
    { waktu: "17:00:55", aktivitas: "Alert: suhu tinggi", hash_code: "0x2e9a33cd7b82e46f94fa7420d6c8aa17", status: "danger" },
    { waktu: "18:15:19", aktivitas: "Pakan otomatis 50g", hash_code: "0x6d4eb71a89590daf2ca55f0eab2a11f3", status: "success" },
    { waktu: "18:55:41", aktivitas: "Pompa oksigen otomatis aktif", hash_code: "0x7f11d69cb0f1cf71f4f2e6a886ef8c3a", status: "info" },
    { waktu: "19:20:03", aktivitas: "Kekeruhan menurun", hash_code: "0x0e6a5d5f6e2c99d2b72a8b3673104e22", status: "success" },
  ])

  const [activePondId, setActivePondId] = useState(dummyPonds[0].id)
  const activePond = useMemo(
    () => dummyPonds.find((pond) => pond.id === activePondId) ?? dummyPonds[0],
    [activePondId, dummyPonds],
  )
  const activeTelemetry = dummyTelemetry[activePond.id]
  const pondStatusMeta = getPoolStatusMeta(activePond.status)

  const chartData = useMemo(
    () => [
      { time: "06:00", pH: activeTelemetry.ph - 0.2, kekeruhan: Math.max(0, activeTelemetry.kekeruhan - 1) },
      { time: "09:00", pH: activeTelemetry.ph + 0.1, kekeruhan: activeTelemetry.kekeruhan },
      { time: "12:00", pH: activeTelemetry.ph - 0.1, kekeruhan: activeTelemetry.kekeruhan + 1 },
      { time: "15:00", pH: activeTelemetry.ph + 0.2, kekeruhan: Math.max(0, activeTelemetry.kekeruhan - 1) },
      { time: "18:00", pH: activeTelemetry.ph, kekeruhan: activeTelemetry.kekeruhan },
    ],
    [activeTelemetry],
  )
  const kekeruhanDomain = getKekeruhanDomain(chartData)

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
              <p className="text-slate-700">{activePond.name} - Diperbarui 3 menit lalu</p>
              <p className="text-sm text-slate-500">
                {activePond.fish_type} - {activePond.capacity} Ekor
              </p>
            </div>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            {dummyPonds.map((pond) => {
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
                  <p className="text-xs text-slate-500">{pond.fish_type} - {pond.capacity} Ekor</p>
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
                <StatusBadge status={getMetricStatus("pakan", activeTelemetry)} />
              </div>
              <p className="text-3xl font-bold text-teal-600 mt-4 text-center">
                {getMetricStatus("pakan", activeTelemetry) === "bahaya" ? "Tertunda" : "Terpenuhi"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm h-[430px] flex flex-col">
            <h3 className="text-xl font-bold text-cyan-700 mb-4 text-center">Grafik Fluktuasi Air</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                    {dummyLogs.map((log) => (
                      <tr key={`${log.waktu}-${log.hash_code}`} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{log.waktu}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <LogStatusDot status={log.status} />
                            <span className="text-slate-700">{log.aktivitas}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded text-xs font-mono">
                            {getShortHash(log.hash_code)}
                          </code>
                        </td>
                      </tr>
                    ))}
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
