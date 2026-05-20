"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Search,
  ShieldCheck,
  Copy,
  CheckCheck,
  Activity,
  Database,
  Clock3,
  ChevronLeft,
  ChevronRight,
  WifiOff,
  RefreshCw,
  Layers,
  FileJson,
  Hash,
} from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { PageHeader } from "@/components/page-header"
import { useBlockchainLedger } from "@/hooks/useBlockchainLedger"
import { formatTxHashDisplay } from "@/lib/blockchain/format-tx-hash"
import type {
  BlockchainConnectionStatus,
  BlockchainEventType,
  BlockchainTxStatus,
  LedgerPayloadField,
} from "@/lib/blockchain/types"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 5

const txStatusStyle: Record<BlockchainTxStatus, string> = {
  Verified: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Flagged: "bg-red-100 text-red-700",
}

function PayloadDetail({ fields }: { fields: LedgerPayloadField[] }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50/95 to-white p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)]">
      <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-2">
        {fields.map((f, i) => (
          <div
            key={`${f.label}-${i}`}
            className="min-w-0 rounded-md bg-white/60 px-2 py-1.5 ring-1 ring-slate-100/80"
          >
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {f.label}
            </dt>
            <dd
              className={cn(
                "mt-0.5 truncate text-xs font-semibold text-slate-800",
                f.tone === "warn" && "text-amber-800",
                f.tone === "success" && "text-emerald-700",
              )}
              title={f.value}
            >
              {f.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ConnectionBadge({ status }: { status: BlockchainConnectionStatus }) {
  if (status === "active") {
    return (
      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium w-fit border border-emerald-100">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Status: Jaringan blockchain aktif
      </div>
    )
  }
  return (
    <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-sm font-medium w-fit border border-slate-200">
      <WifiOff className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
      Status: Tidak aktif (belum terhubung)
    </div>
  )
}

export default function BlockchainPage() {
  const { records, connectionStatus, lastSyncedAt, isLoading, error, refetch } =
    useBlockchainLedger()
  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState<"Semua" | BlockchainEventType>("Semua")
  const [statusFilter, setStatusFilter] = useState<"Semua" | BlockchainTxStatus>("Semua")
  const [copiedHash, setCopiedHash] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = useMemo(() => {
    if (connectionStatus !== "active") return []
    return records.filter((item) => {
      const flat = `${item.waktu} ${item.tipe} ${item.transactionHash} ${item.payloadFields.map((p) => `${p.label} ${p.value}`).join(" ")}`.toLowerCase()
      const matchSearch = flat.includes(search.toLowerCase())
      const matchEvent = eventFilter === "Semua" || item.tipe === eventFilter
      const matchStatus = statusFilter === "Semua" || item.status === statusFilter
      return matchSearch && matchEvent && matchStatus
    })
  }, [records, search, eventFilter, statusFilter, connectionStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, eventFilter, statusFilter, connectionStatus])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const verifiedCount = records.filter((d) => d.status === "Verified").length
  const pendingCount = records.filter((d) => d.status === "Pending").length
  const flaggedCount = records.filter((d) => d.status === "Flagged").length

  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    window.setTimeout(() => setCopiedHash(""), 1500)
  }

  const formatSynced = (iso: string | null) => {
    if (!iso) return null
    try {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso))
    } catch {
      return null
    }
  }

  const showPagination = connectionStatus === "active" && filteredData.length > ITEMS_PER_PAGE

  return (
    <div className="flex h-screen w-full bg-slate-100">
      <Sidebar />

      <main className="flex-1 overflow-auto p-8">
        <PageHeader
          title="Ledger Audit Blockchain"
          description="Verifikasi keaslian dan integritas data operasional melalui ledger terdistribusi."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">Transaksi terverifikasi</p>
              <ShieldCheck className="text-emerald-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-emerald-600">
              {isLoading ? "…" : connectionStatus === "active" ? verifiedCount : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Integritas hash tervalidasi</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">Menunggu konfirmasi</p>
              <Clock3 className="text-amber-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {isLoading ? "…" : connectionStatus === "active" ? pendingCount : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Node belum mencapai finalitas</p>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500">Perlu tinjauan</p>
              <Activity className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {isLoading ? "…" : connectionStatus === "active" ? flaggedCount : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Terindikasi anomali payload</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm ring-1 ring-red-100 hover:bg-red-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Coba lagi
            </button>
          </div>
        )}

        <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100/80">
          <div className="p-4 lg:p-5 border-b border-slate-100">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <ConnectionBadge status={connectionStatus} />
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isLoading}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                  Muat ulang
                </button>
              </div>

              <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                <label className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari TxHash, event, atau detail..."
                    disabled={connectionStatus !== "active"}
                    className="h-10 w-52 sm:w-64 rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </label>

                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value as "Semua" | BlockchainEventType)}
                  disabled={connectionStatus !== "active"}
                  className="h-10 min-w-44 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 bg-white disabled:bg-slate-50"
                >
                  <option value="Semua">Semua event</option>
                  <option value="Otomasi Pakan">Otomasi Pakan</option>
                  <option value="Intervensi Guardrail">Intervensi Guardrail</option>
                  <option value="Peringatan Dini (FHI)">Peringatan Dini (FHI)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "Semua" | BlockchainTxStatus)}
                  disabled={connectionStatus !== "active"}
                  className="h-10 min-w-36 rounded-lg border border-slate-200 px-3 text-sm text-slate-700 bg-white disabled:bg-slate-50"
                >
                  <option value="Semua">Semua status</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={14} className="text-slate-400" aria-hidden />
                      Waktu
                    </span>
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                    <span className="inline-flex items-center gap-2">
                      <Layers size={14} className="text-slate-400" aria-hidden />
                      Tipe event
                    </span>
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600 uppercase text-xs tracking-wider min-w-[220px]">
                    <span className="inline-flex items-center gap-2">
                      <FileJson size={14} className="text-slate-400" aria-hidden />
                      Detail payload
                    </span>
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600 uppercase text-xs tracking-wider whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <Hash size={14} className="text-slate-400" aria-hidden />
                      Transaction hash
                    </span>
                  </th>
                  <th className="text-left py-3.5 px-4 font-semibold text-slate-600 uppercase text-xs tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-cyan-600" aria-hidden />
                      Memuat ledger…
                    </td>
                  </tr>
                )}

                {!isLoading && connectionStatus === "inactive" && (
                  <tr>
                    <td colSpan={5} className="py-14 px-6">
                      <div className="mx-auto max-w-md text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <WifiOff className="h-6 w-6" aria-hidden />
                        </div>
                        <p className="font-semibold text-slate-800">Jaringan blockchain tidak aktif</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Hubungkan backend, node, atau gateway IoT untuk mulai mencatat transaksi ke ledger.
                          Ringkasan di atas akan terisi otomatis setelah koneksi aktif.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  connectionStatus === "active" &&
                  paginatedData.map((item) => (
                    <tr key={item.id} className="align-top hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{item.waktu}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 whitespace-nowrap">{item.tipe}</td>
                      <td className="py-3.5 px-4 max-w-xl">
                        <PayloadDetail fields={item.payloadFields} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-2">
                          <code
                            className="font-mono text-[11px] sm:text-xs bg-cyan-50 text-cyan-800 px-2 py-1 rounded-md border border-cyan-100/80 max-w-[140px] truncate sm:max-w-none"
                            title={item.transactionHash}
                          >
                            {formatTxHashDisplay(item.transactionHash)}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyHash(item.transactionHash)}
                            className="shrink-0 text-slate-400 hover:text-cyan-700 transition-colors"
                            aria-label="Salin transaction hash"
                          >
                            {copiedHash === item.transactionHash ? (
                              <CheckCheck size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${txStatusStyle[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                {!isLoading && connectionStatus === "active" && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500">
                      Tidak ada transaksi yang cocok dengan filter saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showPagination && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm text-slate-600">
                Menampilkan {filteredData.length === 0 ? 0 : startIndex + 1}-
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)} dari {filteredData.length}{" "}
                transaksi
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg font-medium text-sm transition-colors ${
                      safePage === page
                        ? "bg-cyan-600 text-white shadow-md"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
            <span>
              {connectionStatus === "active" && !isLoading
                ? `${filteredData.length} transaksi sesuai filter`
                : connectionStatus === "inactive" && !isLoading
                  ? "Tidak ada transaksi (jaringan tidak aktif)"
                  : "—"}
            </span>
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <Database size={14} className="shrink-0 text-slate-400" aria-hidden />
                {connectionStatus === "active"
                  ? lastSyncedAt
                    ? `Terakhir sinkron: ${formatSynced(lastSyncedAt) ?? "—"}`
                    : "Ledger sinkron dengan node utama"
                  : "Sinkronisasi ditangguhkan hingga jaringan aktif"}
              </span>
            </span>
          </div>
        </section>
      </main>
    </div>
  )
}
