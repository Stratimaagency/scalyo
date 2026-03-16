<template>
  <div class="empty-state">
    <div class="empty-state-icon">{{ icon }}</div>
    <div class="empty-state-title">{{ title }}</div>
    <div v-if="desc" class="empty-state-desc">{{ desc }}</div>
    <button v-if="action" class="btn btn-primary" style="margin-top: 12px" @click="$emit('action')">
      {{ action }}
    </button>
  </div>
</template>

<script setup>
defineProps({ icon: { type: String, default: '📭' }, title: String, desc: String, action: String })
defineEmits(['action'])
</script>
