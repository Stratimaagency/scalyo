<template>
  <div class="mod-page fade-in">
    <div class="mod-hero">
      <div>
        <h1 class="mod-title">🎯 OKR Tracker</h1>
        <p class="mod-subtitle">Objectifs et résultats clés de l'équipe</p>
      </div>
      <div class="mod-hero-score">
        <div class="mod-big-num" :style="{ color: okrColor(tasksStore.globalOKRScore) }">{{ tasksStore.globalOKRScore }}%</div>
        <div class="mod-big-label">Score global</div>
      </div>
    </div>

    <div class="mod-card" v-if="!tasksStore.okrs.length">
      <div class="mod-empty">
        <p style="font-size: 40px; margin-bottom: 12px;">🎯</p>
        <p style="font-weight: 700; margin-bottom: 8px;">Aucun OKR défini</p>
        <p style="color: #5F6368">Créez vos objectifs pour suivre la performance de l'équipe.</p>
      </div>
    </div>

    <div v-else class="okr-grid">
      <div v-for="okr in tasksStore.okrs" :key="okr.id" class="mod-card okr-card">
        <div class="okr-obj-header">
          <span class="okr-emoji">{{ okr.emoji || '🎯' }}</span>
          <div>
            <h4 class="okr-obj-title">{{ okr.objective }}</h4>
            <p class="okr-obj-owner">{{ okr.owner || '' }}</p>
          </div>
          <div class="okr-obj-score" :style="{ color: okrColor(okrScore(okr)) }">{{ okrScore(okr) }}%</div>
        </div>

        <div v-for="kr in okr.keyResults" :key="kr.id" class="okr-kr">
          <div class="okr-kr-header">
            <span class="okr-kr-title">{{ kr.title }}</span>
            <span class="okr-kr-nums">{{ kr.current }}/{{ kr.target }} {{ kr.unit || '' }}</span>
          </div>
          <div class="mod-progress-bar">
            <div class="mod-progress-fill" :style="{ width: krPct(kr) + '%', background: okrGrad(krPct(kr)) }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTasksStore } from '../../stores/tasks'

const tasksStore = useTasksStore()

function krPct(kr) { return kr.target ? Math.min(Math.round((kr.current / kr.target) * 100), 100) : 0 }
function okrScore(okr) {
  if (!okr.keyResults?.length) return 0
  return Math.round(okr.keyResults.reduce((a, kr) => a + krPct(kr), 0) / okr.keyResults.length)
}
function okrColor(pct) { return pct >= 70 ? '#34A853' : pct >= 40 ? '#FBBC05' : '#EA4335' }
function okrGrad(pct) { return pct >= 70 ? 'linear-gradient(90deg, #34A853, #4CAF50)' : pct >= 40 ? 'linear-gradient(90deg, #FBBC05, #FF9800)' : 'linear-gradient(90deg, #EA4335, #F44336)' }

onMounted(() => {
  if (!tasksStore.okrs.length) tasksStore.fetchAll()
})
</script>

<style scoped>
.okr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; }
.okr-card { padding: 24px; }
.okr-obj-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.okr-emoji { font-size: 28px; }
.okr-obj-title { font-size: 16px; font-weight: 800; color: #202124; }
.okr-obj-owner { font-size: 12px; color: #5F6368; }
.okr-obj-score { margin-left: auto; font-size: 24px; font-weight: 900; }
.okr-kr { margin-bottom: 14px; }
.okr-kr-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.okr-kr-title { font-size: 13px; font-weight: 600; color: #202124; }
.okr-kr-nums { font-size: 12px; font-weight: 700; color: #5F6368; }
</style>
