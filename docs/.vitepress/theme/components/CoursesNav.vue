<template>
  <nav class="courses-nav" aria-label="Courses navigation">
    <div class="courses-nav__inner">
      <a href="/" class="courses-nav__brand" aria-label="Bliss home">bliss <span>/ courses</span></a>
      <div class="courses-nav__links">
        <a href="/courses/">Courses</a>
        <a href="/docs/">Docs</a>
        <a href="/blog/">Blog</a>
        <a href="/papers/">Papers</a>
        <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" class="courses-nav__youtube">YouTube ↗</a>
      </div>

      <button class="courses-nav__menu-button" type="button" :aria-expanded="isMenuOpen" aria-controls="courses-mobile-menu" aria-label="Toggle navigation menu" @click="isMenuOpen = !isMenuOpen">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
    </div>

    <div v-if="isMenuOpen" id="courses-mobile-menu" class="courses-nav__mobile-menu">
      <a v-for="item in mobileLinks" :key="item.href" :href="item.href" @click="isMenuOpen = false">{{ item.label }}</a>
    </div>
  </nav>
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

<style scoped>
.courses-nav { position: fixed; top: 0; left: 0; z-index: 20; width: 100%; border-bottom: 1px solid var(--bliss-border); background: rgb(250 250 250 / 88%); backdrop-filter: blur(12px); }
.courses-nav__inner { display: flex; align-items: center; justify-content: space-between; width: min(100% - 3rem, 1152px); min-height: 64px; margin-inline: auto; }
.courses-nav__brand { color: var(--bliss-fg); font-family: var(--bliss-font-mono); font-size: 14px; font-weight: 600; text-decoration: none; }
.courses-nav__brand span { color: var(--bliss-fg-muted); font-weight: 400; }
.courses-nav__links { display: flex; align-items: center; gap: 22px; color: var(--bliss-fg-muted); font-size: 13px; font-weight: 500; }
.courses-nav__links a { color: inherit; text-decoration: none; }
.courses-nav__links a:hover { color: var(--bliss-fg); }
.courses-nav__youtube { padding: 7px 11px; border-radius: var(--bliss-radius-pill); background: #ef4444; color: white !important; }
.courses-nav__menu-button, .courses-nav__mobile-menu { display: none; }
@media (max-width: 760px) {
  .courses-nav__inner { width: min(100% - 2rem, 1152px); }
  .courses-nav__links { display: none; }
  .courses-nav__menu-button { width: 44px; height: 44px; display: grid; place-content: center; gap: 4px; border: 1px solid var(--bliss-border); border-radius: 12px; background: rgb(255 255 255 / 72%); color: var(--bliss-fg); }
  .courses-nav__menu-button span { width: 17px; height: 1.5px; background: currentColor; }
  .courses-nav__mobile-menu { position: absolute; top: calc(100% - 4px); right: 1rem; left: 1rem; display: grid; gap: 2px; padding: 8px; border: 1px solid var(--bliss-border); border-radius: 16px; background: rgb(255 255 255 / 96%); box-shadow: var(--bliss-shadow-lg); }
  .courses-nav__mobile-menu a { padding: 12px; border-radius: 9px; color: var(--bliss-fg-secondary); font-size: 15px; font-weight: 500; text-decoration: none; }
  .courses-nav__mobile-menu a:hover { background: var(--bliss-bg-subtle); }
}
</style>
