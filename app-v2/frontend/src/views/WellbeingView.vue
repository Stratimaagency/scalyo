<template>
  <div class="wellbeing-view">
    <div class="wb-header">
      <div><h1>💚 {{ t('wb_title') }}</h1><p class="wb-conf">🔒 {{ t('wb_confidential') }}</p></div>
      <div class="wb-gauge">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" stroke-width="10" /><circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="10" :stroke-dasharray="gaugeArc + ' 314.16'" stroke-linecap="round" transform="rotate(-90 60 60)" /><text x="60" y="65" text-anchor="middle" font-size="28" font-weight="800" fill="#10b981">{{ score }}</text></svg>
      </div>
    </div>

    <!-- Mood selector -->
    <div class="wb-section">
      <h2>{{ t('wb_how_feel') }}</h2>
      <div class="mood-grid">
        <button v-for="m in moods" :key="m.key" class="mood-btn" :class="{ active: selectedMood === m.key }" @click="selectedMood = m.key">
          <span class="mood-emoji">{{ m.emoji }}</span>
          <span class="mood-label">{{ t(m.labelKey) }}</span>
        </button>
      </div>
    </div>

    <div class="wb-grid">
      <!-- Left column -->
      <div class="wb-left">
        <!-- Score + Burnout + Charge -->
        <div class="wb-card">
          <div class="wb-metric"><span class="wbm-label">{{ t('wb_score') }}</span><div class="wbm-bar"><div class="wbm-fill green" :style="{ width: score + '%' }" /></div><span class="wbm-val green">{{ score }}/100</span></div>
          <div class="wb-metric"><span class="wbm-label">{{ t('wb_burnout') }}</span><span class="burnout-pill none">{{ t('wb_burnout_none') }}</span></div>
          <div class="wb-metric"><span class="wbm-label">{{ t('wb_charge') }}</span><div class="wbm-bar"><div class="wbm-fill green" :style="{ width: charge + '%' }" /></div><span class="wbm-val">{{ charge }}%</span></div>
        </div>

        <!-- Tip -->
        <div class="wb-card tip-card">
          <div class="tip-header"><h3>💡 {{ t('wb_tip_title') }}</h3><button class="tip-refresh" @click="refreshTip">🔄 {{ t('wb_tip_refresh') }}</button></div>
          <p class="tip-text">{{ tips[tipIndex] }}</p>
        </div>

        <!-- Week -->
        <div class="wb-card">
          <h3>{{ t('wb_your_week') }}</h3>
          <div class="week-row">
            <div v-for="(d, i) in weekDays" :key="i" class="week-day">
              <span class="wd-emoji">{{ weekMoods[i] || '—' }}</span>
              <span class="wd-label">{{ t(d) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="wb-right">
        <!-- Motivation cards -->
        <div class="motiv-grid">
          <div v-for="(c, i) in motivCards" :key="i" class="motiv-card" :class="'mc-' + i">
            <span class="mc-icon">{{ c.icon }}</span>
            <p>{{ t(c.key) }}</p>
          </div>
        </div>

        <!-- Nova AI -->
        <div class="wb-card nova-card">
          <h3>🤖 {{ t('wb_nova') }}</h3>
          <div class="nova-suggestions">
            <button v-for="s in novaSuggestions" :key="s" class="nova-sug" @click="novaInput = t(s)">{{ t(s) }}</button>
          </div>
          <div class="nova-input">
            <input v-model="novaInput" :placeholder="t('wb_nova_placeholder')" />
            <button class="nova-send">→</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Emergency -->
    <div class="wb-emergency">
      <h3>🚨 {{ t('wb_emergency') }} — {{ t('wb_emergency_desc') }}</h3>
      <div class="emergency-grid">
        <div class="em-item">🇫🇷 France — <strong>3114</strong> (24/7)</div>
        <div class="em-item">🇧🇪 Belgique — <strong>0800 32 123</strong></div>
        <div class="em-item">🇨🇭 Suisse — <strong>143</strong></div>
        <div class="em-item">🇨🇦 Canada — <strong>1-866-APPELLE</strong></div>
        <div class="em-item">🇺🇸 USA — <strong>988</strong></div>
        <div class="em-item">🇰🇷 한국 — <strong>1393</strong></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })

const score = ref(70)
const charge = ref(70)
const selectedMood = ref('normal')
const novaInput = ref('')
const tipIndex = ref(0)

const moods = [
  { key: 'exhausted', emoji: '😩', labelKey: 'wb_mood_exhausted' },
  { key: 'stressed', emoji: '😟', labelKey: 'wb_mood_stressed' },
  { key: 'attention', emoji: '🙂', labelKey: 'wb_mood_attention' },
  { key: 'normal', emoji: '😊', labelKey: 'wb_mood_normal' },
  { key: 'great', emoji: '😄', labelKey: 'wb_mood_great' },
]

const weekDays = ['wb_mon', 'wb_tue', 'wb_wed', 'wb_thu', 'wb_fri']
const weekMoods = ['😊', '😊', '😄', '🙂', '—']

const motivCards = [
  { key: 'wb_card1', icon: '💪' },
  { key: 'wb_card2', icon: '⭐' },
  { key: 'wb_card3', icon: '☕' },
  { key: 'wb_card4', icon: '🤝' },
]

