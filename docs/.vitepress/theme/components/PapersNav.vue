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
import { ref } from 'vue'

const isMenuOpen = ref(false)
const mobileLinks = [
  { label: 'Papers', href: '/papers/' },
  { label: 'Docs', href: '/docs/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'GitHub ↗', href: 'https://github.com/MayukhChakrabortyDX/bliss-compiler' },
]
</script>

<style scoped>
.papers-nav { position: fixed; top: 0; left: 0; z-index: 20; width: 100%; border-bottom: 1px solid rgb(228 228 231 / 72%); background: rgb(250 250 250 / 76%); box-shadow: 0 8px 24px rgb(9 9 11 / 5%); backdrop-filter: blur(20px) saturate(135%); }
.papers-nav__inner { display: flex; align-items: center; justify-content: space-between; width: min(100% - 3rem, 960px); min-height: 64px; margin-inline: auto; }
.papers-nav__brand { color: var(--bliss-fg); font-family: var(--bliss-font-mono); font-size: 14px; font-weight: 600; text-decoration: none; }
.papers-nav__brand span { color: var(--bliss-fg-muted); font-weight: 400; }
.papers-nav__links { display: flex; align-items: center; gap: 22px; color: var(--bliss-fg-muted); font-size: 13px; font-weight: 500; }
.papers-nav__links a { color: inherit; text-decoration: none; }
.papers-nav__links a:hover { color: var(--bliss-fg); }
.papers-nav__menu-button, .papers-nav__mobile-menu { display: none; }
@media (max-width: 760px) {
  .papers-nav__inner { width: min(100% - 2rem, 960px); }
  .papers-nav__links { display: none; }
  .papers-nav__menu-button { position: fixed; top: auto; right: 1rem; bottom: calc(1.25rem + env(safe-area-inset-bottom)); z-index: 30; width: 52px; height: 52px; display: grid; place-content: center; gap: 4px; border: 1px solid #27272a; border-radius: 50%; background: #09090b; color: #fafafa; box-shadow: 0 12px 28px rgb(9 9 11 / 24%), 0 0 0 4px rgb(255 255 255 / 80%); cursor: pointer; -webkit-tap-highlight-color: transparent; -webkit-appearance: none; }
  .papers-nav__menu-button span { width: 17px; height: 1.5px; background: currentColor; transition: transform 160ms ease, opacity 160ms ease; }
  .papers-nav__menu-button { transition: transform 160ms ease, box-shadow 160ms ease; }
  .papers-nav__menu-button:active { transform: scale(.92); }
  .papers-nav__menu-button.is-open { box-shadow: 0 8px 20px rgb(9 9 11 / 20%), 0 0 0 4px rgb(255 255 255 / 80%); }
  .papers-nav__menu-button.is-open span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
  .papers-nav__menu-button.is-open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .papers-nav__menu-button.is-open span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }
  .papers-nav__mobile-menu { position: fixed; top: auto; right: 1rem; bottom: calc(1.25rem + env(safe-area-inset-bottom) + 64px); z-index: 29; width: min(calc(100% - 2rem), 300px); display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 10px; border: 1px solid var(--bliss-border); border-radius: 16px; background: rgb(255 255 255 / 96%); box-shadow: 0 16px 36px rgb(9 9 11 / 14%); backdrop-filter: blur(16px); }
  .papers-nav.is-menu-open { background: transparent; }
  .papers-nav__mobile-menu a { padding: 12px; border-radius: 9px; color: var(--bliss-fg-secondary); font-size: 15px; font-weight: 500; text-decoration: none; -webkit-tap-highlight-color: transparent; }
  .papers-nav__menu-button:active, .papers-nav__mobile-menu a:active { background-color: inherit; }
  .papers-nav__menu-button:focus-visible, .papers-nav__mobile-menu a:focus-visible { outline: 2px solid #71717a; outline-offset: 3px; }
  .mobile-menu-enter-active, .mobile-menu-leave-active { transition: opacity 160ms ease, transform 160ms ease; transform-origin: bottom right; }
  .mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(8px) scale(.96); }
  .papers-nav__mobile-menu a:hover { background: var(--bliss-bg-subtle); }
}
</style>