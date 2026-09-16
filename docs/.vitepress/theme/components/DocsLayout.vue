<template>
  <div class="docs-page">
    <!-- Sticky on phones: the panels are anchored to this wrapper so they open
         under the bar wherever the reader has scrolled to, never off-screen. -->
    <div class="docs-mobile-nav">
      <div class="docs-mobile-tools">
        <button
          type="button"
          :class="[
            'docs-mobile-tools__button',
            'docs-mobile-tools__button--menu',
            { 'is-active': mobilePanel === 'menu' },
          ]"
          :aria-expanded="mobilePanel === 'menu'"
          aria-controls="docs-sidebar-panel"
          @click="toggleMobilePanel('menu')"
        >
          <svg class="docs-mobile-tools__icon" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M2.75 4h10.5M2.75 8h6.5M2.75 12h8.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span class="docs-mobile-tools__text">Menu</span>
          <span class="docs-mobile-tools__chevron" aria-hidden="true"></span>
        </button>
        <button
          type="button"
          :class="[
            'docs-mobile-tools__button',
            'docs-mobile-tools__button--outline',
            { 'is-active': mobilePanel === 'outline' },
          ]"
          :aria-expanded="mobilePanel === 'outline'"
          aria-controls="docs-outline-panel"
          @click="toggleMobilePanel('outline')"
        >
          <svg class="docs-mobile-tools__icon" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="3.25" cy="4" r="1.1" fill="currentColor" />
            <circle cx="3.25" cy="8" r="1.1" fill="currentColor" />
            <circle cx="3.25" cy="12" r="1.1" fill="currentColor" />
            <path
              d="M6.75 4h6.5M6.75 8h6.5M6.75 12h4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span class="docs-mobile-tools__text">On this page</span>
          <span class="docs-mobile-tools__chevron" aria-hidden="true"></span>
        </button>
      </div>

      <div
        v-if="mobilePanel"
        class="docs-mobile-scrim"
        aria-hidden="true"
        @click="mobilePanel = null"
      />

      <Transition name="docs-panel">
        <div
          v-if="mobilePanel === 'menu'"
          id="docs-sidebar-panel"
          class="docs-mobile-panel"
        >
          <nav class="docs-mobile-panel__scroll" aria-label="Documentation">
            <div v-for="group in docsNavigation" :key="group.label" class="docs-mobile-panel__group">
              <div class="docs-mobile-panel__label">{{ group.label }}</div>
              <a
                v-for="item in group.items"
                :key="item.text"
                :href="item.link"
                :class="{ 'is-active': item.link && isActive(item.link) }"
                @click="mobilePanel = null"
              >
                {{ item.text }}
              </a>
            </div>
          </nav>
        </div>
      </Transition>

      <Transition name="docs-panel">
        <div
          v-if="mobilePanel === 'outline'"
          id="docs-outline-panel"
          class="docs-mobile-panel"
        >
          <nav class="docs-mobile-panel__scroll" aria-label="On this page">
            <a
              v-for="header in headers"
              :key="header.slug"
              :href="`#${header.slug}`"
              :class="[`level-${header.level}`, { 'is-active': header.slug === activeSlug }]"
              @click="mobilePanel = null"
            >
              {{ header.title }}
            </a>
            <span v-if="!headers.length" class="docs-mobile-panel__empty">
              No sections on this page.
            </span>
          </nav>
        </div>
      </Transition>
    </div>

    <aside class="docs-sidebar">
      <div v-for="group in groups" :key="group.label" class="docs-sidebar__group">
        <div class="docs-sidebar__label">{{ group.label }}</div>

        <nav class="docs-sidebar__nav" aria-label="Documentation">
          <template v-for="item in group.items" :key="item.text">
            <a
              v-if="item.link"
              :href="item.link"
              :class="['docs-sidebar__link', { 'is-active': isActive(item.link) }]"
            >
              {{ item.text }}
            </a>
          </template>
        </nav>
      </div>
    </aside>

    <article class="docs-article">
      <div class="docs-breadcrumb">
        <span>{{ sectionLabel }}</span>
        <span aria-hidden="true">/</span>
        <span>{{ page.title }}</span>
      </div>

      <div class="docs-content">
        <Content />
      </div>

      <nav v-if="previous || next" class="docs-pagination" aria-label="Documentation pagination">
        <a v-if="previous" :href="previous.link" class="docs-pagination__item docs-pagination__item--previous">
          <span class="docs-pagination__direction">Previous</span>
          <span class="docs-pagination__title">{{ previous.text }}</span>
        </a>

        <a v-if="next" :href="next.link" class="docs-pagination__item docs-pagination__item--next">
          <span class="docs-pagination__direction">Next</span>
          <span class="docs-pagination__title">{{ next.text }}</span>
        </a>
      </nav>
    </article>

    <aside v-if="headers.length" class="docs-outline">
      <div class="docs-outline__label">On this page</div>
      <nav
        class="docs-outline__nav"
        aria-label="On this page"
        :style="{
          '--docs-outline-progress-top': `${outlineProgress.top}%`,
          '--docs-outline-progress-height': `${outlineProgress.height}%`,
        }"
      >
        <span class="docs-outline__progress" aria-hidden="true" />
        <a
          v-for="header in headers"
          :key="header.slug"
          :href="`#${header.slug}`"
          :class="[
            'docs-outline__link',
            `level-${header.level}`,
            { 'is-active': header.slug === activeSlug },
          ]"
        >
          {{ header.title }}
        </a>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { docsNavigation, flattenNavigation } from '../navigation'

