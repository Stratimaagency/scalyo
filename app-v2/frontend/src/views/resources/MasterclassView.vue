<template>
  <div class="mc-view">
    <div class="mc-header">
      <h1>🎓 {{ t('nav.masterclass') }}</h1>
      <p>{{ t('nav.masterclassSub') }}</p>
    </div>

    <div class="mc-list">
      <div v-for="mc in store.masterclasses" :key="mc.id"
           class="mc-card" :class="{ 'is-new': mc.isNew }">

        <!-- Card header -->
        <div class="mcc-top">
          <div class="mcc-left">
            <div class="mcc-badges">
              <span v-if="mc.isNew" class="badge-new">🎓 NOUVEAU · {{ mc.quarter }}</span>
              <span v-else class="badge-quarter">{{ mc.quarter }}</span>
            </div>
            <h2>{{ mc.title }}</h2>
            <div class="mcc-meta">
              <span>{{ mc.modules?.length || 0 }} modules</span>
              <span>·</span>
              <span>{{ totalLessons(mc) }} leçons</span>
              <span>·</span>
              <span>{{ mc.totalHours }}</span>
            </div>
          </div>
          <div class="mcc-right">
            <div class="mcc-progress-ring">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                <circle cx="20" cy="20" r="16" fill="none"
                  :stroke="mc.isNew ? '#7c3aed' : '#10b981'"
                  stroke-width="3"
                  stroke-dasharray="100.5"
                  :stroke-dashoffset="100.5 - (mcProgress(mc) / 100 * 100.5)"
                  transform="rotate(-90 20 20)" />
              </svg>
              <span>{{ mcProgress(mc) }}%</span>
            </div>
            <button class="btn-start" :class="{ 'btn-continue': mcProgress(mc) > 0 }"
                    @click="openMc === mc.id ? openMc = null : openMc = mc.id">
              {{ mcProgress(mc) === 0 ? t('res_start') :
                 mcProgress(mc) === 100 ? t('res_completed') : t('res_continue') }}
            </button>
          </div>
        </div>

        <!-- Modules list (expanded) -->
        <div v-if="openMc === mc.id" class="mcc-modules">
          <div v-for="(mod, mi) in mc.modules" :key="mod.id" class="mc-mod">

            <!-- Module header -->
            <div class="mcm-header"
                 @click="openMod === mod.id ? openMod = null : openMod = mod.id">
              <div class="mcm-left">
                <div class="mcm-num" :class="{ done: isModDone(mod) }">
                  {{ isModDone(mod) ? '✓' : mi + 1 }}
                </div>
                <div>
                  <strong>{{ mod.title }}</strong>
                  <span class="mcm-meta">
                    {{ mod.lessonDetails?.length || mod.lessons || 0 }} leçons
                    · {{ mod.exercises || 0 }} exercices
                    · {{ mod.duration }}
                  </span>
                </div>
              </div>
              <span class="mcm-chev">{{ openMod === mod.id ? '▾' : '▸' }}</span>
            </div>

            <!-- Lessons list -->
            <div v-if="openMod === mod.id" class="mcm-lessons">

              <!-- Lessons -->
              <div v-for="(lesson, li) in (mod.lessonDetails || [])" :key="mod.id + '_' + li"
                   class="mcl-item"
                   @click="openLesson === lessonKey(mod, li) ? openLesson = null : openLesson = lessonKey(mod, li)">
                <div class="mcl-left">
                  <span class="mcl-icon" :class="{ done: completedLessons.includes(lessonKey(mod, li)) }">
                    {{ completedLessons.includes(lessonKey(mod, li)) ? '✅' : '📖' }}
                  </span>
                  <div>
                    <span class="mcl-title">{{ lesson.title }}</span>
                    <span class="mcl-dur">{{ lesson.duration }}</span>
                  </div>
                </div>
                <span class="mcl-chev">{{ openLesson === lessonKey(mod, li) ? '▾' : '▸' }}</span>
              </div>

              <!-- Lesson content expanded -->
              <div v-if="openLesson && openLesson.startsWith(mod.id + '_')"
                   class="mcl-content">
                <p>{{ getOpenLessonSummary(mod) }}</p>
                <button class="btn-done"
                        @click="markDone(openLesson)">
                  {{ completedLessons.includes(openLesson) ? '✅ ' + t('res_completed') : t('res_mark_done') }}
                </button>
              </div>

              <!-- Exercises -->
              <div v-for="ei in mod.exercises" :key="'ex_' + mod.id + '_' + ei" class="mcl-item exercise">
                <div class="mcl-left">
                  <span class="mcl-icon">📝</span>
                  <div>
                    <span class="mcl-title">Exercice {{ ei }}</span>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="!mod.lessonDetails?.length" class="mcl-empty">
                {{ t('res_lesson_coming') }}
              </div>

            </div>
          </div>
        </div>

        <!-- Certificate button if 100% -->
        <div v-if="mcProgress(mc) === 100" class="mcc-cert">
          <button class="btn-cert">🎓 {{ t('res_download_cert') }}</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResourceStore } from '@/stores/resources'

