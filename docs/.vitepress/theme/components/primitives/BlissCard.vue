<template>
  <component
    :is="href ? 'a' : 'article'"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
    :class="['bliss-card', cardClass, variant ? `bliss-card--${variant}` : '']"
  >
    <slot name="art" />
    <div class="bliss-card__content">
      <slot name="meta" />
      <slot name="title">
        <h3 v-if="title">{{ title }}</h3>
      </slot>
      <slot name="description">
        <p v-if="description">{{ description }}</p>
      </slot>
      <slot />
      <slot name="actions">
        <span v-if="actionText" class="bliss-card__link">
          {{ actionText }}
        </span>
      </slot>
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    href?: string
    title?: string
    description?: string
    actionText?: string
    variant?: 'violet' | 'blue' | 'emerald' | 'amber'
    cardClass?: string
    external?: boolean
  }>(),
  {
    href: undefined,
    title: '',
    description: '',
    actionText: '',
    variant: undefined,
    cardClass: '',
    external: false,
  }
)
</script>
