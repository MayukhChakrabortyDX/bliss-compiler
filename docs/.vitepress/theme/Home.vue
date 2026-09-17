<template>
  <div class="home">

    <!-- Hero -->
    <section class="home-hero">
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
          href="/docs/compiler"
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

      <div class="home-hero__rail" aria-label="Bliss focus areas">
        <span><strong>01</strong> language</span>
        <span><strong>02</strong> compiler</span>
        <span><strong>03</strong> systems</span>
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
                    fill="#27272a"
                    d="M24 4c-6.5 0-10.3 5.9-10.3 13.5 0 3.7-1.7 7.2-3.5 10.4-1.5 2.7-.7 6.1 2.1 7.2 1.9.8 4 .2 5.2-1.4 1.4 3.7 3.7 5.6 6.5 5.6s5.1-1.9 6.5-5.6c1.2 1.6 3.3 2.2 5.2 1.4 2.8-1.1 3.6-4.5 2.1-7.2-1.8-3.2-3.5-6.7-3.5-10.4C34.3 9.9 30.5 4 24 4Z"
                  />
                  <ellipse cx="24" cy="28.5" rx="8.2" ry="9.4" fill="#fafafa" />
                  <ellipse cx="19.5" cy="16.8" rx="3.2" ry="4.2" fill="#fafafa" />
                  <ellipse cx="28.5" cy="16.8" rx="3.2" ry="4.2" fill="#fafafa" />
                  <circle cx="20.2" cy="17.3" r="1.1" fill="#18181b" />
                  <circle cx="27.8" cy="17.3" r="1.1" fill="#18181b" />
                  <path d="m21 20.8 3-2 3 2-3 2.2Z" fill="#f59e0b" />
                  <ellipse cx="16.5" cy="38.4" rx="5.2" ry="1.8" fill="#f59e0b" />
                  <ellipse cx="31.5" cy="38.4" rx="5.2" ry="1.8" fill="#f59e0b" />
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
              <div class="home-macos-icon" aria-label="Apple">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.3.74 3.09.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.55 4.09ZM12.04 7.25C11.89 5.02 13.7 3.18 15.78 3c.29 2.58-2.34 4.5-3.74 4.25Z" />
                </svg>
              </div>

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

