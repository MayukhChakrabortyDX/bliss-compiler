<template>
  <nav class="blog-nav" aria-label="Blog navigation">
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

      <button class="blog-nav__menu-button" type="button" :aria-expanded="isMenuOpen" aria-controls="blog-mobile-menu" aria-label="Toggle navigation menu" @click="isMenuOpen = !isMenuOpen">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
    </div>

    <div v-if="isMenuOpen" id="blog-mobile-menu" class="blog-nav__mobile-menu">
      <a v-for="item in mobileLinks" :key="item.href" :href="item.href" @click="isMenuOpen = false">{{ item.label }}</a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isMenuOpen = ref(false)
const mobileLinks = [
  { label: 'Blog', href: '/blog/' },
  { label: 'Language', href: '/docs/language' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Papers', href: '/papers/' },
  { label: 'Subscribe', href: '#subscribe' },
]
</script>

<style scoped>
.blog-nav { position: fixed; top: 0; left: 0; z-index: 20; width: 100%; border-bottom: 1px solid var(--bliss-border); background: rgb(250 250 250 / 88%); backdrop-filter: blur(12px); }
.blog-nav__inner { display: flex; align-items: center; justify-content: space-between; width: min(100% - 3rem, 960px); min-height: 64px; margin-inline: auto; }
.blog-nav__brand { color: var(--bliss-fg); font-family: var(--bliss-font-mono); font-size: 14px; font-weight: 600; text-decoration: none; }
.blog-nav__brand span { color: var(--bliss-fg-muted); font-weight: 400; }
.blog-nav__links { display: flex; align-items: center; gap: 22px; color: var(--bliss-fg-muted); font-size: 13px; font-weight: 500; }
.blog-nav__links a { color: inherit; text-decoration: none; }
.blog-nav__links a:hover { color: var(--bliss-fg); }
.blog-nav__subscribe { padding: 7px 11px; border: 1px solid var(--bliss-border); border-radius: var(--bliss-radius-pill); color: var(--bliss-fg) !important; }
.blog-nav__menu-button, .blog-nav__mobile-menu { display: none; }
@media (max-width: 760px) {
  .blog-nav__inner { width: min(100% - 2rem, 960px); }
  .blog-nav__links { display: none; }
  .blog-nav__menu-button { width: 44px; height: 44px; display: grid; place-content: center; gap: 4px; border: 1px solid var(--bliss-border); border-radius: 12px; background: rgb(255 255 255 / 72%); color: var(--bliss-fg); }
  .blog-nav__menu-button span { width: 17px; height: 1.5px; background: currentColor; }
  .blog-nav__mobile-menu { position: absolute; top: calc(100% - 4px); right: 1rem; left: 1rem; display: grid; gap: 2px; padding: 8px; border: 1px solid var(--bliss-border); border-radius: 16px; background: rgb(255 255 255 / 96%); box-shadow: var(--bliss-shadow-lg); }
  .blog-nav__mobile-menu a { padding: 12px; border-radius: 9px; color: var(--bliss-fg-secondary); font-size: 15px; font-weight: 500; text-decoration: none; }
  .blog-nav__mobile-menu a:hover { background: var(--bliss-bg-subtle); }
}
</style>
