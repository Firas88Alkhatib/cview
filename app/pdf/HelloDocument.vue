<script setup lang="ts">
import { Document, Page, Text, View } from '@ceereals/vue-pdf'
import type { Style } from '@ceereals/vue-pdf'

// P0-T07 smoke document. Replaced by the template system in P1-T09/T10.
const props = defineProps<{ title: string }>()

const styles = {
  page: { padding: 48 },
  heading: { fontSize: 24, marginBottom: 12 },
  body: { fontSize: 12 },
} satisfies Record<string, Style>
</script>

<template>
  <Document :title="props.title">
    <Page size="A4" :style="styles.page">
      <View>
        <Text :style="styles.heading">{{ props.title }}</Text>
        <Text :style="styles.body">Generated in the browser with @ceereals/vue-pdf.</Text>
      </View>
    </Page>
  </Document>
</template>
