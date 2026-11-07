<template>
  <footer class="bliss-footer">
    <div class="bliss-footer__inner">
      <div class="bliss-footer__brand">
        <span class="bliss-footer__logo" aria-hidden="true">
          <BlissLogo />
        </span>
        <span>© 2026 Bliss</span>

        <span class="bliss-footer__separator">·</span>

        <a
          href="https://github.com/MayukhChakrabortyDX/bliss-compiler"
          target="_blank"
          rel="noreferrer"
        >
          Open source compiler
        </a>
      </div>

      <span class="bliss-footer__tagline">
        simple · native · deliberate
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import BlissLogo from './primitives/BlissLogo.vue'
</script>
