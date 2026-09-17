<template>
  <RouteProgress />
  <BlissScrollbar />
  <NotFoundLayout v-if="isNotFound" />
  <template v-else>
    <!-- Uniform Main Top Navigation -->
    <BlissNav :is-marketing="isMarketing" />

    <!-- Dedicated Segment Sub-Navbar -->
    <BlissSubNav v-if="!isMarketing" :segment="currentSegment" />

    <div class="bliss-site">
      <SiteAmbient v-if="isMarketing" />
      <div v-else :class="['site-header', { 'site-header--with-subnav': !isMarketing }]" aria-hidden="true" />

      <Home v-if="isMarketing" />
      <TimelineLayout v-else-if="isTimeline" />
      <BlogLayout v-else-if="isBlog" />
      <CoursesLayout v-else-if="isCourses" />
      <PapersLayout v-else-if="isPapers" />
      <DocsIndexLayout v-else-if="isDocsIndex" />
      <DocsLayout v-else />

      <BlissFooter />
    </div>

    <!-- Mobile Floating Capsule Menu (Across Home, Timeline, Blog, Courses, Papers, Docs Landing) -->
    <BlissMobileCapsule
      v-if="isMarketing || isTimeline || isBlog || isCourses || isPapers || isDocsIndex"
      :segment="currentSegment"
    />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import BlissNav from './components/BlissNav.vue'
import BlissSubNav from './components/BlissSubNav.vue'
import BlissMobileCapsule from './components/BlissMobileCapsule.vue'
import BlissFooter from './components/BlissFooter.vue'
import SiteAmbient from './components/SiteAmbient.vue'
import DocsLayout from './components/DocsLayout.vue'
import DocsIndexLayout from './components/DocsIndexLayout.vue'
import TimelineLayout from './components/TimelineLayout.vue'
import BlogLayout from './components/BlogLayout.vue'
import CoursesLayout from './components/CoursesLayout.vue'
import PapersLayout from './components/PapersLayout.vue'
import Home from './Home.vue'
import NotFoundLayout from './components/NotFoundLayout.vue'
import RouteProgress from './components/RouteProgress.vue'
import BlissScrollbar from './components/BlissScrollbar.vue'

const { page } = useData()

const isMarketing = computed(() => page.value.relativePath === 'index.md')
const isNotFound = computed(() => page.value.isNotFound || page.value.relativePath === '404.md')
const isTimeline = computed(() => page.value.relativePath.startsWith('timeline/'))
const isBlog = computed(() => page.value.relativePath.startsWith('blog/'))
const isCourses = computed(() => page.value.relativePath.startsWith('courses/'))
const isPapers = computed(() => page.value.relativePath.startsWith('papers/'))
const isDocsIndex = computed(() => page.value.relativePath === 'docs/index.md')

const currentSegment = computed<'home' | 'docs' | 'blog' | 'courses' | 'papers' | 'timeline'>(() => {
  if (isMarketing.value) return 'home'
  if (isTimeline.value) return 'timeline'
  if (isBlog.value) return 'blog'
  if (isCourses.value) return 'courses'
  if (isPapers.value) return 'papers'
  return 'docs'
})
</script>
