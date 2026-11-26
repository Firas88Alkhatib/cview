---
paths:
  - "app/components/**"
  - "app/layouts/**"
  - "app/pages/**"
  - "app/app.vue"
  - "app/utils/motion.ts"
---
# Animation rules (motion-v 2.x, D-12 / D-16 / D-28)

- **Components** (auto-imported by `motion-v/nuxt`): `Motion` (`<Motion as="li" …>`), `AnimatePresence`,
  `LayoutGroup`, `MotionConfig`, `ReorderGroup`/`ReorderItem`. Composables such as `useReducedMotion` and
  `useAnimate` are auto-imported too. Use Vue `<Transition>` only for trivial enter/leave.
- **Preset directives** for one-line entrances on plain elements: `v-fade-up` and `v-fade-in`, defined in
  `presetDirectives` in `app/utils/motion.ts` and registered in `nuxt.config`. Raw `v-motion` is **off**.
  To add a preset, add it to `presetDirectives` (JSON only). Never inline motion values in templates.
- All values come from `app/utils/motion.ts`: `durations`, `easings`, `layoutSpring`, `fadeUpStagger`
  (`container` + `item`), `quickFadeOut`. Add a preset there if one is missing. No magic numbers in components.
- Patterns:
  - Sliding tab indicator: `<Motion layout-id="…">` with an id unique per bar, using `:transition="layoutSpring"`.
  - Section change: `<AnimatePresence mode="wait">` around content keyed by `mainId:subId`. The container uses
    `fadeUpStagger.container` (`initial="hidden" animate="visible" exit="exit"`), and the children use `fadeUpStagger.item`.
  - Lists: `<AnimatePresence>` plus `layout` on items keyed by stable `id`.
- Animate only `transform` and `opacity`. For panel resize or collapse use `layout` or transforms, never width tweens.
- Interruptions must be clean. Rapid clicks never queue animations or block input. App state never
  depends on an animation finishing.
- Reduced motion: global `<MotionConfig v-bind="motionConfig">` in `app.vue` (`reducedMotion: 'user'`).
  Motion then drops transforms and layout movement but keeps opacity fades, which is intended.
- Verify APIs in `node_modules/motion-v/dist/es/**/*.d.ts` before using anything not listed here.
- Tests: happy-dom doesn't run real animations, so assert end states or reduced-motion behaviour in nuxt tests
  (wait one macrotask, not `nextTick`) and real motion in Playwright. E2E runs with `reducedMotion: 'reduce'`.
