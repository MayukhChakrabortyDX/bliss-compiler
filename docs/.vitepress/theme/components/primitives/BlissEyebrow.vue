<template>
  <div :class="['bliss-eyebrow', variant ? `bliss-eyebrow--${variant}` : '', { 'bliss-eyebrow--pill': pill }]">
    <span v-if="dot" class="bliss-eyebrow__dot" aria-hidden="true" />
    <slot>{{ text }}</slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string
    variant?: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'neutral'
    pill?: boolean
    dot?: boolean
  }>(),
  {
    text: '',
    variant: undefined,
    pill: false,
    dot: false,
  }
)
</script>
