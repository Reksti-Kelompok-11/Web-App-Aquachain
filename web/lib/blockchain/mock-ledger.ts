import { mockTxHashForId } from "./format-tx-hash"
import { MOCK_BLOCKCHAIN_CONNECTION } from "./mock-config"
import type { LedgerFetchResult, LedgerRecord } from "./types"

function buildRecord(
  id: string,
  waktu: string,
  tipe: LedgerRecord["tipe"],
  status: LedgerRecord["status"],
  fields: LedgerRecord["payloadFields"],
): LedgerRecord {
  return {
    id,
    waktu,
    tipe,
    transactionHash: mockTxHashForId(id),
    payloadFields: fields,
    status,
  }
}

/** Data seed — ganti isi ini atau hapus setelah API siap */
const MOCK_LEDGER_SEED: LedgerRecord[] = [
  buildRecord("1", "12 Apr 2026, 08:00:12", "Otomasi Pakan", "Verified", [
    { label: "Kolam", value: "A1" },
    { label: "Target", value: "100 g", tone: "default" },
    { label: "Aktual", value: "105 g", tone: "warn" },
  ]),
  buildRecord("2", "11 Apr 2026, 15:42:05", "Intervensi Guardrail", "Verified", [
    { label: "Kolam", value: "A1" },
    { label: "pH", value: "8.8", tone: "warn" },
    { label: "Aksi", value: "Pakan dibatalkan", tone: "warn" },
  ]),
  buildRecord("3", "11 Apr 2026, 08:00:10", "Otomasi Pakan", "Verified", [
    { label: "Kolam", value: "A1" },
    { label: "Target", value: "150 g" },
    { label: "Aktual", value: "148 g", tone: "success" },
  ]),
  buildRecord("4", "09 Apr 2026, 11:15:30", "Peringatan Dini (FHI)", "Verified", [
    { label: "Kolam", value: "A1" },
    { label: "Kekeruhan", value: "85%", tone: "warn" },
    { label: "Catatan", value: "Filter kotor" },
  ]),
  buildRecord("5", "09 Apr 2026, 08:00:15", "Intervensi Guardrail", "Verified", [
    { label: "Kolam", value: "A1" },
    { label: "pH", value: "6.0", tone: "warn" },
    { label: "Aksi", value: "Pakan dibatalkan", tone: "warn" },
  ]),
  buildRecord("6", "08 Apr 2026, 08:00:12", "Otomasi Pakan", "Pending", [
    { label: "Kolam", value: "A1" },
    { label: "Target", value: "100 g" },
    { label: "Aktual", value: "105 g", tone: "warn" },
  ]),
  buildRecord("7", "07 Apr 2026, 11:15:30", "Peringatan Dini (FHI)", "Flagged", [
    { label: "Kolam", value: "A1" },
    { label: "Kekeruhan", value: "85%", tone: "warn" },
    { label: "Catatan", value: "Filter kotor" },
  ]),
  buildRecord("8", "07 Apr 2026, 08:00:15", "Intervensi Guardrail", "Verified", [
    { label: "Kolam", value: "A1" },
    { label: "pH", value: "6.0", tone: "warn" },
    { label: "Aksi", value: "Pakan dibatalkan", tone: "warn" },
  ]),
  buildRecord("9", "06 Apr 2026, 18:22:01", "Otomasi Pakan", "Verified", [
    { label: "Kolam", value: "B2" },
    { label: "Target", value: "80 g" },
    { label: "Aktual", value: "80 g", tone: "success" },
  ]),
  buildRecord("10", "06 Apr 2026, 12:05:44", "Otomasi Pakan", "Verified", [
    { label: "Kolam", value: "A1" },
    { label: "Target", value: "120 g" },
    { label: "Aktual", value: "118 g", tone: "success" },
  ]),
  buildRecord("11", "05 Apr 2026, 08:10:02", "Peringatan Dini (FHI)", "Verified", [
    { label: "Kolam", value: "B2" },
    { label: "DO", value: "4.1 mg/L", tone: "warn" },
    { label: "Catatan", value: "Aerasi dinaikkan" },
  ]),
  buildRecord("12", "04 Apr 2026, 15:30:00", "Intervensi Guardrail", "Pending", [
    { label: "Kolam", value: "B2" },
    { label: "Suhu", value: "32 °C", tone: "warn" },
    { label: "Aksi", value: "Jadwal ditunda 30 menit" },
  ]),
  buildRecord("13", "04 Apr 2026, 08:00:00", "Otomasi Pakan", "Verified", [
    { label: "Kolam", value: "A1" },
    { label: "Target", value: "95 g" },
    { label: "Aktual", value: "94 g", tone: "success" },
  ]),
  buildRecord("14", "03 Apr 2026, 20:15:33", "Otomasi Pakan", "Verified", [
    { label: "Kolam", value: "B2" },
    { label: "Target", value: "60 g" },
    { label: "Aktual", value: "60 g", tone: "success" },
  ]),
]

export async function fetchMockLedger(): Promise<LedgerFetchResult> {
  await new Promise((r) => setTimeout(r, 180))
  if (MOCK_BLOCKCHAIN_CONNECTION === "inactive") {
    return {
      connectionStatus: "inactive",
      records: [],
      lastSyncedAt: null,
    }
  }
  return {
    connectionStatus: "active",
    records: MOCK_LEDGER_SEED,
    lastSyncedAt: new Date().toISOString(),
  }
}
