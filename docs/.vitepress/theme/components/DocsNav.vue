<template>
  <nav class="section-nav" aria-label="Documentation navigation">
    <div class="section-nav__inner">
      <a href="/language/" class="section-nav__brand">bliss <span>/ docs</span></a>

      <div class="section-nav__links">
        <a href="/language/" :class="{ 'is-active': isLanguage }">Language</a>
        <a href="/compiler/" :class="{ 'is-active': isCompiler }">Compiler</a>
        <a href="/blog/">Blog</a>
        <a href="https://github.com/MayukhChakrabortyDX/bliss-compiler" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isCompiler = computed(() => route.path.startsWith('/compiler/'))
const isLanguage = computed(() => !isCompiler.value)
</script>

<style scoped>
.section-nav { position: fixed; top: 0; left: 0; z-index: 20; width: 100%; border-bottom: 1px solid var(--bliss-border); background: rgb(250 250 250 / 88%); backdrop-filter: blur(12px); }
.section-nav__inner { display: flex; align-items: center; justify-content: space-between; width: min(100% - 3rem, 1280px); min-height: 64px; margin-inline: auto; }
.section-nav__brand { color: var(--bliss-fg); font-size: 16px; font-weight: 700; letter-spacing: -.025em; text-decoration: none; }
.section-nav__brand span { color: var(--bliss-fg-muted); font-weight: 500; }
.section-nav__links { display: flex; align-items: center; gap: 24px; color: var(--bliss-fg-muted); font-size: 13px; font-weight: 500; }
.section-nav__links a { color: inherit; text-decoration: none; }
.section-nav__links a:hover, .section-nav__links .is-active { color: var(--bliss-fg); }
@media (max-width: 760px) { .section-nav__inner { width: min(100% - 2rem, 1280px); } .section-nav__links { gap: 14px; } .section-nav__links a:nth-child(3) { display: none; } }
</style>
