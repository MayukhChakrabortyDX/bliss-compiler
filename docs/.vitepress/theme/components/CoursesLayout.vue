<template>
  <main class="courses-shell">
    <header class="courses-hero">
      <div class="courses-eyebrow"><span></span> Bliss learning library</div>
      <h1>Learn the ideas<br /><em>behind the language.</em></h1>
      <p>Focused video courses for people who want to follow Bliss from its first principles to its compiler implementation.</p>
    </header>

    <section class="courses-featured" aria-labelledby="featured-heading">
      <div class="courses-section-heading">
        <h2 id="featured-heading">Start here</h2>
        <span>3 learning paths</span>
      </div>

      <div class="courses-grid">
        <article v-for="course in courses" :key="course.title" class="course-card">
          <div :class="['course-card__art', `course-card__art--${course.art}`]">
            <span class="course-card__number">{{ course.number }}</span>
            <span class="course-card__play" aria-hidden="true">▶</span>
            <span class="course-card__art-label">{{ course.artLabel }}</span>
          </div>
          <div class="course-card__body">
            <div class="course-card__meta"><span>YouTube course</span><span>{{ course.level }}</span></div>
            <h3>{{ course.title }}</h3>
            <p>{{ course.description }}</p>
            <div class="course-card__footer">
              <span>{{ course.lessons }} lessons · {{ course.duration }}</span>
              <span class="course-card__status">Coming soon</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="courses-format" aria-label="Course format">
      <div><span class="courses-format__number">01</span><h2>Ideas first</h2><p>Start with the constraint, tradeoff, and design question—not an isolated syntax rule.</p></div>
      <div><span class="courses-format__number">02</span><h2>Build in public</h2><p>Follow language experiments and compiler changes as they become concrete.</p></div>
      <div><span class="courses-format__number">03</span><h2>Keep a reference nearby</h2><p>Every lesson is designed to pair naturally with the documentation.</p></div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const courses = [
  { number: '01', art: 'violet', artLabel: 'First principles', level: 'Beginner', title: 'Rethinking systems programming', description: 'A guided introduction to the questions that led to Bliss.', lessons: 6, duration: '48 min' },
  { number: '02', art: 'blue', artLabel: 'Language design', level: 'Intermediate', title: 'Inside the Bliss language', description: 'Syntax, types, ownership, and the shape of a safer systems language.', lessons: 9, duration: '1 hr 22 min' },
  { number: '03', art: 'amber', artLabel: 'Compiler notes', level: 'Intermediate', title: 'Building the compiler', description: 'Follow source text through parsing, semantic analysis, and the road ahead.', lessons: 8, duration: '1 hr 8 min' },
]

const storageKey = 'bliss-courses:compiler-design-complete'
const activeLessonIndex = ref(0)
const completed = ref<string[]>([])
const isComplete = (lessonId: string) => completed.value.includes(lessonId)

const saveProgress = () => {
  localStorage.setItem(storageKey, JSON.stringify(completed.value))
}

const toggleComplete = (lessonId: string) => {
  completed.value = isComplete(lessonId)
    ? completed.value.filter((id) => id !== lessonId)
    : [...completed.value, lessonId]
  saveProgress()
}

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    if (Array.isArray(saved)) completed.value = saved.filter((id): id is string => typeof id === 'string')
  } catch {
    completed.value = []
  }
})

</script>

