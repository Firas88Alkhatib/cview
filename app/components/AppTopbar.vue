<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const GITHUB_URL = 'https://github.com/Firas88Alkhatib'
defineShortcuts({
  meta_g: {
    usingInput: false,
    handler: () => window.open(GITHUB_URL, '_blank'),
  },
})

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'About',
    to: '/about',
    active: route.path.startsWith('/about'),
  },
])
</script>

<template>
  <UHeader>
    <template #title>
      <AppLogo />
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton class="cursor-pointer" />

      <UTooltip text="Open on GitHub" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          :to="GITHUB_URL"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>
  </UHeader>
</template>
