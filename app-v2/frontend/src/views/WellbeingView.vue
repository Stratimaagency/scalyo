<template>
  <div class="wb-view">
    <h1>\u{1F49A} {{ t('wb_title') }}</h1>
    <div class="wb-privacy">
      <span>\u{1F512}</span>
      <span>{{ t('wb_confidential') }}</span>
    </div>

    <WbMoodPicker @mood-selected="onMoodSelected" />

    <WbBreathing :mood="store.mood" />

    <WbTrends />

    <WbNovaChat />

    <WbEmergency />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useWellbeingStore } from '@/stores/wellbeing'
import WbMoodPicker from '@/components/wellbeing/WbMoodPicker.vue'
import WbBreathing from '@/components/wellbeing/WbBreathing.vue'
import WbNovaChat from '@/components/wellbeing/WbNovaChat.vue'
import WbTrends from '@/components/wellbeing/WbTrends.vue'
import WbEmergency from '@/components/wellbeing/WbEmergency.vue'
import '@/assets/wellbeing.css'

const { t } = useI18n({ useScope: 'global' })
const store = useWellbeingStore()

function onMoodSelected(mood) {
  // Scroll to micro-action if triggered
  const el = document.querySelector('.micro-action-card')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

onMounted(() => store.init())
</script>
