import { describe, expect, it } from 'vitest'
import en from '~~/i18n/locales/en.json'

type Messages = { [key: string]: string | Messages }

/** Flattens nested messages into `a.b.c` → value pairs. */
function flatten(messages: Messages, prefix = ''): Array<[string, unknown]> {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value] as [string, unknown]],
  )
}

describe('en locale', () => {
  const entries = flatten(en)

  it('has only non-empty string messages', () => {
    for (const [key, value] of entries) {
      expect(typeof value, key).toBe('string')
      expect(String(value).trim(), key).not.toBe('')
    }
  })

  it('uses camelCase key segments', () => {
    for (const [key] of entries) {
      for (const segment of key.split('.')) expect(segment, key).toMatch(/^[a-z][a-zA-Z0-9]*$/)
    }
  })
})
