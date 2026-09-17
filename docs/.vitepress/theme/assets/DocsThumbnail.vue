<template>
  <div :class="['docs-card__art', `docs-card__art--${variant || 'violet'}`]" aria-hidden="true">
    <div class="docs-card__art-glow" />

    <!-- Language Overview -->
    <svg v-if="topic === 'overview-lang'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none" stroke="currentColor">
      <rect x="25" y="15" width="90" height="60" rx="10" stroke-width="1.5" stroke="rgba(139, 92, 246, 0.4)" fill="rgba(255, 255, 255, 0.6)" />
      <path d="M40 32h35M40 45h60M40 58h42" stroke-width="2" stroke-linecap="round" stroke="var(--bliss-violet-dark)" />
      <circle cx="100" cy="32" r="5" fill="#8b5cf6" />
      <path d="M98 43l4 4 8-8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="#10b981" />
    </svg>

    <!-- Syntax -->
    <svg v-else-if="topic === 'syntax'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none" stroke="currentColor">
      <rect x="20" y="15" width="100" height="60" rx="10" stroke-width="1.5" stroke="rgba(59, 130, 246, 0.4)" fill="rgba(255, 255, 255, 0.6)" />
      <path d="M38 35l-8 10 8 10M102 35l8 10-8 10" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" stroke="var(--bliss-blue-dark)" />
      <path d="M52 45h36" stroke-width="2.5" stroke-linecap="round" stroke="#3b82f6" />
      <path d="M62 33l16 24" stroke-width="2" stroke-linecap="round" stroke="#93c5fd" />
    </svg>

    <!-- Types -->
    <svg v-else-if="topic === 'types'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <rect x="22" y="20" width="40" height="50" rx="8" stroke="rgba(16, 185, 129, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <rect x="78" y="20" width="40" height="50" rx="8" stroke="rgba(16, 185, 129, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <text x="42" y="50" font-family="monospace" font-size="13" font-weight="700" fill="#047857" text-anchor="middle">i32</text>
      <text x="98" y="50" font-family="monospace" font-size="13" font-weight="700" fill="#047857" text-anchor="middle">str</text>
      <path d="M62 45h16" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3" stroke-linecap="round" />
    </svg>

    <!-- Expressions -->
    <svg v-else-if="topic === 'expressions'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none" stroke="currentColor">
      <circle cx="70" cy="26" r="12" stroke="rgba(245, 158, 11, 0.6)" stroke-width="1.75" fill="rgba(255, 255, 255, 0.8)" />
      <circle cx="42" cy="62" r="10" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.6)" />
      <circle cx="98" cy="62" r="10" stroke="rgba(245, 158, 11, 0.4)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.6)" />
      <path d="M62 34L48 54M78 34l14 20" stroke="rgba(245, 158, 11, 0.5)" stroke-width="1.5" />
      <path d="M66 26h8M70 22v8" stroke="#b45309" stroke-width="2" stroke-linecap="round" />
      <text x="42" y="66" font-family="monospace" font-size="11" font-weight="700" fill="#b45309" text-anchor="middle">x</text>
      <text x="98" y="66" font-family="monospace" font-size="11" font-weight="700" fill="#b45309" text-anchor="middle">y</text>
    </svg>

    <!-- Statements & Control Flow -->
    <svg v-else-if="topic === 'statements'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <path d="M30 45h25M85 45h25" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" />
      <polygon points="70,26 85,45 70,64 55,45" stroke="#e11d48" stroke-width="1.75" fill="rgba(255, 255, 255, 0.8)" />
      <path d="M70 45l-4-4m4 4l4-4" stroke="#e11d48" stroke-width="2" stroke-linecap="round" />
      <path d="M70 64v10M70 16v10" stroke="#fda4af" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2" />
    </svg>

    <!-- Modules -->
    <svg v-else-if="topic === 'modules'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <rect x="25" y="25" width="38" height="40" rx="6" stroke="rgba(99, 102, 241, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <rect x="77" y="25" width="38" height="40" rx="6" stroke="rgba(99, 102, 241, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <path d="M44 25V18h52v7" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="44" cy="45" r="4" fill="#4338ca" />
      <circle cx="96" cy="45" r="4" fill="#4338ca" />
      <path d="M48 45h44" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="3 3" />
    </svg>

    <!-- Tour -->
    <svg v-else-if="topic === 'tour'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <circle cx="35" cy="45" r="12" stroke="rgba(59, 130, 246, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <circle cx="70" cy="45" r="12" stroke="rgba(59, 130, 246, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <circle cx="105" cy="45" r="12" stroke="rgba(59, 130, 246, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <path d="M47 45h11m24 0h11" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" />
      <path d="M35 40v10m35-10v10m35-10v10" stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- Memory Model -->
    <svg v-else-if="topic === 'memory'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <rect x="25" y="22" width="40" height="46" rx="8" stroke="rgba(244, 63, 94, 0.6)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.8)" />
      <rect x="75" y="22" width="40" height="46" rx="8" stroke="rgba(244, 63, 94, 0.6)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.8)" />
      <path d="M45 36h-8v18h8" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M95 36h8v18h-8" stroke="#e11d48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M45 45h50" stroke="#f43f5e" stroke-width="1.75" stroke-dasharray="2 2" stroke-linecap="round" />
    </svg>

    <!-- Memory Walkthrough -->
    <svg v-else-if="topic === 'memory-walkthrough'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <rect x="30" y="20" width="80" height="50" rx="8" stroke="rgba(245, 158, 11, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <path d="M45 35h50M45 45h35M45 55h42" stroke="#d97706" stroke-width="2" stroke-linecap="round" />
      <circle cx="95" cy="55" r="4" fill="#f59e0b" />
    </svg>

    <!-- Status -->
    <svg v-else-if="topic === 'status'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <rect x="25" y="20" width="90" height="50" rx="8" stroke="rgba(113, 113, 122, 0.4)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <path d="M38 35h45M38 47h30M38 59h55" stroke="#71717a" stroke-width="2" stroke-linecap="round" />
      <circle cx="95" cy="35" r="4" fill="#10b981" />
      <circle cx="80" cy="47" r="4" fill="#3b82f6" />
      <circle cx="105" cy="59" r="4" fill="#f59e0b" />
    </svg>

    <!-- Compiler Overview -->
    <svg v-else-if="topic === 'overview-compiler'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <rect x="35" y="20" width="70" height="50" rx="10" stroke="rgba(139, 92, 246, 0.6)" stroke-width="1.75" fill="rgba(255, 255, 255, 0.8)" />
      <rect x="47" y="32" width="46" height="26" rx="4" fill="rgba(139, 92, 246, 0.12)" stroke="#8b5cf6" stroke-width="1.2" />
      <path d="M45 20v-6M70 20v-6M95 20v-6M45 70v6M70 70v6M95 70v6M35 35h-6M35 55h-6M105 35h6M105 55h6" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="70" cy="45" r="5" fill="#6d28d9" />
    </svg>

    <!-- Architecture -->
    <svg v-else-if="topic === 'architecture'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <rect x="25" y="16" width="90" height="16" rx="4" stroke="rgba(20, 184, 166, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <rect x="25" y="37" width="90" height="16" rx="4" stroke="rgba(20, 184, 166, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <rect x="25" y="58" width="90" height="16" rx="4" stroke="rgba(20, 184, 166, 0.5)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <text x="70" y="28" font-family="monospace" font-size="9" font-weight="700" fill="#0d9488" text-anchor="middle">FRONTEND (AST)</text>
      <text x="70" y="49" font-family="monospace" font-size="9" font-weight="700" fill="#0d9488" text-anchor="middle">MIDDLE-END (IR)</text>
      <text x="70" y="70" font-family="monospace" font-size="9" font-weight="700" fill="#0d9488" text-anchor="middle">CODEGEN (TARGET)</text>
    </svg>

    <!-- Parsing -->
    <svg v-else-if="topic === 'parsing'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <path d="M25 45c20-25 40 25 60 0s30-10 30-10" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" />
      <circle cx="25" cy="45" r="4" fill="#2563eb" />
      <circle cx="55" cy="32" r="4" fill="#2563eb" />
      <circle cx="85" cy="45" r="4" fill="#2563eb" />
      <circle cx="115" cy="35" r="4" fill="#2563eb" />
      <path d="M55 32v28M85 45v20" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="2 2" />
    </svg>

    <!-- Pipeline Walkthrough -->
    <svg v-else-if="topic === 'pipeline-walkthrough'" class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <circle cx="35" cy="45" r="14" stroke="rgba(245, 158, 11, 0.6)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <circle cx="70" cy="45" r="14" stroke="rgba(245, 158, 11, 0.6)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <circle cx="105" cy="45" r="14" stroke="rgba(245, 158, 11, 0.6)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <path d="M49 45h7m28 0h7" stroke="#d97706" stroke-width="2" stroke-linecap="round" />
      <path d="M53 42l4 3-4 3m32-6l4 3-4 3" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="35" y="48" font-family="monospace" font-size="9" font-weight="700" fill="#b45309" text-anchor="middle">01</text>
      <text x="70" y="48" font-family="monospace" font-size="9" font-weight="700" fill="#b45309" text-anchor="middle">02</text>
      <text x="105" y="48" font-family="monospace" font-size="9" font-weight="700" fill="#b45309" text-anchor="middle">03</text>
    </svg>

    <!-- Fallback Generic Vector -->
    <svg v-else class="docs-card__art-svg" viewBox="0 0 140 90" fill="none">
      <rect x="30" y="20" width="80" height="50" rx="8" stroke="rgba(139, 92, 246, 0.4)" stroke-width="1.5" fill="rgba(255, 255, 255, 0.7)" />
      <path d="M42 35h56M42 47h36M42 59h20" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" />
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  topic?: string
  variant?: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'zinc'
}>()
</script>
