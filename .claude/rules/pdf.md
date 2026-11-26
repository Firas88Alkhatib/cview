---
paths:
  - "app/pdf/**"
  - "app/composables/usePdf*.ts"
  - "app/components/preview/**"
---
# PDF rules (@ceereals/vue-pdf)

- Templates are **pure**. They take `data`, `theme`, `labels` (PDF locale dictionary) and `locale` props only.
  All fixed text comes from `labels`, never hard-coded and never from the UI i18n (`useI18n`). The PDF
  language is independent of the UI (D-23). No stores, no
  composables with side effects, no `fetch`.
- Use only vue-pdf primitives inside templates (`Document`, `Page`, `View`, `Text`, `Image`, `Link`, …).
  HTML elements and Nuxt UI components do not render in a PDF.
- Styles are react-pdf style objects (flexbox, pt units), not Tailwind classes. Keep them in a `styles`
  const per template and derive colours and font from `theme`.
- Verify an API in `node_modules/@ceereals/vue-pdf/dist/types/index.d.ts` (single file) or on vue-pdf.org.
  Don't assume react-pdf's API maps 1:1. Key exports (v0.3.1, checked in P0-T07):
  - `usePdf(docGetter, { reactive?, onError? })` returns `{ url, blob, isLoading, isFinished, error, execute, unmount }`.
    It re-renders reactively. It **revokes old blob URLs itself** (VueUse `useObjectUrl`), so don't revoke
    manually. It has **no debounce**, so wrap it in `usePdfDocument`.
  - `PDFViewer` (iframe), `PDFDownloadLink`, `PDFPrint`, `fontStore` (font registration), `renderToBuffer` (Node).
  - Exports: `browser` maps to the DOM build, otherwise the Node build. Components that render PDFs in the app use
    the `.client.vue` suffix (or `<ClientOnly>`).
- Render only on the client (`.client.vue` / `<ClientOnly>`).
- Bundle: the PDF engine is about **1.9 MB (668 KB gzipped)**. Never import it from the editor shell or layout.
  Keep it in lazily loaded preview code so the editor is interactive before the engine arrives.
- Fonts: register once in `app/pdf/shared/fonts.ts`. Files go in `public/fonts/`. Never hotlink fonts.
- Optional fields must render cleanly when empty (no dangling separators or empty headings).
- Shape data for templates in small pure mappers (e.g. `formatPeriod`) and unit-test those.
- Tests: `renderToBuffer(h(Template, props))` works in the **nuxt** Vitest project (see
  `tests/nuxt/pdf/HelloDocument.test.ts`). `/Info` metadata (e.g. `/Title`) is a plain `(literal)`.
  **Page text is hex-encoded and kerned**, even with `{ compress: false }`, so asserting body text needs a
  PDF text extractor (decide in P1-T09; ask before adding a dependency).
- Bun blocks vue-pdf's `patch-package` postinstall. That's harmless, because the package ships no patches. Don't `bun pm trust` it.
