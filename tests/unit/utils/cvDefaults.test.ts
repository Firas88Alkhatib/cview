import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { cvDataSchema, cvVersionSchema } from '~/schemas'
import { createSampleCvData, createVersion, DEFAULT_THEME } from '~/utils/cvDefaults'
import { newId } from '~/utils/id'
import { issuesOf } from '~~/tests/unit/schemas/helpers'

describe('newId', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns unique valid UUIDs', () => {
    const ids = Array.from({ length: 50 }, newId)
    expect(new Set(ids).size).toBe(50)
    for (const id of ids) expect(z.uuid().safeParse(id).success).toBe(true)
  })

  it('falls back to getRandomValues where randomUUID is unavailable (insecure context)', () => {
    const real = globalThis.crypto
    vi.stubGlobal('crypto', { getRandomValues: real.getRandomValues.bind(real) })
    const id = newId()
    expect(z.uuidv4().safeParse(id).success).toBe(true)
  })
})

describe('sample CV (D-41)', () => {
  it('is valid, so a first-time guest starts with a valid store', () => {
    expect(issuesOf(cvDataSchema, createSampleCvData())).toEqual([])
  })

  it('gets fresh ids on every call', () => {
    const [a, b] = [createSampleCvData(), createSampleCvData()]
    expect(a.experience[0]!.id).not.toBe(b.experience[0]!.id)
  })
})

describe('createVersion', () => {
  it('creates a valid version with defaults and matching timestamps', () => {
    const now = new Date('2026-11-26T12:00:00.000Z')
    const version = createVersion('My CV', createSampleCvData(), now)
    expect(issuesOf(cvVersionSchema, version)).toEqual([])
    expect(version.createdAt).toBe('2026-11-26T12:00:00.000Z')
    expect(version.updatedAt).toBe(version.createdAt)
  })

  it('does not share the default theme object between versions', () => {
    const version = createVersion('My CV', createSampleCvData())
    version.theme.colors.primary = '#000000'
    expect(DEFAULT_THEME.colors.primary).not.toBe('#000000')
  })
})
