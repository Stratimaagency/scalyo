<template>
  <div class="sm-subtask" :class="{ 'sm-subtask--done': subtask.done }">
    <label class="sm-subtask__check">
      <input type="checkbox" :checked="subtask.done" @change="$emit('toggle', subtask.id)" />
      <span class="sm-subtask__box">
        <svg v-if="subtask.done" width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
      </span>
    </label>
    <span class="sm-subtask__name">{{ subtask.name }}</span>
    <button class="sm-subtask__del" @click.stop="$emit('delete', subtask.id)" title="Supprimer">&times;</button>
  </div>
</template>

<script setup>
defineProps({
  subtask: { type: Object, required: true },
})
defineEmits(['toggle', 'delete'])
</script>

<style scoped>
.sm-subtask {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 8px 4px 28px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--sm-t2);
  transition: opacity .2s;
}
.sm-subtask--done { opacity: .5; }
.sm-subtask--done .sm-subtask__name { text-decoration: line-through; }
.sm-subtask__check { display: flex; align-items: center; cursor: pointer; }
.sm-subtask__check input { display: none; }
.sm-subtask__box {
  width: 16px; height: 16px; border-radius: 4px;
  border: 1.5px solid var(--sm-bd2);
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.sm-subtask--done .sm-subtask__box {
  background: var(--sm-ok); border-color: var(--sm-ok);
}
.sm-subtask__name { flex: 1; min-width: 0; }
.sm-subtask__del {
  opacity: 0; border: none; background: none; color: var(--sm-t3);
  font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1;
}
.sm-subtask:hover .sm-subtask__del { opacity: 1; }
</style>
