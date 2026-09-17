<template>
  <Teleport to="body">
    <div v-if="open" class="paper-modal" role="dialog" aria-modal="true" :aria-label="paper.title" @click.self="$emit('close')">
      <div class="paper-modal__window">
        <header class="paper-modal__header">
          <div>
            <span class="paper-modal__eyebrow">PDF preview</span>
            <h2>{{ paper.title }}</h2>
          </div>
          <button type="button" class="paper-modal__close" aria-label="Close PDF preview" @click="$emit('close')">×</button>
        </header>

        <iframe :src="paper.link" :title="`${paper.title} PDF preview`" class="paper-modal__frame"></iframe>

        <footer class="paper-modal__footer">
          <span>Previewing the published PDF</span>
          <a :href="paper.link" target="_blank" rel="noreferrer">Open in new tab ↗</a>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
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