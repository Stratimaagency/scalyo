<template>
  <section class="stats-section anim-section" data-anim="fade-up">
    <div class="container">
      <div class="stats-grid">
        <div v-for="(s, i) in statsData" :key="i" class="stat-card">
          <span class="stat-emoji emoji-3d">{{ s.icon }}</span>
          <div class="stat-number">{{ s.n }}</div>
          <div class="stat-label">{{ s.l }}</div>
          <div class="stat-note">{{ s.s }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  statsData: { type: Array, required: true }
})
</script>