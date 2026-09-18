<template>
  <main class="courses-shell">
    <BlissPageHeader
      eyebrow="Bliss / Courses"
      title="Learn the ideas behind the language."
      description="Focused video courses for people who want to follow Bliss from its first principles to its compiler implementation."
      variant="emerald"
      pill
    />

    <section class="courses-featured" aria-labelledby="featured-heading">
      <div class="courses-section-heading">
        <h2 id="featured-heading">Start here</h2>
        <span>3 learning paths</span>
      </div>

      <div class="courses-grid">
        <BlissCard v-for="course in courses" :key="course.title" card-class="course-card">
          <template #art>
            <div :class="['course-card__art', `course-card__art--${course.art}`]">
              <span class="course-card__number">{{ course.number }}</span>
              <span class="course-card__play" aria-hidden="true">▶</span>
              <span class="course-card__art-label">{{ course.artLabel }}</span>
            </div>
          </template>

          <template #meta>
            <div class="course-card__meta">
              <span>YouTube course</span>
              <span>{{ course.level }}</span>
            </div>
          </template>

          <template #title>
            <h3>{{ course.title }}</h3>
          </template>

          <template #description>
            <p>{{ course.description }}</p>
          </template>

          <template #footer>
            <div class="course-card__footer">
              <span>{{ course.lessons }} lessons · {{ course.duration }}</span>
              <span class="course-card__status">Coming soon</span>
            </div>
          </template>
        </BlissCard>
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
import { onMounted, ref } from 'vue'
import BlissPageHeader from './primitives/BlissPageHeader.vue'
import BlissCard from './primitives/BlissCard.vue'

const courses = [
  { number: '01', art: 'violet', artLabel: 'First principles', level: 'Beginner', title: 'Rethinking systems programming', description: 'A guided introduction to the questions that led to Bliss.', lessons: 6, duration: '48 min' },
  { number: '02', art: 'blue', artLabel: 'Language design', level: 'Intermediate', title: 'Inside the Bliss language', description: 'Syntax, types, ownership, and the shape of a safer systems language.', lessons: 9, duration: '1 hr 22 min' },
  { number: '03', art: 'amber', artLabel: 'Compiler notes', level: 'Intermediate', title: 'Building the compiler', description: 'Follow source text through parsing, semantic analysis, and the road ahead.', lessons: 8, duration: '1 hr 8 min' },
]

const storageKey = 'bliss-courses:compiler-design-complete'
const completed = ref<string[]>([])
const isComplete = (lessonId: string) => completed.value.includes(lessonId)

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    if (Array.isArray(saved)) completed.value = saved.filter((id): id is string => typeof id === 'string')
  } catch {
    completed.value = []
  }
})
</script>
