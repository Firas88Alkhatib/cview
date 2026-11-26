# Roadmap

Status: `todo` · `in-progress` · `blocked (Q-n)` · `done`. Detailed tasks live in `phase-<n>.md`.
Later phases stay as outlines until the previous phase is close to done, so we don't plan against
assumptions that may change.

| Phase | Goal | Status | Tasks |
|---|---|---|---|
| 0 | Tooling & foundations | in-progress | `phase-0.md` |
| 1 | Frontend MVP: top bar, editor, live preview, 1 template, guest versions | todo | `phase-1.md` |
| 2 | Backend foundation: Elysia structure, Drizzle + Postgres, shared Zod validation | not planned | none yet |
| 3 | Auth & server persistence: login, CV CRUD, versions sync, guest → account import | not planned | none yet |
| 4 | Templates & polish: more templates, theme editor, custom sections, UI languages, performance, a11y audit | not planned | none yet |

## Phase outlines (to be broken into tasks later)
**Phase 2: Backend foundation**
- Split `api.ts` into Elysia modules; error handling; Eden client composable.
- Postgres (local via Docker?) plus Drizzle schema and migrations, mirroring the Zod schemas (drizzle-zod?).
- API request validation with the shared schemas. Integration tests against a test DB.

**Phase 3: Auth & persistence**
- Auth (Q-8). Session handling and route guards. "Continue as guest" vs "Sign in".
- `ApiStorageAdapter` behind the existing `StorageAdapter` interface.
- CV versions CRUD on the server. Import guest session data on sign-up.

**Phase 4: Templates & polish**
- Template gallery and switcher with thumbnails. More theme controls beyond the phase-1 toolbar (spacing, sizes?).
- **Custom sections and sub-sections** (D-18) via the section registry: user-defined section schema and a generic PDF block.
- **UI languages** (D-19): add locale files and a language picker in Settings (i18n infrastructure already exists from P0-T08). RTL support? (Ask.)
- PDF rendering in a Web Worker if needed. Lighthouse and accessibility pass.
