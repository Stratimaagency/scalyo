<template>
  <div class="mc-view">
    <h1>🎓 Masterclass</h1>
    <p class="mc-sub">Cours trimestriels complets pour développer votre expertise CS</p>

    <div class="mc-list">
      <div v-for="mc in store.masterclasses" :key="mc.id" class="mc-card" :class="{ 'is-new': mc.isNew }">
        <div class="mcc-header">
          <div>
            <span v-if="mc.isNew" class="mc-new">NOUVEAU {{ mc.quarter }}</span>
            <span v-else class="mc-quarter">{{ mc.quarter }}</span>
            <h2>{{ mc.title }}</h2>
          </div>
          <span class="mc-modules-count" v-if="mc.modules.length">{{ mc.modules.length }} modules</span>
        </div>

        <div v-if="mc.modules.length" class="mcc-modules">
          <div v-for="(mod, i) in mc.modules" :key="mod.id" class="mc-module">
            <div class="mcm-left">
              <span class="mcm-num">{{ i + 1 }}</span>
              <div>
                <strong>{{ mod.title }}</strong>
                <span class="mcm-meta">{{ mod.lessons }} leçons · {{ mod.exercises }} exercices</span>
              </div>
            </div>
            <span class="mcm-status" :class="{ done: mod.completed }">{{ mod.completed ? '✅' : '○' }}</span>
          </div>
        </div>

        <div v-else class="mcc-locked">
          <span>🔒</span> Contenu disponible prochainement
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useResourceStore } from '@/stores/resources'
const store = useResourceStore()
</script>

<style scoped>
.mc-view { max-width: 800px; }
.mc-view h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 4px; }
.mc-sub { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 28px; }
.mc-list { display: flex; flex-direction: column; gap: 20px; }
.mc-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
.mc-card.is-new { border-color: var(--purple-border); box-shadow: 0 0 0 1px rgba(124,58,237,0.08); }
.mcc-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px; }
.mcc-header h2 { font-size: 1.05rem; font-weight: 700; margin-top: 4px; }
.mc-new { font-size: 0.65rem; font-weight: 700; background: var(--purple); color: #fff; padding: 3px 10px; border-radius: 4px; }
.mc-quarter { font-size: 0.72rem; color: var(--text-muted); }
.mc-modules-count { font-size: 0.75rem; color: var(--text-muted); background: var(--bg); padding: 4px 12px; border-radius: 6px; white-space: nowrap; }
.mcc-modules { border-top: 1px solid var(--border-light); }
.mc-module { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; border-bottom: 1px solid var(--border-light); transition: background 0.15s; }
.mc-module:last-child { border-bottom: none; }
.mc-module:hover { background: var(--bg-hover); }
.mcm-left { display: flex; align-items: center; gap: 14px; }
.mcm-num { width: 28px; height: 28px; border-radius: 50%; background: var(--purple-bg); color: var(--purple); font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mcm-left strong { font-size: 0.88rem; display: block; }
.mcm-meta { font-size: 0.72rem; color: var(--text-muted); }
.mcm-status { font-size: 1rem; }
.mcm-status:not(.done) { color: var(--border); }
.mcc-locked { padding: 20px 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem; border-top: 1px solid var(--border-light); }
</style>
