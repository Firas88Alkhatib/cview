<script setup lang="ts">
definePageMeta({ layout: 'workspace' })
</script>

<template>
  <PreviewSplitPane>
    <template #start>
      <EditorPanel />
    </template>
    <template #end>
      <PreviewPanel />
    </template>
  </PreviewSplitPane>
</template>
