<template>
  <BlogNav v-if="isBlog" />
  <CoursesNav v-else-if="isCourses" />
  <DocsNav v-else-if="!isMarketing" />
  <Teleport v-if="isMarketing" to="body">
    <BlissNav />
  </Teleport>

  <div class="bliss-site">
    <SiteAmbient v-if="isMarketing" />
    <div v-else class="site-header" aria-hidden="true" />

    <Home v-if="isMarketing" />
    <BlogLayout v-else-if="isBlog" />
    <CoursesLayout v-else-if="isCourses" />
    <DocsIndexLayout v-else-if="isDocsIndex" />
    <DocsLayout v-else />

    <BlissFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import BlissNav from './components/BlissNav.vue'
import BlogNav from './components/BlogNav.vue'
import CoursesNav from './components/CoursesNav.vue'
import DocsNav from './components/DocsNav.vue'
import BlissFooter from './components/BlissFooter.vue'
import SiteAmbient from './components/SiteAmbient.vue'
import DocsLayout from './components/DocsLayout.vue'
import DocsIndexLayout from './components/DocsIndexLayout.vue'
import BlogLayout from './components/BlogLayout.vue'
import CoursesLayout from './components/CoursesLayout.vue'
import Home from './Home.vue'

const { page } = useData()

const isMarketing = computed(() => page.value.relativePath === 'index.md')
const isBlog = computed(() => page.value.relativePath.startsWith('blog/'))
const isCourses = computed(() => page.value.relativePath.startsWith('courses/'))
const isDocsIndex = computed(() => page.value.relativePath === 'docs/index.md')
</script>
