<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="!href ? type : undefined"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
    :class="['bliss-button', variant ? `bliss-button--${variant}` : 'bliss-button--secondary']"
  >
    <slot />
    <slot name="icon">
      <span v-if="icon === 'arrow-right'" aria-hidden="true">→</span>
      <span v-else-if="icon === 'external'" aria-hidden="true">↗</span>
      <span v-else-if="icon === 'play'" aria-hidden="true">▶</span>
    </slot>
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    href?: string
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'ghost' | 'link'
    external?: boolean
    icon?: 'arrow-right' | 'external' | 'play' | 'none'
  }>(),
  {
    href: undefined,
    type: 'button',
    variant: 'secondary',
    external: false,
    icon: 'none',
  }
)
</script>
