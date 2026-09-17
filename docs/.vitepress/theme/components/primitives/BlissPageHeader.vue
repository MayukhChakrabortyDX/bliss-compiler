<template>
  <header class="bliss-header">
    <slot name="eyebrow">
      <BlissEyebrow v-if="eyebrow" :variant="variant" :pill="pill" :dot="dot" :text="eyebrow" />
    </slot>
    <slot name="title">
      <h1 v-if="title">{{ title }}</h1>
    </slot>
    <slot name="description">
      <p v-if="description">{{ description }}</p>
    </slot>
    <slot name="meta" />
    <slot />
  </header>
</template>

<script setup lang="ts">
import BlissEyebrow from './BlissEyebrow.vue'

withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    description?: string
    variant?: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'neutral'
    pill?: boolean
    dot?: boolean
  }>(),
  {
    eyebrow: '',
    title: '',
    description: '',
    variant: undefined,
    pill: false,
    dot: false,
  }
)
</script>
