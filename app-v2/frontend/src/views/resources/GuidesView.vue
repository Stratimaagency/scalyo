<template>
  <div class="guides-view">
    <h1>📖 Guides & Process</h1>
    <p class="gv-sub">Process complets illustrés pour chaque situation CS</p>

    <div class="gv-sections">
      <div v-for="section in sections" :key="section.title" class="gv-section">
        <h2>{{ section.icon }} {{ section.title }}</h2>
        <div class="gv-grid">
          <div v-for="g in section.items" :key="g.id" class="gv-card">
            <span class="gvc-icon">{{ g.icon }}</span>
            <div class="gvc-body">
              <strong>{{ g.title }}</strong>
              <p>{{ g.desc }}</p>
              <span class="gvc-steps">{{ g.steps }} étapes</span>
            </div>
            <button class="btn-arrow">→</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useResourceStore } from '@/stores/resources'
const store = useResourceStore()

const sections = computed(() => [
  { title: 'Gestion Client', icon: '👤', items: store.guides.filter(g => g.category === 'client') },
  { title: 'Organisation', icon: '📅', items: store.guides.filter(g => g.category === 'organization') },
  { title: 'COPIL', icon: '📊', items: store.guides.filter(g => g.category === 'copil') },
  { title: 'Management transverse', icon: '🤝', items: store.guides.filter(g => g.category === 'management') },
])
</script>

<style scoped>
.guides-view { max-width: 1000px; }
.guides-view h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
.gv-sub { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 28px; }
.gv-sections { display: flex; flex-direction: column; gap: 28px; }
.gv-section h2 { font-size: 1rem; font-weight: 700; margin-bottom: 12px; }
.gv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.gv-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; display: flex; gap: 12px; align-items: flex-start; transition: all 0.2s; }
.gv-card:hover { box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.gvc-icon { font-size: 1.5rem; flex-shrink: 0; }
.gvc-body { flex: 1; min-width: 0; }
.gvc-body strong { font-size: 0.88rem; display: block; margin-bottom: 4px; }
.gvc-body p { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 6px; }
.gvc-steps { font-size: 0.68rem; color: var(--purple); background: var(--purple-bg); padding: 2px 8px; border-radius: 4px; }
.btn-arrow { background: none; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer; flex-shrink: 0; padding: 4px; }
.btn-arrow:hover { color: var(--purple); }
@media (max-width: 768px) { .gv-grid { grid-template-columns: 1fr; } }
</style>
