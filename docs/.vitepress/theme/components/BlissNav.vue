<template>
  <header :class="['bliss-nav', { 'is-scrolled': isScrolled || !isMarketing, 'is-marketing': isMarketing }]">
    <div class="bliss-nav__inner">
      <!-- Brand -->
      <a href="/" class="bliss-nav__brand" aria-label="Bliss home">
        <span class="bliss-nav__logo" aria-hidden="true">
          <BlissLogoSvg />
        </span>
        <span class="bliss-nav__name">bliss</span>
      </a>

      <!-- Uniform Desktop Navigation -->
      <nav class="bliss-nav__links" aria-label="Main site navigation">
        <a
          v-for="link in primaryLinks"
          :key="link.href"
          :href="link.href"
          :class="['bliss-nav__link', { 'is-active': isLinkActive(link.href) }]"
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noreferrer' : undefined"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vitepress'
import BlissLogoSvg from '../assets/BlissLogoSvg.vue'

defineProps<{
  isMarketing?: boolean
}>()

const route = useRoute()
const isScrolled = ref(false)

const primaryLinks = [
  { label: 'Docs', href: '/docs/' },
  { label: 'Timeline', href: '/timeline/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Papers', href: '/papers/' },
  { label: 'GitHub ↗', href: 'https://github.com/MayukhChakrabortyDX/bliss-compiler', external: true },
]

const isLinkActive = (href: string) => {
  if (href.startsWith('http')) return false
  const currentPath = route.path.replace(/\/$/, '') || '/'
  const targetPath = href.replace(/\/$/, '') || '/'
  return currentPath.startsWith(targetPath)
}

const updateScrollState = () => {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
})
</script>
