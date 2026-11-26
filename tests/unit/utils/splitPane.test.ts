import { describe, expect, it } from 'vitest'
import {
  clampPreview,
  collapseThreshold,
  dragOutcome,
  fractionForKey,
  previewRange,
  SPLIT_LIMITS,
  SPLIT_STEP,
} from '~/utils/splitPane'

const W = 1280

describe('previewRange', () => {
  it('keeps the preview ≥ 360px and the editor ≥ 400px (D-43)', () => {
    const { min, max } = previewRange(W)
    expect(min * W).toBeCloseTo(SPLIT_LIMITS.previewMin)
    expect((1 - max) * W).toBeCloseTo(SPLIT_LIMITS.editorMin)
  })

  it('gives the editor its minimum when the container is too narrow for both', () => {
    const { min, max } = previewRange(600)
    expect(min).toBe(max)
    expect((1 - max) * 600).toBeCloseTo(400)
  })

  it('does not clamp when the width is unknown (SSR, before layout)', () => {
    expect(previewRange(0)).toEqual({ min: 0, max: 1 })
  })
})

describe('clampPreview', () => {
  it.each([
    [0.5, 0.5],
    [0.1, 360 / W],
    [0.95, 1 - 400 / W],
  ])('clamps %d', (input, expected) => {
    expect(clampPreview(input, W)).toBeCloseTo(expected)
  })

  it('recovers from a non-finite value', () => {
    expect(clampPreview(Number.NaN, W)).toBeCloseTo(360 / W)
  })
})

describe('fractionForKey', () => {
  const at = (key: string, shift = false, current = 0.5) =>
    fractionForKey(key, { shift, current, width: W })

  it('ArrowLeft moves the divider left, so the preview grows by one step', () => {
    expect(at('ArrowLeft')! * W).toBeCloseTo(0.5 * W + SPLIT_STEP.small)
    expect(at('ArrowRight')! * W).toBeCloseTo(0.5 * W - SPLIT_STEP.small)
  })

  it('Shift makes bigger steps', () => {
    expect(at('ArrowLeft', true)! * W).toBeCloseTo(0.5 * W + SPLIT_STEP.large)
  })

  it('Home and End jump to the limits', () => {
    expect(at('Home')).toBeCloseTo(1 - 400 / W)
    expect(at('End')).toBeCloseTo(360 / W)
  })

  it('never steps past a limit', () => {
    expect(at('ArrowRight', true, 360 / W)).toBeCloseTo(360 / W)
  })

  it('ignores other keys', () => {
    expect(at('Enter')).toBeNull()
  })
})

describe('dragOutcome (D-44)', () => {
  const rect = { left: 0, width: W }
  const atPreviewPx = (px: number) => dragOutcome(W - px, rect)

  it('resizes normally above the minimum', () => {
    expect(atPreviewPx(500)).toEqual({ collapsed: false, fraction: 500 / W })
  })

  it('holds at the minimum between the threshold and the minimum', () => {
    expect(collapseThreshold()).toBe(180)
    expect(atPreviewPx(200)).toEqual({ collapsed: false, fraction: 360 / W })
    expect(atPreviewPx(180)).toEqual({ collapsed: false, fraction: 360 / W })
  })

  it('collapses once the preview would be narrower than half the minimum', () => {
    expect(atPreviewPx(179)).toEqual({ collapsed: true })
    expect(atPreviewPx(-50)).toEqual({ collapsed: true }) // pointer past the right edge
  })

  it('still respects the editor minimum', () => {
    expect(atPreviewPx(W - 10)).toEqual({ collapsed: false, fraction: 1 - 400 / W })
  })
})