const { t } = useI18n({ useScope: 'global' })
const store = useResourceStore()

const openMc = ref(null)
const openMod = ref(null)
const openLesson = ref(null)
const completedLessons = ref([])

function lessonKey(mod, idx) { return mod.id + '_' + idx }

function totalLessons(mc) {
  return (mc.modules || []).reduce((s, m) => s + (m.lessonDetails?.length || m.lessons || 0), 0)
}

function isModDone(mod) {
  if (!mod.lessonDetails?.length) return false
  return mod.lessonDetails.every((_, i) => completedLessons.value.includes(lessonKey(mod, i)))
}

function mcProgress(mc) {
  const total = totalLessons(mc)
  if (!total) return 0
  const done = (mc.modules || []).reduce((s, m) =>
    s + (m.lessonDetails || []).filter((_, i) => completedLessons.value.includes(lessonKey(m, i))).length, 0)
  return Math.round(done / total * 100)
}

function getOpenLessonSummary(mod) {
  if (!openLesson.value) return ''
  const idx = parseInt(openLesson.value.split('_').pop())
  return mod.lessonDetails?.[idx]?.summary || t('res_lesson_coming')
}

function markDone(key) {
  const idx = completedLessons.value.indexOf(key)
  if (idx >= 0) completedLessons.value.splice(idx, 1)
  else completedLessons.value.push(key)
}
</script>

<style scoped>
.mc-view { max-width: 800px; }
.mc-header { margin-bottom: 28px; }
.mc-header h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
.mc-header p { font-size: 0.85rem; color: var(--text-secondary); }
.mc-list { display: flex; flex-direction: column; gap: 16px; }

.mc-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; transition: box-shadow 0.2s; }
.mc-card:hover { box-shadow: var(--shadow-sm); }
.mc-card.is-new { border-color: var(--purple-border); }

.mcc-top { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; gap: 20px; }
.mcc-left { flex: 1; }
.mcc-badges { margin-bottom: 8px; }
.badge-new { font-size: 0.65rem; font-weight: 700; background: var(--purple); color: #fff; padding: 3px 10px; border-radius: 4px; }
.badge-quarter { font-size: 0.72rem; color: var(--text-muted); }
.mcc-left h2 { font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; }
.mcc-meta { display: flex; gap: 6px; font-size: 0.72rem; color: var(--text-muted); }

.mcc-right { display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0; }
.mcc-progress-ring { position: relative; width: 48px; height: 48px; }
.mcc-progress-ring svg { width: 100%; height: 100%; }
.mcc-progress-ring span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: var(--text); }

.btn-start { background: var(--purple); color: #fff; border: none; padding: 8px 18px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.btn-start:hover { background: var(--purple-dark); }
.btn-continue { background: var(--green); }
.btn-continue:hover { background: var(--green-dark); }

.mcc-modules { border-top: 1px solid var(--border-light); }

.mc-mod { border-bottom: 1px solid var(--border-light); }
.mc-mod:last-child { border-bottom: none; }

.mcm-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; cursor: pointer; transition: background 0.15s; }
.mcm-header:hover { background: var(--bg-hover); }
.mcm-left { display: flex; align-items: center; gap: 14px; }
.mcm-num { width: 28px; height: 28px; border-radius: 50%; background: var(--purple-bg); color: var(--purple); font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mcm-num.done { background: var(--green-bg); color: var(--green); }
.mcm-left strong { font-size: 0.88rem; display: block; margin-bottom: 2px; }
.mcm-meta { font-size: 0.72rem; color: var(--text-muted); }
.mcm-chev { font-size: 0.8rem; color: var(--text-muted); }

.mcm-lessons { background: var(--bg); padding: 8px 24px 12px; }

.mcl-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.12s; }
.mcl-item:hover { background: #fff; }
.mcl-item.exercise { cursor: default; opacity: 0.8; }
.mcl-left { display: flex; align-items: center; gap: 10px; }
.mcl-icon { font-size: 1rem; }
.mcl-icon.done { filter: none; }
.mcl-title { font-size: 0.82rem; font-weight: 500; display: block; }
.mcl-dur { font-size: 0.68rem; color: var(--text-muted); }
.mcl-chev { font-size: 0.75rem; color: var(--text-muted); }

.mcl-content { background: #fff; border-radius: 8px; padding: 16px; margin: 4px 0 8px; font-size: 0.82rem; line-height: 1.6; color: var(--text-secondary); }
.btn-done { margin-top: 10px; background: var(--green); color: #fff; border: none; padding: 6px 16px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }

.mcl-empty { padding: 16px 12px; font-size: 0.82rem; color: var(--text-muted); text-align: center; }

.mcc-cert { padding: 16px 24px; border-top: 1px solid var(--border-light); text-align: center; }
.btn-cert { background: linear-gradient(135deg, var(--purple), #7c3aed); color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
</style>
