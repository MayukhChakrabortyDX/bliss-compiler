<template>
  <footer class="bliss-footer">
    <div class="bliss-footer__inner">
      <div>
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

<style scoped>
.bliss-footer {
  border-top: 1px solid rgb(228 228 231 / 80%);
}

.bliss-footer__inner {
  width: min(100% - 3rem, 1152px);
  margin-inline: auto;
  padding: 32px 0;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  color: #a1a1aa;
  font-size: 14px;
}

.bliss-footer__separator {
  margin-inline: 8px;
  color: #d4d4d8;
}

.bliss-footer a {
  color: inherit;
  text-decoration: none;
  transition: color 180ms ease;
}

.bliss-footer a:hover {
  color: #3f3f46;
}

.bliss-footer__tagline {
  font-family: var(--bliss-font-mono);
  font-size: 12px;
}

@media (max-width: 640px) {
  .bliss-footer__inner {
    width: min(100% - 2rem, 1152px);
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>