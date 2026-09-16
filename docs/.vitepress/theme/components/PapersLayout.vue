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

<style scoped>
.papers-shell { width: min(100% - 3rem, 960px); margin: 0 auto; padding: 72px 0 112px; }
.papers-index__header { max-width: 700px; margin-bottom: 64px; }
.papers-eyebrow { color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 11px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; }
.papers-index__header h1, .paper-post__header h1 { margin: 14px 0 18px; color: var(--bliss-fg); font-size: clamp(2.75rem, 6vw, 5rem); font-weight: 600; letter-spacing: -.055em; line-height: 1; }
.papers-index__header p, .paper-post__description { margin: 0; color: var(--bliss-fg-muted); font-size: 18px; line-height: 1.7; }
.papers-list { display: grid; gap: 16px; }
.paper-card { display: block; padding: 28px; border: 1px solid var(--bliss-border); border-radius: 20px; background: #fff; color: inherit; transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease; }
.paper-card:hover { border-color: #d4d4d8; transform: translateY(-2px); box-shadow: var(--bliss-shadow-md); }
.paper-card__meta, .paper-post__meta { display: flex; gap: 14px; color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; }
.paper-card h2 { margin: 16px 0 8px; color: var(--bliss-fg); font-size: 24px; letter-spacing: -.03em; }
.paper-card p { max-width: 680px; margin: 0; color: var(--bliss-fg-muted); line-height: 1.7; }
.paper-card__actions { display: flex; align-items: center; gap: 16px; margin-top: 22px; }
.paper-card__preview { padding: 9px 13px; border-radius: 8px; background: var(--bliss-fg); color: var(--bliss-bg); font-size: 13px; font-weight: 600; cursor: pointer; }
.paper-card__preview:hover { background: #27272a; }
.paper-card__read { color: var(--bliss-fg); font-size: 13px; font-weight: 600; text-decoration: none; }
.paper-card__read:hover { text-decoration: underline; text-underline-offset: 3px; }
.papers-empty { display: flex; align-items: flex-start; gap: 24px; padding: 28px 0; border-top: 1px solid var(--bliss-border); border-bottom: 1px solid var(--bliss-border); }
.papers-empty__index { color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 12px; }
.papers-empty h2 { margin: 0 0 8px; color: var(--bliss-fg); font-size: 22px; letter-spacing: -.03em; }
.papers-empty p { margin: 0; color: var(--bliss-fg-muted); line-height: 1.7; }
.paper-post { max-width: 760px; margin: 0 auto; }
.paper-post__header { margin-bottom: 64px; }
.paper-post__meta { margin-top: 24px; }
.paper-post__content h2, .paper-post__content h3 { color: var(--bliss-fg); letter-spacing: -.035em; }
.paper-post__content h2 { margin: 56px 0 16px; font-size: 28px; }
.paper-post__content h3 { margin: 36px 0 12px; font-size: 21px; }
.paper-post__content p, .paper-post__content li { color: var(--bliss-fg-secondary); font-size: 17px; line-height: 1.85; }
.paper-post__content p { margin: 0 0 22px; }
@media (max-width: 760px) { .papers-shell { width: min(100% - 2rem, 760px); padding-top: 48px; } .papers-empty { gap: 16px; } .paper-card__preview { display: none; } }
</style>