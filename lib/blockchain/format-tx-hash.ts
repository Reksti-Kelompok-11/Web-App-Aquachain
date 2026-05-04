/**
 * Hash dummy deterministik panjang penuh (format mirip Ethereum tx hash).
 */
export function mockTxHashForId(id: string | number): string {
  let x = Number(String(id).replace(/\D/g, "") || "1") * 1664525 + 1013904223
  let out = ""
  for (let i = 0; i < 64; i++) {
    x = (Math.imul(x, 1103515245) + 12345) >>> 0
    out += (x % 16).toString(16)
  }
  return `0x${out}`
}

/** Tampilan singkat seperti Figma: 0x + awal … akhir */
export function formatTxHashDisplay(
  fullHash: string,
  opts?: { headChars?: number; tailChars?: number },
): string {
  const h = fullHash.trim()
  const head = opts?.headChars ?? 6
  const tail = opts?.tailChars ?? 4
  if (!h.startsWith("0x") || h.length <= 2 + head + tail) return h
  const body = h.slice(2)
  if (body.length <= head + tail) return h
  return `0x${body.slice(0, head)}…${body.slice(-tail)}`
}
