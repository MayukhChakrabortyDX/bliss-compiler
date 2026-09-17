<template>
  <div :class="['bliss-subnav', `bliss-subnav--${segment}`]" role="navigation" :aria-label="`${meta.title} sub-navigation`">
    <div class="bliss-subnav__inner">
      <!-- Segment Title & Accent Indicator -->
      <div class="bliss-subnav__badge">
        <span class="bliss-subnav__dot" aria-hidden="true" />
        <span class="bliss-subnav__title">{{ meta.title }}</span>
      </div>

      <!-- Segment Navigation Links / Extra Options -->
      <nav class="bliss-subnav__links" :aria-label="`${meta.title} options`">
        <a
          v-for="item in meta.links"
          :key="item.href"
          :href="item.href"
          :class="['bliss-subnav__link', { 'is-active': isLinkActive(item.href) }]"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noreferrer' : undefined"
        >
          {{ item.label }}
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

export interface SubNavLink {
  label: string
  href: string
  external?: boolean
}

export interface SegmentConfig {
  title: string
  links: SubNavLink[]
}

const props = defineProps<{
  segment: 'docs' | 'blog' | 'courses' | 'papers' | 'timeline'
}>()

const route = useRoute()

const segmentConfigs: Record<string, SegmentConfig> = {
  docs: {
    title: 'Docs',
    links: [
      { label: 'Overview', href: '/docs/' },
      { label: 'Language', href: '/docs/language' },
      { label: 'Compiler', href: '/docs/compiler' },
    ],
  },
  timeline: {
    title: 'Timeline',
    links: [
      { label: 'Overview', href: '/timeline/' },
      { label: 'In Flight', href: '/timeline/#in-flight' },
      { label: 'Up Next', href: '/timeline/#up-next' },
      { label: 'Shipped', href: '/timeline/#shipped' },
    ],
  },
  blog: {
    title: 'Journal',
    links: [
      { label: 'All Articles', href: '/blog/' },
      { label: 'Subscribe', href: '#subscribe' },
    ],
  },
  courses: {
    title: 'Courses',
    links: [
      { label: 'All Courses', href: '/courses/' },
      { label: 'YouTube ↗', href: 'https://www.youtube.com/', external: true },
    ],
  },
  papers: {
    title: 'Research',
    links: [
      { label: 'All Papers', href: '/papers/' },
      { label: 'Archive', href: '/papers/#archive' },
    ],
  },
}

const meta = computed<SegmentConfig>(() => segmentConfigs[props.segment] || segmentConfigs.docs)

const isLinkActive = (href: string) => {
  if (href.startsWith('http') || href.startsWith('#')) return false
  const currentPath = route.path.replace(/\/$/, '') || '/'
  const targetPath = href.replace(/\/$/, '') || '/'
  if (
    targetPath === '/docs' ||
    targetPath === '/blog' ||
    targetPath === '/courses' ||
    targetPath === '/papers' ||
    targetPath === '/timeline'
  ) {
    return currentPath === targetPath
  }
  return currentPath.startsWith(targetPath)
}
</script>
