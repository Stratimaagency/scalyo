<template>
  <div class="sm-eisen">
    <!-- Headers -->
    <div class="sm-eisen__corner"></div>
    <div class="sm-eisen__header sm-eisen__header--top">⚡ Urgent</div>
    <div class="sm-eisen__header sm-eisen__header--top">📅 Pas urgent</div>
    <div class="sm-eisen__header sm-eisen__header--left">🎯 Important</div>

    <!-- Q1: Urgent + Important = FAIRE -->
    <div class="sm-eisen__quad sm-eisen__quad--q1"
      @dragover.prevent @drop="onDrop($event, 1)">
      <div class="sm-eisen__quad-label">🔴 Faire maintenant</div>
      <div v-for="task in q(1)" :key="task.id" class="sm-eisen__item" draggable="true" @dragstart="onDragStart($event, task)">
        <span class="sm-eisen__item-name">{{ task.name }}</span>
        <button class="sm-eisen__item-transfer" @click.stop="startTransfer(task)" title="Transférer">↗</button>
      </div>
    </div>

    <!-- Q2: Pas urgent + Important = PLANIFIER -->
    <div class="sm-eisen__quad sm-eisen__quad--q2"
      @dragover.prevent @drop="onDrop($event, 2)">
      <div class="sm-eisen__quad-label">🟢 Planifier</div>
      <div v-for="task in q(2)" :key="task.id" class="sm-eisen__item" draggable="true" @dragstart="onDragStart($event, task)">
        <span class="sm-eisen__item-name">{{ task.name }}</span>
        <button class="sm-eisen__item-transfer" @click.stop="startTransfer(task)" title="Transférer">↗</button>
      </div>
    </div>

    <div class="sm-eisen__header sm-eisen__header--left">⬇ Pas important</div>

    <!-- Q3: Urgent + Pas important = DELEGUER -->
    <div class="sm-eisen__quad sm-eisen__quad--q3"
      @dragover.prevent @drop="onDrop($event, 3)">
      <div class="sm-eisen__quad-label">🔵 Déléguer</div>
      <div v-for="task in q(3)" :key="task.id" class="sm-eisen__item" draggable="true" @dragstart="onDragStart($event, task)">
        <span class="sm-eisen__item-name">{{ task.name }}</span>
        <button class="sm-eisen__item-transfer" @click.stop="startTransfer(task)" title="Transférer">↗</button>
      </div>
    </div>

    <!-- Q4: Pas urgent + Pas important = ELIMINER -->
    <div class="sm-eisen__quad sm-eisen__quad--q4"
      @dragover.prevent @drop="onDrop($event, 4)">
      <div class="sm-eisen__quad-label">⚪ Éliminer</div>
      <div v-for="task in q(4)" :key="task.id" class="sm-eisen__item" draggable="true" @dragstart="onDragStart($event, task)">
        <span class="sm-eisen__item-name">{{ task.name }}</span>
        <button class="sm-eisen__item-transfer" @click.stop="startTransfer(task)" title="Transférer">↗</button>
      </div>
    </div>

    <!-- Transfer overlay -->
    <div v-if="transferringTask" class="sm-eisen__transfer-overlay" @click.self="transferringTask = null">
      <div class="sm-eisen__transfer-box">
        <h4>Transférer « {{ transferringTask.name }} »</h4>
        <div v-for="m in team" :key="m.id" class="sm-eisen__transfer-item" @click="doTransfer(m.id)">
          <span class="sm-eisen__transfer-avatar">{{ m.initials }}</span>
          {{ m.display_name || m.email }}
        </div>
        <button class="sm-eisen__transfer-cancel" @click="transferringTask = null">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  tasks: { type: Array, required: true },
  team: { type: Array, default: () => [] },
})

const emit = defineEmits(['update-quadrant', 'transfer'])

const transferringTask = ref(null)

function q(num) {
  return props.tasks.filter(t => t.quadrant === num)
}

let draggedTask = null
function onDragStart(e, task) {
  draggedTask = task
  e.dataTransfer.effectAllowed = 'move'
}
function onDrop(e, quadrant) {
  if (draggedTask && draggedTask.quadrant !== quadrant) {
    emit('update-quadrant', draggedTask.id, quadrant)
  }
  draggedTask = null
}

function startTransfer(task) {
  transferringTask.value = task
}
function doTransfer(memberId) {
  emit('transfer', transferringTask.value.id, memberId)
  transferringTask.value = null
}
</script>

<style scoped>
.sm-eisen {
  display: grid; grid-template-columns: 48px 1fr 1fr; grid-template-rows: 36px 1fr 36px 1fr;
  gap: 2px; font-family: 'DM Sans', sans-serif; min-height: 500px; position: relative;
}
.sm-eisen__corner { background: var(--sm-bg); }
.sm-eisen__header {
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: var(--sm-t2); background: var(--sm-bg);
}
.sm-eisen__header--left {
  writing-mode: vertical-lr; transform: rotate(180deg);
  font-size: 11px; padding: 8px 0;
}
.sm-eisen__quad {
  border-radius: 12px; padding: 12px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 6px;
}
.sm-eisen__quad--q1 { background: var(--sm-err-p); }
.sm-eisen__quad--q2 { background: var(--sm-ok-p); }
.sm-eisen__quad--q3 { background: var(--sm-info-p); }
.sm-eisen__quad--q4 { background: rgba(148,163,184,.08); }
.sm-eisen__quad-label { font-size: 12px; font-weight: 600; color: var(--sm-t2); margin-bottom: 4px; }
.sm-eisen__item {
  display: flex; align-items: center; gap: 6px;
  background: var(--sm-white); border: 1px solid var(--sm-bd); border-radius: 8px;
  padding: 8px 10px; font-size: 13px; color: var(--sm-t1); cursor: grab;
  transition: box-shadow .15s;
}
.sm-eisen__item:hover { box-shadow: var(--sm-sh); }
.sm-eisen__item:active { cursor: grabbing; }
.sm-eisen__item-name { flex: 1; }
.sm-eisen__item-transfer {
  border: none; background: none; font-size: 13px; color: var(--sm-t3); cursor: pointer;
  opacity: 0; transition: opacity .15s;
}
.sm-eisen__item:hover .sm-eisen__item-transfer { opacity: 1; }

/* Transfer overlay */
.sm-eisen__transfer-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,.2);
  display: flex; align-items: center; justify-content: center; z-index: 10;
  border-radius: 12px;
}
.sm-eisen__transfer-box {
  background: var(--sm-white); border-radius: var(--sm-r); padding: 16px;
  box-shadow: var(--sm-sh2); min-width: 220px;
}
.sm-eisen__transfer-box h4 {
  font-family: 'Cormorant Garamond', serif; font-size: 15px; color: var(--sm-t1);
  margin: 0 0 12px;
}
.sm-eisen__transfer-item {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px; border-radius: 6px; font-size: 13px; color: var(--sm-t1); cursor: pointer;
}
.sm-eisen__transfer-item:hover { background: var(--sm-bg); }
.sm-eisen__transfer-avatar {
  width: 24px; height: 24px; border-radius: 50%; font-size: 10px; font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  background: var(--sm-ai-p); color: var(--sm-ai);
}
.sm-eisen__transfer-cancel {
  border: none; background: none; color: var(--sm-t3); font-size: 12px;
  cursor: pointer; margin-top: 8px; width: 100%; text-align: center;
}
</style>
