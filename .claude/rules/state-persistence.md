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
- Persisted payloads carry a `schemaVersion`. Bump it and add a migration when a schema shape changes
  (ask about the migration policy first).
- Keep actions small and named for intent (`addExperience`, `updateExperience(id, patch)`, `reorderExperience`).
- No business logic in components. Put it in stores or composables so it stays unit-testable.
