<template>
  <div class="docs-index-shell">
    <BlissPageHeader
      eyebrow="Bliss / Documentation"
      title="Build from first principles."
      description="Explore the evolving Bliss language, compiler architecture, and formal specifications."
      variant="violet"
      pill
    />

    <div class="docs-sections-grid">
      <article
        v-for="section in groups"
        :key="section.id"
        :class="['docs-section-card', `docs-section-card--${section.variant}`]"
      >
        <div class="docs-section-card__art-wrap">
          <DocsThumbnail :topic="section.topic" :variant="section.variant" />
        </div>

        <div class="docs-section-card__body">
          <div class="docs-section-card__meta">
            <span class="docs-section-card__badge">{{ section.badge }}</span>
            <span class="docs-section-card__count">{{ section.items.length }} chapters</span>
          </div>

          <h2 class="docs-section-card__title">{{ section.label }}</h2>
          <p class="docs-section-card__description">{{ section.description }}</p>

          <div class="docs-section-card__topics">
            <span
              v-for="highlight in section.highlights"
              :key="highlight"
              class="docs-section-card__topic"
            >
              {{ highlight }}
            </span>
          </div>

          <div class="docs-section-card__actions">
            <a :href="section.link" class="docs-section-card__cta">
              Explore {{ section.label }}
              <span aria-hidden="true">→</span>
            </a>

            <div class="docs-section-card__quick-links">
              <span class="docs-section-card__quick-label">Chapters:</span>
              <a
                v-for="item in section.items.slice(0, 4)"
                :key="item.text"
                :href="item.link"
                class="docs-section-card__quick-link"
              >
                {{ item.text }}
              </a>
              <span v-if="section.items.length > 4" class="docs-section-card__more">
                +{{ section.items.length - 4 }} more
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { docsNavigation } from '../navigation'
import BlissPageHeader from './primitives/BlissPageHeader.vue'
import DocsThumbnail from '../assets/DocsThumbnail.vue'

const groups = docsNavigation
</script>
