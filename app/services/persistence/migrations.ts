import { cvVersionSchema } from '~/schemas'
import type { SkipReason } from '~/services/persistence/types'
import type { CvVersion } from '~/types'

/**
 * Bump this when a stored shape changes, and add a migration from the previous number.
 * `migrations[n]` upgrades data saved at schema version n to n + 1 (D-39).
 */
export const CURRENT_SCHEMA_VERSION = 1

export type Migration = (data: unknown) => unknown
export type MigrationRegistry = Readonly<Record<number, Migration>>

export const migrations: MigrationRegistry = {
  // 1: (v1) => ({ ...v1, newField: default }),
}

export interface StoredEnvelope {
  schemaVersion: number
  version: unknown
}

export type UpgradeResult = { ok: true; version: CvVersion } | { ok: false; reason: SkipReason }

export function isEnvelope(value: unknown): value is StoredEnvelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    Number.isInteger((value as StoredEnvelope).schemaVersion) &&
    (value as StoredEnvelope).schemaVersion >= 1 &&
    'version' in value
  )
}

/** Migrates a stored envelope step by step to `current`, then validates it with Zod. */
export function upgrade(
  envelope: StoredEnvelope,
  registry: MigrationRegistry = migrations,
  current: number = CURRENT_SCHEMA_VERSION,
): UpgradeResult {
  if (envelope.schemaVersion > current) return { ok: false, reason: 'future' }

  let data = envelope.version
  for (let from = envelope.schemaVersion; from < current; from++) {
    const step = registry[from]
    if (!step) return { ok: false, reason: 'migrationFailed' }
    try {
      data = step(data)
    } catch {
      return { ok: false, reason: 'migrationFailed' }
    }
  }

  const parsed = cvVersionSchema.safeParse(data)
  return parsed.success ? { ok: true, version: parsed.data } : { ok: false, reason: 'invalid' }
}
