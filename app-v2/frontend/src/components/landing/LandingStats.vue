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
import { computed } from 'vue'
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()

const statsData = computed(() => [
  { n: '-34%', l: t('stat1'), s: t('stat1n'), icon: '📉' },
  { n: '+18%', l: t('stat2'), s: t('stat2n'), icon: '📈' },
  { n: '6h',   l: t('stat3'), s: t('stat3n'), icon: '⏱️' },
  { n: '30j',  l: t('stat4'), s: t('stat4n'), icon: '🔮' },
])
</script>

<style scoped>
/* ═══════════════════ STATS ═══════════════════ */
.stats-section { padding: 80px 0; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.stat-card { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 16px; padding: 28px 20px; text-align: center; transition: transform 0.3s, box-shadow 0.3s; }
.stat-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(124,58,237,0.12); }
.stat-emoji { margin-bottom: 12px; }
.stat-number { font-size: 2.6rem; font-weight: 800; background: linear-gradient(135deg, var(--lp-purple), var(--lp-purple-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 6px; }
.stat-label { font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
.stat-note { font-size: 0.78rem; color: var(--lp-muted); line-height: 1.5; }

</style>