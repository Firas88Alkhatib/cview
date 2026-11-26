/**
 * UUID v4 from crypto.getRandomValues, which exists in every context. crypto.randomUUID only
 * exists in secure contexts (https or localhost), so plain-http access by IP (LAN, WSL, phones)
 * needs this. Also used by the randomUUID polyfill (plugins/crypto-polyfill.client.ts).
 */
export function uuidV4FromRandomValues(): `${string}-${string}-${string}-${string}-${string}` {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80 // RFC 4122 variant
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** New UUID v4 for list items and versions. */
export function newId(): string {
  return typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : uuidV4FromRandomValues()
}
