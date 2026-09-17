<template>
  <div class="papers-shell">
    <div v-if="isIndex" class="papers-index">
      <header class="papers-index__header">
        <div class="papers-eyebrow">Bliss / Papers</div>
        <h1>Research in progress.</h1>
        <p>White papers and research notes on language design, compiler construction, and systems programming.</p>
      </header>

      <div v-if="papers.length" class="papers-list">
        <article v-for="paper in papers" :key="paper.link" class="paper-card">
          <div class="paper-card__meta">
            <span>{{ paper.type }}</span>
            <span>{{ paper.date }}</span>
          </div>
          <h2>{{ paper.title }}</h2>
          <p>{{ paper.description }}</p>
          <div class="paper-card__actions">
            <button type="button" class="paper-card__preview" @click="selectedPaper = paper">Preview PDF</button>
            <a :href="paper.link" target="_blank" rel="noreferrer" class="paper-card__read">Open PDF ↗</a>
          </div>
        </article>
      </div>

      <div v-else class="papers-empty">
        <span class="papers-empty__index">01</span>
        <div>
          <h2>The archive is taking shape.</h2>
          <p>The first research papers will appear here as they are published.</p>
        </div>
      </div>
    </div>

    <article v-else class="paper-post">
      <header class="paper-post__header">
        <div class="papers-eyebrow">{{ frontmatter.category || 'Bliss / Paper' }}</div>
        <h1>{{ page.title }}</h1>
        <p v-if="frontmatter.description" class="paper-post__description">{{ frontmatter.description }}</p>
        <div class="paper-post__meta">
          <span>{{ frontmatter.date }}</span>
          <span v-if="frontmatter.author">{{ frontmatter.author }}</span>
        </div>
      </header>

      <div class="paper-post__content">
        <Content />
      </div>
    </article>

    <PaperPdfModal v-if="selectedPaper" :open="!!selectedPaper" :paper="selectedPaper" @close="selectedPaper = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
import PaperPdfModal from './PaperPdfModal.vue'

const route = useRoute()
const { page, frontmatter } = useData()

const isIndex = computed(() => route.path === '/papers/' || route.path === '/papers')

const papers = [
  {
    title: 'Classifying Productions and Progressive Error Recovery',
    description: 'A structural model for error recovery in the Bliss parser, introducing bounded, branch, extension, and until productions with progressive synchronization.',
    date: 'September 2026',
    type: 'Research paper',
    link: '/papers/pdfs/1789199274490.pdf',
  },
]
const selectedPaper = ref<(typeof papers)[number] | null>(null)
</script>