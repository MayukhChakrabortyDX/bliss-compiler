<script setup lang="ts">
const scrollToDownloads = (e: MouseEvent) => {
  e.preventDefault()
  const target = document.getElementById('downloads')
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.pushState(null, '', '#downloads')
  }
}
</script>

<template>
  <div class="home">

    <!-- Hero -->
    <section class="home-hero">
      <h1 class="home-hero__title">
        Native control.
        <span>Zero runtime overhead.</span>
      </h1>

      <p class="home-hero__description">
        Bliss is a compiled, statically typed systems programming language featuring
        lexical ownership verification, progressive compiler diagnostics, and direct
        native code generation without tracing garbage collection.
      </p>

      <div class="home-hero__actions">
        <a href="#downloads" class="home-button home-button--primary" @click="scrollToDownloads">
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
        <span>lexical ownership</span>
        <span>algebraic types</span>
        <span>llvm backend</span>
      </div>

      <div class="home-hero__rail" aria-label="Bliss compiler architecture">
        <span><strong>01</strong> AST &amp; Lexer</span>
        <span><strong>02</strong> Typed BIR</span>
        <span><strong>03</strong> LLVM Target</span>
      </div>
    </section>

    <!-- Thesis -->
    <section id="language" class="home-section home-thesis">
      <div class="home-thesis__intro">
        <div>
          <p class="home-eyebrow">Technical design goals</p>

          <h2 class="home-heading home-heading--large">
            Low-level control without undefined behavior.
          </h2>
        </div>

        <p class="home-thesis__description">
          Modern systems engineering demands deterministic memory reclamation without
          stop-the-world pause times, explicit struct layout control, and a resilient
          compiler pipeline designed from the ground up for progressive error recovery.
        </p>
      </div>

      <div class="home-feature-grid">
        <article class="home-feature-card">
          <div class="home-feature-card__number">01 / MEMORY MODEL</div>

          <h3>Lexical Ownership &amp; Lifetimes</h3>

          <p>
            Compile-time borrow verification without tracing garbage collection. Values carry
            explicit ownership semantics, enabling deterministic allocation and automatic resource cleanup at block boundaries.
          </p>
        </article>

        <article class="home-feature-card">
          <div class="home-feature-card__number">02 / TYPE SYSTEM</div>

          <h3>Algebraic Types &amp; Exhaustiveness</h3>

          <p>
            Discriminated unions, structural tuples, and strictly checked pattern matching.
            The type checker enforces complete state coverage, eliminating null dereferences and unhandled variant branches.
          </p>
        </article>

        <article class="home-feature-card">
          <div class="home-feature-card__number">03 / COMPILER PIPELINE</div>

          <h3>Progressive Parser Synchronization</h3>

          <p>
            A resilient recursive-descent parsing engine that synchronizes across bounded productions.
            Compilation continues diagnosing downstream code even in the presence of syntax errors.
          </p>
        </article>
      </div>
    </section>

    <!-- Code / Philosophy -->
    <section class="home-section home-idea">
      <div class="home-idea__panel">
        <div class="home-idea__copy">
          <p class="home-eyebrow home-eyebrow--dark">Systems syntax</p>

          <h2 class="home-heading home-heading--idea">
            Explicit semantics.<br />
            Deterministic execution.
          </h2>

          <p class="home-idea__description">
            Bliss pairs procedural ergonomics with systems primitives: immutable bindings
            by default, explicit error propagation via Result types, and direct manipulation
            of native memory buffers.
          </p>

          <a
            href="https://github.com/MayukhChakrabortyDX/bliss-compiler"
            target="_blank"
            rel="noreferrer"
            class="home-idea__link"
          >
            View compiler source on GitHub
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div class="home-code">
          <div class="home-code__header">
            <span></span>
            <span></span>
            <span></span>
            <span class="home-code__title">main.bliss</span>
          </div>

          <pre><code><span class="home-code__keyword">import</span> std.io.println;
<span class="home-code__keyword">import</span> std.types.*;

<span class="home-code__keyword">fx</span> main([String] args, i32 size): i32 {
    println(<span class="home-code__comment">"Hello World"</span>);
    <span class="home-code__keyword">return</span> 0;
}</code></pre>

          <div class="home-code__footer">
            <div>
              <span class="home-code__footer-label">Native Code Generation</span>
              <p>
                Lowered through Typed Bliss IR (BIR) directly to optimized machine code
                via LLVM with zero runtime abstraction penalty.
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
            <p class="home-eyebrow">Open compiler development</p>

            <h2>Engineered entirely in the open.</h2>

            <p>
              Follow lexer milestones, AST lowerings, type inference algorithms,
              and RFC benchmarks directly in the public source repository.
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
        <p class="home-eyebrow">Toolchain targets</p>

        <div>
          <h2 class="home-heading home-heading--downloads">
            Native cross-compilation.
          </h2>

          <p>Prebuilt toolchains &amp; language server binaries.</p>
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
              <p>x86_64 and aarch64</p>
            </div>

            <span class="home-soon-pill">Target</span>
          </div>

          <div class="home-download-options">
            <a href="#" aria-disabled="true">
              <span>
                <strong>Linux x86-64</strong>
                <small>x86_64-unknown-linux-gnu</small>
              </span>
              <span>Target Tier 1</span>
            </a>

            <a href="#" aria-disabled="true">
              <span>
                <strong>Linux ARM64</strong>
                <small>aarch64-unknown-linux-gnu</small>
              </span>
              <span>Target Tier 1</span>
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
              <p>x86_64 and aarch64</p>
            </div>

            <span class="home-soon-pill">Target</span>
          </div>

          <div class="home-download-options">
            <a href="#" aria-disabled="true">
              <span>
                <strong>Windows x86-64</strong>
                <small>x86_64-pc-windows-msvc</small>
              </span>
              <span>Target Tier 1</span>
            </a>

            <a href="#" aria-disabled="true">
              <span>
                <strong>Windows ARM64</strong>
                <small>aarch64-pc-windows-msvc</small>
              </span>
              <span>Target Tier 1</span>
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

              <span>Darwin LLVM</span>
            </div>

            <p>macOS support for Darwin targets (x86_64 and arm64-apple-darwin) in active development.</p>
          </div>

          <span class="home-macos-card__architectures">
            Apple Silicon · Intel
          </span>
        </article>
      </div>
    </section>
  </div>
</template>

