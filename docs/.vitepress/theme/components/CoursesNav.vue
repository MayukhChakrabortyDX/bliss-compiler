<template>
  <nav class="courses-nav" aria-label="Courses navigation">
    <div class="courses-nav__inner">
      <a href="/courses/" class="courses-nav__brand">bliss <span>/ courses</span></a>
      <div class="courses-nav__links">
        <a href="/courses/">All courses</a>
        <a href="/docs/">Documentation</a>
        <a href="/blog/">Blog</a>
        <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" class="courses-nav__youtube">YouTube ↗</a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.courses-nav { position: fixed; top: 0; left: 0; z-index: 20; width: 100%; border-bottom: 1px solid var(--bliss-border); background: rgb(250 250 250 / 88%); backdrop-filter: blur(12px); }
.courses-nav__inner { display: flex; align-items: center; justify-content: space-between; width: min(100% - 3rem, 1152px); min-height: 64px; margin-inline: auto; }
.courses-nav__brand { color: var(--bliss-fg); font-family: var(--bliss-font-mono); font-size: 14px; font-weight: 600; text-decoration: none; }
.courses-nav__brand span { color: var(--bliss-fg-muted); font-weight: 400; }
.courses-nav__links { display: flex; align-items: center; gap: 22px; color: var(--bliss-fg-muted); font-size: 13px; font-weight: 500; }
.courses-nav__links a { color: inherit; text-decoration: none; }
.courses-nav__links a:hover { color: var(--bliss-fg); }
.courses-nav__youtube { padding: 7px 11px; border-radius: var(--bliss-radius-pill); background: #ef4444; color: white !important; }
@media (max-width: 760px) { .courses-nav__inner { width: min(100% - 2rem, 1152px); } .courses-nav__links { gap: 14px; } .courses-nav__links a:nth-child(2), .courses-nav__links a:nth-child(3) { display: none; } }
</style>
