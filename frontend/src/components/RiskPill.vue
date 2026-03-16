<template>
  <span class="tag" :class="'risk-' + risk" style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em">
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'

const props = defineProps({ risk: { type: String, default: 'low' } })
const { lang } = useI18n()

const label = computed(() => {
  const labels = {
    critical: { fr: 'Critique', en: 'Critical', kr: '위험' },
    medium: { fr: 'Vigilance', en: 'Watch', kr: '주의' },
    low: { fr: 'Sain', en: 'Healthy', kr: '건강' },
  }
  return (labels[props.risk] || labels.low)[lang.value] || (labels[props.risk] || labels.low).fr
})
</script>
