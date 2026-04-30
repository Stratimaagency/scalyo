<template>
  <div class="ai-insight-panel" :class="{ expanded: !!content }">
    <div class="aip-header">
      <span class="aip-icon">✦</span>
      <span class="aip-title">{{ title || t('ai_insights') }}</span>
      <button class="aip-btn" @click="analyze" :disabled="loading">
        {{ loading ? t('ai_loading') : buttonLabel || t('ai_analyze') }}
      </button>
    </div>
    <div v-if="loading" class="aip-loading">
      <div class="aip-thinking"><span /><span /><span /></div>
      <span class="aip-loading-text">{{ t('ai_thinking') }}</span>
    </div>
    <div v-else-if="error" class="aip-error">
      <span>⚠️ {{ error }}</span>
      <button class="aip-retry" @click="analyze">{{ t('ai_retry') }}</button>
    </div>
    <div v-else-if="content" class="aip-content" v-html="formatContent(content)" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { askScalyoAI } from '@/utils/askScalyoAI'
import { sanitizeHtml } from '@/utils/sanitize'

const props = defineProps({
  module: { type: String, required: true },
  title: { type: String, default: '' },
  buttonLabel: { type: String, default: '' },
  message: { type: String, default: '' },
  context: { type: Object, default: () => ({}) },
  autoRun: { type: Boolean, default: false },
})

const emit = defineEmits(['result', 'error'])

const { t, locale } = useI18n({ useScope: 'global' })
const loading = ref(false)
const error = ref(null)
const content = ref(null)

async function analyze() {
  loading.value = true
  error.value = null
  try {
    const result = await askScalyoAI({
      module: props.module,
      message: props.message || t('ai_default_prompt_' + props.module) || 'Analyse',
      context: props.context,
      lang: locale.value,
    })
    content.value = result.response || result.reply || result.content || ''
    emit('result', result)
  } catch (e) {
    error.value = e.message || t('ai_error')
    emit('error', e)
  } finally {
    loading.value = false
  }
}

function formatContent(text) {
  const html = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
  return sanitizeHtml(html)
}

function reset() {
  content.value = null
  error.value = null
}

defineExpose({ analyze, reset })

if (props.autoRun) analyze()
</script>

<style scoped>
.ai-insight-panel {
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  border: 1px solid #e9d5ff;
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.3s ease;
}
.aip-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.aip-icon {
  color: #7c3aed;
  font-size: 1rem;
}
.aip-title {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 700;
  color: #4c1d95;
}
.aip-btn {
  background: #7c3aed;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.aip-btn:hover:not(:disabled) { background: #6d28d9; }
.aip-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.aip-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
}
.aip-thinking {
  display: flex;
  gap: 4px;
}
.aip-thinking span {
  width: 6px;
  height: 6px;
  background: #7c3aed;
  border-radius: 50%;
  animation: aip-bounce 1.4s infinite;
}
.aip-thinking span:nth-child(2) { animation-delay: 0.2s; }
.aip-thinking span:nth-child(3) { animation-delay: 0.4s; }
@keyframes aip-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}
.aip-loading-text {
  font-size: 0.78rem;
  color: #6d28d9;
  font-style: italic;
}
.aip-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: 8px;
  font-size: 0.82rem;
  color: #dc2626;
}
.aip-retry {
  background: none;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
}
.aip-content {
  margin-top: 14px;
  padding: 14px 16px;
  background: #fff;
  border-radius: 10px;
  font-size: 0.85rem;
  line-height: 1.65;
  color: #1e1b4b;
}
.aip-content :deep(strong) { color: #4c1d95; }
</style>
