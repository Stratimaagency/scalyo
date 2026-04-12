<template>
  <div class="settings-view">
    <h1>⚙️ {{ t('sm_settings_title') }}</h1>

    <div class="stg-card">
      <div class="stg-grid">
        <div class="fg"><label>{{ t('sm_firstname') }}</label><input v-model="form.firstName" class="fi" /></div>
        <div class="fg"><label>{{ t('sm_country') }}</label>
          <select v-model="form.country" class="fi">
            <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.flag }} {{ c.name }}</option>
          </select>
        </div>
        <div class="fg"><label>{{ t('sm_company') }}</label><input v-model="form.company" class="fi" /></div>
        <div class="fg"><label>{{ t('sm_contract') }}</label>
          <select v-model="form.contract" class="fi">
            <option value="cdi">{{ t('sm_contract_cdi') }}</option>
            <option value="cdd">{{ t('sm_contract_cdd') }}</option>
            <option value="freelance">{{ t('sm_contract_freelance') }}</option>
          </select>
        </div>
        <div class="fg"><label>{{ t('sm_days_week') }}</label><input v-model.number="form.daysPerWeek" type="number" min="1" max="7" class="fi" /></div>
        <div class="fg"><label>{{ t('sm_hours_day') }}</label><input v-model.number="form.hoursPerDay" type="number" min="1" max="24" class="fi" /></div>
        <div class="fg"><label>{{ t('sm_vacation_days') }}</label><input v-model.number="form.vacationDays" type="number" min="0" class="fi" /></div>
        <div class="fg"><label>{{ t('sm_holidays') }}</label><input v-model.number="form.holidays" type="number" min="0" class="fi" /></div>
        <div class="fg"><label>{{ t('sm_exceptional') }}</label><input v-model.number="form.exceptionalLeave" type="number" min="0" class="fi" /></div>
        <div class="fg"><label>{{ t('sm_daily_tasks') }}</label><input v-model.number="form.dailyFixedHours" type="number" min="0" max="8" step="0.5" class="fi" /></div>
      </div>
    </div>

    <!-- Auto-calculated -->
    <div class="stg-card auto">
      <h3>{{ t('sm_auto_calculated') }}</h3>
      <div class="calc-grid">
        <div class="calc-item">
          <span class="calc-label">{{ t('sm_working_days') }}</span>
          <span class="calc-val">{{ workingDays }}</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">{{ t('sm_project_hours_day') }}</span>
          <span class="calc-val">{{ projectHoursDay }}h</span>
        </div>
        <div class="calc-item">
          <span class="calc-label">{{ t('sm_project_hours_year') }}</span>
          <span class="calc-val purple">{{ projectHoursYear }}h</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n({ useScope: 'global' })
const auth = useAuthStore()

const countries = [
  { code: 'FR', flag: '🇫🇷', name: 'France' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgique' },
  { code: 'CH', flag: '🇨🇭', name: 'Suisse' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: 'US', flag: '🇺🇸', name: 'USA' },
  { code: 'KR', flag: '🇰🇷', name: '한국' },
]

const form = reactive({
  firstName: auth.user?.firstName || '',
  country: auth.company?.country || 'FR',
  company: auth.company?.name || '',
  contract: 'cdi',
  daysPerWeek: 5,
  hoursPerDay: 7,
  vacationDays: 25,
  holidays: 11,
  exceptionalLeave: 2,
  dailyFixedHours: 1.5,
})

const workingDays = computed(() => {
  const totalWeeks = 52
  const totalDays = totalWeeks * form.daysPerWeek
  return totalDays - form.vacationDays - form.holidays - form.exceptionalLeave
})

const projectHoursDay = computed(() => {
  return Math.max(0, form.hoursPerDay - form.dailyFixedHours)
})

const projectHoursYear = computed(() => {
  return Math.round(workingDays.value * projectHoursDay.value)
})
</script>

<style scoped>
.settings-view { max-width: 700px; }
.settings-view h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; }

.stg-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 24px; margin-bottom: 20px; }
.stg-card h3 { font-size: 0.9rem; font-weight: 700; margin-bottom: 16px; }
.stg-card.auto { background: var(--purple-bg); border-color: var(--purple-border); }

.stg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.fg { display: flex; flex-direction: column; gap: 4px; }
.fg label { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); }
.fi { padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; background: #fff; width: 100%; }
.fi:focus { border-color: var(--purple); }

.calc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.calc-item { text-align: center; padding: 14px; background: rgba(255,255,255,0.6); border-radius: var(--radius-sm); }
.calc-label { font-size: 0.72rem; color: var(--text-secondary); display: block; margin-bottom: 4px; }
.calc-val { font-size: 1.5rem; font-weight: 800; color: var(--text); }
.calc-val.purple { color: var(--purple); }

@media (max-width: 600px) { .stg-grid { grid-template-columns: 1fr; } .calc-grid { grid-template-columns: 1fr; } }
</style>
