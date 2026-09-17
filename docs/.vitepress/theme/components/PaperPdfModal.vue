<template>
  <BlissModal :open="open" eyebrow="PDF preview" :title="paper.title" @close="$emit('close')">
    <iframe :src="paper.link" :title="`${paper.title} PDF preview`" class="paper-modal__frame" />

    <template #footer>
      <span>Previewing the published PDF</span>
      <a :href="paper.link" target="_blank" rel="noreferrer">Open in new tab ↗</a>
    </template>
  </BlissModal>
</template>

<script setup lang="ts">
import BlissModal from './primitives/BlissModal.vue'

defineProps<{
  open: boolean
  paper: {
    title: string
    link: string
  }
}>()

defineEmits<{
  close: []
}>()
</script>