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
        <div class="roi-main-result">
          <div class="roi-big">{{ roiSavings }}</div>
          <div class="roi-desc">{{ t('roi_saved') }}</div>
        </div>
        <div class="roi-details">
          <div class="roi-detail">
            <div class="roi-dl">{{ t('roi_time') }}</div>
            <div class="roi-dv green">{{ roiHours }}h</div>
          </div>
          <div class="roi-detail">
            <div class="roi-dl">{{ t('roi_multiplier') }}</div>
            <div class="roi-dv purple">x{{ roiMultiplier }}</div>
          </div>
        </div>
        <div class="roi-plan">
          <div class="roi-plan-label">{{ t('roi_recommendation') }}</div>
          <div class="roi-plan-value">{{ roiRecommendedPlan }}</div>
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

