<template>
  <nav :class="['blog-nav', { 'is-menu-open': isMenuOpen }]" aria-label="Blog navigation">
    <div class="blog-nav__inner">
      <a href="/" class="blog-nav__brand" aria-label="Bliss home">bliss <span>journal</span></a>

      <div class="blog-nav__links">
        <a href="/blog/">Blog</a>
        <a href="/docs/language">Language</a>
        <a href="/docs/">Docs</a>
        <a href="/courses/">Courses</a>
        <a href="/papers/">Papers</a>
        <a href="#subscribe" class="blog-nav__subscribe">Subscribe</a>
      </div>

    </div>
  </nav>

  <Teleport to="body">
    <button :class="['blog-nav__menu-button', { 'is-open': isMenuOpen }]" type="button" :aria-expanded="isMenuOpen" aria-controls="blog-mobile-menu" aria-label="Toggle navigation menu" @click="isMenuOpen = !isMenuOpen">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>
    <Transition name="mobile-menu">
      <nav v-if="isMenuOpen" id="blog-mobile-menu" class="blog-nav__mobile-menu" aria-label="Primary navigation">
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
  { label: 'Blog', href: '/blog/' },
  { label: 'Language', href: '/docs/language' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Papers', href: '/papers/' },
  { label: 'Subscribe', href: '#subscribe' },
]

const onDocumentClick = (event: MouseEvent | TouchEvent) => {
  if (!isMenuOpen.value) return
  const target = event.target as Node | null
  if (!target) return
  const menuEl = document.getElementById('blog-mobile-menu')
  const buttonEl = document.querySelector('.blog-nav__menu-button')
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

