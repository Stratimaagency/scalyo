<template>
  <div class="fade-in" style="max-width: 600px; margin: 0 auto">
    <AppCard v-if="!sent">
      <div style="text-align: center; margin-bottom: 20px">
        <div class="page-header__icon" style="margin: 0 auto 8px;">💬</div>
        <h1 class="page-header__title">{{ t('feedbackTitle') }}</h1>
      </div>

      <!-- Category -->
      <div class="field-group">
        <label class="field-label">{{ t('fbCat') }}</label>
        <div style="display: flex; gap: 6px; flex-wrap: wrap">
          <button v-for="c in categories" :key="c.key" class="chip" :class="{ active: form.category === c.key }" @click="form.category = c.key" style="display: flex; align-items: center; gap: 4px;">
            <ScalyoIcon :name="c.icon" :size="14" /> {{ c.label }}
          </button>
        </div>
      </div>

      <!-- Rating -->
      <div class="field-group">
        <label class="field-label">{{ t('fbGlobal') }}</label>
        <div style="display: flex; gap: 8px">
          <button v-for="r in 5" :key="r"
            @click="form.rating = r"
            style="width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); cursor: pointer; font-size: 16px; transition: all .15s"
            :style="{ background: form.rating >= r ? 'var(--tealBg)' : '', borderColor: form.rating >= r ? 'var(--tealBorder)' : '', color: form.rating >= r ? 'var(--teal)' : 'var(--muted)' }"
          >★</button>
        </div>
      </div>

      <!-- Description -->
      <AppField :label="t('fbDesc')" v-model="form.description" type="textarea" :rows="5" />

      <button class="btn btn-primary" style="width: 100%; justify-content: center" :disabled="!form.category || !form.rating || !form.description || submitting" @click="submit">
        {{ submitting ? t('saving') : t('fbSend') }}
      </button>
    </AppCard>

    <AppCard v-else style="text-align: center; padding: 40px">
      <div style="margin-bottom: 16px"><ScalyoIcon name="party" :size="52" /></div>
      <h3 style="font-weight: 800; margin-bottom: 8px">{{ t('fbSent') }}</h3>
      <p style="color: var(--muted); font-size: 13px; margin-bottom: 20px">{{ t('fbThanks') }}</p>
      <button class="btn btn-primary" @click="reset">{{ t('sendAnother') }}</button>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { feedbackApi } from '../api'
import { useI18n } from '../i18n'
import AppCard from '../components/AppCard.vue'
import AppField from '../components/AppField.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const sent = ref(false)
const submitting = ref(false)
const form = reactive({ category: '', rating: 0, description: '' })

const categories = computed(() => [
  { key: 'bug', label: t('feedbackBug'), icon: 'bug' },
  { key: 'feature', label: t('feedbackFeature'), icon: 'lightbulb' },
  { key: 'improvement', label: t('feedbackImprovement'), icon: 'chart-up' },
  { key: 'other', label: t('feedbackOther'), icon: 'chat' },
])

async function submit() {
  submitting.value = true
  try {
    await feedbackApi.create(form)
    sent.value = true
  } catch (e) {
    console.error('Failed to submit feedback:', e)
    alert(t('feedbackError'))
  }
  submitting.value = false
}

function reset() {
  form.category = ''
  form.rating = 0
  form.description = ''
  sent.value = false
}
</script>
