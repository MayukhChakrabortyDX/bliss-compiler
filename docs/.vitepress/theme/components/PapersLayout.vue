<template>
  <div class="papers-shell">
    <div v-if="isIndex" class="papers-index">
      <BlissPageHeader
        eyebrow="Bliss / Papers"
        title="Research in progress."
        description="White papers and research notes on language design, compiler construction, and systems programming."
        variant="amber"
        pill
      />

      <div v-if="papers.length" class="papers-list">
        <BlissCard
          v-for="paper in papers"
          :key="paper.link"
          :title="paper.title"
          :description="paper.description"
          card-class="paper-card"
        >
          <template #meta>
            <div class="paper-card__meta">
              <span>{{ paper.type }}</span>
              <span>{{ paper.date }}</span>
            </div>
          </template>
          <template #actions>
            <div class="paper-card__actions">
              <button type="button" class="paper-card__preview" @click="selectedPaper = paper">Preview PDF</button>
              <a :href="paper.link" target="_blank" rel="noreferrer" class="paper-card__read">Open PDF ↗</a>
            </div>
          </template>
        </BlissCard>
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
      <BlissPageHeader
        :eyebrow="frontmatter.category || 'Bliss / Paper'"
        :title="page.title"
        :description="frontmatter.description"
        variant="amber"
        pill
      >
        <template #meta>
          <div class="paper-post__meta">
            <span>{{ frontmatter.date }}</span>
            <span v-if="frontmatter.author">{{ frontmatter.author }}</span>
          </div>
        </template>
      </BlissPageHeader>

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
import BlissPageHeader from './primitives/BlissPageHeader.vue'
import BlissCard from './primitives/BlissCard.vue'
import PaperPdfModal from './PaperPdfModal.vue'

const route = useRoute()
const { page, frontmatter } = useData()

const isIndex = computed(() => {
  const rel = page.value.relativePath
  if (rel === 'papers/index.md' || rel === 'paper/index.md' || rel === 'papers.md' || rel === 'paper.md') {
    return true
  }
  const cleanPath = (route.path || '').replace(/\/index(\.html)?$/, '').replace(/\/$/, '')
  return cleanPath === '/papers' || cleanPath === '/paper'
})

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