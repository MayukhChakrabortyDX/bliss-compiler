<template>
  <Teleport to="body">
    <Transition name="bliss-modal">
      <div
        v-if="open"
        class="paper-modal"
        role="dialog"
        aria-modal="true"
        @click.self="emit('close')"
        @pointerdown.self="emit('close')"
      >
        <div class="paper-modal__window">
          <header class="paper-modal__header">
            <div>
              <span v-if="eyebrow" class="paper-modal__eyebrow">{{ eyebrow }}</span>
              <h2 v-if="title">{{ title }}</h2>
              <slot name="header" />
            </div>
            <button type="button" class="paper-modal__close" aria-label="Close dialog" @click="emit('close')">
              ×
            </button>
          </header>

          <div class="paper-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="paper-modal__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    eyebrow?: string
    title?: string
  }>(),
  {
    eyebrow: '',
    title: '',
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>
