import type { Options, Transition, Variants } from 'motion-v'

// The single source for motion values (D-12 / D-16). Components and directives use these
// presets instead of inline numbers. Keep this file JSON-serializable, because nuxt.config
// imports it to register the preset directives.

/** Durations in seconds (motion-v unit). */
export const durations = {
  exit: 0.12,
  enter: 0.3,
  stagger: 0.05,
} as const

export const easings = {
  out: [0.22, 1, 0.36, 1],
  in: [0.4, 0, 1, 1],
} as const

/** Default spring for layout animations (sliding tab indicator, panels). */
export const layoutSpring: Transition = { type: 'spring', stiffness: 500, damping: 40, mass: 1 }

/** Global defaults applied through <MotionConfig> in app.vue. */
export const motionConfig = {
  reducedMotion: 'user',
  transition: { duration: durations.enter, ease: easings.out },
} as const

/** Rise from below and fade in. Used as the child of `fadeUpStagger.container`. */
export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: durations.enter, ease: easings.out } },
  exit: { opacity: 0, transition: { duration: durations.exit, ease: easings.in } },
}

/**
 * Section-change entrance: children rise in one after another.
 * Usage: container gets `:variants="fadeUpStagger.container" initial="hidden" animate="visible" exit="exit"`,
 * and each child gets `:variants="fadeUpStagger.item"`.
 */
export const fadeUpStagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: durations.stagger } },
    // Old content leaves all at once, quickly, so fast clicking never queues work.
    exit: { opacity: 0, transition: { duration: durations.exit, ease: easings.in } },
  } satisfies Variants,
  item: fadeUpItem,
} as const

/** Quick fade-out for content being replaced. */
export const quickFadeOut: Variants = {
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: durations.exit, ease: easings.in } },
}

/**
 * One-line entrance effects for plain elements, registered as directives in nuxt.config
 * (`v-fade-up`, `v-fade-in`). Use components for anything with exit, layout or stagger.
 */
export const presetDirectives = {
  'fade-up': {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.enter, ease: easings.out },
  },
  'fade-in': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: durations.enter, ease: easings.out },
  },
} satisfies Record<string, Options>
