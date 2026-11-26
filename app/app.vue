<template>
  <UApp>
    <!-- Global motion defaults. reducedMotion="user" honours prefers-reduced-motion (D-11). -->
    <MotionConfig v-bind="motionConfig">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </MotionConfig>
  </UApp>
</template>
