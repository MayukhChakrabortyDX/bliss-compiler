<template>
  <div class="blog-shell">
    <div v-if="isIndex" class="blog-index">
      <header class="blog-index__header">
        <div>
          <div class="blog-eyebrow">Bliss / Blog</div>
          <h1>Notes from the build.</h1>
          <p>Language experiments, compiler work, systems thinking, and things worth writing down.</p>
        </div>
      </header>

      <div class="blog-list">
        <a v-for="post in posts" :key="post.link" :href="post.link" class="blog-card">
          <div class="blog-card__meta">
            <span>{{ post.date }}</span>
            <span>{{ post.reading }}</span>
          </div>
          <h2>{{ post.title }}</h2>
          <p>{{ post.description }}</p>
          <span class="blog-card__read">Read article ↗</span>
        </a>
      </div>
    </div>

    <article v-else class="blog-post">
      <header class="blog-post__header">
        <div class="blog-eyebrow">{{ frontmatter.category || 'Bliss / Notes' }}</div>
        <h1>{{ page.title }}</h1>
        <p v-if="frontmatter.description" class="blog-post__description">
          {{ frontmatter.description }}
        </p>
        <div class="blog-post__meta">
          <span>{{ frontmatter.date }}</span>
          <span v-if="frontmatter.author">{{ frontmatter.author }}</span>
        </div>
      </header>

      <div class="blog-post__content">
        <Content />
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

const route = useRoute()
const { page, frontmatter } = useData()

const isIndex = computed(() => route.path === '/blog/' || route.path === '/blog')

const posts = [
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
