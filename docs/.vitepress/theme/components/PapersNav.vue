<template>
  <nav :class="['papers-nav', { 'is-menu-open': isMenuOpen }]" aria-label="Papers navigation">
    <div class="papers-nav__inner">
      <a href="/" class="papers-nav__brand" aria-label="Bliss home">bliss <span>/ papers</span></a>

      <div class="papers-nav__links">
        <a href="/papers/">Papers</a>
        <a href="/docs/">Docs</a>
        <a href="/blog/">Blog</a>
        <a href="/courses/">Courses</a>
        <a href="https://github.com/MayukhChakrabortyDX/bliss-compiler" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>

    </div>
  </nav>

  <Teleport to="body">
    <button :class="['papers-nav__menu-button', { 'is-open': isMenuOpen }]" type="button" :aria-expanded="isMenuOpen" aria-controls="papers-mobile-menu" aria-label="Toggle navigation menu" @click="isMenuOpen = !isMenuOpen">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>
    <Transition name="mobile-menu">
      <nav v-if="isMenuOpen" id="papers-mobile-menu" class="papers-nav__mobile-menu" aria-label="Primary navigation">
      <a v-for="item in mobileLinks" :key="item.href" :href="item.href" @click="isMenuOpen = false">{{ item.label }}</a>
      </nav>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isMenuOpen = ref(false)
const mobileLinks = [
  { label: 'Papers', href: '/papers/' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'GitHub ↗', href: 'https://github.com/MayukhChakrabortyDX/bliss-compiler' },
]

const onDocumentClick = (event: MouseEvent | TouchEvent) => {
  if (!isMenuOpen.value) return
  const target = event.target as Node | null
  if (!target) return
  const menuEl = document.getElementById('papers-mobile-menu')
  const buttonEl = document.querySelector('.papers-nav__menu-button')
  if (menuEl && !menuEl.contains(target) && buttonEl && !buttonEl.contains(target)) {
    isMenuOpen.value = false
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') isMenuOpen.value = false
}

onMounted(() => {
  window.addEventListener('pointerdown', onDocumentClick)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
})

watch(() => route?.path, () => {
  isMenuOpen.value = false
})
</script>