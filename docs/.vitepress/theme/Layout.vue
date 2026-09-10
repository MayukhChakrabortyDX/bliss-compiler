<template>
  <div class="bliss-site">
    <SiteAmbient v-if="isMarketing" />
    <BlissNav />

    <Home v-if="isMarketing" />
    <BlogLayout v-else-if="isBlog" />
    <DocsLayout v-else />

    <BlissFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import BlissNav from './components/BlissNav.vue'
import BlissFooter from './components/BlissFooter.vue'
import SiteAmbient from './components/SiteAmbient.vue'
import DocsLayout from './components/DocsLayout.vue'
import BlogLayout from './components/BlogLayout.vue'
import Home from './Home.vue'

const { page, frontmatter } = useData()

const isMarketing = computed(() => page.value.relativePath === 'index.md')
const isBlog = computed(() => page.value.relativePath.startsWith('blog/'))
</script>
