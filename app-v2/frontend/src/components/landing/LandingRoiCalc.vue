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
            <label>{{ t('roi_lbl_arr') }}: <strong>&#8364;{{ roiArr.toLocaleString() }}</strong></label>
            <input type="range" v-model.number="roiArr" min="1000" max="100000" step="1000" />
          </div>
          <div class="roi-field">
            <label>{{ t('roi_lbl_churn') }}: <strong>{{ roiChurn }}%</strong></label>
            <input type="range" v-model.number="roiChurn" min="1" max="30" />
          </div>
        </div>

        <div class="roi-results">
          <div class="roi-card green">
            <div class="roi-card-value">&#8364;{{ roiSaved.toLocaleString() }}</div>
            <div class="roi-card-label">{{ t('roi_saved') }}</div>
          </div>
          <div class="roi-card blue">
            <div class="roi-card-value">{{ roiTimeSaved }}h</div>
            <div class="roi-card-label">{{ t('roi_time') }}</div>
          </div>
          <div class="roi-card purple">
            <div class="roi-card-value">x{{ roiMultiplier }}</div>
            <div class="roi-card-label">{{ t('roi_multiplier') }}</div>
          </div>
          <div class="roi-recommendation">
            {{ t('roi_recommendation') }} <strong>{{ roiRecommendedPlan }}</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  t: { type: Function, required: true }
})

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
  if (roiCsms.value <= 3) return props.t('roi_plan_starter')
  if (roiCsms.value <= 10) return props.t('roi_plan_growth')
  return props.t('roi_plan_elite')
})
</script>
<style scoped>
.roi-section { padding: 100px 24px; max-width: 1100px; margin: 0 auto; }
.roi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.roi-sliders { display: flex; flex-direction: column; gap: 28px; }
.roi-field label { display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 600; color: #1a1a2e; margin-bottom: 8px; }
.roi-field label span { color: #7c3aed; font-weight: 700; }
.roi-field input[type="range"] { width: 100%; accent-color: #7c3aed; height: 6px; -webkit-appearance: none; background: #e5e7eb; border-radius: 3px; outline: none; }
.roi-field input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #7c3aed; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(124,58,237,0.3); }
.roi-results { background: #fff; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 8px 32px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 20px; }
.roi-card { padding: 20px; border-radius: 14px; text-align: center; }
.roi-card.green { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
.roi-card.blue { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
.roi-card.purple { background: linear-gradient(135deg, #faf5ff, #ede9fe); }
.roi-card-value { font-size: 2rem; font-weight: 800; color: #1a1a2e; margin-bottom: 4px; }
.roi-card.green .roi-card-value { color: #166534; }
.roi-card.blue .roi-card-value { color: #1e40af; }
.roi-card.purple .roi-card-value { color: #7c3aed; }
.roi-card-label { font-size: 0.82rem; color: #6b7280; font-weight: 500; }
.roi-recommendation { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; border-radius: 14px; padding: 16px 20px; font-size: 0.9rem; text-align: center; }
.roi-recommendation strong { font-weight: 700; display: block; font-size: 1.05rem; margin-top: 4px; }
@media (max-width: 768px) {
  .roi-grid { grid-template-columns: 1fr; gap: 32px; }
}
</style>
