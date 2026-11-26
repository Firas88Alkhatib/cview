# CView — Agent Instructions

CV builder: forms on the left, live in-browser PDF preview on the right. One Nuxt app serves UI + API.
Full product spec: `docs/PROJECT.md` · Architecture: `docs/ARCHITECTURE.md` · Plan: `docs/plan/ROADMAP.md`

## Golden rules
1. **Ask the developer before any decision** not already settled in `docs/DECISIONS.md` or the current task
   (new dependency, data-model change, UX behaviour, file/folder structure, naming of public APIs,
   anything ambiguous). Ask concise questions with options and a recommendation. Never guess silently.
2. **Work one task at a time** from `docs/plan/`. Do not start the next task without confirmation.
3. **Read only what you need.** Start from the docs map below; open the specific file, not whole folders.
   Do not re-read files you just edited. Do not read `bun.lock`, `.nuxt/`, `.output/`, `node_modules/`
   (exception: `node_modules/<pkg>/dist/*.d.ts` to verify a library API).
4. **Verify library APIs, never assume.** Check the package's types/docs before using an API you are
   not certain of (especially `@ceereals/vue-pdf`, Nuxt UI v4, Zod v4, Vitest, Elysia).
5. **Every change ships with tests** at the right layer (see `docs/TESTING.md`). Run checks before
   reporting done; report failures honestly with output.
6. Record settled decisions in `docs/DECISIONS.md`; update task status in the phase file when done.
7. **Never run `git commit` or `git push`.** Never amend, rebase, merge, tag or force anything else that
   rewrites or publishes history. The developer commits and pushes. When work is ready, say so and suggest
   a commit message. Staging (`git add`), `git status`, `git diff` and `git log` are fine.
   Never add secrets to the repo.

## Stack (do not swap without asking)
| Concern | Choice |
|---|---|
| Runtime / package manager | Bun (`bun`, `bunx` — never npm/yarn/pnpm) |
| Framework | Nuxt 4 (`app/` srcDir), Vue 3 `<script setup lang="ts">`, TypeScript strict |
| UI | Nuxt UI v4 (`U*` components, Tailwind v4, tokens in `app/assets/css/main.css`) |
| State | Pinia (setup-style stores) |
| i18n | `@nuxtjs/i18n`: every UI string via `t()` / `$t()`, English first (`i18n/locales/en.json`) |
| Validation | Zod v4 — schemas are the source of truth; types come from `z.infer` |
| PDF | `@ceereals/vue-pdf` (component-based documents, rendered client-side) |
| Animation | motion-v components + preset directives (`v-fade-up`, `v-fade-in`). All values in `app/utils/motion.ts` |
| API (phase 2+) | Elysia via `nuxt-elysia` mounted at `/api` (`api.ts`), Eden client for typed calls |
| DB (phase 2+) | PostgreSQL + Drizzle ORM |
| Tests | Vitest + `@nuxt/test-utils` (unit + integration), Playwright (E2E) |

## Commands
```bash
bun install            # install
bun run dev            # dev server http://localhost:3000
bun run build          # production build (Nitro preset: bun)
bun run typecheck      # nuxi typecheck
bun run lint           # eslint + prettier --check (lint:fix / format to auto-fix)
bun run test:unit      # vitest, project "unit" (node env, fast)
bun run test:nuxt      # vitest, project "nuxt" (Nuxt runtime, components/integration)
bun run test:e2e       # playwright
bun run test           # unit + nuxt (test:watch for watch mode)
```
If a script is missing, its setup task in `docs/plan/phase-0.md` is not done yet — say so, don't improvise.
Run the narrowest command first (single file: `bunx vitest run path/to/file.test.ts`).

## Code conventions
- Prettier: single quotes, no semicolons, width 100. Format matches existing files.
- Components: PascalCase, **multi-word** names (`App*` prefix for app-wide ones, D-27); Nuxt auto-imports (components, composables, `utils/`) — don't add
  manual imports for auto-imported things. Explicit `import type` for types.
- Props/emits typed with `defineProps<...>()` / `defineEmits<...>()`. Use `defineModel` for v-model.
- No `any`. No non-null `!` unless justified in a comment. Prefer `readonly`/`as const` for constants.
- Keep components small (< ~150 lines). Extract logic to composables (`app/composables/use*.ts`).
- Styling: Nuxt UI props and `ui` prop first, Tailwind utilities second, no scoped CSS unless needed.
  Default variants are configured in `app/app.config.ts`; don't repeat them per component.
- **No hard-coded UI text.** Use i18n keys, including labels, placeholders, aria-labels, toasts and Zod error
  messages shown in the UI. Key style: `section.component.purpose` (e.g. `editor.profile.firstName`).
- Accessibility: every input has a label (`UFormField`), interactive elements are keyboard reachable.
- Client-only code (PDF rendering, storage) must be guarded (`<ClientOnly>`, `import.meta.client`).
- Comments explain *why*, not *what*.

## Docs map (open on demand)
| Need | File |
|---|---|
| What we build, features, UX | `docs/PROJECT.md` |
| Folder layout, data flow, module boundaries | `docs/ARCHITECTURE.md` |
| Settled decisions + open questions | `docs/DECISIONS.md` |
| Test strategy, layers, patterns | `docs/TESTING.md` |
| Phases and status | `docs/plan/ROADMAP.md` |
| Current tasks | `docs/plan/phase-<n>.md` |
