import type { CvVersion } from '~/types'

/**
 * Persistence boundary (ARCHITECTURE.md). Stores talk only to this interface. Phase 1 uses
 * sessionStorage, and phase 3 adds an API adapter with the same contract. Async on purpose.
 */
export interface StorageAdapter {
  /** All readable versions in saved order, plus a report of the ones that couldn't be loaded. */
  listVersions(): Promise<LoadedVersions>
  loadVersion(id: string): Promise<CvVersion | null>
  /** Validates first. Only valid data is ever persisted (D-38). */
  saveVersion(version: CvVersion): Promise<void>
  removeVersion(id: string): Promise<void>
  getActiveId(): Promise<string | null>
  setActiveId(id: string | null): Promise<void>
}

export interface LoadedVersions {
  versions: CvVersion[]
  /** Versions that couldn't be used. Each one is quarantined, not deleted (D-39). */
  skipped: SkippedVersion[]
}

export type SkipReason =
  /** Not JSON, or not a `{ schemaVersion, version }` envelope. */
  | 'corrupt'
  /** Saved by a newer app version than this one. */
  | 'future'
  /** A migration step threw, or one is missing. */
  | 'migrationFailed'
  /** Migrated, but still fails cvVersionSchema. */
  | 'invalid'

export interface SkippedVersion {
  id: string
  reason: SkipReason
}

export type PersistenceErrorCode = 'invalid' | 'quota' | 'unavailable'

export class PersistenceError extends Error {
  constructor(
    readonly code: PersistenceErrorCode,
    options?: { cause?: unknown },
  ) {
    super(`Persistence failed: ${code}`, options)
    this.name = 'PersistenceError'
  }
}
