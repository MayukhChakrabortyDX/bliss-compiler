<template>
  <div class="blog-shell">
    <div v-if="isIndex" class="blog-index">
      <BlissPageHeader
        eyebrow="Bliss / Blog"
        title="Notes from the build."
        description="Language experiments, compiler work, systems thinking, and things worth writing down."
        variant="blue"
        pill
      />

      <div class="blog-list">
        <BlissCard
          v-for="post in posts"
          :key="post.link"
          :href="post.link"
          :title="post.title"
          :description="post.description"
          action-text="Read article ↗"
          card-class="blog-card"
        >
          <template #meta>
            <div class="blog-card__meta">
              <span>{{ post.date }}</span>
              <span>{{ post.reading }}</span>
            </div>
          </template>
        </BlissCard>
      </div>
    </div>

    <article v-else class="blog-post">
      <BlissPageHeader
        :eyebrow="frontmatter.category || 'Bliss / Notes'"
        :title="page.title"
        :description="frontmatter.description"
        variant="blue"
        pill
      >
        <template #meta>
          <div class="blog-post__meta">
            <span>{{ frontmatter.date }}</span>
            <span v-if="frontmatter.author">{{ frontmatter.author }}</span>
          </div>
        </template>
      </BlissPageHeader>

      <div class="blog-post__content">
        <Content />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useData, useRoute } from 'vitepress'
import BlissPageHeader from './primitives/BlissPageHeader.vue'
import BlissCard from './primitives/BlissCard.vue'

const route = useRoute()
const { page, frontmatter } = useData()

const isIndex = computed(() => {
  const rel = page.value.relativePath
  if (rel === 'blog/index.md' || rel === 'blogs/index.md' || rel === 'blogs.md') {
    return true
  }
  const cleanPath = (route.path || '').replace(/\/index(\.html)?$/, '').replace(/\/$/, '')
  return cleanPath === '/blog' || cleanPath === '/blogs'
})

onMounted(() => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/blogs')) {
    history.replaceState(null, '', '/blog/')
  }
})

const posts = [
  {
    title: 'Using the Bliss CLI',
    description: 'A complete walkthrough of compiling Bliss programs from the command line.',
    date: 'September 2026',
    reading: '7 min read',
    link: '/blog/posts/pre-alpha-release',
  },
  {
    title: 'Why Bliss exists',
    description: 'The questions behind building another systems programming language from first principles.',
    date: 'September 2026',
    reading: '6 min read',
    link: '/blog/posts/why-bliss-exists',
  },
  {
    title: 'Building a parser that can recover',
    description: 'A look at synchronization tokens, recovery boundaries, and making compiler errors useful.',
    date: 'September 2026',
    reading: '8 min read',
    link: '/blog/posts/parser-recovery',
  },
]
</script>
