<script setup lang="ts">
import { usePdf } from '@ceereals/vue-pdf'
import { h } from 'vue'
import { getPdfLabels } from '~/pdf/locales'
import { DEFAULT_PDF_LOCALE } from '~/pdf/meta'
import { defaultTemplate } from '~/pdf/registry'
import { registerPdfFonts } from '~/pdf/shared/fonts'
import { createSampleCvData, DEFAULT_THEME } from '~/utils/cvDefaults'

// Smoke preview: the template system end to end, with the sample CV. P1-T11 replaces this with
// the real preview (active version from the store, usePdfDocument with debounce). The `.client`
// suffix keeps vue-pdf out of SSR. usePdf revokes old blob URLs itself.
registerPdfFonts()
const template = defaultTemplate()
const data = createSampleCvData()
const { url, error } = usePdf(() =>
  h(template.component, {
    data,
    theme: DEFAULT_THEME,
    labels: getPdfLabels(DEFAULT_PDF_LOCALE),
    locale: DEFAULT_PDF_LOCALE,
  }),
)
</script>

<template>
  <div class="size-full">
    <p v-if="error" role="alert" class="text-error">{{ error.message }}</p>
    <iframe
      v-else-if="url"
      :src="url"
      :title="$t('preview.frameTitle')"
      class="block size-full border-0"
    />
  </div>
</template>