const novaSuggestions = ['wb_nova_sug1', 'wb_nova_sug2', 'wb_nova_sug3', 'wb_nova_sug4', 'wb_nova_sug5']

const tips = [
  'Prenez 5 minutes pour respirer profondément entre deux calls.',
  'Bloquez 30 minutes sans réunion dans votre agenda chaque jour.',
  'Célébrez vos petites victoires — elles comptent autant que les grandes.',
  'Faites une promenade de 10 minutes après le déjeuner.',
  'Parlez à un collègue de quelque chose qui n\'est pas le travail.',
]

const gaugeArc = ref(((score.value / 100) * 314.16).toFixed(1))

function refreshTip() { tipIndex.value = (tipIndex.value + 1) % tips.length }
</script>

<style scoped>
.wellbeing-view { max-width: 1000px; }
.wb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.wb-header h1 { font-size: 1.5rem; font-weight: 800; }
.wb-conf { font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; }
.wb-gauge { width: 100px; height: 100px; }
.wb-gauge svg { width: 100%; height: 100%; }

.wb-section { margin-bottom: 24px; }
.wb-section h2 { font-size: 1rem; font-weight: 700; margin-bottom: 14px; }

.mood-grid { display: flex; gap: 10px; flex-wrap: wrap; }
.mood-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 18px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; flex: 1; min-width: 100px; }
.mood-btn:hover { border-color: var(--purple); transform: translateY(-2px); }
.mood-btn.active { border-color: var(--purple); background: var(--purple-bg); box-shadow: 0 0 0 2px rgba(124,58,237,0.15); }
.mood-emoji { font-size: 2rem; }
.mood-label { font-size: 0.72rem; color: var(--text-secondary); text-align: center; }

.wb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.wb-left, .wb-right { display: flex; flex-direction: column; gap: 14px; }
.wb-card { background: #fff; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 18px; }
.wb-card h3 { font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; }

.wb-metric { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.wb-metric:last-child { margin-bottom: 0; }
.wbm-label { font-size: 0.78rem; color: var(--text-secondary); min-width: 100px; }
.wbm-bar { flex: 1; height: 8px; background: var(--border-light); border-radius: 4px; overflow: hidden; }
.wbm-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }
.wbm-fill.green { background: var(--green); }
.wbm-val { font-size: 0.82rem; font-weight: 600; min-width: 50px; text-align: right; }
.wbm-val.green { color: var(--green); }
.burnout-pill { font-size: 0.78rem; font-weight: 600; padding: 3px 12px; border-radius: 6px; }
.burnout-pill.none { background: var(--green-bg); color: var(--green); }

.tip-card { background: linear-gradient(135deg, #fefce8, #fef9c3); border-color: #fde68a; }
.tip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.tip-header h3 { margin-bottom: 0; }
.tip-refresh { background: none; border: none; font-size: 0.75rem; color: var(--text-muted); cursor: pointer; }
.tip-refresh:hover { color: var(--text); }
.tip-text { font-size: 0.88rem; line-height: 1.6; color: #92400e; font-style: italic; }

.week-row { display: flex; gap: 8px; }
.week-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px; background: var(--bg); border-radius: var(--radius-sm); }
.wd-emoji { font-size: 1.4rem; }
.wd-label { font-size: 0.68rem; color: var(--text-muted); font-weight: 600; }

.motiv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.motiv-card { padding: 16px; border-radius: var(--radius-md); display: flex; align-items: center; gap: 10px; color: #fff; }
.mc-icon { font-size: 1.5rem; }
.motiv-card p { font-size: 0.82rem; font-weight: 500; line-height: 1.4; }
.mc-0 { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.mc-1 { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
.mc-2 { background: linear-gradient(135deg, #10b981, #34d399); }
.mc-3 { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #1a1a2e; }

.nova-card { }
.nova-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.nova-sug { background: var(--purple-bg); border: 1px solid var(--purple-border); color: var(--purple); padding: 6px 12px; border-radius: 999px; font-size: 0.75rem; cursor: pointer; transition: all 0.15s; }
.nova-sug:hover { background: var(--purple); color: #fff; }
.nova-input { display: flex; gap: 8px; }
.nova-input input { flex: 1; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; outline: none; }
.nova-input input:focus { border-color: var(--purple); }
.nova-send { background: var(--purple); color: #fff; border: none; border-radius: var(--radius-sm); padding: 9px 16px; font-size: 1rem; cursor: pointer; }

.wb-emergency { background: #fff; border: 1px solid var(--red-border); border-radius: var(--radius-md); padding: 20px; }
.wb-emergency h3 { font-size: 0.9rem; font-weight: 700; color: var(--red); margin-bottom: 14px; }
.emergency-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.em-item { font-size: 0.82rem; padding: 10px; background: var(--red-bg); border-radius: var(--radius-sm); }
.em-item strong { color: var(--red); }

@media (max-width: 768px) {
  .wb-grid { grid-template-columns: 1fr; }
  .mood-grid { flex-direction: row; overflow-x: auto; flex-wrap: nowrap; }
  .mood-btn { min-width: 80px; flex: none; }
  .motiv-grid { grid-template-columns: 1fr; }
  .emergency-grid { grid-template-columns: 1fr; }
}
</style>
