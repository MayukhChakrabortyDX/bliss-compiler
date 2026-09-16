<template>
  <nav class="section-nav" aria-label="Documentation navigation">
    <div class="section-nav__inner">
      <a href="/" class="section-nav__brand" aria-label="Bliss home">bliss <span>/ docs</span></a>

      <div class="section-nav__links">
        <a href="/docs/">Docs</a>
        <a href="/docs/language">Language</a>
        <a href="/docs/compiler">Compiler</a>
        <a href="/blog/">Blog</a>
        <a href="/courses/">Courses</a>
        <a href="/papers/">Papers</a>
        <a href="https://github.com/MayukhChakrabortyDX/bliss-compiler" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>

      <button class="section-nav__menu-button" type="button" :aria-expanded="isMenuOpen" aria-controls="docs-mobile-menu" aria-label="Toggle navigation menu" @click="isMenuOpen = !isMenuOpen">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
    </div>

    <div v-if="isMenuOpen" id="docs-mobile-menu" class="section-nav__mobile-menu">
      <a v-for="item in mobileLinks" :key="item.href" :href="item.href" @click="isMenuOpen = false">{{ item.label }}</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)
const mobileLinks = [
  { label: 'Docs', href: '/docs/' },
  { label: 'Language', href: '/docs/language' },
  { label: 'Compiler', href: '/docs/compiler' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Papers', href: '/papers/' },
  { label: 'GitHub ↗', href: 'https://github.com/MayukhChakrabortyDX/bliss-compiler' },
]
</script>

<style scoped>
.section-nav { position: fixed; top: 0; left: 0; z-index: 20; width: 100%; border-bottom: 1px solid var(--bliss-border); background: rgb(250 250 250 / 88%); backdrop-filter: blur(12px); }
.section-nav__inner { display: flex; align-items: center; justify-content: space-between; width: min(100% - 3rem, 1280px); min-height: 64px; margin-inline: auto; }
.section-nav__brand { color: var(--bliss-fg); font-size: 16px; font-weight: 700; letter-spacing: -.025em; text-decoration: none; }
.section-nav__brand span { color: var(--bliss-fg-muted); font-weight: 500; }
.section-nav__links { display: flex; align-items: center; gap: 24px; color: var(--bliss-fg-muted); font-size: 13px; font-weight: 500; }
.section-nav__links a { color: inherit; text-decoration: none; }
.section-nav__links a:hover, .section-nav__links .is-active { color: var(--bliss-fg); }
.section-nav__menu-button, .section-nav__mobile-menu { display: none; }
@media (max-width: 760px) {
  .section-nav__inner { width: min(100% - 2rem, 1280px); }
  .section-nav__links { display: none; }
  .section-nav__menu-button { width: 44px; height: 44px; display: grid; place-content: center; gap: 4px; border: 1px solid var(--bliss-border); border-radius: 12px; background: rgb(255 255 255 / 72%); color: var(--bliss-fg); }
  .section-nav__menu-button span { width: 17px; height: 1.5px; background: currentColor; }
  .section-nav__mobile-menu { position: absolute; top: calc(100% - 4px); right: 1rem; left: 1rem; display: grid; gap: 2px; padding: 8px; border: 1px solid var(--bliss-border); border-radius: 16px; background: rgb(255 255 255 / 96%); box-shadow: var(--bliss-shadow-lg); }
  .section-nav__mobile-menu a { padding: 12px; border-radius: 9px; color: var(--bliss-fg-secondary); font-size: 15px; font-weight: 500; text-decoration: none; }
  .section-nav__mobile-menu a:hover { background: var(--bliss-bg-subtle); }
}
</style>
