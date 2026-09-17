<template>
  <Teleport to="body">
    <div
      v-if="isScrollable"
      :class="['bliss-scrollbar', { 'is-visible': isVisible || isDragging }]"
      aria-hidden="true"
      @pointerdown="onTrackPointerDown"
    >
      <div class="bliss-scrollbar__track">
        <div
          ref="thumbRef"
          :class="['bliss-scrollbar__thumb', { 'is-dragging': isDragging }]"
          :style="{
            height: `${thumbHeight}px`,
            transform: `translateY(${thumbTop}px)`,
          }"
          @pointerdown.stop="onThumbPointerDown"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const thumbRef = ref<HTMLElement | null>(null)

const isScrollable = ref(false)
const isVisible = ref(false)
const isDragging = ref(false)
const thumbHeight = ref(40)
const thumbTop = ref(0)

let hideTimer: ReturnType<typeof setTimeout> | null = null
let dragStartY = 0
let dragStartScrollY = 0

const scheduleHide = (delay = 1100) => {
  if (isDragging.value) return
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (!isDragging.value) {
      isVisible.value = false
    }
  }, delay)
}

const showBriefly = (delay = 1100) => {
  isVisible.value = true
  scheduleHide(delay)
}

const updateGeometry = () => {
  if (typeof window === 'undefined') return
  const windowHeight = window.innerHeight
  const docHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  )
  const maxScroll = docHeight - windowHeight

  if (maxScroll <= 5) {
    isScrollable.value = false
    isVisible.value = false
    return
  }

  isScrollable.value = true

  // Proportional height with minimum and maximum bounds
  const minHeight = 36
  const maxHeight = windowHeight - 40
  const calculatedHeight = Math.max(
    minHeight,
    Math.min(maxHeight, (windowHeight / docHeight) * windowHeight),
  )
  thumbHeight.value = calculatedHeight

  // Proportional top offset
  const availableTrackHeight = windowHeight - calculatedHeight
  const scrollY = Math.max(0, Math.min(window.scrollY, maxScroll))
  thumbTop.value = (scrollY / maxScroll) * availableTrackHeight
}

const onScroll = () => {
  updateGeometry()
  showBriefly()
}

const onMouseMove = (event: MouseEvent) => {
  if (typeof window === 'undefined') return
  // Show scrollbar if mouse is near the right edge (within 72px)
  if (window.innerWidth - event.clientX <= 72) {
    showBriefly(1400)
  }
}

const onThumbPointerDown = (event: PointerEvent) => {
  event.preventDefault()
  isDragging.value = true
  isVisible.value = true
  dragStartY = event.clientY
  dragStartScrollY = window.scrollY

  const thumb = thumbRef.value
  if (thumb) {
    thumb.setPointerCapture(event.pointerId)
  }

  window.addEventListener('pointermove', onThumbPointerMove)
  window.addEventListener('pointerup', onThumbPointerUp)
  window.addEventListener('pointercancel', onThumbPointerUp)
}

const onThumbPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return
  event.preventDefault()

  const windowHeight = window.innerHeight
  const docHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  )
  const maxScroll = docHeight - windowHeight
  const availableTrackHeight = windowHeight - thumbHeight.value

  if (availableTrackHeight <= 0) return

  const deltaY = event.clientY - dragStartY
  const scrollRatio = maxScroll / availableTrackHeight
  const targetScrollY = Math.max(0, Math.min(maxScroll, dragStartScrollY + deltaY * scrollRatio))

  window.scrollTo({
    top: targetScrollY,
    behavior: 'instant',
  })
}

const onThumbPointerUp = (event: PointerEvent) => {
  isDragging.value = false
  const thumb = thumbRef.value
  if (thumb && thumb.hasPointerCapture(event.pointerId)) {
    thumb.releasePointerCapture(event.pointerId)
  }

  window.removeEventListener('pointermove', onThumbPointerMove)
  window.removeEventListener('pointerup', onThumbPointerUp)
  window.removeEventListener('pointercancel', onThumbPointerUp)

  scheduleHide(1000)
}

const onTrackPointerDown = (event: PointerEvent) => {
  // If clicked directly on the track background, jump scroll towards target
  if (event.target === thumbRef.value) return
  event.preventDefault()

  const windowHeight = window.innerHeight
  const docHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight,
  )
  const maxScroll = docHeight - windowHeight
  const clickY = event.clientY
  const targetRatio = clickY / windowHeight
  const targetScrollY = Math.max(0, Math.min(maxScroll, targetRatio * maxScroll))

  window.scrollTo({
    top: targetScrollY,
    behavior: 'smooth',
  })
  showBriefly()
}

onMounted(() => {
  updateGeometry()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', updateGeometry)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateGeometry)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('pointermove', onThumbPointerMove)
  window.removeEventListener('pointerup', onThumbPointerUp)
  window.removeEventListener('pointercancel', onThumbPointerUp)
  if (hideTimer) clearTimeout(hideTimer)
})

watch(() => route.path, async () => {
  await nextTick()
  updateGeometry()
  // Briefly show on route transition to reassure user of new page length
  showBriefly(800)
})
</script>
