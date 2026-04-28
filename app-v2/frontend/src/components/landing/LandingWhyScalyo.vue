<template>
    <section class="why-section anim-section" data-anim="fade-up">
      <div class="container">
        <div class="section-header">
          <h2>{{ t('sell_title') }}</h2>
          <p class="section-sub">{{ t('sell_subtitle') }}</p>
        </div>
        <div class="sell-grid">
          <div v-for="(s, i) in sellingPoints" :key="i" class="sell-card">
            <span class="sell-icon emoji-3d">{{ s.icon }}</span>
            <h4>{{ s.label }}</h4>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─────────────────── PRICING ─────────────────── -->
</template>

<script setup>
import { computed } from 'vue'
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()

const sellingPoints = computed(() => [
  { icon: '🔗', label: t('sell_1_label'), desc: t('sell_1_desc') },
  { icon: '⚡', label: t('sell_2_label'), desc: t('sell_2_desc') },
  { icon: '🛡️', label: t('sell_3_label'), desc: t('sell_3_desc') },
  { icon: '🤖', label: t('sell_4_label'), desc: t('sell_4_desc') },
  { icon: '💚', label: t('sell_5_label'), desc: t('sell_5_desc') },
  { icon: '💎', label: t('sell_6_label'), desc: t('sell_6_desc') },
  { icon: '🧩', label: t('sell_7_label'), desc: t('sell_7_desc') },
  { icon: '🌍', label: t('sell_8_label'), desc: t('sell_8_desc') },
])
</script>

<style scoped>
/* ═══════════════════ WHY SCALYO ═══════════════════ */
.why-section { padding: 80px 0; background: var(--lp-bg2); }
.sell-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 36px; }
.sell-card { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 16px; padding: 24px; transition: all 0.3s; }
.sell-card:hover { border-color: var(--lp-purple); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(124,58,237,0.1); }
.sell-icon { margin-bottom: 12px; font-size: 1.8rem; }
.sell-card h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; }
.sell-card p { font-size: 0.82rem; color: var(--lp-muted); line-height: 1.6; }

</style>