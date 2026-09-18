<template>
  <Teleport to="body">
    <!-- Floating Capsule Container -->
    <div :class="['bliss-mobile-capsule', `bliss-mobile-capsule--${segment}`, { 'bliss-mobile-capsule--single': segment === 'home' }]">
      <!-- Top Button: Segment Options / Sub-Nav (Only on segment pages) -->
      <button
        v-if="segment !== 'home'"
        type="button"
        :class="['bliss-mobile-capsule__btn', { 'is-active': isSegmentOpen }]"
        :aria-expanded="isSegmentOpen"
        aria-controls="bliss-segment-popover"
        :aria-label="`Toggle ${segmentTitle} options`"
        @click="toggleSegment"
      >
        <!-- Book / Reader icon when closed, X when open -->
        <svg v-if="!isSegmentOpen" class="bliss-mobile-capsule__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2.5 4.5A2.5 2.5 0 0 1 5 2h4.5v13.5H5a2.5 2.5 0 0 0-2.5 2.5V4.5z" />
          <path d="M17.5 4.5A2.5 2.5 0 0 0 15 2h-4.5v13.5H15a2.5 2.5 0 0 1 2.5 2.5V4.5z" />
        </svg>
        <svg v-else class="bliss-mobile-capsule__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>

      <div v-if="segment !== 'home'" class="bliss-mobile-capsule__divider" aria-hidden="true" />

      <!-- Bottom Button: Primary Site Navigation Menu -->
      <button
        type="button"
        :class="['bliss-mobile-capsule__btn', { 'is-active': isSiteNavOpen }]"
        :aria-expanded="isSiteNavOpen"
        aria-controls="bliss-site-popover"
        aria-label="Toggle site navigation menu"
        @click="toggleSiteNav"
      >
        <!-- Hamburger Menu Icon when closed, X when open -->
        <svg v-if="!isSiteNavOpen" class="bliss-mobile-capsule__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
        <svg v-else class="bliss-mobile-capsule__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>
    </div>

    <!-- Segment Options Popover -->
    <Transition name="mobile-menu">
      <div
        v-if="isSegmentOpen"
        id="bliss-segment-popover"
        :class="['bliss-mobile-popover', 'bliss-mobile-popover--segment', `bliss-mobile-popover--${segment}`]"
        role="dialog"
        :aria-label="`${segmentTitle} options`"
      >
        <slot name="segment-panel" :close="closeAll">
          <div class="bliss-mobile-popover__header">
            <span class="bliss-mobile-popover__badge">{{ segmentTitle }}</span>
          </div>
          <nav class="bliss-mobile-popover__links" :aria-label="`${segmentTitle} options`">
            <a
              v-for="link in segmentLinks"
              :key="link.href"
              :href="link.href"
              :class="['bliss-mobile-popover__link', { 'is-active': isSubLinkActive(link.href) }]"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noreferrer' : undefined"
              @click="closeAll"
            >
              {{ link.label }}
            </a>
          </nav>
        </slot>
      </div>
    </Transition>

    <!-- Primary Site Navigation Popover -->
    <Transition name="mobile-menu">
      <nav
        v-if="isSiteNavOpen"
        id="bliss-site-popover"
        class="bliss-mobile-popover bliss-mobile-popover--site"
        aria-label="Primary navigation"
      >
        <div class="bliss-mobile-popover__header">
          <span class="bliss-mobile-popover__badge">Navigation</span>
        </div>
        <div class="bliss-mobile-popover__grid">
          <a
            v-for="link in primaryLinks"
            :key="link.href"
            :href="link.href"
            :class="['bliss-mobile-popover__link', { 'is-active': isPrimaryLinkActive(link.href) }]"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noreferrer' : undefined"
            @click="closeAll"
          >
            {{ link.label }}
          </a>
        </div>
      </nav>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const props = withDefaults(
  defineProps<{
    segment?: 'home' | 'docs' | 'blog' | 'courses' | 'papers' | 'timeline'
  }>(),
  {
    segment: 'home',
  },
)

const route = useRoute()
const isSegmentOpen = ref(false)
const isSiteNavOpen = ref(false)

const primaryLinks = [
  { label: 'Docs', href: '/docs/' },
  { label: 'Timeline', href: '/timeline/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Papers', href: '/papers/' },
  { label: 'GitHub ↗', href: 'https://github.com/MayukhChakrabortyDX/bliss-compiler', external: true },
]

const segmentConfigs: Record<string, { title: string; links: { label: string; href: string; external?: boolean }[] }> = {
  docs: {
    title: 'Docs',
    links: [
      { label: 'Overview', href: '/docs/' },
      { label: 'Language', href: '/docs/language' },
      { label: 'Compiler', href: '/docs/compiler' },
      { label: 'Specifications', href: '/docs/specifications/' },
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

const segmentTitle = computed(() => segmentConfigs[props.segment]?.title ?? 'Segment')
const segmentLinks = computed(() => segmentConfigs[props.segment]?.links ?? [])

const toggleSegment = () => {
  isSiteNavOpen.value = false
  isSegmentOpen.value = !isSegmentOpen.value
}

const toggleSiteNav = () => {
  isSegmentOpen.value = false
  isSiteNavOpen.value = !isSiteNavOpen.value
}

const closeAll = () => {
  isSegmentOpen.value = false
  isSiteNavOpen.value = false
}

const isPrimaryLinkActive = (href: string) => {
  if (href.startsWith('http')) return false
  const currentPath = route.path.replace(/\/$/, '') || '/'
  const targetPath = href.replace(/\/$/, '') || '/'
  return currentPath.startsWith(targetPath)
}

const isSubLinkActive = (href: string) => {
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

const onDocumentClick = (event: MouseEvent | TouchEvent) => {
  if (!isSegmentOpen.value && !isSiteNavOpen.value) return
  const target = event.target as Node | null
  if (!target) return

  const capsule = document.querySelector('.bliss-mobile-capsule')
  const segmentPopover = document.getElementById('bliss-segment-popover')
  const sitePopover = document.getElementById('bliss-site-popover')

  if (
    capsule && !capsule.contains(target) &&
    (!segmentPopover || !segmentPopover.contains(target)) &&
    (!sitePopover || !sitePopover.contains(target))
  ) {
    closeAll()
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeAll()
}

onMounted(() => {
  window.addEventListener('pointerdown', onDocumentClick)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
})

watch(() => route.path, () => {
  closeAll()
})
</script>
