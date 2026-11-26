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
- Verify an API in `node_modules/@ceereals/vue-pdf/dist/*.d.ts` or on vue-pdf.org before using it.
  Don't assume react-pdf's API maps 1:1.
- Render only on the client (`<ClientOnly>` / `import.meta.client`). Revoke the previous object URL on every re-render and on unmount.
- Fonts: register once in `app/pdf/shared/fonts.ts`. Files go in `public/fonts/`. Never hotlink fonts.
- Optional fields must render cleanly when empty (no dangling separators or empty headings).
- Shape data for templates in small pure mappers (e.g. `formatPeriod`) and unit-test those.
