import * as z from 'zod'

/**
 * Per-session layout and navigation preferences (`ui` store, D-40). Every field falls back
 * independently, so one bad value never resets the rest.
 * `previewSize` is the preview panel's share of the split area (0–1). The real min/max come in P1-T06.
 */
export const UI_DEFAULTS = {
  previewSize: 0.5,
  previewCollapsed: false,
  lastExpandedSize: 0.5,
  editor: { mainId: 'profile', subId: null as string | null },
} as const

export const uiStateSchema = z.object({
  previewSize: z.number().min(0).max(1).catch(UI_DEFAULTS.previewSize),
  previewCollapsed: z.boolean().catch(UI_DEFAULTS.previewCollapsed),
  lastExpandedSize: z.number().min(0).max(1).catch(UI_DEFAULTS.lastExpandedSize),
  editor: z
    .object({
      mainId: z.string().min(1).catch(UI_DEFAULTS.editor.mainId),
      subId: z.string().min(1).nullable().catch(UI_DEFAULTS.editor.subId),
    })
    .catch({ ...UI_DEFAULTS.editor }),
})
