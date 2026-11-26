---
paths:
  - "api.ts"
  - "server/**"
---
# Server rules (phase 2+)

- Phase 1 is frontend only (D-7). Don't add API, DB or auth work unless the current task is in phase 2 or later.
- Elysia is mounted by `nuxt-elysia` at `/api`. Export the app type for the Eden client (`@elysia/eden`).
- Validate every request body, param and query with the shared Zod schemas from `app/schemas/`.
- DB access through Drizzle only, in the server layer. Migrations are generated, not hand-edited (ask before running them).
- Secrets come from env (`.env`, never committed). Add new keys to `.env.example`.
