---
paths:
  - "app/components/**"
  - "app/layouts/**"
  - "app/pages/**"
  - "app/utils/motion.ts"
---
# Animation rules (motion-v, D-12 / D-16)

- Use **motion-v** (`motion-v/nuxt` auto-imports its components) for anything beyond a trivial fade.
  Use Vue `<Transition>`/`<TransitionGroup>` only for simple enter/leave. No other animation libraries.
- Verify motion-v APIs in `node_modules/motion-v/dist/*.d.ts` or on motion.dev (Vue docs) before using them.
- Reuse the presets in `app/utils/motion.ts` (`fadeUpStagger`, `quickFadeOut`, springs). Don't inline
  new magic durations. Add a preset if one is missing.
- Patterns:
  - Sliding tab indicator uses a shared `layoutId`, unique per tab bar.
  - Section change uses keyed content: quick fade-out (~120 ms), then a staggered fade-up of the children.
  - List add/remove/reorder: `AnimatePresence` plus `layout` on items, keyed by stable `id`.
- Animate only `transform` and `opacity` (no width or height layout thrash). For the panel collapse use `layout` or transforms.
- Interruptions must be clean. Rapid clicks never queue animations or block input.
- Respect reduced motion (global `MotionConfig reducedMotion="user"` or equivalent). Never rely on an
  animation finishing for app state to be correct.
- E2E runs with `reducedMotion: 'reduce'`. Don't wait on animations in tests.
