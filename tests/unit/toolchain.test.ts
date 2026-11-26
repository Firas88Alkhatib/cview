import { describe, expect, it } from 'vitest'
import { z } from 'zod'

// Toolchain smoke test. Replace it with the real schema tests in P1-T01.
describe('unit toolchain', () => {
  it('runs in plain node without a DOM', () => {
    expect(typeof window).toBe('undefined')
  })

  it('resolves zod from app dependencies', () => {
    const schema = z.object({ name: z.string().min(1) })
    expect(schema.safeParse({ name: 'Ada' }).success).toBe(true)
    expect(schema.safeParse({ name: '' }).success).toBe(false)
  })
})
