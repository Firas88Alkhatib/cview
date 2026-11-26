import { useStorage } from '@vueuse/core'
import type { StorageLike } from '@vueuse/core'
import { defineStore, skipHydrate } from 'pinia'
import { computed } from 'vue'
import { UI_DEFAULTS, uiStateSchema } from '~/schemas/ui'
import type { UiState } from '~/types'

// Layout and navigation preferences for this tab session (D-40). Saved through VueUse
// useStorage, not the StorageAdapter: they're simple, never synced to the server, and losing
// them costs nothing. Validated on read, with per-field fallbacks.

export const UI_STORAGE_KEY = 'cview:ui'

const freshDefaults = (): UiState => structuredClone(uiStateSchema.parse(UI_DEFAULTS))

function sessionStorageOrUndefined(): StorageLike | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.sessionStorage
  } catch {
    return undefined
  }
}

export const useUiStore = defineStore('ui', () => {
  const state = useStorage<UiState>(UI_STORAGE_KEY, freshDefaults(), sessionStorageOrUndefined(), {
    serializer: {
      read: (raw) => {
        try {
          return uiStateSchema.parse(JSON.parse(raw))
        } catch {
          return freshDefaults()
        }
      },
      write: (value) => JSON.stringify(value),
    },
  })

  const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

  function setPreviewSize(size: number) {
    state.value.previewSize = clamp01(size)
    if (!state.value.previewCollapsed) state.value.lastExpandedSize = state.value.previewSize
  }

  /**
   * Collapses the preview to the thin bar. `restoreSize` is what a later click on the handle
   * restores. A drag-collapse passes the size from before the drag, not the minimum it passed.
   */
  function collapsePreview(restoreSize?: number) {
    if (state.value.previewCollapsed) return
    state.value.lastExpandedSize = clamp01(restoreSize ?? state.value.previewSize)
    state.value.previewCollapsed = true
  }

  /** Re-opens the preview at `size`, or at the last expanded size (click on the handle, D-5). */
  function expandPreview(size?: number) {
    state.value.previewCollapsed = false
    setPreviewSize(size ?? state.value.lastExpandedSize)
  }

  function navigate(mainId: string, subId: string | null = null) {
    state.value.editor = { mainId, subId }
  }

  function reset() {
    state.value = freshDefaults()
  }

  return {
    // skipHydrate: the store also exists during SSR (with defaults), and Pinia would otherwise
    // overwrite this sessionStorage-backed ref with that SSR state on the client.
    state: skipHydrate(state),
    previewSize: computed(() => state.value.previewSize),
    previewCollapsed: computed(() => state.value.previewCollapsed),
    editor: computed(() => state.value.editor),
    setPreviewSize,
    collapsePreview,
    expandPreview,
    navigate,
    reset,
  }
})
