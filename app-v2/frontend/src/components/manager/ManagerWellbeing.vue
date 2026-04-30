<template>
  <section class="mgr-section">
    <h2>💚 {{ t('mgr_wellbeing') }}</h2>
    <div class="wellbeing-grid">
      <div v-for="m in members" :key="m.id" class="member-card">
        <div class="mc-header">
          <div class="mc-avatar" :class="m.status">{{ m.name[0] }}</div>
          <div class="mc-info">
            <strong>{{ m.name }}</strong>
            <span class="mc-role">{{ m.role }}</span>
          </div>
          <span class="mc-status-badge" :class="m.status">
            {{ m.status === 'healthy' ? t('status_healthy') : t('kpi_overloaded') }}
          </span>
        </div>

        <!-- Wellbeing bar -->
        <div class="mc-metric">
          <div class="metric-row">
            <span class="metric-label">{{ t('mgr_wellbeing') }}</span>
            <span class="metric-val" :class="wellbeingClass(m.wellbeingScore)">
              {{ m.wellbeingScore }}/100
            </span>
          </div>
          <div class="metric-bar">
            <div
              class="metric-fill"
              :class="wellbeingClass(m.wellbeingScore)"
              :style="{ width: m.wellbeingScore + '%' }"
            />
          </div>
        </div>

        <!-- Workload bar -->
        <div class="mc-metric">
          <div class="metric-row">
            <span class="metric-label">{{ t('mgr_workload') }}</span>
            <span class="metric-val" :class="workloadClass(m.workload)">
              {{ m.workload }}%
            </span>
          </div>
          <div class="metric-bar">
            <div
              class="metric-fill"
              :class="workloadClass(m.workload)"
              :style="{ width: m.workload + '%' }"
            />
          </div>
        </div>

        <!-- Burnout -->
        <div class="mc-row">
          <span class="metric-label">{{ t('mgr_burnout_risk') }}</span>
          <span class="burnout-badge" :class="m.burnoutRisk">
            {{ t('mgr_burnout_' + m.burnoutRisk) }}
          </span>
        </div>

        <!-- Week mood -->
        <div class="mc-row">
          <span class="metric-label">{{ t('mgr_week_mood') }}</span>
          <div class="week-moods">
            <span
              v-for="(mood, i) in m.weekMoods"
              :key="i"
              class="mood-emoji"
              :title="t('mgr_mood_' + mood)"
            >
              {{ moodEmoji(mood) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { wellbeingClass, workloadClass, moodEmoji } from './managerHelpers.js'

const { t } = useI18n({ useScope: 'global' })

defineProps({
  members: { type: Array, required: true }
})
</script>
