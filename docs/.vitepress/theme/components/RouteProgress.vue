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
import { useRoute, useRouter } from 'vitepress'

const route = useRoute()
const router = useRouter()

const isVisible = ref(false)
const progress = ref(0)
let progressTimer: number | undefined
let finishTimer: number | undefined
let hideTimer: number | undefined
let maxTimer: number | undefined
let startedAt = 0

const clearTimers = () => {
  if (progressTimer !== undefined) window.clearInterval(progressTimer)
  if (finishTimer !== undefined) window.clearTimeout(finishTimer)
  if (hideTimer !== undefined) window.clearTimeout(hideTimer)
  if (maxTimer !== undefined) window.clearTimeout(maxTimer)
  progressTimer = undefined
  finishTimer = undefined
  hideTimer = undefined
  maxTimer = undefined
}

const start = () => {
  clearTimers()
  isVisible.value = true
  progress.value = 12
  startedAt = performance.now()
  progressTimer = window.setInterval(() => {
    progress.value = Math.min(progress.value + (84 - progress.value) * 0.08, 84)
  }, 120)
  // Safety timeout to auto-finish if navigation stalls or is cancelled
  maxTimer = window.setTimeout(() => {
    finish()
  }, 8000)
}

const finish = () => {
  if (!isVisible.value) return
  if (progressTimer !== undefined) window.clearInterval(progressTimer)
  if (maxTimer !== undefined) window.clearTimeout(maxTimer)
  progressTimer = undefined
  maxTimer = undefined
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

let origOnBefore: typeof router.onBeforeRouteChange
let origOnAfter: typeof router.onAfterRouteChange

onMounted(() => {
  origOnBefore = router.onBeforeRouteChange
  origOnAfter = router.onAfterRouteChange

  router.onBeforeRouteChange = async (to) => {
    if (origOnBefore) {
      const res = await origOnBefore(to)
      if (res === false) return false
    }
    const currentPath = router.route.path.split('#')[0].split('?')[0]
    const targetPath = to.split('#')[0].split('?')[0]
    if (targetPath !== currentPath) {
      start()
    }
  }

  router.onAfterRouteChange = async (to) => {
    if (origOnAfter) {
      await origOnAfter(to)
    }
    finish()
  }
})

watch(() => route.path, () => {
  finish()
})

onBeforeUnmount(() => {
  if (router) {
    router.onBeforeRouteChange = origOnBefore
    router.onAfterRouteChange = origOnAfter
  }
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