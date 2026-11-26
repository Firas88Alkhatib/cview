<template>
  <section :aria-label="$t('preview.region')" class="h-full min-w-0 overflow-hidden bg-muted">
    <!-- The panel never scrolls. Only the PDF document inside the viewer scrolls (D-17). -->
    <PreviewPdfPreviewSmoke />
  </section>
</template>
