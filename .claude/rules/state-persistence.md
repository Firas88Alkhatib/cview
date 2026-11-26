---
paths:
  - "app/stores/**"
  - "app/services/**"
  - "app/composables/**"
---
# State & persistence rules

- Pinia setup-style stores (`defineStore('cv', () => { ... })`). State is `ref`, getters are `computed`, actions are functions.
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
