<template>
  <div class="docs-index-shell">
    <header class="docs-index__header">
      <div class="docs-index__eyebrow">Bliss / Documentation</div>
      <h1>Build from first principles.</h1>
      <p>Explore the evolving Bliss language and the compiler work behind it.</p>
    </header>

    <section v-for="group in groups" :key="group.label" class="docs-index__group">
      <div class="docs-index__group-header">
        <h2>{{ group.label }}</h2>
        <span>{{ group.items.length }} pages</span>
      </div>

      <div class="docs-index__grid">
        <a v-for="item in group.items" :key="item.link" :href="item.link" class="docs-index__card">
          <span class="docs-index__card-label">{{ group.label }}</span>
          <h3>{{ item.text }}</h3>
          <span class="docs-index__card-link">Open page →</span>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { docsNavigation } from '../navigation'

const groups = docsNavigation
</script>
