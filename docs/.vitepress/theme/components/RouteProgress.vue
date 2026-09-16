<template>
  <div
    class="route-progress"
    :class="{ 'is-visible': isVisible }"
    :style="{ width: `${progress}%` }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isVisible = ref(false)
const progress = ref(0)
let progressTimer: number | undefined
let finishTimer: number | undefined
let hideTimer: number | undefined
let startedAt = 0

const clearTimers = () => {
  if (progressTimer !== undefined) window.clearInterval(progressTimer)
  if (finishTimer !== undefined) window.clearTimeout(finishTimer)
  if (hideTimer !== undefined) window.clearTimeout(hideTimer)
  progressTimer = undefined
  finishTimer = undefined
  hideTimer = undefined
}

const start = () => {
  clearTimers()
  isVisible.value = true
  progress.value = 12
  startedAt = performance.now()
  progressTimer = window.setInterval(() => {
    progress.value = Math.min(progress.value + (84 - progress.value) * 0.08, 84)
  }, 120)
}

const finish = () => {
  if (!isVisible.value) return
  if (progressTimer !== undefined) window.clearInterval(progressTimer)
  progressTimer = undefined
  const remainingTime = Math.max(0, 320 - (performance.now() - startedAt))
  finishTimer = window.setTimeout(() => {
    progress.value = 100
    finishTimer = undefined
    hideTimer = window.setTimeout(() => {
      isVisible.value = false
      progress.value = 0
      hideTimer = undefined
    }, 220)
  }, remainingTime)
}

const isInternalNavigation = (event: MouseEvent) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false

  const target = event.target instanceof Element ? event.target.closest('a') : null
  if (!target || target.target === '_blank' || target.hasAttribute('download')) return false

  const url = new URL(target.href, window.location.href)
  return url.origin === window.location.origin && url.pathname !== window.location.pathname
}

const handleClick = (event: MouseEvent) => {
  if (isInternalNavigation(event)) start()
}

onMounted(() => {
  document.addEventListener('pointerdown', handleClick, true)
  document.addEventListener('click', handleClick, true)
})

watch(() => route.path, finish)

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleClick, true)
  document.removeEventListener('click', handleClick, true)
  clearTimers()
})
</script>

<style scoped>
.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  height: 3px;
  pointer-events: none;
  background: var(--bliss-violet);
  box-shadow: 0 0 10px rgb(139 92 246 / 42%);
  opacity: 0;
  transition: width 180ms ease, opacity 120ms ease;
}

.route-progress.is-visible {
  opacity: 1;
}
</style>