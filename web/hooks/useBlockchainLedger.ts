"use client"

import { useCallback, useEffect, useState } from "react"
import type { BlockchainConnectionStatus, LedgerRecord } from "@/lib/blockchain/types"

export interface UseBlockchainLedgerState {
  records: LedgerRecord[]
  connectionStatus: BlockchainConnectionStatus
  lastSyncedAt: string | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Lapisan data untuk halaman ledger. Ganti `fetchLedgerRecords` di `lib/blockchain/fetch-ledger.ts`
 * untuk menghubungkan API tanpa mengubah UI.
 */
export function useBlockchainLedger(): UseBlockchainLedgerState {
  const [records, setRecords] = useState<LedgerRecord[]>([])
  const [connectionStatus, setConnectionStatus] =
    useState<BlockchainConnectionStatus>("inactive")
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("https://backend-aqua-chain.vercel.app/api/blockchain/logs/pond-001")
      if (!res.ok) throw new Error("Gagal mengambil data blockchain")
      
      const rawData = await res.json()
      
      // Pastikan kita mengambil array-nya, baik itu langsung atau di dalam properti .data
      const logsArray = Array.isArray(rawData) ? rawData : (rawData.data || [])

      const mappedRecords: LedgerRecord[] = logsArray.map((item: any) => {
        const dateObj = new Date(item.timestamp)
        
        // Pemetaan status agar sesuai dengan UI
        let uiStatus: "Verified" | "Pending" | "Flagged" = "Pending"
        const statusFromDB = item.verification_status?.toLowerCase()
        
        if (statusFromDB === "verified") uiStatus = "Verified"
        else if (statusFromDB === "flagged") uiStatus = "Flagged"

        return {
          id: item.blockchain_id || item.id,
          waktu: dateObj.toLocaleDateString("id-ID", { 
            day: "2-digit", 
            month: "short", 
            year: "numeric", 
            hour: "2-digit", 
            minute: "2-digit" 
          }),
          tipe: "Pencatatan Telemetri", 
          transactionHash: item.tx_hash || "N/A",
          status: uiStatus,
          payloadFields: [
            { label: "Block Number", value: item.block_number?.toString() || "Menunggu" },
            { label: "Log ID", value: item.log_id || "N/A" }
          ]
        }
      })

      setRecords(mappedRecords)
      setConnectionStatus("active")
      
    } catch (err) {
      console.error(err)
      setError("Gagal memuat ledger. Periksa koneksi ke Vercel atau coba lagi.")
      setRecords([])
      setConnectionStatus("inactive")
      setLastSyncedAt(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    records,
    connectionStatus,
    lastSyncedAt,
    isLoading,
    error,
    refetch: load,
  }
}
