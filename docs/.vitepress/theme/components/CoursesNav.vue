<template>
  <nav :class="['courses-nav', { 'is-menu-open': isMenuOpen }]" aria-label="Courses navigation">
    <div class="courses-nav__inner">
      <a href="/" class="courses-nav__brand" aria-label="Bliss home">bliss <span>/ courses</span></a>
      <div class="courses-nav__links">
        <a href="/courses/">Courses</a>
        <a href="/docs/">Docs</a>
        <a href="/blog/">Blog</a>
        <a href="/papers/">Papers</a>
        <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" class="courses-nav__youtube">YouTube ↗</a>
      </div>

    </div>
  </nav>

  <Teleport to="body">
    <button :class="['courses-nav__menu-button', { 'is-open': isMenuOpen }]" type="button" :aria-expanded="isMenuOpen" aria-controls="courses-mobile-menu" aria-label="Toggle navigation menu" @click="isMenuOpen = !isMenuOpen">
      <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
    </button>
    <Transition name="mobile-menu">
      <nav v-if="isMenuOpen" id="courses-mobile-menu" class="courses-nav__mobile-menu" aria-label="Primary navigation">
      <a v-for="item in mobileLinks" :key="item.href" :href="item.href" @click="isMenuOpen = false">{{ item.label }}</a>
      </nav>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)
const mobileLinks = [
  { label: 'Courses', href: '/courses/' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Papers', href: '/papers/' },
  { label: 'YouTube ↗', href: 'https://www.youtube.com/' },
]
</script>

