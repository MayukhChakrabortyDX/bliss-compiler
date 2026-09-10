<template>
  <div class="home">

    <!-- Hero -->
    <section class="home-hero">
      <div class="home-status-pill">
        <span class="home-status-dot"></span>
        Early development
      </div>

      <h1 class="home-hero__title">
        Rethink
        <span>systems.</span>
      </h1>

      <p class="home-hero__description">
        Bliss is a systems programming language exploring a new outlook on
        memory safety, programming paradigms, and the fundamentals of systems software.
      </p>

      <div class="home-hero__actions">
        <a href="#downloads" class="home-button home-button--primary">
          Get Bliss
          <span aria-hidden="true">↓</span>
        </a>

        <a
          href="https://github.com/MayukhChakrabortyDX/bliss-compiler"
          target="_blank"
          rel="noreferrer"
          class="home-button home-button--secondary"
        >
          Explore the compiler
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="home-keywords">
        <span>systems programming</span>
        <span>memory safety</span>
        <span>new paradigms</span>
      </div>
    </section>

    <!-- Thesis -->
    <section id="language" class="home-section home-thesis">
      <div class="home-thesis__intro">
        <div>
          <p class="home-eyebrow">Why Bliss?</p>

          <h2 class="home-heading home-heading--large">
            Systems programming deserves another look.
          </h2>
        </div>

        <p class="home-thesis__description">
          Bliss is being designed from first principles. Instead of treating today's
          conventions as fixed boundaries, it asks what systems programming could look
          like if memory, ownership, syntax, and the programming model were reconsidered together.
        </p>
      </div>

      <div class="home-feature-grid">
        <article class="home-feature-card">
          <div class="home-feature-card__number">01 / MEMORY</div>

          <h3>A new take on memory safety.</h3>

          <p>
            Memory safety is not treated as a single mechanism. Bliss explores different
            ways to make safe systems software practical while preserving low-level control.
          </p>
        </article>

        <article class="home-feature-card">
          <div class="home-feature-card__number">02 / PARADIGM</div>

          <h3>Programming, reconsidered.</h3>

          <p>
            Bliss questions familiar assumptions about how programs are structured,
            composed, and reasoned about — not just how syntax is written.
          </p>
        </article>

        <article class="home-feature-card">
          <div class="home-feature-card__number">03 / SYSTEM</div>

          <h3>Designed as a system.</h3>

          <p>
            The language and compiler are being developed together so that the ideas
            can shape the generated program instead of becoming a layer on top.
          </p>
        </article>
      </div>
    </section>

    <!-- Code / Philosophy -->
    <section class="home-section home-idea">
      <div class="home-idea__panel">
        <div class="home-idea__copy">
          <p class="home-eyebrow home-eyebrow--dark">The idea</p>

          <h2 class="home-heading home-heading--idea">
            Less tradition.<br />
            More intention.
          </h2>

          <p class="home-idea__description">
            Bliss is an exploration. The goal is not to make another familiar systems
            language, but to investigate whether the pieces can fit together differently.
          </p>

          <a
            href="https://github.com/MayukhChakrabortyDX/bliss-compiler"
            target="_blank"
            rel="noreferrer"
            class="home-idea__link"
          >
            Read the work on GitHub
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div class="home-code">
          <div class="home-code__header">
            <span></span>
            <span></span>
            <span></span>
            <span class="home-code__title">bliss</span>
          </div>

          <pre><code><span class="home-code__comment">// an early language, still taking shape</span>

