# CView

A CV builder with a **live PDF preview**. Fill in structured forms on the left and watch a
pixel-accurate PDF of your CV update on the right, generated entirely in the browser.

> **Status:** early development (phase 0: tooling). See the [roadmap](docs/plan/ROADMAP.md).

## Features (planned)
- Split view with section forms on the left and a live PDF preview on the right
  - the preview can be resized, and collapses to a thin bar with a click-or-drag handle
- PDF colours, font and language controls (the PDF language is independent of the UI language)
- Multiple CV versions, and multiple templates (one in the first release)
- Guest mode (data kept in `sessionStorage`). Accounts with server persistence come later
- Validated inputs (Zod), a multilingual UI (i18n) and rich, reduced-motion-aware animations

## Tech stack
| | |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Framework | [Nuxt 4](https://nuxt.com) + TypeScript |
| UI | [Nuxt UI v4](https://ui.nuxt.com) (Tailwind CSS v4) |
| State | Pinia |
| Validation | Zod |
| PDF | [@ceereals/vue-pdf](https://vue-pdf.org) |
| Animation | [motion-v](https://motion.dev/docs/vue) |
| API | [Elysia](https://elysiajs.com) via `nuxt-elysia` (mounted at `/api`) |
| Database (later) | PostgreSQL + Drizzle ORM |
| Testing | Vitest + @nuxt/test-utils, Playwright |

## Getting started
Requires Bun ≥ 1.3.

```bash
bun install
bun run dev        # http://localhost:3000
```

## Scripts
| Command | Description |
|---|---|
| `bun run dev` | Start the dev server |
| `bun run build` | Production build (Nitro `bun` preset) |
| `bun run preview` | Preview the production build |
| `bun run generate` | Static generation |
| `bun run typecheck` | Type-check with vue-tsc |
| `bun run lint` | ESLint + Prettier check (`lint:fix` / `format` to fix) |
| `bun run test` | Unit + Nuxt integration tests (`test:unit`, `test:nuxt`, `test:watch`) |

The `test:e2e` (Playwright) script is added during phase 0.

## Project docs
| | |
|---|---|
| [docs/PROJECT.md](docs/PROJECT.md) | Product description and UX |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Folder layout, data flow, PDF pipeline |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Settled decisions and open questions |
| [docs/TESTING.md](docs/TESTING.md) | Testing strategy |
| [docs/plan/](docs/plan/ROADMAP.md) | Roadmap and phase task lists |

## Working with AI agents
This repo is set up for agentic coding. [AGENTS.md](AGENTS.md) is the entry point for any agent.
[CLAUDE.md](CLAUDE.md) adds Claude Code specifics. Path-scoped rules and reusable skills live in
[.claude/](.claude/).
