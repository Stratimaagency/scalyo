<template>
  <div class="sm-project-card" :class="{ 'sm-project-card--selected': selected }" @click="$emit('select-project', project)">
    <div class="sm-project-card__header">
      <span class="sm-project-card__emoji">{{ project.emoji || '📁' }}</span>
      <div class="sm-project-card__info">
        <h3 class="sm-project-card__name">{{ project.name }}</h3>
        <p class="sm-project-card__desc" v-if="project.description">{{ project.description }}</p>
      </div>
      <button class="sm-project-card__delete" @click.stop="$emit('delete-project', project)" title="Supprimer">🗑️</button>
      <svg class="sm-project-card__circle" width="38" height="38" viewBox="0 0 38 38">
        <circle cx="19" cy="19" r="17" fill="none" stroke="var(--sm-bd)" stroke-width="3" />
        <circle cx="19" cy="19" r="17" fill="none" stroke="url(#sm-cg)" stroke-width="3"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="circumference - (circumference * progress / 100)"
          stroke-linecap="round" transform="rotate(-90 19 19)" />
        <text x="19" y="20" text-anchor="middle" dominant-baseline="central"
          class="sm-project-card__pct">{{ progress }}%</text>
      </svg>
    </div>
    <div class="sm-project-card__bar-wrap">
      <div class="sm-project-card__bar" :style="{ width: progress + '%' }"></div>
    </div>
    <div class="sm-project-card__footer">
      <span class="sm-project-card__tasks">{{ project.task_count || 0 }} tâches</span>
      <span class="sm-project-card__light" :class="trafficClass">●</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: { type: Object, required: true },
  selected: { type: Boolean, default: false },
})

defineEmits(['select-project', 'delete-project'])

const progress = computed(() => props.project.progress || 0)
const circumference = computed(() => 2 * Math.PI * 17)

const trafficClass = computed(() => {
  const p = progress.value
  if (p >= 75) return 'sm-project-card__light--green'
  if (p >= 40) return 'sm-project-card__light--orange'
  return 'sm-project-card__light--red'
})
</script>

<style scoped>
.sm-project-card {
  background: var(--sm-white);
  border: 1px solid var(--sm-bd);
  border-radius: var(--sm-r);
  padding: 16px;
  cursor: pointer;
  transition: all .2s;
  box-shadow: var(--sm-sh);
  font-family: 'DM Sans', sans-serif;
}
.sm-project-card:hover { box-shadow: var(--sm-sh2); transform: translateY(-1px); }
.sm-project-card--selected { border-color: var(--sm-terra); box-shadow: 0 0 0 2px rgba(244,63,94,.15), var(--sm-sh2); }
.sm-project-card__header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.sm-project-card__emoji { font-size: 28px; flex-shrink: 0; }
.sm-project-card__info { flex: 1; min-width: 0; }
.sm-project-card__name {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600; font-size: 16px; color: var(--sm-t1);
  margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sm-project-card__desc { font-size: 12px; color: var(--sm-t3); margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sm-project-card__circle { flex-shrink: 0; }
.sm-project-card__pct { font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 600; fill: var(--sm-t1); }
.sm-project-card__bar-wrap { height: 4px; background: var(--sm-bd); border-radius: 2px; overflow: hidden; margin-bottom: 10px; }
.sm-project-card__bar { height: 100%; background: var(--sm-grad-h); border-radius: 2px; transition: width .4s ease; }
.sm-project-card__footer { display: flex; justify-content: space-between; align-items: center; }
.sm-project-card__tasks { font-size: 12px; color: var(--sm-t3); }
.sm-project-card__light { font-size: 10px; }
.sm-project-card__light--green { color: var(--sm-ok); }
.sm-project-card__light--orange { color: var(--sm-warn); }
.sm-project-card__light--red { color: var(--sm-err); }
.sm-project-card__delete {
  background: none; border: none; cursor: pointer; font-size: 14px; opacity: 0; transition: opacity .2s;
  padding: 4px; border-radius: 6px; flex-shrink: 0;
}
.sm-project-card__delete:hover { background: rgba(239,68,68,.1); }
.sm-project-card:hover .sm-project-card__delete { opacity: 1; }
</style>
