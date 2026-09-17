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
          :class="[
            'docs-outline__link',
            `level-${header.level}`,
            { 'is-active': header.slug === activeSlug },
          ]"
          @click="onOutlineClick(header.slug)"
        >
          {{ header.title }}
        </a>
      </nav>
    </aside>

    <Teleport to="body">
      <!-- Merged Mobile Pill Capsule (Docs Reader Tools + Site Navigation) -->
      <div class="docs-mobile-capsule">
        <!-- Top Half: Reader Tools (Docs Menu & On this page TOC) -->
        <button
          type="button"
          :class="['docs-mobile-capsule__btn', { 'is-active': !!mobilePanel }]"
          :aria-expanded="!!mobilePanel"
          aria-controls="docs-reader-popover"
          aria-label="Toggle reader tools"
          @click="toggleReaderTools"
        >
          <!-- Open Book / Reader Icon when closed, X when open -->
          <svg v-if="!mobilePanel" class="docs-mobile-capsule__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M2.5 4.5A2.5 2.5 0 0 1 5 2h4.5v13.5H5a2.5 2.5 0 0 0-2.5 2.5V4.5z" />
            <path d="M17.5 4.5A2.5 2.5 0 0 0 15 2h-4.5v13.5H15a2.5 2.5 0 0 1 2.5 2.5V4.5z" />
          </svg>
          <svg v-else class="docs-mobile-capsule__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>

        <div class="docs-mobile-capsule__divider" aria-hidden="true" />

        <!-- Bottom Half: Primary Site Navigation Menu -->
        <button
          type="button"
          :class="['docs-mobile-capsule__btn', { 'is-active': isSiteNavOpen }]"
          :aria-expanded="isSiteNavOpen"
          aria-controls="docs-site-popover"
          aria-label="Toggle site navigation menu"
          @click="toggleSiteNav"
        >
          <!-- Hamburger Menu Icon when closed, X when open -->
          <svg v-if="!isSiteNavOpen" class="docs-mobile-capsule__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
          <svg v-else class="docs-mobile-capsule__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>

      <!-- Reader Tools Popover (Menu | On this page) -->
      <Transition name="mobile-menu">
        <div
          v-if="mobilePanel"
          id="docs-reader-popover"
          class="docs-reader-popover"
          role="dialog"
          aria-label="Reader tools"
        >
          <div class="docs-reader-popover__tabs">
            <button
              type="button"
              :class="['docs-reader-popover__tab', { 'is-active': mobilePanel === 'menu' }]"
              @click="mobilePanel = 'menu'"
            >
              Menu
            </button>
            <button
              type="button"
              :class="['docs-reader-popover__tab', { 'is-active': mobilePanel === 'outline' }]"
              @click="mobilePanel = 'outline'"
            >
              On this page
            </button>
          </div>

          <div class="docs-reader-popover__content">
            <!-- Menu Panel (Docs navigation) -->
            <nav v-if="mobilePanel === 'menu'" class="docs-reader-popover__scroll" aria-label="Documentation">
              <div v-for="groupItem in docsNavigation" :key="groupItem.label" class="docs-reader-popover__group">
                <div class="docs-reader-popover__label">{{ groupItem.label }}</div>
                <a
                  v-for="item in groupItem.items"
                  :key="item.text"
                  :href="item.link"
                  :class="{ 'is-active': item.link && isActive(item.link) }"
                  @click="mobilePanel = null"
                >
                  {{ item.text }}
                </a>
              </div>
            </nav>

            <!-- Outline Panel (On this page) -->
            <nav v-else class="docs-reader-popover__scroll" aria-label="On this page">
              <a
                v-for="header in headers"
                :key="header.slug"
                :href="`#${header.slug}`"
                :class="[`level-${header.level}`, { 'is-active': header.slug === activeSlug }]"
                @click="onOutlineClick(header.slug)"
              >
                {{ header.title }}
              </a>
              <span v-if="!headers.length" class="docs-reader-popover__empty">
                No sections on this page.
              </span>
            </nav>
          </div>
        </div>
      </Transition>

      <!-- Site Navigation Popover -->
      <Transition name="mobile-menu">
        <nav
          v-if="isSiteNavOpen"
          id="docs-site-popover"
          class="bliss-mobile-popover bliss-mobile-popover--site docs-site-popover"
          aria-label="Primary navigation"
        >
          <div class="bliss-mobile-popover__header">
            <span class="bliss-mobile-popover__badge">Navigation</span>
          </div>
          <div class="bliss-mobile-popover__grid">
            <a
              v-for="item in siteNavLinks"
              :key="item.href"
              :href="item.href"
              :class="['bliss-mobile-popover__link', { 'is-active': isPrimaryLinkActive(item.href) }]"
              :target="item.href.startsWith('http') ? '_blank' : undefined"
              :rel="item.href.startsWith('http') ? 'noreferrer' : undefined"
              @click="isSiteNavOpen = false"
            >
              {{ item.label }}
            </a>
          </div>
        </nav>
      </Transition>
    </Teleport>
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
const isSiteNavOpen = ref(false)
const activeSlug = ref('')

