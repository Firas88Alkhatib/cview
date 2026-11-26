import { describe, expect, it } from 'vitest'
import { periodSchema, profileSchema } from '~/schemas'
import enRaw from '~~/i18n/locales/en.json?raw'

// Plain strings (a direct .json import is compiled to message ASTs in the Nuxt runtime).
const en = JSON.parse(enRaw)

const messagesOf = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message) ?? []

describe('zod-i18n plugin', () => {
  it('translates generic issues into the current UI language', () => {
    const result = profileSchema.safeParse({ firstName: '', lastName: 'Lovelace', links: [] })
    expect(messagesOf(result)).toEqual([en.validation.required])
  })

  it('interpolates limits into the message', () => {
    const result = profileSchema.safeParse({
      firstName: 'x'.repeat(51),
      lastName: 'Lovelace',
      links: [],
    })
    expect(messagesOf(result)).toEqual(['Must be at most 50 characters'])
  })

  it('translates custom schema keys', () => {
    const result = periodSchema.safeParse({ start: '2021-03', end: '2021-01' })
    expect(messagesOf(result)).toEqual([en.validation.periodOrder])
  })
})
