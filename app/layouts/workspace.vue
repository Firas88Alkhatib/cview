<template>
  <div class="flex h-dvh flex-col overflow-hidden">
    <!-- Editor workspace: fills the viewport and the page itself never scrolls (D-17, P1-T05).
         Panels scroll internally. Other pages keep the normal scrolling default layout. -->
    <AppTopbar class="shrink-0" />
    <div class="min-h-0 flex-1">
      <slot />
    </div>
    <AppPersistenceNotices />
  </div>
</template>
