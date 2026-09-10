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

    <section class="courses-workspace" aria-labelledby="workspace-heading">
      <div class="courses-section-heading">
        <div>
          <span class="courses-workspace__eyebrow">Playable sample course</span>
          <h2 id="workspace-heading">Compiler design fundamentals</h2>
        </div>
        <span>{{ completedLessons }} / {{ compilerLessons.length }} complete</span>
      </div>

      <div class="courses-player">
        <div class="courses-player__video">
          <iframe
            :key="activeLesson.videoId"
            :src="`https://www.youtube-nocookie.com/embed/${activeLesson.videoId}`"
            :title="activeLesson.title"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          />
        </div>

        <div class="courses-player__details">
          <span class="courses-workspace__eyebrow">Now playing · {{ activeLesson.duration }}</span>
          <h3>{{ activeLesson.title }}</h3>
          <p>{{ activeLesson.description }}</p>
          <button
            type="button"
            :class="['courses-complete-button', { 'is-complete': isComplete(activeLesson.id) }]"
            @click="toggleComplete(activeLesson.id)"
          >
            {{ isComplete(activeLesson.id) ? '✓ Completed' : 'Mark as complete' }}
          </button>
        </div>
      </div>

      <div class="courses-lesson-list" aria-label="Compiler design lessons">
        <button
          v-for="(lesson, index) in compilerLessons"
          :key="lesson.id"
          type="button"
          :class="['courses-lesson', { 'is-active': lesson.id === activeLesson.id }]"
          @click="activeLessonIndex = index"
        >
          <span :class="['courses-lesson__number', { 'is-complete': isComplete(lesson.id) }]">
            {{ isComplete(lesson.id) ? '✓' : `0${index + 1}` }}
          </span>
          <span class="courses-lesson__copy"><strong>{{ lesson.title }}</strong><small>{{ lesson.duration }} · {{ lesson.source }}</small></span>
          <span class="courses-lesson__play" aria-hidden="true">▶</span>
        </button>
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

const compilerLessons = [
  { id: 'compiler-introduction', title: 'Introduction to compiler design', description: 'An accessible overview of what a compiler does and the major phases involved.', duration: '16 min', source: "Rayan's Classroom", videoId: 'WTo5GRwbPh8' },
  { id: 'lexical-analysis', title: 'Lexical analysis', description: 'A practical introduction to turning source characters into tokens for later compiler stages.', duration: '19 min', source: 'Udemy sample lecture', videoId: 'h-7vnYTMQOM' },
  { id: 'syntax-analysis', title: 'Lexical and syntax analysis', description: 'A second perspective on the lexer-parser handoff and the structures a parser builds.', duration: '24 min', source: 'GATE Crash Course', videoId: 'oq0lZwpApLo' },
]

const storageKey = 'bliss-courses:compiler-design-complete'
const activeLessonIndex = ref(0)
const completed = ref<string[]>([])
const activeLesson = computed(() => compilerLessons[activeLessonIndex.value])
const completedLessons = computed(() => completed.value.length)
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

