/** Status koneksi jaringan / node — dari BE atau gateway IoT */
export type BlockchainConnectionStatus = "active" | "inactive"

export type BlockchainTxStatus = "Verified" | "Pending" | "Flagged"

export type BlockchainEventType =
  | "Otomasi Pakan"
  | "Intervensi Guardrail"
  | "Peringatan Dini (FHI)"

export interface LedgerPayloadField {
  label: string
  value: string
  tone?: "default" | "warn" | "success"
}

export interface LedgerRecord {
  id: string
  waktu: string
  tipe: BlockchainEventType
  /** Hash penuh (0x + 64 hex) untuk salin & integrasi explorer */
  transactionHash: string
  payloadFields: LedgerPayloadField[]
  status: BlockchainTxStatus
}

/** Bentuk respons yang diharapkan dari BE / indexer blockchain */
export interface LedgerFetchResult {
  connectionStatus: BlockchainConnectionStatus
  records: LedgerRecord[]
  /** ISO string atau null jika belum pernah sinkron */
  lastSyncedAt: string | null
}