<span class="home-code__keyword">fx</span> main() {
    <span class="home-code__comment">// rethink the way systems are built</span>
}</code></pre>

          <div class="home-code__footer">
            <div>
              <span class="home-code__footer-label">Prototype compiler</span>
              <p>
                Currently transforming Bliss source into an AST, with compilation
                infrastructure evolving toward the next stages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Status -->
    <section class="home-section home-status">
      <div class="home-status-card">
        <div class="home-status-card__content">
          <div>
            <p class="home-eyebrow">Project status</p>

            <h2>Bliss is being built in public.</h2>

            <p>
              Follow the compiler repository for the latest language experiments,
              implementation work, and tests.
            </p>
          </div>

          <a
            href="https://github.com/MayukhChakrabortyDX/bliss-compiler"
            target="_blank"
            rel="noreferrer"
            class="home-status-card__button"
          >
            View on GitHub ↗
          </a>
        </div>
      </div>
    </section>

    <!-- Downloads -->
    <section id="downloads" class="home-section home-downloads">
      <div class="home-downloads__heading">
        <p class="home-eyebrow">Downloads</p>

        <div>
          <h2 class="home-heading home-heading--downloads">
            Choose your machine.
          </h2>

          <p>Releases are coming soon.</p>
        </div>
      </div>

      <div class="home-download-grid">
        <!-- Linux -->
        <article class="home-download-card">
          <div class="home-download-card__top">
            <div>
              <div class="home-platform-icon home-platform-icon--linux">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M24 4c-6.1 0-10.1 5.3-10.1 12.5 0 4.3-2.1 6.6-3.8 9.3-1.3 2.1-.8 5 1.8 6.2 1.5.7 3.1.3 4.3-.6 1.3 2.7 3.8 4.2 7.8 4.2s6.5-1.5 7.8-4.2c1.2.9 2.8 1.3 4.3.6 2.6-1.2 3.1-4.1 1.8-6.2-1.7-2.7-3.8-5-3.8-9.3C34.1 9.3 30.1 4 24 4Zm-6.2 28.7c-.9 0-1.7-.7-1.7-1.6s.8-1.6 1.7-1.6 1.7.7 1.7 1.6-.8 1.6-1.7 1.6Zm12.4 0c-.9 0-1.7-.7-1.7-1.6s.8-1.6 1.7-1.6 1.7.7 1.7 1.6-.8 1.6-1.7 1.6Z"
                  />
                  <path
                    fill="white"
                    d="M19 16.2c0 1-.7 1.8-1.6 1.8s-1.6-.8-1.6-1.8.7-1.8 1.6-1.8 1.6.8 1.6 1.8Zm13.2 0c0 1-.7 1.8-1.6 1.8s-1.6-.8-1.6-1.8.7-1.8 1.6-1.8 1.6.8 1.6 1.8Z"
                  />
                  <path
                    fill="currentColor"
                    d="M18.8 22.2c1.9 1.3 8.5 1.3 10.4 0 .5-.3 1.1-.2 1.4.3.3.5.2 1.1-.3 1.4-2.5 1.7-10.1 1.7-12.6 0-.5-.3-.6-.9-.3-1.4.3-.5.9-.6 1.4-.3Z"
                  />
                </svg>
              </div>

              <h3>Linux</h3>
              <p>x86-64 and ARM64</p>
            </div>

            <span class="home-soon-pill">Soon</span>
          </div>

          <div class="home-download-options">
            <a href="#" aria-disabled="true">
              <span>
                <strong>Linux x86-64</strong>
                <small>linux-x86_64</small>
              </span>
              <span>Coming soon</span>
            </a>

            <a href="#" aria-disabled="true">
              <span>
                <strong>Linux ARM64</strong>
                <small>linux-aarch64</small>
              </span>
              <span>Coming soon</span>
            </a>
          </div>
        </article>

        <!-- Windows -->
        <article class="home-download-card">
          <div class="home-download-card__top">
            <div>
              <div class="home-platform-icon home-platform-icon--windows">
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M5 8.2 22.4 5.8v17.1H5V8.2Zm19.3-2.7L43 2.8v20.1H24.3V5.5ZM5 25.1h17.4v17.1L5 39.8V25.1Zm19.3 0H43v20.1l-18.7-2.7V25.1Z"
                  />
                </svg>
              </div>

              <h3>Windows</h3>
              <p>x86-64 and ARM64</p>
            </div>

            <span class="home-soon-pill">Soon</span>
          </div>

          <div class="home-download-options">
            <a href="#" aria-disabled="true">
              <span>
                <strong>Windows x86-64</strong>
                <small>windows-x86_64</small>
              </span>
              <span>Coming soon</span>
            </a>

            <a href="#" aria-disabled="true">
              <span>
                <strong>Windows ARM64</strong>
                <small>windows-aarch64</small>
              </span>
              <span>Coming soon</span>
            </a>
          </div>
        </article>

        <!-- macOS -->
        <article class="home-macos-card">
          <div>
            <div class="home-macos-card__title">
              <div class="home-macos-icon">⌘</div>

              <h3>macOS</h3>

              <span>Coming later</span>
            </div>

            <p>macOS support is planned for a future release.</p>
          </div>

          <span class="home-macos-card__architectures">
            x86-64 · ARM64
          </span>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.home-section {
  width: min(100% - 3rem, 1152px);
  margin-inline: auto;
}