const route = useRoute()
const { page } = useData()
const outlineProgress = ref({ top: 0, height: 0 })
const mobilePanel = ref<'menu' | 'outline' | null>(null)
const activeSlug = ref('')

/* Matches the fixed nav (64px) plus the sticky tools bar (44px) so a heading
   is considered current once it clears both. */
const HEADING_OFFSET = 116

const toggleMobilePanel = (panel: 'menu' | 'outline') => {
  mobilePanel.value = mobilePanel.value === panel ? null : panel
}

const currentPath = computed(() => {
  const path = route.path.replace(/\/$/, '')
  return path || '/'
})

const normalizedLink = (link: string) => link.replace(/\/$/, '') || '/'

const isActive = (link?: string) =>
  !!link && normalizedLink(link) === currentPath.value

const activeGroup = computed(() =>
  docsNavigation.find((group) =>
    flattenNavigation([group]).some((item) => isActive(item.link)),
  ) ?? docsNavigation[0],
)

const groups = computed(() => (activeGroup.value ? [activeGroup.value] : []))
const links = computed(() => flattenNavigation(groups.value))

const currentIndex = computed(() =>
  links.value.findIndex((item) => item.link && isActive(item.link)),
)

const previous = computed(() =>
  currentIndex.value > 0 ? links.value[currentIndex.value - 1] : undefined,
)

const next = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < links.value.length - 1
    ? links.value[currentIndex.value + 1]
    : undefined,
)

const sectionLabel = computed(() => activeGroup.value?.label ?? 'Documentation')

const headers = computed(() =>
  page.value.headers
    .filter((header) => header.level === 2 || header.level === 3)
    .map((header) => ({
      level: header.level,
      title: header.title,
      slug: header.slug,
    })),
)

const updateOutlineProgress = () => {
  const content = document.querySelector<HTMLElement>('.docs-content')
  if (!content) return

  const articleTop = content.getBoundingClientRect().top + window.scrollY
  const articleBottom = articleTop + content.offsetHeight
  const articleHeight = articleBottom - articleTop

  if (articleHeight <= 0) return

  const viewportTop = window.scrollY + 64
  const viewportBottom = window.scrollY + window.innerHeight
  const visibleTop = Math.min(Math.max(viewportTop, articleTop), articleBottom)
  const visibleBottom = Math.min(Math.max(viewportBottom, articleTop), articleBottom)

  outlineProgress.value = {
    top: ((visibleTop - articleTop) / articleHeight) * 100,
    height: Math.max(0, ((visibleBottom - visibleTop) / articleHeight) * 100),
  }
}

const updateActiveHeading = () => {
  if (!headers.value.length) {
    activeSlug.value = ''
    return
  }

  let current = headers.value[0].slug

  for (const header of headers.value) {
    const element = document.getElementById(header.slug)
    if (!element) continue
    if (element.getBoundingClientRect().top - HEADING_OFFSET > 0) break
    current = header.slug
  }

  activeSlug.value = current
}

const onScroll = () => {
  updateOutlineProgress()
  updateActiveHeading()
}

const refreshOutline = async () => {
  await nextTick()
  onScroll()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') mobilePanel.value = null
}

onMounted(() => {
  refreshOutline()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('keydown', onKeydown)
})

watch(() => route.path, () => {
  mobilePanel.value = null
  refreshOutline()
})
</script>
