<template>
  <nav class="blog-nav" aria-label="Blog navigation">
    <div class="blog-nav__inner">
      <a href="/blog/" class="blog-nav__brand">bliss <span>journal</span></a>

      <div class="blog-nav__links">
        <a href="/blog/">All posts</a>
        <a href="/language/">Language</a>
        <a href="/compiler/">Docs</a>
        <a href="#subscribe" class="blog-nav__subscribe">Subscribe</a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.blog-nav { position: fixed; top: 0; left: 0; z-index: 20; width: 100%; border-bottom: 1px solid var(--bliss-border); background: rgb(250 250 250 / 88%); backdrop-filter: blur(12px); }
.blog-nav__inner { display: flex; align-items: center; justify-content: space-between; width: min(100% - 3rem, 960px); min-height: 64px; margin-inline: auto; }
.blog-nav__brand { color: var(--bliss-fg); font-family: var(--bliss-font-mono); font-size: 14px; font-weight: 600; text-decoration: none; }
.blog-nav__brand span { color: var(--bliss-fg-muted); font-weight: 400; }
.blog-nav__links { display: flex; align-items: center; gap: 22px; color: var(--bliss-fg-muted); font-size: 13px; font-weight: 500; }
.blog-nav__links a { color: inherit; text-decoration: none; }
.blog-nav__links a:hover { color: var(--bliss-fg); }
.blog-nav__subscribe { padding: 7px 11px; border: 1px solid var(--bliss-border); border-radius: var(--bliss-radius-pill); color: var(--bliss-fg) !important; }
@media (max-width: 760px) { .blog-nav__inner { width: min(100% - 2rem, 960px); } .blog-nav__links { gap: 14px; } .blog-nav__links a:nth-child(2) { display: none; } }
</style>
