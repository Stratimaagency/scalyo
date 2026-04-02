<template>
  <div class="okr-tracker">
    <!-- Hero -->
    <div class="hero">
      <h1 class="hero-title">🎯 OKR Tracker — Objectifs & Resultats cles</h1>
      <p class="hero-sub">Mesurez la progression de vos objectifs strategiques</p>
    </div>

    <!-- Global score -->
    <div class="global-score-card">
      <div class="global-score-inner">
        <span class="global-label">SCORE GLOBAL OKR</span>
        <span class="global-number">{{ globalScore }}%</span>
        <div class="global-bar-track">
          <div class="global-bar-fill" :style="{ width: globalScore + '%' }" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="okrs.length === 0" class="empty-state">
      <div class="empty-icon">🎯</div>
      <p class="empty-title">Aucun OKR defini</p>
      <p class="empty-sub">Creez vos premiers objectifs pour suivre votre progression.</p>
    </div>

    <!-- OKR cards -->
    <div v-else class="okr-list">
      <div v-for="okr in okrs" :key="okr.id || okr.objective" class="okr-card">
        <div class="okr-header">
          <div>
            <h3 class="okr-title">{{ okr.objective || 'Objectif' }}</h3>
            <span class="okr-owner">{{ okr.owner || 'Non assigne' }}</span>
          </div>
          <span class="okr-score" :style="{ color: scoreColor(okrProgress(okr)) }">
            {{ okrProgress(okr) }}%
          </span>
        </div>

        <div class="kr-list">
          <div v-for="(kr, i) in (okr.keyResults || [])" :key="i" class="kr-item">
            <div class="kr-top">
              <span class="kr-name">{{ kr.name || kr.label || `KR ${i + 1}` }}</span>
              <div class="kr-values">
                <template v-if="editingKR === `${okr.id}-${i}`">
                  <input
                    v-model.number="editValue"
                    type="number"
                    class="kr-input"
                    @keyup.enter="saveKR(okr, i)"
                    @blur="editingKR = null"
                  />
                  <span class="kr-target">/ {{ kr.target || 100 }}</span>
                </template>
                <template v-else>
                  <span class="kr-current" :style="{ color: scoreColor(krProgress(kr)) }">{{ kr.current || 0 }}</span>
                  <span class="kr-target">/ {{ kr.target || 100 }}</span>
                  <button class="kr-edit-btn" @click="startEdit(okr, i, kr)">✏️</button>
                </template>
              </div>
            </div>
            <div class="kr-bar-track">
              <div
                class="kr-bar-fill"
                :style="{ width: krProgress(kr) + '%', background: scoreColor(krProgress(kr)) }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTasksStore } from '../../stores/tasks'

const tasksStore = useTasksStore()

const okrs = computed(() => tasksStore.okrs)
const globalScore = computed(() => tasksStore.globalOKRScore)

const editingKR = ref(null)
const editValue = ref(0)

function krProgress(kr) {
  const target = kr.target || 1
  const current = kr.current || 0
  const progress = kr.inverse
    ? Math.min(100, Math.round((target / Math.max(current, 0.01)) * 100))
    : Math.min(100, Math.round((current / target) * 100))
  return progress
}

function okrProgress(okr) {
  const krs = okr.keyResults || []
  if (!krs.length) return 0
  return Math.round(krs.reduce((sum, kr) => sum + krProgress(kr), 0) / krs.length)
}

function scoreColor(pct) {
  if (pct >= 70) return 'var(--sm-ok)'
  if (pct >= 40) return 'var(--sm-warn)'
  return 'var(--sm-err)'
}

function startEdit(okr, i, kr) {
  editingKR.value = `${okr.id}-${i}`
  editValue.value = kr.current || 0
}

function saveKR(okr, i) {
  const kr = (okr.keyResults || [])[i]
  if (kr) kr.current = editValue.value
  editingKR.value = null
}
</script>

<style scoped>
.okr-tracker {
  max-width: 1200px;
  padding: 24px 28px;
  font-family: 'DM Sans', sans-serif;
}

.hero {
  background: var(--sm-grad);
  color: #fff;
  border-radius: 20px;
  padding: 28px 32px;
  margin-bottom: 24px;
}
.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px;
}
.hero-sub {
  font-size: 14px;
  opacity: 0.85;
  margin: 0;
}

.global-score-card {
  background: #fff;
  border: 1px solid var(--sm-bd);
  border-radius: 16px;
  box-shadow: var(--sm-sh);
  padding: 28px 32px;
  margin-bottom: 24px;
  text-align: center;
}
.global-score-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.global-label {
  font-size: 12px;
  color: var(--sm-t3);
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.global-number {
  font-family: 'Cormorant Garamond', serif;
  font-size: 56px;
  font-weight: 700;
  background: var(--sm-grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.global-bar-track {
  width: 100%;
  max-width: 400px;
  height: 8px;
  background: var(--sm-bd);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
}
.global-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--sm-grad-h);
  transition: width 0.4s ease;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--sm-t1);
  margin: 0 0 6px;
}
.empty-sub { font-size: 13px; color: var(--sm-t3); margin: 0; }

.okr-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.okr-card {
  background: #fff;
  border: 1px solid var(--sm-bd);
  border-radius: 16px;
  box-shadow: var(--sm-sh);
  padding: 22px 24px;
}

.okr-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}
.okr-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--sm-t1);
  margin: 0 0 4px;
}
.okr-owner {
  font-size: 12px;
  color: var(--sm-t3);
  font-weight: 500;
}
.okr-score {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.kr-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.kr-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.kr-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.kr-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--sm-t2);
}
.kr-values {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
.kr-current {
  font-weight: 700;
}
.kr-target {
  color: var(--sm-t3);
  font-weight: 500;
}
.kr-edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  opacity: 0.5;
  transition: opacity 0.2s;
}
.kr-edit-btn:hover {
  opacity: 1;
}
.kr-input {
  width: 60px;
  padding: 3px 6px;
  border: 1px solid var(--sm-bd);
  border-radius: 6px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  text-align: center;
  outline: none;
}
.kr-input:focus {
  border-color: var(--sm-parme);
}

.kr-bar-track {
  height: 8px;
  background: var(--sm-bd);
  border-radius: 4px;
  overflow: hidden;
}
.kr-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}
</style>
