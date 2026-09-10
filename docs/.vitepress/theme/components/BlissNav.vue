<template>
  <nav :class="['bliss-nav', { 'is-scrolled': isScrolled }]">
    <div class="bliss-nav__inner">
      <!-- Brand -->
      <a href="/" class="bliss-nav__brand">
        <span
          class="bliss-nav__logo"
          aria-label="Bliss logo placeholder"
        >
          <!-- Replace this placeholder SVG with the final Bliss logo when ready -->
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path
              d="M7 20.5c2.2 0 3.2-8 6.2-8s4 7 6.5 7 3.1-4.5 5.3-4.5"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </span>

        <span class="bliss-nav__name">bliss</span>
      </a>

      <!-- Desktop navigation -->
      <div class="bliss-nav__links">
        <a href="/language">The language</a>
        <a href="/language/">Docs</a>
        <a href="/blog">Blog</a>
        <a href="/#downloads">Downloads</a>

        <a
          href="https://github.com/MayukhChakrabortyDX/bliss-compiler"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </div>

      <!-- Mobile -->
      <a
        href="/#downloads"
        class="bliss-nav__mobile-downloads"
      >
        Downloads
      </a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isScrolled = ref(false)

const updateScrollState = () => {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
})
</script>

<style scoped>
.bliss-nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  width: 100%;
  border-bottom: 1px solid transparent;
  background: transparent;
  transition:
    background var(--bliss-duration-normal) var(--bliss-ease),
    border-color var(--bliss-duration-normal) var(--bliss-ease),
    box-shadow var(--bliss-duration-normal) var(--bliss-ease);
}

.bliss-nav.is-scrolled {
  border-bottom: 1px solid rgb(228 228 231 / 75%);
  background: rgb(250 250 250 / 78%);
  box-shadow: 0 1px 12px rgb(9 9 11 / 4%);
  backdrop-filter: blur(16px);
}

.bliss-nav__inner {
  width: min(100% - 3rem, 1152px);
  margin-inline: auto;
  padding: 28px 0;

  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bliss-nav__brand {
  display: flex;
  align-items: center;
  gap: 10px;

  color: var(--bliss-fg);
  font-weight: 600;
  letter-spacing: -0.025em;
  text-decoration: none;
}

.bliss-nav__logo {
  width: 32px;
  height: 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;
  background: #09090b;
  color: white;
}

.bliss-nav__logo svg {
  width: 20px;
  height: 20px;
}

.bliss-nav__name {
  font-size: 18px;
}

.bliss-nav__links {
  display: flex;
  align-items: center;
  gap: 28px;

  color: #71717a;
  font-size: 14px;
  font-weight: 500;
}

.bliss-nav__links a {
  color: inherit;
  text-decoration: none;
  transition: color 180ms ease;
}

.bliss-nav__links a:hover {
  color: #09090b;
}

.bliss-nav__mobile-downloads {
  display: none;

  padding: 8px 16px;
  border: 1px solid #e4e4e7;
  border-radius: 999px;

  background: rgb(255 255 255 / 70%);
  color: #3f3f46;

  font-size: 14px;
  font-weight: 500;
  text-decoration: none;

  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
  backdrop-filter: blur(12px);

  transition:
    border-color 180ms ease,
    background 180ms ease;
}

.bliss-nav__mobile-downloads:hover {
  border-color: #d4d4d8;
  background: white;
}

@media (max-width: 768px) {
  .bliss-nav__inner {
    width: min(100% - 2rem, 1152px);
  }

  .bliss-nav__links {
    display: none;
  }

  .bliss-nav__mobile-downloads {
    display: block;
  }
}
</style>
