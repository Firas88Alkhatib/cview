import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import en from '~~/i18n/locales/en.json'

// vue-i18n's t() accepts any string, so typecheck can't catch typos. This test does.
const ROOT = join(import.meta.dirname, '../../..')
const APP = join(ROOT, 'app')
// PDF text comes from app/pdf/locales, not UI i18n (D-23).
const EXCLUDED = [join(APP, 'pdf')]
const KEY_CALL = /(?<![\w.])\$?t\(\s*(['"`])([\w.-]+)\1/g

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && /\.(vue|ts)$/.test(e.name))
    .map((e) => join(e.parentPath, e.name))
    .filter((file) => !EXCLUDED.some((ex) => file.startsWith(ex)))
}

function hasKey(messages: unknown, key: string): boolean {
  const value = key.split('.').reduce<unknown>((node, part) => {
    return node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined
  }, messages)
  return typeof value === 'string'
}

describe('i18n keys used in app/', () => {
  const usages = sourceFiles(APP).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(KEY_CALL)].map((m) => ({
      file: relative(ROOT, file),
      key: m[2]!,
    })),
  )

  it('finds translation calls (sanity check for the scanner)', () => {
    expect(usages.length).toBeGreaterThan(0)
  })

  it('all exist in the en locale', () => {
    const missing = usages.filter((u) => !hasKey(en, u.key)).map((u) => `${u.file}: ${u.key}`)
    expect(missing).toEqual([])
  })
})