const siteNavLinks = [
  { label: 'Docs', href: '/docs/' },
  { label: 'Timeline', href: '/timeline/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Papers', href: '/papers/' },
  { label: 'GitHub ↗', href: 'https://github.com/MayukhChakrabortyDX/bliss-compiler' },
]

/* Matches the fixed nav (64px) plus the sticky tools bar (44px) so a heading
   is considered current once it clears both. */
const HEADING_OFFSET = 116

const toggleReaderTools = () => {
  isSiteNavOpen.value = false
  mobilePanel.value = mobilePanel.value ? null : (headers.value.length ? 'outline' : 'menu')
}

const toggleSiteNav = () => {
  mobilePanel.value = null
  isSiteNavOpen.value = !isSiteNavOpen.value
}

let isClickScrolling = false
let clickScrollTimer: ReturnType<typeof setTimeout> | null = null

const onOutlineClick = (slug: string) => {
  activeSlug.value = slug
  mobilePanel.value = null
  isClickScrolling = true

  if (clickScrollTimer) clearTimeout(clickScrollTimer)
  clickScrollTimer = setTimeout(() => {
    isClickScrolling = false
    updateActiveHeading()
  }, 800)
}

const currentPath = computed(() => {
  const path = route.path.replace(/\/$/, '')
  return path || '/'
})

const normalizedLink = (link: string) => link.replace(/\/$/, '') || '/'

const isActive = (link?: string) =>
  !!link && normalizedLink(link) === currentPath.value

const isPrimaryLinkActive = (href: string) => {
  if (href.startsWith('http')) return false
  const path = route.path.replace(/\/$/, '') || '/'
  const target = href.replace(/\/$/, '') || '/'
  return path.startsWith(target)
}

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

const headers = computed(() => {
  const pageHeaders = page.value?.headers || []
  return pageHeaders
    .filter((header) => header.level >= 2 && header.level <= 4)
    .map((header) => ({
      level: header.level,
      title: header.title,
      slug: header.slug,
    }))
})

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
  if (isClickScrolling) return
  if (!headers.value.length) {
    activeSlug.value = ''
    return
  }

  const scrollY = window.scrollY
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1100
  const topThreshold = isMobile ? 100 : 96

  // Collect bounding positions of all headings currently in DOM
  const headingList: { slug: string; top: number }[] = []
  for (const header of headers.value) {
    const el = document.getElementById(header.slug)
    if (el) {
      headingList.push({
        slug: header.slug,
        top: el.getBoundingClientRect().top,
      })
    }
  }

  if (!headingList.length) return

  // Near top of document
  if (scrollY < 60) {
    activeSlug.value = headingList[0].slug
    return
  }

  // Find the last heading that has crossed or reached topThreshold
  let current = headingList[0].slug
  for (let i = 0; i < headingList.length; i++) {
    const item = headingList[i]
    if (item.top <= topThreshold) {
      current = item.slug
    } else {
      break
    }
  }

  // Edge case: Activate the last heading only if at the absolute bottom 15px of document
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  if (scrollY + windowHeight >= documentHeight - 15) {
    const lastItem = headingList[headingList.length - 1]
    if (lastItem.top < windowHeight) {
      current = lastItem.slug
    }
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
  if (event.key === 'Escape') {
    mobilePanel.value = null
    isSiteNavOpen.value = false
  }
}

const onDocumentClick = (event: MouseEvent | TouchEvent) => {
  if (!mobilePanel.value && !isSiteNavOpen.value) return
  const target = event.target as Node | null
  if (!target) return

  const capsule = document.querySelector('.docs-mobile-capsule')
  const readerPopover = document.getElementById('docs-reader-popover')
  const sitePopover = document.getElementById('docs-site-popover')

  const isInsideCapsule = capsule?.contains(target)
  const isInsideReader = readerPopover?.contains(target)
  const isInsideSite = sitePopover?.contains(target)

  if (!isInsideCapsule && !isInsideReader && !isInsideSite) {
    mobilePanel.value = null
    isSiteNavOpen.value = false
  }
}

onMounted(() => {
  document.body.classList.add('has-docs-capsule')
  refreshOutline()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('pointerdown', onDocumentClick)
})

onBeforeUnmount(() => {
  document.body.classList.remove('has-docs-capsule')
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointerdown', onDocumentClick)
})

watch(() => route.path, () => {
  mobilePanel.value = null
  isSiteNavOpen.value = false
  refreshOutline()
})
</script>
