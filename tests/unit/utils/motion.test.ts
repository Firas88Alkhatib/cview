import { describe, expect, it } from 'vitest'
import {
  durations,
  fadeUpStagger,
  motionConfig,
  presetDirectives,
  quickFadeOut,
} from '~/utils/motion'

describe('motion presets', () => {
  it('honours the user reduced-motion preference globally', () => {
    expect(motionConfig.reducedMotion).toBe('user')
  })

  it('keeps the section-change timings within the agreed spec (D-16)', () => {
    expect(durations.exit).toBeLessThanOrEqual(0.15)
    expect(durations.stagger).toBeGreaterThanOrEqual(0.04)
    expect(durations.stagger).toBeLessThanOrEqual(0.06)
  })

  it('staggers children on enter and fades the container out quickly on exit', () => {
    expect(fadeUpStagger.container.visible.transition.staggerChildren).toBe(durations.stagger)
    expect(fadeUpStagger.container.exit.transition.duration).toBe(durations.exit)
    expect(quickFadeOut.exit).toMatchObject({ opacity: 0 })
  })

  it('makes items rise from below into their final position', () => {
    expect(fadeUpStagger.item.hidden).toMatchObject({ opacity: 0, y: 16 })
    expect(fadeUpStagger.item.visible).toMatchObject({ opacity: 1, y: 0 })
  })

  it('keeps preset directives JSON-serializable for nuxt.config', () => {
    expect(JSON.parse(JSON.stringify(presetDirectives))).toEqual(presetDirectives)
    expect(Object.keys(presetDirectives)).toEqual(['fade-up', 'fade-in'])
  })
})
