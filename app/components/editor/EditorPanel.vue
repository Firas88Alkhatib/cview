<template>
  <section :aria-label="$t('editor.region')" class="flex h-full min-w-0 flex-col">
    <!-- Main + sub section bars go here (P1-T15). They stay put while the content scrolls. -->
    <div class="shrink-0" />
    <div data-scroll-container class="min-h-0 flex-1 overflow-y-auto p-6">
      <slot>
        <p class="text-muted">{{ $t('editor.placeholder') }}</p>
      </slot>
    </div>
  </section>
</template>
