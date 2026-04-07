<template>
  <div class="sm-config">
    <h3 class="sm-config__title">{{ t.title }}</h3>
    <p class="sm-config__desc">{{ t.desc }}</p>

    <!-- Country & Company -->
    <div class="sm-config__section">
      <h4 class="sm-config__section-title">{{ t.general }}</h4>
      <div class="sm-config__grid">
        <div class="sm-config__field">
          <label>{{ t.firstName }}</label>
          <input v-model="firstName" @blur="saveFirstName" :placeholder="t.firstNameHint" />
        </div>
        <div class="sm-config__field">
          <label>{{ t.country }}</label>
          <select v-model="form.country" @change="applyCountryDefaults">
            <option v-for="c in countries" :key="c.code" :value="c.code">{{ c.flag }} {{ c.name }}</option>
          </select>
        </div>
        <div class="sm-config__field">
          <label>{{ t.company }}</label>
          <input v-model="form.company_name" @blur="save" />
        </div>
        <div class="sm-config__field">
          <label>{{ t.contract }}</label>
          <select v-model="form.contract_type" @change="save">
            <option value="full_time">{{ t.fullTime }}</option>
            <option value="part_time">{{ t.partTime }}</option>
            <option value="freelance">{{ t.freelance }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Work Schedule -->
    <div class="sm-config__section">
      <h4 class="sm-config__section-title">{{ t.workSchedule }}</h4>
      <div class="sm-config__grid">
        <div class="sm-config__field">
          <label>{{ t.daysWeek }}</label>
          <input v-model.number="form.days_per_week" type="number" min="1" max="7" @change="save" />
        </div>
        <div class="sm-config__field">
          <label>{{ t.hoursDay }}</label>
          <input v-model.number="form.hours_per_day" type="number" min="1" max="16" step="0.5" @change="save" />
        </div>
        <div class="sm-config__field">
          <label>{{ t.daysOff }}</label>
          <input v-model.number="form.days_off_per_year" type="number" min="0" max="60" @change="save" />
        </div>
        <div class="sm-config__field">
          <label>{{ t.holidays }}</label>
          <input v-model.number="form.national_holidays" type="number" min="0" max="20" @change="save" />
        </div>
        <div class="sm-config__field">
          <label>{{ t.extraDaysOff }}</label>
          <input v-model.number="form.extra_days_off" type="number" min="0" max="30" @change="save" />
        </div>
      </div>
    </div>

    <!-- Legal info for selected country -->
    <div v-if="currentCountry" class="sm-config__section">
      <h4 class="sm-config__section-title">{{ t.legalInfo || 'Réglementation du pays' }}</h4>
      <div class="sm-config__legal-note">
        <span class="sm-config__legal-flag">{{ currentCountry.flag }}</span>
        <span>{{ currentCountry.legalNote }}</span>
      </div>
      <div class="sm-config__grid" style="margin-top: 12px;">
        <div class="sm-config__field">
          <label>{{ t.maxHoursWeek || 'Max heures / semaine (légal)' }}</label>
          <input :value="currentCountry.maxHoursWeek || '—'" disabled class="sm-config__disabled" />
        </div>
        <div class="sm-config__field">
          <label>{{ t.maxHoursDay || 'Max heures / jour (légal)' }}</label>
          <input :value="currentCountry.maxHoursDay || 'Non plafonné'" disabled class="sm-config__disabled" />
        </div>
      </div>
      <div class="sm-config__grid" style="margin-top: 8px;">
        <div class="sm-config__field">
          <label>{{ t.conventionCollective || 'Convention collective' }}</label>
          <input v-model="form.company_type" @blur="save" :placeholder="t.toFill || 'À remplir selon votre secteur'" />
        </div>
        <div class="sm-config__field">
          <label>{{ t.specificRules || 'Règles spécifiques entreprise' }}</label>
          <input v-model="form.extra_rules" @blur="save" :placeholder="t.toFill || 'À remplir (ex: RTT, accord d\'entreprise...)'" />
        </div>
      </div>
    </div>

    <!-- Daily Fixed Tasks -->
    <div class="sm-config__section">
      <h4 class="sm-config__section-title">{{ t.dailyTasks }}</h4>
      <p class="sm-config__hint">{{ t.dailyTasksHint }}</p>
      <div class="sm-config__daily-list">
        <div v-for="(dt, i) in form.daily_tasks" :key="i" class="sm-config__daily-item">
          <input v-model="dt.name" :placeholder="t.taskName" @blur="save" />
          <input v-model.number="dt.duration" type="number" min="0" step="0.25" @change="save" />
          <span>h</span>
          <button @click="removeDaily(i)">&times;</button>
        </div>
      </div>
      <button class="sm-config__add-btn" @click="addDaily">+ {{ t.addTask }}</button>
    </div>

    <!-- Summary -->
    <div class="sm-config__summary">
      <div class="sm-config__summary-card">
        <span class="sm-config__summary-label">{{ t.workDaysYear }}</span>
        <span class="sm-config__summary-value">{{ workDaysPerYear }}</span>
      </div>
      <div class="sm-config__summary-card">
        <span class="sm-config__summary-label">{{ t.effectiveHours }}</span>
        <span class="sm-config__summary-value">{{ effectiveHours.toFixed(1) }}h</span>
      </div>
      <div class="sm-config__summary-card">
        <span class="sm-config__summary-label">{{ t.projectHoursYear }}</span>
        <span class="sm-config__summary-value">{{ projectHoursPerYear.toFixed(0) }}h</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSmartMatriceStore } from '../../stores/smartMatrice'