<style scoped>
.courses-shell { width: min(100% - 3rem, 1152px); margin: 0 auto; padding: 80px 0 112px; }
.courses-hero { max-width: 800px; }
.courses-eyebrow, .course-card__meta { display: flex; align-items: center; gap: 8px; color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
.courses-eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 0 4px rgb(239 68 68 / 12%); }
.courses-hero h1 { margin: 20px 0; color: var(--bliss-fg); font-size: clamp(3.25rem, 7vw, 6.25rem); font-weight: 600; letter-spacing: -.065em; line-height: .94; }
.courses-hero h1 em { color: #a1a1aa; font-style: normal; }
.courses-hero p { max-width: 620px; margin: 0; color: var(--bliss-fg-muted); font-size: 18px; line-height: 1.75; }
.courses-featured { margin-top: 80px; }
.courses-section-heading { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 18px; }
.courses-section-heading h2 { margin: 0; color: var(--bliss-fg); font-size: 22px; letter-spacing: -.03em; }
.courses-section-heading > span { color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 11px; }
.courses-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.course-card { overflow: hidden; border: 1px solid var(--bliss-border); border-radius: 24px; background: white; box-shadow: var(--bliss-shadow-sm); transition: transform 180ms ease, box-shadow 180ms ease; }
.course-card:hover { transform: translateY(-4px); box-shadow: var(--bliss-shadow-md); }
.course-card__art { position: relative; display: flex; align-items: center; justify-content: center; height: 190px; overflow: hidden; color: var(--bliss-fg); }
.course-card__art::before, .course-card__art::after { position: absolute; border-radius: 999px; content: ''; filter: blur(2px); }
.course-card__art::before { width: 230px; height: 230px; transform: translate(-30%, -35%); opacity: .6; }
.course-card__art::after { width: 150px; height: 150px; transform: translate(55%, 42%); opacity: .55; }
.course-card__art--violet { background: #f3f0ff; }.course-card__art--violet::before { background: #c4b5fd; }.course-card__art--violet::after { background: #ddd6fe; }
.course-card__art--blue { background: #eff6ff; }.course-card__art--blue::before { background: #93c5fd; }.course-card__art--blue::after { background: #bfdbfe; }
.course-card__art--amber { background: #fffbeb; }.course-card__art--amber::before { background: #fcd34d; }.course-card__art--amber::after { background: #fde68a; }
.course-card__number, .course-card__art-label { position: absolute; z-index: 1; font-family: var(--bliss-font-mono); font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }.course-card__number { top: 18px; left: 20px; }.course-card__art-label { right: 20px; bottom: 18px; color: var(--bliss-fg-muted); font-size: 9px; }
.course-card__play { position: relative; z-index: 1; display: grid; width: 54px; height: 54px; place-items: center; padding-left: 3px; border: 1px solid rgb(255 255 255 / 75%); border-radius: 50%; background: rgb(255 255 255 / 65%); box-shadow: 0 8px 20px rgb(9 9 11 / 8%); font-size: 16px; backdrop-filter: blur(10px); }
.course-card__body { padding: 22px; }.course-card__meta { justify-content: space-between; font-size: 9px; }.course-card__meta span:last-child { color: var(--bliss-fg-muted); }.course-card h3 { margin: 16px 0 9px; color: var(--bliss-fg); font-size: 21px; letter-spacing: -.035em; line-height: 1.15; }.course-card p { min-height: 66px; margin: 0; color: var(--bliss-fg-muted); font-size: 14px; line-height: 1.6; }.course-card__footer { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--bliss-border-subtle); color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 10px; }.course-card__status { color: #b45309; }
.courses-workspace { margin-top: 96px; padding: 32px; border: 1px solid var(--bliss-border); border-radius: 28px; background: #fff; box-shadow: var(--bliss-shadow-sm); }.courses-workspace .courses-section-heading { margin-bottom: 24px; }.courses-workspace .courses-section-heading > span { align-self: center; padding: 6px 10px; border-radius: var(--bliss-radius-pill); background: #ecfdf5; color: #047857; }.courses-workspace__eyebrow { display: block; color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 10px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }.courses-workspace h2 { margin: 8px 0 0; color: var(--bliss-fg); font-size: 25px; letter-spacing: -.035em; }.courses-player { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(240px, .8fr); overflow: hidden; border-radius: 18px; background: #09090b; }.courses-player__video { position: relative; aspect-ratio: 16 / 9; background: #18181b; }.courses-player__video iframe { position: absolute; width: 100%; height: 100%; border: 0; }.courses-player__details { display: flex; flex-direction: column; justify-content: center; padding: 28px; color: white; }.courses-player__details h3 { margin: 14px 0 10px; font-size: 22px; letter-spacing: -.035em; line-height: 1.15; }.courses-player__details p { margin: 0; color: #a1a1aa; font-size: 14px; line-height: 1.65; }.courses-complete-button { align-self: flex-start; margin-top: 24px; padding: 9px 13px; border: 1px solid #3f3f46; border-radius: var(--bliss-radius-pill); background: transparent; color: #fafafa; font-size: 12px; font-weight: 600; cursor: pointer; }.courses-complete-button:hover { border-color: #a1a1aa; }.courses-complete-button.is-complete { border-color: #047857; background: #064e3b; color: #d1fae5; }.courses-lesson-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 16px; }.courses-lesson { display: flex; align-items: center; gap: 10px; padding: 12px; border: 1px solid transparent; border-radius: 12px; background: var(--bliss-bg-subtle); color: var(--bliss-fg); text-align: left; cursor: pointer; }.courses-lesson:hover, .courses-lesson.is-active { border-color: var(--bliss-border); background: #fff; }.courses-lesson__number { display: grid; width: 28px; height: 28px; flex: 0 0 auto; place-items: center; border: 1px solid var(--bliss-border); border-radius: 50%; color: var(--bliss-fg-muted); font-family: var(--bliss-font-mono); font-size: 9px; }.courses-lesson__number.is-complete { border-color: #86efac; background: #dcfce7; color: #15803d; }.courses-lesson__copy { min-width: 0; }.courses-lesson__copy strong, .courses-lesson__copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.courses-lesson__copy strong { font-size: 12px; }.courses-lesson__copy small { margin-top: 3px; color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 9px; }.courses-lesson__play { margin-left: auto; color: var(--bliss-fg-subtle); font-size: 10px; }
.courses-format { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px; margin-top: 96px; padding-top: 32px; border-top: 1px solid var(--bliss-border); }.courses-format__number { color: var(--bliss-fg-subtle); font-family: var(--bliss-font-mono); font-size: 11px; }.courses-format h2 { margin: 16px 0 8px; color: var(--bliss-fg); font-size: 18px; letter-spacing: -.025em; }.courses-format p { margin: 0; color: var(--bliss-fg-muted); font-size: 14px; line-height: 1.65; }
@media (max-width: 900px) { .courses-grid { grid-template-columns: 1fr; }.course-card { display: grid; grid-template-columns: 240px 1fr; }.course-card__art { height: auto; }.course-card p { min-height: auto; }.courses-player { grid-template-columns: 1fr; }.courses-lesson-list { grid-template-columns: 1fr; }.courses-format { gap: 24px; } }
@media (max-width: 640px) { .courses-shell { width: min(100% - 2rem, 1152px); padding-top: 52px; }.courses-grid, .courses-format { grid-template-columns: 1fr; }.course-card { display: block; }.course-card__art { height: 180px; }.courses-workspace { margin-inline: -1rem; padding: 20px; border-radius: 0; }.courses-workspace .courses-section-heading { align-items: flex-start; gap: 12px; flex-direction: column; }.courses-player__details { padding: 22px; }.courses-format { margin-top: 64px; }.courses-hero h1 { font-size: 3.35rem; } }
</style>
