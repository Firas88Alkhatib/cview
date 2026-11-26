<script setup lang="ts">
import { useElementSize, useEventListener, useMounted } from '@vueuse/core'
import { UI_DEFAULTS } from '~/schemas/ui'
import { useUiStore } from '~/stores/ui'
import {
  clampPreview,
  COLLAPSED_BAR_WIDTH,
  dragOutcome,
  fractionForKey,
  previewRange,
} from '~/utils/splitPane'

// Editor (start) | divider | preview (end). The divider resizes the preview within pixel
// minimums (D-43). Dragging far enough, clicking the chevron, or pressing Enter collapses it
// into a thin bar whose handle restores it by click or drag (D-5, D-44).
const ui = useUiStore()
const container = useTemplateRef<HTMLElement>('container')
const separator = useTemplateRef<HTMLElement>('separator')
const handle = useTemplateRef<{ $el: HTMLElement }>('handle')
const { width } = useElementSize(container)
const mounted = useMounted()
const previewId = useId()

// Stored state comes from sessionStorage on the client only. Use the defaults until mounted,
// so the SSR markup matches the first client render.
const collapsed = computed(() => mounted.value && ui.previewCollapsed)
const fraction = computed(() =>
  mounted.value ? clampPreview(ui.previewSize, width.value) : UI_DEFAULTS.previewSize,
)
const range = computed(() => previewRange(width.value))
const percent = (f: number) => Math.round(f * 100)

// ── pointer gestures ─────────────────────────────────────────────────────
// Listening on window, not with pointer capture, because collapsing or expanding mid-drag
// removes the element the gesture started on. Window listeners don't get events over iframes,
// so the preview ignores pointer events while dragging (see the template).
const CLICK_SLOP_PX = 4
interface Gesture {
  source: 'divider' | 'handle'
  startX: number
  /** The size a collapse during this gesture should restore later. */
  restoreSize: number
  moved: boolean
}
const gesture = ref<Gesture | null>(null)
const dragging = computed(() => gesture.value?.moved ?? false)

function startGesture(source: Gesture['source'], event: PointerEvent) {
  if (event.button !== 0) return
  event.preventDefault() // no text selection or focus jump while dragging
  gesture.value = {
    source,
    startX: event.clientX,
    restoreSize: source === 'divider' ? fraction.value : ui.state.lastExpandedSize,
    moved: false,
  }
}

useEventListener(window, 'pointermove', (event: PointerEvent) => {
  const g = gesture.value
  if (!g || !container.value) return
  if (!g.moved && Math.abs(event.clientX - g.startX) < CLICK_SLOP_PX) return
  g.moved = true
  const outcome = dragOutcome(event.clientX, container.value.getBoundingClientRect())
  if (outcome.collapsed) ui.collapsePreview(g.restoreSize)
  else if (ui.previewCollapsed) ui.expandPreview(outcome.fraction)
  else ui.setPreviewSize(outcome.fraction)
})

function endGesture() {
  const g = gesture.value
  if (!g) return
  gesture.value = null
  if (g.source === 'handle' && !g.moved) void expand() // a click, not a drag
}
useEventListener(window, 'pointerup', endGesture)
useEventListener(window, 'pointercancel', endGesture)

// ── buttons and keyboard ─────────────────────────────────────────────────
async function collapse() {
  ui.collapsePreview()
  await nextTick()
  handle.value?.$el.focus()
}

async function expand() {
  ui.expandPreview()
  await nextTick()
  separator.value?.focus()
}

function onSeparatorKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    void collapse()
    return
  }
  const next = fractionForKey(event.key, {
    shift: event.shiftKey,
    current: fraction.value,
    width: container.value?.getBoundingClientRect().width ?? 0,
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

    <!-- Expanded: the divider (resize) with a collapse chevron on it. -->
    <div v-if="!collapsed" class="group relative z-10 -mx-1 w-2 shrink-0">
      <div
        ref="separator"
        role="separator"
        tabindex="0"
        aria-orientation="vertical"
        :aria-label="$t('workspace.resizePreview')"
        :aria-controls="previewId"
        :aria-valuenow="percent(fraction)"
        :aria-valuemin="percent(range.min)"
        :aria-valuemax="percent(range.max)"
        class="peer absolute inset-0 cursor-col-resize touch-none outline-none"
        @pointerdown="startGesture('divider', $event)"
        @keydown="onSeparatorKeydown"
      >
        <!-- Visible 1px line inside an 8px hit area; 3px and primary on hover/focus/drag. -->
        <span
          class="absolute inset-y-0 left-1/2 -translate-x-1/2 transition-colors group-hover:bg-primary group-focus-within:w-[3px] group-focus-within:bg-primary"
          :class="dragging ? 'w-[3px] bg-primary' : 'w-px bg-border'"
        />
      </div>
      <UButton
        icon="i-lucide-chevron-right"
        size="xs"
        color="neutral"
        :aria-label="$t('workspace.hidePreview')"
        :aria-controls="previewId"
        aria-expanded="true"
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 shadow-sm transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        @click="collapse"
      />
    </div>

    <!-- Collapsed: a thin bar with a pop-out handle (click: restore, drag: pull out). -->
    <div
      v-else
      class="flex h-full shrink-0 items-center justify-center border-l border-default bg-muted"
      :style="{ width: `${COLLAPSED_BAR_WIDTH}px` }"
    >
      <UButton
        ref="handle"
        icon="i-lucide-chevron-left"
        size="xs"
        color="neutral"
        :aria-label="$t('workspace.showPreview')"
        :aria-controls="previewId"
        aria-expanded="false"
        class="-ml-3 cursor-col-resize touch-none rounded-full shadow-sm"
        @pointerdown="startGesture('handle', $event)"
        @keydown.enter.prevent="expand"
        @keydown.space.prevent="expand"
      />
    </div>

    <!-- Kept mounted while collapsed, so the PDF doesn't re-render on expand. During a gesture
         it ignores pointer events: the iframe would otherwise swallow the window-level drag
         listeners (removing this fails 8 E2E tests). -->
    <div
      v-show="!collapsed"
      :id="previewId"
      class="h-full min-w-0 shrink-0"
      :class="
        gesture
          ? 'pointer-events-none'
          : 'motion-safe:transition-[flex-basis] motion-safe:duration-200'
      "
      :style="{ flexBasis: `${fraction * 100}%` }"
    >
      <slot name="end" />
    </div>
  </div>
</template>
