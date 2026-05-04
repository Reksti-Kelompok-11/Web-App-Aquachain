"use client"

import { useCallback, useEffect, useState } from "react"
import { fetchLedgerRecords } from "@/lib/blockchain/fetch-ledger"
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
      const res = await fetchLedgerRecords()
      setConnectionStatus(res.connectionStatus)
      setRecords(res.records)
      setLastSyncedAt(res.lastSyncedAt)
    } catch {
      setError("Gagal memuat ledger. Periksa koneksi atau coba lagi.")
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
