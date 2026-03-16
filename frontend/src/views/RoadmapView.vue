<template>
  <div class="fade-in">
    <div class="flex-between mb-lg">
      <div>
        <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('roadmap') }}</h3>
        <p style="font-size: 13px; color: var(--muted)">{{ roadmap.phase }}</p>
      </div>
      <button class="btn btn-primary" @click="showAdd = true">+ {{ t('addStep') }}</button>
    </div>

    <!-- Progress -->
    <AppCard class="mb-lg">
      <div class="flex-between mb-sm">
        <span style="font-weight: 700">{{ t('overallProgress') }}</span>
        <span class="kpi-value" style="font-size: 20px; color: var(--teal)">{{ roadmap.progress }}%</span>
      </div>
      <HealthBar :val="roadmap.progress" />
    </AppCard>

    <!-- Steps -->
    <div style="display: flex; flex-direction: column; gap: 10px">
      <AppCard v-for="(item, i) in roadmap.items" :key="i" class="card-lift">
        <div class="flex-between">
          <div style="display: flex; gap: 12px; align-items: center">
            <label class="toggle-switch" style="width: 36px; height: 20px">
              <input type="checkbox" v-model="item.done" @change="updateProgress" />
              <span class="toggle-slider" style="border-radius: 20px"></span>
            </label>
            <span style="font-weight: 700; font-size: 14px" :style="{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.5 : 1 }">
              {{ item.text }}
            </span>
          </div>
          <button class="btn btn-danger btn-sm" @click="removeItem(i)">✕</button>
        </div>
      </AppCard>
    </div>

    <EmptyState v-if="!roadmap.items?.length" icon="🗺️" :title="t('noRoadmapSteps')" :action="'+ ' + t('addStep')" @action="showAdd = true" />

    <!-- Add step modal -->
    <AppModal v-if="showAdd" :title="t('addStep')" @close="showAdd = false">
      <AppField :label="t('stepDesc')" v-model="newStep" required @enter="addStep" />
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px">
        <button class="btn btn-secondary" @click="showAdd = false">{{ t('cancel') }}</button>
        <button class="btn btn-primary" @click="addStep">{{ t('add') }}</button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { roadmapApi } from '../api'
import { useI18n } from '../i18n'
import AppCard from '../components/AppCard.vue'
import HealthBar from '../components/HealthBar.vue'
import EmptyState from '../components/EmptyState.vue'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'

const { t } = useI18n()
const roadmap = reactive({ phase: '', progress: 0, items: [] })
const showAdd = ref(false)
const newStep = ref('')

onMounted(async () => {
  try {
    const { data } = await roadmapApi.get()
    Object.assign(roadmap, data)
    if (!roadmap.phase) roadmap.phase = t('roadmapPhaseDefault')
    if (!Array.isArray(roadmap.items)) roadmap.items = []
  } catch {}
})

function updateProgress() {
  if (!roadmap.items.length) { roadmap.progress = 0; save(); return }
  const done = roadmap.items.filter(i => i.done).length
  roadmap.progress = Math.round((done / roadmap.items.length) * 100)
  save()
}

function addStep() {
  if (!newStep.value.trim()) return
  roadmap.items.push({ text: newStep.value.trim(), done: false })
  newStep.value = ''
  showAdd.value = false
  updateProgress()
}

function removeItem(index) {
  roadmap.items.splice(index, 1)
  updateProgress()
}

async function save() {
  await roadmapApi.update({ items: roadmap.items, progress: roadmap.progress, phase: roadmap.phase })
}
</script>