.home-eyebrow {
  margin: 0;
  color: #a1a1aa;
  font-family: var(--bliss-font-mono);
  font-size: 12px;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.home-eyebrow--dark {
  color: #71717a;
}

.home-heading {
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.035em;
}

.home-heading--large {
  max-width: 768px;
  margin-top: 12px;
  font-size: 48px;
  line-height: 1.1;
}

.home-heading--idea {
  margin-top: 16px;
  font-size: 36px;
  line-height: 1.15;
  letter-spacing: -0.025em;
}

.home-heading--downloads {
  margin-top: 8px;
  font-size: 30px;
  line-height: 1.2;
}

/* Hero */

.home-hero {
  width: min(100% - 3rem, 1024px);
  margin-inline: auto;
  /* Reserve the fixed, transparent marketing navigation without separating it
     from the ambient homepage background. */
  padding: 168px 0 96px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.home-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 6px 14px;
  border: 1px solid #e4e4e7;
  border-radius: 999px;
  background: rgb(255 255 255 / 80%);
  color: #52525b;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
  backdrop-filter: blur(12px);
}

.home-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #10b981;
}

.home-hero__title {
  max-width: 896px;
  margin: 0;
  font-size: 64px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.055em;
}

.home-hero__title span {
  color: #a1a1aa;
}

.home-hero__description {
  max-width: 672px;
  margin: 28px 0 0;
  color: #71717a;
  font-size: 20px;
  line-height: 2;
}

.home-hero__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 36px;
}

.home-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 180ms ease,
    background 180ms ease,
    border-color 180ms ease;
}

.home-button:hover {
  transform: translateY(-2px);
}

.home-button--primary {
  background: #09090b;
  color: white;
  box-shadow: 0 10px 24px rgb(9 9 11 / 10%);
}

.home-button--primary:hover {
  background: #27272a;
}

.home-button--secondary {
  border: 1px solid #e4e4e7;
  background: white;
  color: #27272a;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
}

.home-button--secondary:hover {
  border-color: #d4d4d8;
}

.home-keywords {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 32px;
  row-gap: 12px;
  margin-top: 48px;
  color: #a1a1aa;
  font-family: var(--bliss-font-mono);
  font-size: 11px;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

/* Thesis */

.home-thesis {
  padding-bottom: 112px;
  scroll-margin-top: 40px;
}

.home-thesis__intro {
  display: grid;
  gap: 40px;
  align-items: end;
  grid-template-columns: 1.1fr 0.9fr;
}

.home-thesis__description {
  max-width: 576px;
  margin: 0;
  padding-bottom: 4px;
  color: #71717a;
  font-size: 16px;
  line-height: 1.75;
}

.home-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 48px;
}

.home-feature-card {
  padding: 24px;
  border: 1px solid #e4e4e7;
  border-radius: 24px;
  background: white;
  box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
}

.home-feature-card__number {
  margin-bottom: 40px;
  color: #a1a1aa;
  font-family: var(--bliss-font-mono);
  font-size: 12px;
  line-height: 1.5;
}

.home-feature-card h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.home-feature-card p {
  margin: 12px 0 0;
  color: #71717a;
  font-size: 14px;
  line-height: 1.5;
}

/* Idea / code */

.home-idea {
  padding-bottom: 112px;
}

.home-idea__panel {
  overflow: hidden;
  border: 1px solid #e4e4e7;
  border-radius: 32px;
  background: #09090b;
  color: white;
  box-shadow: 0 24px 48px rgb(9 9 11 / 10%);
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
}

.home-idea__copy {
  padding: 48px;
}

.home-idea__description {
  max-width: 448px;
  margin: 20px 0 0;
  color: #a1a1aa;
  font-size: 14px;
  line-height: 1.75;
}

.home-idea__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: color 180ms ease;
}

.home-idea__link:hover {
  color: #d4d4d8;
}

.home-code {
  padding: 48px;
  border-left: 1px solid rgb(255 255 255 / 10%);
  background: rgb(255 255 255 / 3.5%);
}

.home-code__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: #71717a;
  font-family: var(--bliss-font-mono);
  font-size: 11px;
}

.home-code__header > span:not(.home-code__title) {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #3f3f46;
}

.home-code__title {
  margin-left: 8px;
}

.home-code pre {
  margin: 0;
  overflow-x: auto;
  color: #d4d4d8;
  font-family: var(--bliss-font-mono);
  font-size: 14px;
  line-height: 1.75;
}

.home-code__comment {
  color: #71717a;
}

.home-code__keyword {
  color: white;
}

.home-code__footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgb(255 255 255 / 10%);
}

