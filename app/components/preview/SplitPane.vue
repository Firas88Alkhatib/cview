<script setup lang="ts">
import { useElementSize, useMounted } from '@vueuse/core'
import { UI_DEFAULTS } from '~/schemas/ui'
import { useUiStore } from '~/stores/ui'
import { clampPreview, fractionForKey, fractionFromPointer, previewRange } from '~/utils/splitPane'

// Editor (start) | divider | preview (end). The divider resizes the preview within pixel
// minimums (D-43). Its size lives in the ui store as a fraction. Collapse comes in P1-T07.
const ui = useUiStore()
const container = useTemplateRef<HTMLElement>('container')
const { width } = useElementSize(container)
const mounted = useMounted()
const previewId = useId()

// The stored size comes from sessionStorage on the client only. Apply it after mount so the
// SSR markup (default size) matches the first client render.
const fraction = computed(() =>
  mounted.value ? clampPreview(ui.previewSize, width.value) : UI_DEFAULTS.previewSize,
)
const range = computed(() => previewRange(width.value))
const percent = (f: number) => Math.round(f * 100)

const dragging = ref(false)

function containerWidth() {
  return container.value?.getBoundingClientRect().width ?? 0
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0) return
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  dragging.value = true
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value || !container.value) return
  const rect = container.value.getBoundingClientRect()
  ui.setPreviewSize(clampPreview(fractionFromPointer(event.clientX, rect), rect.width))
}

function onPointerUp(event: PointerEvent) {
  if (!dragging.value) return
  ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
  dragging.value = false
}

function onKeydown(event: KeyboardEvent) {
  const next = fractionForKey(event.key, {
    shift: event.shiftKey,
    current: fraction.value,
    width: containerWidth(),
  })
  if (next === null) return
  event.preventDefault()
  ui.setPreviewSize(next)
}
</script>

<template>
  <div
    ref="container"
    class="flex h-full min-w-0"
    :class="{ 'cursor-col-resize select-none': dragging }"
  >
    <div class="h-full min-w-0 flex-1">
      <slot name="start" />
    </div>

    <div
      role="separator"
      tabindex="0"
      aria-orientation="vertical"
      :aria-label="$t('workspace.resizePreview')"
      :aria-controls="previewId"
      :aria-valuenow="percent(fraction)"
      :aria-valuemin="percent(range.min)"
      :aria-valuemax="percent(range.max)"
      class="group relative z-10 -mx-1 w-2 shrink-0 cursor-col-resize touch-none outline-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
    >
      <!-- Visible 1px line inside an 8px hit area; highlighted on hover, drag and focus. -->
      <span
        class="absolute inset-y-0 left-1/2 -translate-x-1/2 transition-colors group-hover:bg-primary group-focus-visible:w-[3px] group-focus-visible:bg-primary"
        :class="dragging ? 'w-[3px] bg-primary' : 'w-px bg-border'"
      />
    </div>

    <!-- Defensive: pointer capture already routes the drag to the divider (verified in headless
         Chromium), but real browsers host the native PDF viewer in the iframe, so it also
         ignores pointer events while dragging. -->
    <div
      :id="previewId"
      class="h-full min-w-0 shrink-0"
      :class="{ '[&_iframe]:pointer-events-none': dragging }"
      :style="{ flexBasis: `${fraction * 100}%` }"
    >
      <slot name="end" />
    </div>
  </div>
</template>
