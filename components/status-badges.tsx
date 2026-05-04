"use client"

export type MetricStatus = "aman" | "waspada" | "bahaya"
export type KolamStatus = "Baik" | "Sedang" | "Bahaya"

// Status badge untuk metrik (pH, Suhu, dll)
export function StatusBadge({ status }: { status: MetricStatus }) {
  const configs = {
    aman: {
      bg: "bg-green-500",
      glow: "shadow-[0_0_12px_rgba(34,197,94,0.7)]",
      text: "Aman",
    },
    waspada: {
      bg: "bg-yellow-500",
      glow: "shadow-[0_0_12px_rgba(234,179,8,0.7)]",
      text: "Waspada",
    },
    bahaya: {
      bg: "bg-red-500",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.7)]",
      text: "Bahaya",
    },
  }

  const config = configs[status]

  return (
    <span
      className={`${config.bg} ${config.glow} text-white text-xs font-semibold px-2 py-1 rounded-full animate-pulse whitespace-nowrap`}
    >
      {config.text}
    </span>
  )
}

// Status badge untuk kolam
export function KolamStatusBadge({ status }: { status: KolamStatus }) {
  const configs = {
    Baik: {
      bg: "bg-green-500",
      glow: "shadow-[0_0_10px_rgba(34,197,94,0.6)]",
      textColor: "text-green-100",
    },
    Sedang: {
      bg: "bg-yellow-500",
      glow: "shadow-[0_0_10px_rgba(234,179,8,0.6)]",
      textColor: "text-yellow-100",
    },
    Bahaya: {
      bg: "bg-red-500",
      glow: "shadow-[0_0_10px_rgba(239,68,68,0.6)]",
      textColor: "text-red-100",
    },
  }

  const config = configs[status]

  return (
    <div className="flex items-center justify-center gap-2 mt-1">
      <span
        className={`w-3 h-3 rounded-full ${config.bg} ${config.glow} animate-pulse`}
      ></span>
      <span className={`text-sm font-medium ${config.bg} ${config.glow} ${config.textColor} px-2 py-0.5 rounded-full`}>
        {status}
      </span>
    </div>
  )
}

// Status dot untuk log table
export function LogStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colors[status] || colors.info} mr-2`}></span>
  )
}

// Alert status badge untuk peringatan dini
export function AlertStatusBadge({ status }: { status: "resolved" | "auto" | "pending" }) {
  const configs = {
    resolved: {
      bg: "bg-green-100",
      text: "text-green-700",
      label: "Normal Kembali",
    },
    auto: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Otomatis diputus",
    },
    pending: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Menunggu",
    },
  }

  const config = configs[status]

  return (
    <span className={`${config.bg} ${config.text} text-xs font-medium px-2 py-1 rounded-full`}>
      {config.label}
    </span>
  )
}
