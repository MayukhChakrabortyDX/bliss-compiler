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

<style scoped>
.paper-modal { position: fixed; inset: 0; z-index: 200; display: grid; place-items: center; padding: 32px; background: rgb(9 9 11 / 68%); backdrop-filter: blur(8px); }
.paper-modal__window { display: grid; width: min(100%, 1120px); height: min(90vh, 860px); grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; border: 1px solid #3f3f46; border-radius: 16px; background: #18181b; box-shadow: 0 24px 80px rgb(0 0 0 / 30%); }
.paper-modal__header, .paper-modal__footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 16px 20px; color: #fafafa; }
.paper-modal__header { border-bottom: 1px solid #3f3f46; }
.paper-modal__header > div { min-width: 0; }
.paper-modal__eyebrow { color: #a1a1aa; font-family: var(--bliss-font-mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; }
.paper-modal h2 { overflow-wrap: anywhere; margin: 5px 0 0; color: #fafafa; font-size: 16px; font-weight: 500; line-height: 1.3; }
.paper-modal__close { width: 36px; height: 36px; flex: 0 0 auto; border: 1px solid #52525b; border-radius: 8px; background: transparent; color: #d4d4d8; font-size: 24px; line-height: 1; cursor: pointer; }
.paper-modal__close:hover { background: #27272a; color: #fff; }
.paper-modal__frame { width: 100%; height: 100%; border: 0; background: #52525b; }
.paper-modal__footer { border-top: 1px solid #3f3f46; color: #a1a1aa; font-family: var(--bliss-font-mono); font-size: 10px; }
.paper-modal__footer a { color: #fafafa; text-decoration: none; }
.paper-modal__footer a:hover { text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 760px) { .paper-modal { padding: 0; }.paper-modal__window { width: 100%; height: 100%; border: 0; border-radius: 0; } }
</style>