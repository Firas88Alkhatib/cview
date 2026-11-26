<script setup lang="ts">
definePageMeta({ layout: 'workspace' })
</script>

<template>
  <div class="flex h-full">
    <!-- Static 50/50 split. P1-T06 replaces it with the resizable SplitPane. -->
    <EditorPanel class="w-1/2" />
    <PreviewPanel class="w-1/2 border-l border-default" />
  </div>
</template>
