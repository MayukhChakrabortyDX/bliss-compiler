<template>
  <BlissNav />

  <main class="not-found">
    <div class="not-found__code">404 / NOT FOUND</div>
    <h1>This page went<br /><span>somewhere else.</span></h1>
    <p>The address is valid enough to visit, but there is no Bliss page here yet.</p>
    <div class="not-found__actions">
      <a href="/" class="not-found__primary">Return to Bliss <span aria-hidden="true">↗</span></a>
      <a href="/docs/" class="not-found__secondary">Browse the docs</a>
    </div>
  </main>

  <BlissFooter />
</template>

<script setup lang="ts">
import BlissNav from './BlissNav.vue'
import BlissFooter from './BlissFooter.vue'
</script>

<style scoped>
.not-found { width: min(100% - 3rem, 960px); min-height: calc(100vh - 145px); margin: 0 auto; padding: 180px 0 112px; }
.not-found__code { color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 11px; font-weight: 600; letter-spacing: .18em; }
.not-found h1 { max-width: 760px; margin: 18px 0 24px; color: var(--bliss-fg); font-size: clamp(3.5rem, 8vw, 7rem); font-weight: 600; letter-spacing: -.075em; line-height: .92; }
.not-found h1 span { color: var(--bliss-fg-muted); }
.not-found p { max-width: 420px; margin: 0; color: var(--bliss-fg-muted); font-size: 17px; line-height: 1.7; }
.not-found__actions { display: flex; align-items: center; gap: 18px; margin-top: 36px; }
.not-found__actions a { font-size: 14px; font-weight: 600; text-decoration: none; }
.not-found__primary { padding: 13px 17px; border-radius: 8px; background: var(--bliss-fg); color: var(--bliss-bg); }
.not-found__primary span { margin-left: 6px; }
.not-found__secondary { color: var(--bliss-fg-muted); }
.not-found__secondary:hover { color: var(--bliss-fg); }
@media (max-width: 640px) { .not-found { width: min(100% - 2rem, 760px); padding-top: 144px; } .not-found__actions { align-items: stretch; flex-direction: column; } .not-found__primary { align-self: flex-start; } }
</style>