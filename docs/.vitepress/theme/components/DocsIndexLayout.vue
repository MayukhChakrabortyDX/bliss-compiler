<template>
  <div class="docs-index-shell">
    <BlissPageHeader
      eyebrow="Bliss / Documentation"
      title="Build from first principles."
      description="Explore the evolving Bliss language and the compiler work behind it."
      variant="violet"
    />

    <section v-for="group in groups" :key="group.label" class="docs-index__group">
      <div class="docs-index__group-header">
        <h2>{{ group.label }}</h2>
        <span>{{ group.items.length }} pages</span>
      </div>

      <div class="docs-index__grid">
        <BlissCard
          v-for="item in group.items"
          :key="item.link"
          :href="item.link"
          :title="item.text"
          :description="item.description"
          action-text="Open section →"
          card-class="docs-index__card"
        >
          <template #art>
            <DocsThumbnail :topic="item.topic" :variant="item.variant" />
          </template>
        </BlissCard>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { docsNavigation } from '../navigation'
import BlissPageHeader from './primitives/BlissPageHeader.vue'
import BlissCard from './primitives/BlissCard.vue'
import DocsThumbnail from '../assets/DocsThumbnail.vue'

const groups = docsNavigation
</script>
