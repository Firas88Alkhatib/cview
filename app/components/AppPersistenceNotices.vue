<script setup lang="ts">
import { useVersionsStore } from '~/stores/versions'

// Turns persistence problems from the versions store into toasts (D-39). Renders nothing.
const versions = useVersionsStore()
const toast = useToast()
const { t } = useI18n()

watch(
  () => versions.skipped.length,
  (count) => {
    if (count === 0) return
    toast.add({
      id: 'persistence-skipped',
      title: t('persistence.skipped.title'),
      description: t('persistence.skipped.description', { count }, count),
      color: 'warning',
      icon: 'i-lucide-triangle-alert',
    })
  },
  { immediate: true },
)

// Literal t() calls, so tests/unit/i18n/keys.test.ts can see every key.
const saveErrorDescription = {
  quota: () => t('persistence.saveFailed.quota'),
  unavailable: () => t('persistence.saveFailed.unavailable'),
  invalid: () => t('persistence.saveFailed.invalid'),
} as const

watch(
  () => versions.saveError,
  (code) => {
    if (!code) return
    toast.add({
      id: 'persistence-save-failed',
      title: t('persistence.saveFailed.title'),
      description: saveErrorDescription[code](),
      color: 'error',
      icon: 'i-lucide-hard-drive',
    })
  },
  { immediate: true },
)
</script>

<template>
  <span hidden />
</template>
