<template>
    <section id="roi" class="roi-section">
      <div class="container">
        <div class="section-header anim-section" data-anim="fade-up">
          <span class="section-tag">{{ t('roi_tag') }}</span>
          <h2 v-html="t('roi_h2')"></h2>
          <p class="section-sub">{{ t('roi_sub') }}</p>
        </div>

        <div class="roi-grid anim-section" data-anim="fade-up">
          <div class="roi-sliders">
            <div class="roi-field">
              <label>{{ t('roi_lbl_csm') }}: <strong>{{ roiCsms }}</strong></label>
              <input type="range" v-model.number="roiCsms" min="1" max="50" />
            </div>
            <div class="roi-field">
              <label>{{ t('roi_lbl_acc') }}: <strong>{{ roiAcc }}</strong></label>
              <input type="range" v-model.number="roiAcc" min="5" max="200" />
            </div>
            <div class="roi-field">
              <label>{{ t('roi_lbl_arr') }}: <strong>€{{ roiArr.toLocaleString() }}</strong></label>
              <input type="range" v-model.number="roiArr" min="1000" max="100000" step="1000" />
            </div>
            <div class="roi-field">
              <label>{{ t('roi_lbl_churn') }}: <strong>{{ roiChurn }}%</strong></label>
              <input type="range" v-model.number="roiChurn" min="1" max="30" />
            </div>
          </div>

          <div class="roi-results">
            <div class="roi-main-result">
              <span class="roi-big">€{{ roiSaved.toLocaleString() }}</span>
              <span class="roi-desc">{{ t('roi_main_label') }}</span>
            </div>
            <div class="roi-details">
              <div class="roi-detail"><span class="roi-dl">{{ t('roi_arr') }}</span><span class="roi-dv">€{{ roiTotalArr.toLocaleString() }}</span></div>
              <div class="roi-detail"><span class="roi-dl">{{ t('roi_cost') }}</span><span class="roi-dv red">€{{ roiChurnCost.toLocaleString() }}</span></div>
              <div class="roi-detail"><span class="roi-dl">{{ t('roi_time') }}</span><span class="roi-dv green">{{ roiTimeSaved }}h</span></div>
              <div class="roi-detail"><span class="roi-dl">{{ t('roi_mult') }}</span><span class="roi-dv purple">{{ roiMultiplier }}x</span></div>
            </div>
            <div class="roi-plan">
              <span class="roi-plan-label">{{ t('roi_plan_rec') }}:</span>
              <span class="roi-plan-value">{{ roiRecommendedPlan }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()

const roiCsms = ref(5)
const roiAcc = ref(30)
const roiArr = ref(15000)
const roiChurn = ref(12)

const roiTotalArr = computed(() => roiCsms.value * roiAcc.value * roiArr.value)
const roiChurnCost = computed(() => Math.round(roiTotalArr.value * roiChurn.value / 100))
const roiSaved = computed(() => Math.round(roiChurnCost.value * 0.3))
const roiTimeSaved = computed(() => roiCsms.value * 6)
const roiMultiplier = computed(() => {
  const cost = roiCsms.value <= 3 ? 97 : roiCsms.value <= 10 ? 297 : 697
  return Math.max(1, Math.round(roiSaved.value / (cost * 12)))
})
const roiRecommendedPlan = computed(() => {
  if (roiCsms.value <= 3) return t('roi_plan_starter')
  if (roiCsms.value <= 10) return t('roi_plan_growth')
  return t('roi_plan_elite')
})
</script>

<style scoped>
/* ═══════════════════ ROI ═══════════════════ */
.roi-section { padding: 80px 0; background: var(--lp-bg2); }
.roi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.roi-sliders { display: flex; flex-direction: column; gap: 24px; }
.roi-field label { display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 10px; }
.roi-field label strong { color: var(--lp-purple-light); }
.roi-field input[type="range"] { width: 100%; height: 6px; -webkit-appearance: none; background: var(--lp-border); border-radius: 3px; outline: none; }
.roi-field input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--lp-purple); cursor: pointer; box-shadow: 0 0 12px rgba(124,58,237,0.5); }
.roi-results { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 20px; padding: 28px; }
.roi-main-result { text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--lp-border); }
.roi-big { display: block; font-size: 2.8rem; font-weight: 800; background: linear-gradient(135deg, var(--lp-green), #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
.roi-desc { font-size: 0.85rem; color: var(--lp-muted); }
.roi-details { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.roi-detail { display: flex; justify-content: space-between; font-size: 0.85rem; }
.roi-dl { color: var(--lp-muted); }
.roi-dv { font-weight: 600; }
.roi-dv.red { color: var(--lp-red); }
.roi-dv.green { color: var(--lp-green); }
.roi-dv.purple { color: var(--lp-purple-light); }
.roi-plan { background: rgba(124,58,237,0.08); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
.roi-plan-label { color: var(--lp-muted); }
.roi-plan-value { color: var(--lp-purple-light); font-weight: 600; }

</style>