<template>
  <main class="timeline-shell">
    <!-- Header -->
    <BlissPageHeader
      eyebrow="Public Build Log · Compiler Development"
      title="What we're building."
      description="A transparent, real-time log of what we are actively engineering right now, what is planned next, and our track record of shipped compiler milestones."
      variant="rose"
      pill
      dot
    />

    <!-- Section 1: In Flight (Right Now) -->
    <section id="in-flight" class="timeline-section" aria-labelledby="in-flight-heading">
      <div class="timeline-section-header">
        <div class="timeline-section-title">
          <h2 id="in-flight-heading">In Flight (Right Now)</h2>
          <span class="timeline-section-count">{{ inFlightItems.length }} active</span>
        </div>
      </div>

      <div class="timeline-stream">
        <div
          v-for="item in inFlightItems"
          :key="item.title"
          class="timeline-item timeline-item--in-flight"
        >
          <div class="timeline-marker" aria-hidden="true" />
          <article class="timeline-card">
            <div class="timeline-card__top">
              <div class="timeline-card__meta">
                <span class="timeline-tag">{{ item.category }}</span>
                <span class="timeline-date">{{ item.targetDate }}</span>
              </div>
              <span :class="['timeline-status', `timeline-status--${item.statusClass}`]">
                {{ item.statusText }}
              </span>
            </div>

            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>

            <ul v-if="item.deliverables?.length" class="timeline-deliverables">
              <li
                v-for="(task, idx) in item.deliverables"
                :key="idx"
                :class="{ 'is-pending': !task.done }"
              >
                {{ task.text }}
              </li>
            </ul>

            <div class="timeline-card__footer">
              <span>{{ item.owner }}</span>
              <a
                v-if="item.link"
                :href="item.link"
                target="_blank"
                rel="noreferrer"
                class="timeline-card__link"
              >
                {{ item.linkText || 'Track on GitHub ↗' }}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Section 2: Up Next (The Future) -->
    <section id="up-next" class="timeline-section" aria-labelledby="up-next-heading">
      <div class="timeline-section-header">
        <div class="timeline-section-title">
          <h2 id="up-next-heading">Up Next (The Future)</h2>
          <span class="timeline-section-count">{{ upNextItems.length }} scheduled</span>
        </div>
      </div>

      <div class="timeline-stream">
        <div
          v-for="item in upNextItems"
          :key="item.title"
          class="timeline-item timeline-item--up-next"
        >
          <div class="timeline-marker" aria-hidden="true" />
          <article class="timeline-card">
            <div class="timeline-card__top">
              <div class="timeline-card__meta">
                <span class="timeline-tag">{{ item.category }}</span>
                <span class="timeline-date">{{ item.targetDate }}</span>
              </div>
              <span class="timeline-status timeline-status--planned">
                Scheduled
              </span>
            </div>

            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>

            <ul v-if="item.deliverables?.length" class="timeline-deliverables">
              <li
                v-for="(task, idx) in item.deliverables"
                :key="idx"
                class="is-pending"
              >
                {{ task.text }}
              </li>
            </ul>

            <div class="timeline-card__footer">
              <span>Planned sprint target</span>
              <a
                v-if="item.link"
                :href="item.link"
                target="_blank"
                rel="noreferrer"
                class="timeline-card__link"
              >
                {{ item.linkText || 'RFC Discussion ↗' }}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Section 3: Shipped Milestones -->
    <section id="shipped" class="timeline-section" aria-labelledby="shipped-heading">
      <div class="timeline-section-header">
        <div class="timeline-section-title">
          <h2 id="shipped-heading">Shipped Milestones</h2>
          <span class="timeline-section-count">{{ shippedItems.length }} completed</span>
        </div>
      </div>

      <div class="timeline-stream">
        <div
          v-for="item in shippedItems"
          :key="item.title"
          class="timeline-item timeline-item--shipped"
        >
          <div class="timeline-marker" aria-hidden="true" />
          <article class="timeline-card">
            <div class="timeline-card__top">
              <div class="timeline-card__meta">
                <span class="timeline-tag">{{ item.category }}</span>
                <span class="timeline-date">{{ item.targetDate }}</span>
              </div>
              <span class="timeline-status timeline-status--shipped">
                ✓ Shipped
              </span>
            </div>

            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>

            <div class="timeline-card__footer">
              <span>{{ item.versionTag }}</span>
              <a
                v-if="item.link"
                :href="item.link"
                target="_blank"
                rel="noreferrer"
                class="timeline-card__link"
              >
                {{ item.linkText || 'View Release Notes ↗' }}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import BlissPageHeader from './primitives/BlissPageHeader.vue'

