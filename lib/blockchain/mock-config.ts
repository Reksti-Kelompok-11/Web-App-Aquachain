import type { BlockchainConnectionStatus } from "./types"

/**
 * Untuk UI demo: `inactive` = belum terhubung / gateway nonaktif (tanpa data ledger).
 * Nanti ganti dengan nilai dari BE atau env, mis. `process.env.NEXT_PUBLIC_BLOCKCHAIN_ACTIVE === 'true'`.
 */
export const MOCK_BLOCKCHAIN_CONNECTION: BlockchainConnectionStatus = "active"