.home-code__footer-label {
  color: white;
  font-family: var(--bliss-font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.home-code__footer p {
  max-width: 560px;
  margin: 8px 0 0;
  color: #71717a;
  font-size: 13px;
  line-height: 1.6;
}

/* Status */

.home-status {
  padding-bottom: 112px;
}

.home-status-card {
  padding: 32px;
  border: 1px solid #e4e4e7;
  border-radius: 24px;
  background: white;
  box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
}

.home-status-card__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.home-status-card h2 {
  margin: 8px 0 0;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.home-status-card p:not(.home-eyebrow) {
  max-width: 672px;
  margin: 8px 0 0;
  color: #71717a;
  font-size: 14px;
  line-height: 1.5;
}

.home-status-card__button {
  flex-shrink: 0;
  padding: 12px 20px;
  border: 1px solid #e4e4e7;
  border-radius: 999px;
  color: #27272a;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition:
    border-color 180ms ease,
    background 180ms ease;
}

.home-status-card__button:hover {
  border-color: #d4d4d8;
  background: #fafafa;
}

/* Downloads */

.home-downloads {
  padding-bottom: 112px;
  scroll-margin-top: 40px;
}

.home-downloads__heading {
  margin-bottom: 32px;
}

.home-downloads__heading > div {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.home-downloads__heading > div > p {
  margin: 0;
  color: #a1a1aa;
  font-size: 14px;
}

.home-download-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.home-download-card {
  padding: 24px;
  border: 1px solid #e4e4e7;
  border-radius: 24px;
  background: white;
  box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.home-download-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgb(9 9 11 / 5%);
}

.home-download-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.home-platform-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #f4f4f5;
}

.home-platform-icon svg {
  width: 36px;
  height: 36px;
}

.home-platform-icon--linux {
  color: #27272a;
}

.home-platform-icon--windows {
  color: #0284c7;
}

.home-download-card h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.home-download-card__top p {
  margin: 4px 0 0;
  color: #71717a;
  font-size: 14px;
}

.home-soon-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 12px;
  font-weight: 500;
}

.home-download-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 28px;
}

.home-download-options a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fafafa;
  color: inherit;
  text-decoration: none;
  opacity: 0.7;
  cursor: not-allowed;
}

.home-download-options strong {
  display: block;
  font-size: 14px;
  font-weight: 500;
}

.home-download-options small {
  display: block;
  margin-top: 2px;
  color: #a1a1aa;
  font-family: var(--bliss-font-mono);
  font-size: 11px;
}

.home-download-options a > span:last-child {
  color: #a1a1aa;
  font-size: 12px;
  font-weight: 500;
}

.home-macos-card {
  grid-column: 1 / -1;
  padding: 24px;
  border: 1px dashed #d4d4d8;
  border-radius: 24px;
  background: rgb(250 250 250 / 70%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.home-macos-card__title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-macos-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: white;
  font-size: 18px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 5%);
}

.home-macos-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.home-macos-card__title > span {
  padding: 4px 10px;
  border-radius: 999px;
  background: #e4e4e7;
  color: #71717a;
  font-size: 12px;
  font-weight: 500;
}

.home-macos-card p {
  margin: 8px 0 0;
  color: #71717a;
  font-size: 14px;
}

.home-macos-card__architectures {
  color: #a1a1aa;
  font-family: var(--bliss-font-mono);
  font-size: 12px;
}

/* Responsive */

@media (max-width: 1024px) {
  .home-section {
    width: min(100% - 3rem, 1152px);
  }

  .home-thesis__intro {
    grid-template-columns: 1fr;
  }

  .home-idea__panel {
    grid-template-columns: 1fr;
  }

  .home-code {
    border-top: 1px solid rgb(255 255 255 / 10%);
    border-left: 0;
  }
}

@media (max-width: 768px) {
  .home-hero {
    padding-top: 152px;
    padding-bottom: 80px;
  }

  .home-hero__title {
    font-size: 56px;
  }

  .home-hero__description {
    font-size: 18px;
    line-height: 1.8;
  }

  .home-feature-grid {
    grid-template-columns: 1fr;
  }

  .home-status-card__content {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-downloads__heading > div {
    align-items: flex-start;
    flex-direction: column;
  }

  .home-macos-card {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .home-section,
  .home-hero {
    width: min(100% - 2rem, 1152px);
  }

  .home-hero {
    padding-top: 144px;
  }

  .home-hero__title {
    font-size: 48px;
  }

  .home-hero__description {
    margin-top: 24px;
    font-size: 17px;
  }

  .home-hero__actions {
    width: 100%;
    flex-direction: column;
  }

  .home-button {
    width: 100%;
    justify-content: center;
  }

  .home-heading--large {
    font-size: 40px;
  }

  .home-idea__copy,
  .home-code {
    padding: 32px;
  }

  .home-download-grid {
    grid-template-columns: 1fr;
  }

  .home-macos-card {
    grid-column: auto;
  }
}
</style>