import { useAuthStore } from '../../stores/auth'
import { usePreferencesStore } from '../../stores/preferences'

const store = useSmartMatriceStore()
const authStore = useAuthStore()
const prefsStore = usePreferencesStore()

const firstName = ref('')
const ready = ref(false)
const form = reactive({
  country: 'FR',
  company_name: '',
  contract_type: 'full_time',
  days_per_week: 5,
  hours_per_day: 8,
  days_off_per_year: 25,
  national_holidays: 11,
  extra_days_off: 0,
  extra_rules: '',
  daily_tasks: [],
})

// Country defaults
const countries = [
  { code: 'FR', name: 'France', flag: '🇫🇷', days: 5, hours: 7, off: 25, holidays: 11, maxHoursWeek: 35, maxHoursDay: 10, legalNote: 'Durée légale : 35h/sem. RTT possible au-delà. Convention collective applicable.' },
  { code: 'US', name: 'United States', flag: '🇺🇸', days: 5, hours: 8, off: 10, holidays: 11, maxHoursWeek: 40, maxHoursDay: 0, legalNote: 'No federal PTO requirement. Overtime after 40h/week (FLSA).' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', days: 5, hours: 8, off: 28, holidays: 8, maxHoursWeek: 48, maxHoursDay: 0, legalNote: '28 days statutory leave (incl. bank holidays). 48h/week max (WTR).' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪', days: 5, hours: 8, off: 20, holidays: 9, maxHoursWeek: 48, maxHoursDay: 10, legalNote: 'Min. 20 Urlaubstage (5-Tage). Max 10h/Tag, 48h/Woche (ArbZG).' },
  { code: 'ES', name: 'España', flag: '🇪🇸', days: 5, hours: 8, off: 22, holidays: 14, maxHoursWeek: 40, maxHoursDay: 9, legalNote: '30 días naturales de vacaciones. Máximo 40h/semana.' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', days: 5, hours: 8, off: 26, holidays: 12, maxHoursWeek: 40, maxHoursDay: 0, legalNote: '4 settimane di ferie minimo. Massimo 48h/settimana con straordinari.' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', days: 5, hours: 7.6, off: 20, holidays: 10, maxHoursWeek: 38, maxHoursDay: 9, legalNote: '20 jours légaux. Semaine de 38h. Possibilité de semaine de 4 jours.' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', days: 5, hours: 8.4, off: 20, holidays: 8, maxHoursWeek: 45, maxHoursDay: 0, legalNote: '4 semaines de vacances min (5 si < 20 ans). Max 45h/sem (bureau).' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', days: 5, hours: 8, off: 10, holidays: 9, maxHoursWeek: 40, maxHoursDay: 8, legalNote: '2 weeks vacation (federal). Varies by province.' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', days: 5, hours: 7.6, off: 20, holidays: 8, maxHoursWeek: 38, maxHoursDay: 0, legalNote: '4 weeks annual leave. Max 38h/week (NES).' },
  { code: 'JP', name: '日本', flag: '🇯🇵', days: 5, hours: 8, off: 10, holidays: 16, maxHoursWeek: 40, maxHoursDay: 8, legalNote: '有給休暇 10日～20日。法定労働時間 40時間/週。' },
  { code: 'KR', name: '대한민국', flag: '🇰🇷', days: 5, hours: 8, off: 15, holidays: 15, maxHoursWeek: 52, maxHoursDay: 8, legalNote: '연차 15일. 주 52시간 상한 (연장근로 포함).' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', days: 5, hours: 8, off: 30, holidays: 12, maxHoursWeek: 44, maxHoursDay: 8, legalNote: '30 dias de férias. Máximo 44h/semana (CLT).' },
  { code: 'IN', name: 'India', flag: '🇮🇳', days: 5, hours: 8, off: 12, holidays: 10, maxHoursWeek: 48, maxHoursDay: 9, legalNote: '12-21 earned leave days. Max 48h/week.' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', days: 5, hours: 8, off: 7, holidays: 11, maxHoursWeek: 44, maxHoursDay: 8, legalNote: '7-14 days annual leave. Max 44h/week (EA).' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', days: 5, hours: 8, off: 30, holidays: 10, maxHoursWeek: 48, maxHoursDay: 8, legalNote: '30 days leave after 1 year. Max 8h/day (reduced in Ramadan).' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', days: 5, hours: 8, off: 18, holidays: 13, maxHoursWeek: 44, maxHoursDay: 10, legalNote: '18 jours ouvrables après 6 mois. 44h/semaine (Code du travail).' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', days: 5, hours: 8, off: 24, holidays: 14, maxHoursWeek: 40, maxHoursDay: 8, legalNote: '24 jours ouvrables/an. 40h/semaine (Code du travail).' },
]

const currentCountry = computed(() => countries.find(c => c.code === form.country))

function applyCountryDefaults() {
  const c = countries.find(x => x.code === form.country)
  if (c) {
    form.days_per_week = c.days
    form.hours_per_day = c.hours
    form.days_off_per_year = c.off
    form.national_holidays = c.holidays
  }
  save()
}

const dailyTotalHours = computed(() => form.daily_tasks.reduce((s, dt) => s + (dt.duration || 0), 0))
const effectiveHours = computed(() => Math.max(0, form.hours_per_day - dailyTotalHours.value))
const workDaysPerYear = computed(() => {
  const totalWeeks = 52
  const totalWorkDays = totalWeeks * form.days_per_week
  return totalWorkDays - form.days_off_per_year - form.national_holidays - form.extra_days_off
})
const projectHoursPerYear = computed(() => workDaysPerYear.value * effectiveHours.value)

function addDaily() { form.daily_tasks.push({ name: '', duration: 0.5 }) }
function removeDaily(i) { form.daily_tasks.splice(i, 1); save() }

async function save() {
  if (!ready.value) return
  await store.updateConfig({
    country: form.country,
    company_name: form.company_name,
    contract_type: form.contract_type,
    days_per_week: form.days_per_week,
    hours_per_day: form.hours_per_day,
    days_off_per_year: form.days_off_per_year,
    national_holidays: form.national_holidays,
    extra_days_off: form.extra_days_off,
    daily_tasks: form.daily_tasks,
  })
}

async function saveFirstName() {
  const name = firstName.value.trim()
  if (!name) return
  try {
    await authStore.updateProfile({ display_name: name })
    store.userName = name
  } catch {}
}

onMounted(async () => {
  await store.fetchConfig()
  if (store.config) {
    Object.assign(form, {
      country: store.config.country || 'FR',
      company_name: store.config.company_name || '',
      contract_type: store.config.contract_type || 'full_time',
      days_per_week: store.config.days_per_week || 5,
      hours_per_day: store.config.hours_per_day || 8,
      days_off_per_year: store.config.days_off_per_year || 25,
      national_holidays: store.config.national_holidays || 11,
      extra_days_off: store.config.extra_days_off || 0,
      daily_tasks: store.config.daily_tasks || [],
    })
  }
  firstName.value = authStore.user?.display_name || ''
  ready.value = true
})

// i18n native
const lang = computed(() => prefsStore.lang)
const translations = {
  fr: {
    title: 'Paramètres Smart Matrice',
    desc: 'Configurez votre profil pour que les calculs de durée soient précis.',
    general: 'Informations générales',
    firstName: 'Prénom',
    firstNameHint: 'Affiché dans le profil « Moi »',
    country: 'Pays',
    company: 'Entreprise',
    contract: 'Type de contrat',
    fullTime: 'Temps plein',
    partTime: 'Temps partiel',
    freelance: 'Freelance',
    workSchedule: 'Organisation du temps',
    daysWeek: 'Jours / semaine',
    hoursDay: 'Heures / jour',
    daysOff: 'Congés / an',
    holidays: 'Jours fériés / an',
    extraDaysOff: 'Congés exceptionnels',
    dailyTasks: 'Tâches quotidiennes fixes',
    dailyTasksHint: 'Réunions, emails, admin... ce temps est déduit du temps projet disponible.',
    taskName: 'Nom de la tâche',
    addTask: 'Ajouter une tâche fixe',
    workDaysYear: 'Jours ouvrés / an',
    effectiveHours: 'Heures projet / jour',
    projectHoursYear: 'Heures projet / an',
    legalInfo: 'Réglementation du pays',
    maxHoursWeek: 'Max heures / semaine (légal)',
    maxHoursDay: 'Max heures / jour (légal)',
    conventionCollective: 'Convention collective',
    specificRules: 'Règles spécifiques entreprise',
    toFill: 'À remplir selon votre situation',
  },
  en: {
    title: 'Smart Matrice Settings',
    desc: 'Set up your profile so duration calculations are accurate.',
    general: 'General information',
    firstName: 'First name',
    firstNameHint: 'Shown in "Me" profile',
    country: 'Country',
    company: 'Company',
    contract: 'Contract type',
    fullTime: 'Full-time',
    partTime: 'Part-time',
    freelance: 'Freelance',
    workSchedule: 'Time organization',
    daysWeek: 'Days / week',
    hoursDay: 'Hours / day',
    daysOff: 'Days off / year',
    holidays: 'National holidays / year',
    extraDaysOff: 'Extra days off',
    dailyTasks: 'Daily fixed tasks',
    dailyTasksHint: 'Meetings, emails, admin... this time is subtracted from available project time.',
    taskName: 'Task name',
    addTask: 'Add fixed task',
    workDaysYear: 'Working days / year',
    effectiveHours: 'Project hours / day',
    projectHoursYear: 'Project hours / year',
    legalInfo: 'Country regulations',
    maxHoursWeek: 'Max hours / week (legal)',
    maxHoursDay: 'Max hours / day (legal)',
    conventionCollective: 'Collective agreement',
    specificRules: 'Company-specific rules',
    toFill: 'To be filled based on your situation',
  },
  kr: {
    title: '스마트 매트릭스 설정',
    desc: '정확한 기간 계산을 위해 프로필을 설정하세요.',
    general: '기본 정보',
    firstName: '이름',
    firstNameHint: '"나" 프로필에 표시됩니다',
    country: '국가',
    company: '회사',
    contract: '계약 유형',
    fullTime: '정규직',
    partTime: '파트타임',
    freelance: '프리랜서',
    workSchedule: '시간 구성',
    daysWeek: '주당 근무일',
    hoursDay: '일일 근무시간',
    daysOff: '연간 휴가일',
    holidays: '연간 공휴일',
    extraDaysOff: '특별 휴가',
    dailyTasks: '일일 고정 업무',
    dailyTasksHint: '회의, 이메일, 관리 업무... 이 시간은 가용 프로젝트 시간에서 차감됩니다.',
    taskName: '업무 이름',
    addTask: '고정 업무 추가',
    workDaysYear: '연간 근무일',
    effectiveHours: '일일 프로젝트 시간',
    projectHoursYear: '연간 프로젝트 시간',
    legalInfo: '국가 규정',
    maxHoursWeek: '주당 최대 근무시간 (법적)',
    maxHoursDay: '일일 최대 근무시간 (법적)',
    conventionCollective: '단체 협약',
    specificRules: '회사 특별 규정',
    toFill: '상황에 맞게 입력하세요',
  },
}
const t = computed(() => translations[lang.value] || translations.fr)
</script>

<style scoped>
.sm-config { font-family: 'DM Sans', sans-serif; max-width: 720px; }
.sm-config__title { font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 24px; color: var(--sm-t1); margin: 0 0 4px; }
.sm-config__desc { font-size: 14px; color: var(--sm-t3); margin-bottom: 28px; }
.sm-config__section { margin-bottom: 28px; }
.sm-config__section-title { font-weight: 700; font-size: 15px; color: var(--sm-t1); margin: 0 0 14px; padding-bottom: 8px; border-bottom: 1px solid var(--sm-bd); }
.sm-config__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 500px) { .sm-config__grid { grid-template-columns: 1fr; } }
.sm-config__field { display: flex; flex-direction: column; gap: 5px; }
.sm-config__field label { font-size: 12px; font-weight: 600; color: var(--sm-t2); }
.sm-config__field input, .sm-config__field select {
  border: 1px solid var(--sm-bd); background: #fff; border-radius: 10px;
  padding: 9px 12px; font-size: 14px; font-family: 'DM Sans', sans-serif;
  color: var(--sm-t1); outline: none; transition: border .15s;
}
.sm-config__field input:focus, .sm-config__field select:focus { border-color: var(--sm-terra); }
.sm-config__hint { font-size: 12px; color: var(--sm-t3); margin-bottom: 12px; }
.sm-config__legal-note {
  display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px;
  background: rgba(79,70,229,.04); border: 1px solid rgba(79,70,229,.1);
  border-radius: 10px; font-size: 12px; color: var(--sm-t2); line-height: 1.5;
}
.sm-config__legal-flag { font-size: 20px; flex-shrink: 0; }
.sm-config__disabled {
  border: 1px solid var(--sm-bd); background: var(--sm-bg, #f9fafb); border-radius: 8px;
  padding: 7px 10px; font-size: 13px; color: var(--sm-t3); width: 100%;
}
.sm-config__daily-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.sm-config__daily-item { display: flex; align-items: center; gap: 8px; }
.sm-config__daily-item input:first-child { flex: 1; border: 1px solid var(--sm-bd); background: #fff; border-radius: 8px; padding: 7px 10px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: var(--sm-t1); outline: none; }
.sm-config__daily-item input:nth-child(2) { width: 64px; text-align: center; border: 1px solid var(--sm-bd); background: #fff; border-radius: 8px; padding: 7px 6px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: var(--sm-t1); outline: none; }
.sm-config__daily-item span { font-size: 13px; color: var(--sm-t3); }
.sm-config__daily-item button { border: none; background: none; color: var(--sm-t3); font-size: 18px; cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
.sm-config__daily-item button:hover { color: var(--sm-err); }
.sm-config__add-btn { border: none; background: none; color: var(--sm-terra); font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.sm-config__add-btn:hover { text-decoration: underline; }

.sm-config__summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 24px; }
.sm-config__summary-card {
  background: #fff; border: 1px solid var(--sm-bd); border-radius: 12px;
  padding: 16px; text-align: center;
}
.sm-config__summary-label { display: block; font-size: 11px; font-weight: 600; color: var(--sm-t3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.sm-config__summary-value { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: var(--sm-t1); background: var(--sm-grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
</style>
