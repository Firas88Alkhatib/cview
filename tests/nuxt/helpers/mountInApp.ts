import { mountSuspended } from '@nuxt/test-utils/runtime'
import { UApp } from '#components'
import { defineComponent, h } from 'vue'
import type { Component } from 'vue'

/**
 * Mounts a component inside <UApp>, which provides tooltip, toast and overlay context.
 * Use it for any component that renders Nuxt UI overlays (UTooltip, UModal, UDropdownMenu, …).
 */
export function mountInApp(component: Component, props: Record<string, unknown> = {}) {
  return mountSuspended(
    defineComponent({
      setup: () => () => h(UApp, null, { default: () => h(component, props) }),
    }),
  )
}
