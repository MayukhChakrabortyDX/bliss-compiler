<template>
  <div class="docs-page">
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
          :class="['docs-outline__link', `level-${header.level}`]"
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

const refreshOutline = async () => {
  await nextTick()
  updateOutlineProgress()
}

onMounted(() => {
  refreshOutline()
  window.addEventListener('scroll', updateOutlineProgress, { passive: true })
  window.addEventListener('resize', updateOutlineProgress)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateOutlineProgress)
  window.removeEventListener('resize', updateOutlineProgress)
})

watch(() => route.path, refreshOutline)
</script>
