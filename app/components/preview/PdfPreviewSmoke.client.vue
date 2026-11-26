<script setup lang="ts">
import { usePdf } from '@ceereals/vue-pdf'
import { h } from 'vue'
import HelloDocument from '~/pdf/HelloDocument.vue'

// P0-T07 smoke preview. The `.client` suffix keeps vue-pdf out of SSR. P1-T11 replaces this
// with the real preview (usePdfDocument + debounce). usePdf revokes old blob URLs itself.
const { url, error } = usePdf(() => h(HelloDocument, { title: 'Hello, CView!' }))
</script>

<template>
  <div class="h-[70dvh] w-full">
    <p v-if="error" role="alert" class="text-error">{{ error.message }}</p>
    <iframe
      v-else-if="url"
      :src="url"
      :title="$t('preview.frameTitle')"
      class="size-full rounded-md border-0"
    />
  </div>
</template>
