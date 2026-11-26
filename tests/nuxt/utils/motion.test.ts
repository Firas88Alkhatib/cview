import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, resolveDirective, withDirectives } from 'vue'
import { MotionConfig } from 'motion-v'

/** Renders a <p> with a registered preset directive, inside a MotionConfig. */
function withPreset(name: string, reducedMotion: 'always' | 'never') {
  return defineComponent({
    setup() {
      const directive = resolveDirective(name)
      return () =>
        h(MotionConfig, { reducedMotion }, () =>
          directive ? withDirectives(h('p', 'hello'), [[directive]]) : h('p', 'unresolved'),
        )
    },
  })
}

describe('motion preset directives', () => {
  it.each(['fade-up', 'fade-in'])('registers v-%s globally', async (name) => {
    const wrapper = await mountSuspended(withPreset(name, 'always'))
    expect(wrapper.text()).toBe('hello')
  })

  // Motion's reduced mode drops movement (transforms/layout) but keeps opacity fades.
  async function transformAfterMount(reducedMotion: 'always' | 'never') {
    const wrapper = await mountSuspended(withPreset('fade-up', reducedMotion))
    // Motion resolves the reduced-motion state on the next macrotask, not on nextTick.
    await new Promise((resolve) => setTimeout(resolve, 0))
    return wrapper.get('p').element.style.transform
  }

  it('starts below its final position when motion is allowed', async () => {
    expect(await transformAfterMount('never')).toContain('translateY(16px)')
  })

  it('does not move the element when reduced motion applies', async () => {
    expect(await transformAfterMount('always')).toBe('none')
  })
})
