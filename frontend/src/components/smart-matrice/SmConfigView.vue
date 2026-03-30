<template>
  <div class="sm-config">
    <h3 class="sm-config__title">Paramètres Smart Matrice</h3>

    <!-- Base settings -->
    <div class="sm-config__section">
      <h4 class="sm-config__section-title">Informations générales</h4>
      <div class="sm-config__grid">
        <div class="sm-config__field">
          <label class="sm-config__label">Prénom</label>
          <input v-model="firstName" class="sm-config__input" placeholder="Votre prénom"
            @blur="saveFirstName" />
          <span class="sm-config__hint">Affiché dans le profil « Moi »</span>
        </div>
        <div class="sm-config__field">
          <label class="sm-config__label">Pays</label>
          <select v-model="form.country" class="sm-config__input" @change="save">
            <option value="FR">France</option>
            <option value="BE">Belgique</option>
            <option value="CH">Suisse</option>
            <option value="CA">Canada</option>
            <option value="US">États-Unis</option>
            <option value="KR">Corée du Sud</option>
          </select>
        </div>
        <div class="sm-config__field">
          <label class="sm-config__label">Entreprise</label>
          <input v-model="form.company_name" class="sm-config__input" @blur="save" />
        </div>
      </div>
    </div>

    <!-- Work schedule -->
    <div class="sm-config__section">
      <h4 class="sm-config__section-title">Organisation du temps</h4>
      <div class="sm-config__grid">
        <div class="sm-config__field">
          <label class="sm-config__label">Jours / semaine</label>
          <input v-model.number="form.days_per_week" type="number" min="1" max="7" class="sm-config__input" @change="save" />
        </div>
        <div class="sm-config__field">
          <label class="sm-config__label">Heures / jour</label>
          <input v-model.number="form.hours_per_day" type="number" min="1" max="16" step="0.5" class="sm-config__input" @change="save" />
        </div>
        <div class="sm-config__field sm-config__field--computed">
          <label class="sm-config__label">Temps projet effectif / jour</label>
          <span class="sm-config__computed">{{ effectiveHours.toFixed(1) }}h</span>
          <span class="sm-config__hint">= {{ form.hours_per_day }}h - {{ dailyTotalHours.toFixed(1) }}h tâches fixes</span>
        </div>
      </div>
    </div>

    <!-- Daily tasks -->
    <div class="sm-config__section">
      <h4 class="sm-config__section-title">Tâches quotidiennes fixes</h4>
      <div class="sm-config__daily-list">
        <div v-for="(dt, i) in form.daily_tasks" :key="i" class="sm-config__daily-item">
          <input v-model="dt.name" class="sm-config__input sm-config__input--sm" placeholder="Nom" @blur="save" />
          <input v-model.number="dt.duration" type="number" min="0" step="0.25" class="sm-config__input sm-config__input--xs" @change="save" />
          <span class="sm-config__daily-unit">h</span>
          <button class="sm-config__daily-del" @click="removeDaily(i)">&times;</button>
        </div>
      </div>
      <button class="sm-config__add-btn" @click="addDaily">+ Ajouter une tâche fixe</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useSmartMatriceStore } from '../../stores/smartMatrice'
import { useAuthStore } from '../../stores/auth'

const store = useSmartMatriceStore()
const authStore = useAuthStore()

const firstName = ref('')
const form = reactive({
  country: 'FR',
  company_name: '',
  days_per_week: 5,
  hours_per_day: 8,
  daily_tasks: [],
})

onMounted(async () => {
  await store.fetchConfig()
  if (store.config) {
    Object.assign(form, {
      country: store.config.country || 'FR',
      company_name: store.config.company_name || '',
      days_per_week: store.config.days_per_week || 5,
      hours_per_day: store.config.hours_per_day || 8,
      daily_tasks: store.config.daily_tasks || [],
    })
  }
  firstName.value = authStore.user?.display_name || ''
})

const dailyTotalHours = computed(() =>
  form.daily_tasks.reduce((sum, dt) => sum + (dt.duration || 0), 0)
)

const effectiveHours = computed(() =>
  Math.max(0, form.hours_per_day - dailyTotalHours.value)
)

function addDaily() {
  form.daily_tasks.push({ name: '', duration: 0.5 })
}

function removeDaily(i) {
  form.daily_tasks.splice(i, 1)
  save()
}

async function save() {
  await store.updateConfig({
    country: form.country,
    company_name: form.company_name,
    days_per_week: form.days_per_week,
    hours_per_day: form.hours_per_day,
    daily_tasks: form.daily_tasks,
  })
}

async function saveFirstName() {
  const name = firstName.value.trim()
  if (!name) return
  try {
    await authStore.updateProfile({ display_name: name })
    store.userName = name
  } catch (e) {
    console.error('Failed to update name', e)
  }
}
</script>

<style scoped>
.sm-config { font-family: 'DM Sans', sans-serif; max-width: 640px; }
.sm-config__title {
  font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 22px;
  color: var(--sm-t1); margin: 0 0 24px;
}
.sm-config__section { margin-bottom: 28px; }
.sm-config__section-title {
  font-weight: 600; font-size: 14px; color: var(--sm-t1); margin: 0 0 12px;
  padding-bottom: 8px; border-bottom: 1px solid var(--sm-bd);
}
.sm-config__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 500px) { .sm-config__grid { grid-template-columns: 1fr; } }
.sm-config__field { display: flex; flex-direction: column; gap: 4px; }
.sm-config__label { font-size: 12px; font-weight: 500; color: var(--sm-t2); }
.sm-config__input {
  border: 1px solid var(--sm-bd); background: var(--sm-white); border-radius: 8px;
  padding: 8px 10px; font-size: 14px; font-family: 'DM Sans', sans-serif;
  color: var(--sm-t1); outline: none;
}
.sm-config__input:focus { border-color: var(--sm-terra); }
.sm-config__input--sm { flex: 1; }
.sm-config__input--xs { width: 64px; text-align: center; }
.sm-config__hint { font-size: 11px; color: var(--sm-t3); }
.sm-config__computed {
  font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; color: var(--sm-terra);
}
.sm-config__daily-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.sm-config__daily-item { display: flex; align-items: center; gap: 8px; }
.sm-config__daily-unit { font-size: 13px; color: var(--sm-t3); }
.sm-config__daily-del {
  border: none; background: none; color: var(--sm-t3); font-size: 18px; cursor: pointer;
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
}
.sm-config__daily-del:hover { color: var(--sm-err); }
.sm-config__add-btn {
  border: none; background: none; color: var(--sm-terra); font-size: 13px; font-weight: 500;
  cursor: pointer; padding: 0; font-family: 'DM Sans', sans-serif;
}
.sm-config__add-btn:hover { text-decoration: underline; }
</style>
