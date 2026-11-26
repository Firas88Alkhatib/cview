---
paths:
  - "app/stores/**"
  - "app/services/**"
  - "app/composables/**"
---
# State & persistence rules

- Pinia setup-style stores (`defineStore('cv', () => { ... })`). State is `ref`, getters are `computed`, actions are functions.
- Stores, services and the utils they use **import explicitly** (`pinia`, `vue`, `~/…`), an exception to the
  auto-import rule, so they run in the plain-node `unit` project.
- **All CV writes go through `versions.commit(id, mutate)`**, which clones, mutates, validates the whole version and
  commits only if valid. `cv` store actions wrap it and return `boolean` (or `id | null` for adds). Never mutate
  `versions.versions` directly.
- `structuredClone` can't copy reactive proxies, so use `structuredClone(toRaw(x))`.
- Unit-test stores with `setActivePinia(createPinia())`, an adapter over `MemoryStorage`, `hydrate({ adapter })`,
  fake timers and `flush()`. For reload tests (`tests/nuxt/stores/persistence.test.ts`), make a fresh Pinia
  against the same sessionStorage.
- Stores reach storage only through the `StorageAdapter` interface (`app/services/persistence/`).
  Never call `sessionStorage` or `localStorage` from stores or components.
- Hydrate on the client only, and validate hydrated data with Zod. Invalid data is never trusted.
- Persisted payloads are `{ schemaVersion, version }` envelopes. **Any stored-shape change** (adding a required
  field, renaming or restructuring) needs: bump `CURRENT_SCHEMA_VERSION` in `app/services/persistence/migrations.ts`,
  add `migrations[old]` (old → old+1), update the fixtures, and add a migration test in
  `tests/unit/services/webStorageAdapter.test.ts`. Optional-field additions don't need a migration.
- Only valid data reaches stores and storage (D-38). `saveVersion` rejects invalid data, so validate before calling actions.
- Unit-test adapters with `MemoryStorage` from `~~/tests/fixtures/storage` (`failWrites` simulates a full quota).
- Keep actions small and named for intent (`addExperience`, `updateExperience(id, patch)`, `reorderExperience`).
- No business logic in components. Put it in stores or composables so it stays unit-testable.
