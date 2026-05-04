import type { LedgerFetchResult } from "./types"
import { fetchMockLedger } from "./mock-ledger"

/**
 * Titik integrasi tunggal untuk subsistem BE / IoT / indexer.
 * Nanti: ganti body dengan `fetch('/api/v1/blockchain/ledger', …)` dan map JSON ke `LedgerFetchResult`.
 */
export async function fetchLedgerRecords(): Promise<LedgerFetchResult> {
  return fetchMockLedger()
}
