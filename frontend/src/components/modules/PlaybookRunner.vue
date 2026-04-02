<template>
  <div class="playbook-runner">
    <!-- Hero -->
    <div class="hero">
      <h1 class="hero-title">🔄 Playbooks — Actions automatisees et guidees</h1>
      <p class="hero-sub">Executez des playbooks pour accompagner vos clients</p>
    </div>

    <!-- Filter pills -->
    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-pill"
        :class="{ active: activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
        <span class="filter-count">{{ f.count }}</span>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="filteredPlaybooks.length === 0" class="empty-state">
      <div class="empty-icon">🔄</div>
      <p class="empty-title">Aucun playbook</p>
      <p class="empty-sub">Les playbooks apparaitront ici une fois crees.</p>
    </div>

    <!-- Playbook cards -->
    <div v-else class="playbook-list">
      <div v-for="pb in filteredPlaybooks" :key="pb.id || pb.name" class="playbook-card">
        <div class="pb-header">
          <div>
            <h3 class="pb-name">{{ pb.name || 'Playbook' }}</h3>
            <span class="pb-type-badge" :class="typeBadgeClass(pb.type)">
              {{ typeBadgeLabel(pb.type) }}
            </span>
          </div>
          <span class="pb-progress-num" :style="{ color: progressColor(pbProgress(pb)) }">
            {{ pbProgress(pb) }}%
          </span>
        </div>

        <!-- Progress bar -->
        <div class="pb-bar-track">
          <div
            class="pb-bar-fill"
            :style="{ width: pbProgress(pb) + '%' }"
          />
        </div>

        <!-- Clients attached -->
        <div v-if="(pb.clients || []).length > 0" class="pb-clients">
          <span class="meta-label">CLIENTS</span>
          <div class="client-pills">
            <span v-for="c in (pb.clients || [])" :key="c.id || c" class="client-pill">
              {{ typeof c === 'string' ? c : c.name }}
            </span>
          </div>
        </div>

        <!-- Steps checklist -->
        <div class="pb-steps">
          <span class="meta-label">ETAPES</span>
          <div class="steps-list">
            <label
              v-for="(step, i) in (pb.steps || [])"
              :key="i"
              class="step-item"
              :class="{ done: isStepDone(pb, i) }"
            >
              <input
                type="checkbox"
                :checked="isStepDone(pb, i)"
                class="step-checkbox"
                @change="toggleStep(pb, i)"
              />
              <span class="step-text">
                <span v-if="step.automated" class="auto-badge">⚡</span>
                {{ step.name || step.label || step }}
              </span>
            </label>
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

const activeFilter = ref('all')

const playbooks = computed(() => tasksStore.playbooks)

const filters = computed(() => {
  const all = playbooks.value
  return [
    { key: 'all', label: 'Tous', count: all.length },
    { key: 'churn', label: 'Anti-churn', count: all.filter(p => p.type === 'churn' || p.type === 'anti-churn').length },
    { key: 'onboarding', label: 'Onboarding', count: all.filter(p => p.type === 'onboarding').length },
    { key: 'expansion', label: 'Expansion', count: all.filter(p => p.type === 'expansion').length },
  ]
})

const filteredPlaybooks = computed(() => {
  if (activeFilter.value === 'all') return playbooks.value
  if (activeFilter.value === 'churn') return playbooks.value.filter(p => p.type === 'churn' || p.type === 'anti-churn')
  return playbooks.value.filter(p => p.type === activeFilter.value)
})

function isStepDone(pb, i) {
  const key = `${pb.id}_${i}`
  if (tasksStore.playbookProgress[key] !== undefined) return tasksStore.playbookProgress[key]
  const step = (pb.steps || [])[i]
  return step?.done || false
}

function pbProgress(pb) {
  const steps = pb.steps || []
  if (!steps.length) return 0
  const done = steps.filter((_, i) => isStepDone(pb, i)).length
  return Math.round((done / steps.length) * 100)
}

function toggleStep(pb, i) {
  tasksStore.togglePlaybookStep(pb.id, i)
}

function typeBadgeClass(type) {
  if (type === 'churn' || type === 'anti-churn') return 'badge-churn'
  if (type === 'onboarding') return 'badge-onboarding'
  if (type === 'expansion') return 'badge-expansion'
  return 'badge-default'
}

function typeBadgeLabel(type) {
  if (type === 'churn' || type === 'anti-churn') return 'Anti-churn'
  if (type === 'onboarding') return 'Onboarding'
  if (type === 'expansion') return 'Expansion'
  return type || 'Autre'
}

function progressColor(pct) {
  if (pct >= 70) return '#34A853'
  if (pct >= 40) return '#FBBC05'
  return '#5F6368'
}
</script>

<style scoped>
.playbook-runner {
  max-width: 1200px;
  padding: 24px 28px;
  font-family: 'DM Sans', 'Google Sans', 'Segoe UI', sans-serif;
  background: #F8F9FA;
}

.hero {
  background: linear-gradient(135deg, #EA4335, #FBBC05, #34A853, #4285F4);
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

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filter-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 100px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  font-family: 'DM Sans', 'Google Sans', 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  color: #2d3748;
}
.filter-pill:hover {
  background: rgba(66,133,244,0.08);
}
.filter-pill.active {
  background: #4285F4;
  color: #fff;
}
.filter-count {
  font-size: 11px;
  font-weight: 700;
  background: rgba(0,0,0,0.08);
  padding: 2px 7px;
  border-radius: 999px;
}
.filter-pill.active .filter-count {
  background: rgba(255,255,255,0.2);
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
  color: #1a1f36;
  margin: 0 0 6px;
}
.empty-sub { font-size: 13px; color: #2d3748; margin: 0; }

.playbook-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.playbook-card {
  background: #FFFFFF;
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 22px 24px;
}

.pb-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}
.pb-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1f36;
  margin: 0 0 8px;
}
.pb-type-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.badge-churn {
  background: rgba(234,67,53,0.1);
  color: #EA4335;
}
.badge-onboarding {
  background: rgba(66,133,244,0.1);
  color: #4285F4;
}
.badge-expansion {
  background: rgba(52,168,83,0.1);
  color: #34A853;
}
.badge-default {
  background: rgba(0,0,0,0.05);
  color: #2d3748;
}

.pb-progress-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}

.pb-bar-track {
  height: 8px;
  background: #E8EAED;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 18px;
}
.pb-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #EA4335, #FBBC05, #34A853, #4285F4);
  transition: width 0.4s ease;
}

.pb-clients {
  margin-bottom: 16px;
}
.meta-label {
  font-size: 13px;
  color: #2d3748;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.04em;
  display: block;
  margin-bottom: 8px;
}
.client-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.client-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(66,133,244,0.1);
  color: #4285F4;
}

.pb-steps {
  border-top: 1px solid #E8EAED;
  padding-top: 16px;
}
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 13px;
  color: #2d3748;
}
.step-item:hover {
  background: rgba(0,0,0,0.02);
}
.step-item.done {
  color: #2d3748;
  opacity: 0.6;
}
.step-item.done .step-text {
  text-decoration: line-through;
}
.step-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #4285F4;
  flex-shrink: 0;
  cursor: pointer;
}
.step-text {
  flex: 1;
  font-weight: 500;
}
.auto-badge {
  margin-right: 4px;
}
</style>
