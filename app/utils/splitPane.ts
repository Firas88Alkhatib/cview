// Pure maths for the editor/preview split (P1-T06, D-43). Sizes are stored as the preview's
// fraction (0–1) of the split area, so they scale with the window. Limits are in pixels.

export interface SplitLimits {
  /** Smallest preview width in px (a readable A4 page). */
  previewMin: number
  /** Smallest editor width in px (usable forms). */
  editorMin: number
}

export const SPLIT_LIMITS: SplitLimits = { previewMin: 360, editorMin: 400 }

/** Width of the collapsed preview bar in px (D-44). */
export const COLLAPSED_BAR_WIDTH = 28

/**
 * Dragging the preview narrower than this many px collapses it: halfway below the minimum
 * (D-44). Between this and `previewMin` it stays at the minimum.
 */
export const collapseThreshold = (limits: SplitLimits = SPLIT_LIMITS) => limits.previewMin / 2

export type DragOutcome = { collapsed: true } | { collapsed: false; fraction: number }

/** What a drag with the pointer at `clientX` means: collapse, or a clamped preview size. */
export function dragOutcome(
  clientX: number,
  rect: { left: number; width: number },
  limits: SplitLimits = SPLIT_LIMITS,
): DragOutcome {
  const previewPx = rect.left + rect.width - clientX
  if (previewPx < collapseThreshold(limits)) return { collapsed: true }
  return { collapsed: false, fraction: clampPreview(previewPx / rect.width, rect.width, limits) }
}

/** Keyboard steps in px: arrow keys, and Shift+arrow. */
export const SPLIT_STEP = { small: 24, large: 96 } as const

/** Allowed preview fraction range for a container width. */
export function previewRange(width: number, limits: SplitLimits = SPLIT_LIMITS) {
  if (!(width > 0)) return { min: 0, max: 1 }
  const min = limits.previewMin / width
  const max = 1 - limits.editorMin / width
  // Too narrow for both minimums: the editor keeps its minimum (mobile layout is P1-T08).
  return min <= max ? { min, max } : { min: Math.max(0, max), max: Math.max(0, max) }
}

/** Clamps a preview fraction to the pixel minimums. Unknown widths (0, during SSR/tests) pass through. */
export function clampPreview(fraction: number, width: number, limits: SplitLimits = SPLIT_LIMITS) {
  if (!Number.isFinite(fraction)) return previewRange(width, limits).min
  const { min, max } = previewRange(width, limits)
  return Math.min(max, Math.max(min, fraction))
}

/**
 * Next preview fraction for a key on the separator, or null if the key isn't handled.
 * The divider moves with the arrow: ArrowLeft moves it left, so the preview grows.
 */
export function fractionForKey(
  key: string,
  options: { shift: boolean; current: number; width: number; limits?: SplitLimits },
): number | null {
  const { shift, current, width, limits = SPLIT_LIMITS } = options
  const { min, max } = previewRange(width, limits)
  const step = (shift ? SPLIT_STEP.large : SPLIT_STEP.small) / (width > 0 ? width : 1000)
  switch (key) {
    case 'ArrowLeft':
      return clampPreview(current + step, width, limits)
    case 'ArrowRight':
      return clampPreview(current - step, width, limits)
    case 'Home':
      return max // divider all the way left: largest preview
    case 'End':
      return min // divider all the way right: smallest preview
    default:
      return null
  }
}