interface Deliverable {
  text: string
  done: boolean
}

interface TimelineItem {
  title: string
  category: string
  targetDate: string
  description: string
  statusClass?: string
  statusText?: string
  owner?: string
  versionTag?: string
  link?: string
  linkText?: string
  deliverables?: Deliverable[]
}

const inFlightItems: TimelineItem[] = [
  {
    title: 'Formalizing AST Production Node Structures',
    category: 'Compiler / AST Design',
    targetDate: 'Active Sprint · Expected this weekend',
    description: 'Formalizing strongly typed Abstract Syntax Tree (AST) structures for each grammar production. Up until now, almost all parser productions returned in-place objects—a deliberate design choice to avoid prematurely locking into rigid AST node structures before having a working, stable parser.',
    statusClass: 'in-flight',
    statusText: 'In Active Development',
    owner: 'Core Compiler Team',
    link: 'https://github.com/MayukhChakrabortyDX/bliss-compiler',
    linkText: 'Track AST Migration on GitHub ↗',
    deliverables: [
      { text: 'Formalize concrete AST node structs replacing in-place production objects', done: true },
      { text: 'Standardize statement, declaration, and expression node interfaces', done: true },
      { text: 'Integrate exact source span coordinates into all formal AST nodes', done: false },
      { text: 'Complete production visitor and recursive tree printing passes', done: false },
    ],
  },
]

const upNextItems: TimelineItem[] = [
  {
    title: '500+ Unique Adversarial Test Cases & Parser Hardening',
    category: 'Quality Assurance / Fuzzing',
    targetDate: 'Next Sprint · Post-AST Formalization',
    description: 'Aggressively stress-testing the parser with over 500+ unique, handcrafted and fuzzed test cases with an explicit focus on breaking the parser, identifying grammar ambiguities, and guaranteeing complete production stability.',
    deliverables: [
      { text: 'Curate 500+ unique test programs covering complex syntax combinations', done: false },
      { text: 'Aggressive fuzz testing targeting unexpected EOF and edge-case syntax', done: false },
      { text: 'Exhaustive verification of parser recovery and error synchronization', done: false },
    ],
    link: 'https://github.com/MayukhChakrabortyDX/bliss-compiler',
    linkText: 'Follow Test Suite RFC ↗',
  },
  {
    title: 'Compiler Semantic Analysis & Type Checker Phase',
    category: 'Compiler / Analysis',
    targetDate: 'Future Milestone · Post-Hardening',
    description: 'Transition from the front-end parser into the compiler analysis phase. With the AST formalized and the parser battle-tested across 500+ adversarial suites, construct the symbol tables, lexical scopes, and type-checking engine.',
    deliverables: [
      { text: 'Symbol table resolution and lexical scope hierarchy construction', done: false },
      { text: 'Bidirectional type inference and algebraic type verification', done: false },
      { text: 'Compile-time ownership and borrow verification pass', done: false },
    ],
    link: 'https://github.com/MayukhChakrabortyDX/bliss-compiler',
    linkText: 'Analyzer Roadmap ↗',
  },
]

const shippedItems: TimelineItem[] = [
  {
    title: 'Pre-Alpha Completed Grammar Parser',
    category: 'Compiler / Parser',
    targetDate: 'Shipped · Pre-Alpha',
    description: 'First milestone implementation of the completed grammar parser. The full grammar has been coded and verified with initial test suites, and shipped directly to early-access users and community testers to discover real-world parser bugs before downstream compilation phases.',
    versionTag: 'Pre-Alpha v0.1',
    link: 'https://github.com/MayukhChakrabortyDX/bliss-compiler',
    linkText: 'View Parser Codebase ↗',
  },
  {
    title: 'Span-Based Token Stream Lexer',
    category: 'Compiler / Lexer',
    targetDate: 'Shipped',
    description: 'Fast lexical scanner handling keywords, operators, and string literals using string spans directly over source memory instead of creating new strings or copying/slicing them.',
    versionTag: 'Milestone 0.1',
    link: 'https://github.com/MayukhChakrabortyDX/bliss-compiler',
    linkText: 'View Commit Log ↗',
  },
]
</script>
