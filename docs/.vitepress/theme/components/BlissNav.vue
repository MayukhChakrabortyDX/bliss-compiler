<template>
  <nav :class="['bliss-nav', { 'is-scrolled': isScrolled, 'is-menu-open': isMenuOpen }]">
    <div class="bliss-nav__inner">
      <!-- Brand -->
      <a href="/" class="bliss-nav__brand">
        <span
          class="bliss-nav__logo"
          aria-label="Bliss logo"
        >
          <BlissLogoSvg />
        </span>

        <span class="bliss-nav__name">bliss</span>
      </a>

      <!-- Desktop navigation -->
      <div class="bliss-nav__links">
        <a href="/docs/language">The language</a>
        <a href="/docs/">Docs</a>
        <a href="/blog">Blog</a>
        <a href="/courses/">Courses</a>
        <a href="/papers/">Papers</a>
        <a href="/#downloads">Downloads</a>

        <a
          href="https://github.com/MayukhChakrabortyDX/bliss-compiler"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </div>

    </div>
  </nav>

  <Teleport to="body">
    <button
      :class="['bliss-nav__menu-button', { 'is-open': isMenuOpen }]"
      type="button"
      :aria-expanded="isMenuOpen"
      aria-controls="bliss-mobile-menu"
      aria-label="Toggle navigation menu"
      @click="isMenuOpen = !isMenuOpen"
    >
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>

    <Transition name="mobile-menu">
      <nav v-if="isMenuOpen" id="bliss-mobile-menu" class="bliss-nav__mobile-menu" aria-label="Primary navigation">
      <a href="/docs/language" @click="isMenuOpen = false">The language</a>
      <a href="/docs/" @click="isMenuOpen = false">Docs</a>
      <a href="/blog" @click="isMenuOpen = false">Blog</a>
      <a href="/courses/" @click="isMenuOpen = false">Courses</a>
      <a href="/papers/" @click="isMenuOpen = false">Papers</a>
      <a href="/#downloads" @click="isMenuOpen = false">Downloads</a>
      <a href="https://github.com/MayukhChakrabortyDX/bliss-compiler" target="_blank" rel="noreferrer" @click="isMenuOpen = false">GitHub ↗</a>
      </nav>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import BlissLogoSvg from '../assets/BlissLogoSvg.vue'

const route = useRoute()
const isScrolled = ref(false)
const isMenuOpen = ref(false)

const updateScrollState = () => {
  isScrolled.value = window.scrollY > 8
}

const onDocumentClick = (event: MouseEvent | TouchEvent) => {
  if (!isMenuOpen.value) return
  const target = event.target as Node | null
  if (!target) return
  const menuEl = document.getElementById('bliss-mobile-menu')
  const buttonEl = document.querySelector('.bliss-nav__menu-button')
  if (menuEl && !menuEl.contains(target) && buttonEl && !buttonEl.contains(target)) {
    isMenuOpen.value = false
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') isMenuOpen.value = false
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
  window.addEventListener('pointerdown', onDocumentClick)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
  window.removeEventListener('pointerdown', onDocumentClick)
  window.removeEventListener('keydown', onKeydown)
})

watch(() => route?.path, () => {
  isMenuOpen.value = false
})
</script>

