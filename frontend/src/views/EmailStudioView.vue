<template>
  <div class="fade-in">
    <div class="mb-lg">
      <h3 style="font-weight: 800; margin-bottom: 4px">{{ t('email') }}</h3>
      <p style="font-size: 13px; color: var(--muted)">Pre-built CS email templates ready to customize and send</p>
    </div>

    <div v-if="!selectedTemplate" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px">
      <AppCard v-for="tpl in templates" :key="tpl.id" class="card-lift" style="cursor: pointer" @click="selectedTemplate = tpl">
        <div style="font-size: 24px; margin-bottom: 10px">✉️</div>
        <div style="font-weight: 800; margin-bottom: 4px">{{ tpl.name }}</div>
        <div style="font-size: 12px; color: var(--muted)">{{ tpl.subject }}</div>
      </AppCard>
    </div>

    <!-- Template editor -->
    <div v-else>
      <button class="btn btn-secondary mb-md" @click="selectedTemplate = null">← {{ t('back') }}</button>
      <AppCard>
        <h3 style="font-weight: 800; margin-bottom: 14px">{{ selectedTemplate.name }}</h3>
        <div class="field-group">
          <label class="field-label">Subject</label>
          <input v-model="selectedTemplate.subject" class="field-input" />
        </div>
        <div class="field-group">
          <label class="field-label">Body</label>
          <textarea v-model="selectedTemplate.body" class="field-input" rows="14" style="resize: vertical; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7"></textarea>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 14px">
          <button class="btn btn-primary" @click="copyTemplate">📋 Copy to clipboard</button>
          <button class="btn btn-secondary" @click="selectedTemplate = null">{{ t('close') }}</button>
        </div>
        <div v-if="copied" style="margin-top: 8px; color: var(--green); font-size: 13px; font-weight: 600">✅ Copied!</div>
      </AppCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { emailStudioApi } from '../api'
import { useI18n } from '../i18n'
import AppCard from '../components/AppCard.vue'

const { t, lang } = useI18n()
const templates = ref([])
const selectedTemplate = ref(null)
const copied = ref(false)

onMounted(async () => {
  try {
    const { data } = await emailStudioApi.getTemplates(lang.value)
    templates.value = data
  } catch {}
})

function copyTemplate() {
  const text = `Subject: ${selectedTemplate.value.subject}\n\n${selectedTemplate.value.body}`
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
