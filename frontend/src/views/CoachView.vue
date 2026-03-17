<template>
  <div class="fade-in" style="max-width: 700px; margin: 0 auto">
    <AppCard>
      <div style="text-align: center; margin-bottom: 20px">
        <div style="margin-bottom: 8px"><ScalyoIcon name="robot" :size="36" /></div>
        <h3 style="font-weight: 800">{{ t('coachTitle') }}</h3>
        <p style="font-size: 13px; color: var(--muted)">{{ t('coachStatus') }}</p>
      </div>

      <!-- Messages -->
      <div ref="chatContainer" style="max-height: 500px; overflow-y: auto; margin-bottom: 14px; display: flex; flex-direction: column; gap: 10px; scroll-behavior: smooth">
        <div v-for="(msg, i) in messages" :key="i" :style="{ textAlign: msg.role === 'user' ? 'right' : 'left' }">
          <div style="display: inline-block; padding: 10px 14px; border-radius: 14px; max-width: 85%; font-size: 13px; line-height: 1.7; white-space: pre-wrap"
            :style="{
              background: msg.role === 'user' ? 'var(--tealBg)' : 'var(--surface)',
              color: msg.role === 'user' ? 'var(--teal)' : 'var(--text)',
              border: '1px solid ' + (msg.role === 'user' ? 'var(--tealBorder)' : 'var(--border)'),
            }"
          >{{ msg.content }}</div>
        </div>
        <div v-if="loading" style="color: var(--muted); font-size: 13px; display: flex; gap: 6px; align-items: center">
          <div class="spin" style="width: 14px; height: 14px; border-radius: 50%; border: 2px solid var(--border); border-top-color: var(--teal)"></div>
          {{ t('thinking') }}
        </div>
      </div>

      <!-- Quick suggestions -->
      <div v-if="!messages.length" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px">
        <button v-for="q in suggestions" :key="q" class="chip" @click="send(q)">{{ q }}</button>
      </div>

      <!-- Input -->
      <div style="display: flex; gap: 8px">
        <textarea
          v-model="input"
          class="chat-input"
          rows="1"
          :placeholder="t('coachPlaceholder')"
          @keydown.enter.prevent="send(input)"
        ></textarea>
        <button class="chat-send-btn" :disabled="!input.trim() || loading" @click="send(input)">→</button>
      </div>
    </AppCard>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { coachApi } from '../api'
import { useI18n } from '../i18n'
import AppCard from '../components/AppCard.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t, lang } = useI18n()
const messages = ref([])
const input = ref('')
const loading = ref(false)
const chatContainer = ref(null)

const suggestions = [
  'How to run an effective QBR?',
  'How to prevent churn early?',
  'How to structure a CS team?',
  'Best practices for onboarding',
  'How to calculate customer health score?',
]

async function send(text) {
  if (!text?.trim()) return
  messages.value.push({ role: 'user', content: text.trim() })
  input.value = ''
  loading.value = true
  await nextTick()
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  try {
    const { data } = await coachApi.chat(
      messages.value.map(m => ({ role: m.role, content: m.content })),
      'coach'
    )
    messages.value.push({ role: 'assistant', content: data.content })
  } catch (e) {
    messages.value.push({ role: 'assistant', content: t('errorAI') })
  }
  loading.value = false
  await nextTick()
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
}
</script>
