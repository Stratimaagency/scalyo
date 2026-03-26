<template>
  <div class="fade-in" style="display: flex; height: 100%; overflow: hidden; gap: 0">
    <!-- ═══ LEFT: Main content area ═══ -->
    <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; border-right: 1px solid var(--border)">

      <!-- Header bar with Nova branding -->
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; background: var(--bg1)">
        <div style="width: 42px; height: 42px; background: var(--green); border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 2px 8px rgba(125,155,138,0.14)">
          💚
        </div>
        <div style="flex: 1">
          <div style="font-weight: 800; font-size: 15px">Nova — {{ t('wellbeing') }}</div>
          <div style="font-size: 11px; color: var(--muted); display: flex; align-items: center; gap: 6px">
            <span class="pulse" style="width: 6px; height: 6px; border-radius: 50%; background: var(--green)"></span>
            {{ t('wbConf') }}
          </div>
        </div>
        <span style="font-size: 11px; padding: 3px 10px; border-radius: 20px; background: var(--greenBg); color: var(--green); border: 1px solid var(--greenBorder); font-weight: 700">
          🔒
        </span>
      </div>

      <!-- Tab bar -->
      <div class="tab-bar" style="padding: 0 20px; border-bottom: 1px solid var(--border); background: var(--bg1)">
        <button class="tab-item" :class="{ active: tab === 'overview' }" @click="tab = 'overview'" style="display: flex; align-items: center; gap: 5px">
          <ScalyoIcon name="heart" :size="15" /> {{ t('wellbeing') }}
        </button>
        <button class="tab-item" :class="{ active: tab === 'nova' }" @click="tab = 'nova'" style="display: flex; align-items: center; gap: 5px">
          <ScalyoIcon name="meditation" :size="15" /> Nova AI
        </button>
        <button class="tab-item" :class="{ active: tab === 'coaching' }" @click="tab = 'coaching'" style="display: flex; align-items: center; gap: 5px">
          <ScalyoIcon name="book" :size="15" /> Coaching
        </button>
      </div>

      <!-- ═══ TAB 1: Team Wellbeing Overview ═══ -->
      <div v-if="tab === 'overview'" style="flex: 1; overflow-y: auto; padding: 20px">

        <!-- Score / Burnout / Charge indicators -->
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
          <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 12px; color: var(--muted)">💚 {{ t('wellbeingScore') }}</span>
            <span style="font-size: 15px; font-weight: 900" :style="{ color: scoreColor }">{{ wbData.score }}/100</span>
          </div>
          <div style="padding: 4px 0">
            <input
              type="range" min="0" max="100" :value="wbData.score"
              @input="saveWellbeing({ score: parseInt($event.target.value) })"
              style="width: 100%; accent-color: var(--teal); cursor: pointer"
            />
          </div>
          <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 12px; color: var(--muted)">🧠 {{ t('burnoutRisk') }}</span>
            <span style="font-size: 12px; font-weight: 800" :style="{ color: burnoutColor }">{{ burnoutLabel }}</span>
          </div>
          <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 12px; color: var(--muted)">⚡ {{ t('workload') }}</span>
            <span style="font-size: 15px; font-weight: 900" :style="{ color: wbData.charge > 85 ? 'var(--red)' : wbData.charge > 70 ? 'var(--amber)' : 'var(--green)' }">{{ wbData.charge }}%</span>
          </div>
        </div>

        <!-- Per-CSM detail cards -->
        <template v-if="team.length > 0">
          <div style="font-size: 12px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px">
            {{ t('wbDetail') }}
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
            <AppCard
              v-for="(member, i) in team" :key="i"
              :danger="(member.charge || 70) > 85"
              style="padding: 12px 14px"
            >
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px">
                <div
                  class="avatar"
                  :style="{
                    width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                    background: (member.charge || 70) > 85 ? 'var(--redBg)' : (member.charge || 70) > 70 ? 'var(--amberBg)' : 'var(--tealBg)',
                    border: '1px solid ' + ((member.charge || 70) > 85 ? 'var(--redBorder)' : (member.charge || 70) > 70 ? 'var(--amberBorder)' : 'var(--tealBorder)'),
                    color: (member.charge || 70) > 85 ? 'var(--red)' : (member.charge || 70) > 70 ? 'var(--amber)' : 'var(--teal)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800
                  }"
                >
                  {{ (member.name || '?')[0] }}
                </div>
                <div>
                  <div style="font-weight: 800; font-size: 13px">{{ member.name }}</div>
                  <div style="font-size: 10px; color: var(--muted)">{{ member.accounts || 0 }} {{ t('accounts') }}</div>
                </div>
                <span
                  style="margin-left: auto; font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: 700"
                  :style="{
                    background: (member.charge || 70) > 85 ? 'var(--redBg)' : (member.charge || 70) > 70 ? 'var(--amberBg)' : 'var(--greenBg)',
                    color: (member.charge || 70) > 85 ? 'var(--red)' : (member.charge || 70) > 70 ? 'var(--amber)' : 'var(--green)',
                    border: '1px solid ' + ((member.charge || 70) > 85 ? 'var(--redBorder)' : (member.charge || 70) > 70 ? 'var(--amberBorder)' : 'var(--greenBorder)')
                  }"
                >
                  {{ (member.charge || 70) > 85 ? '⚠ Overload' : (member.charge || 70) > 70 ? 'Caution' : 'Healthy' }}
                </span>
              </div>
              <HealthBar :val="100 - (member.charge || 70)" />
              <div style="display: flex; justify-content: space-between; margin-top: 5px">
                <span style="font-size: 10px; color: var(--muted)">{{ t('workload') }}: {{ member.charge || 70 }}%</span>
                <span
                  style="font-size: 10px"
                  :style="{ color: (member.sat || 7) >= 8 ? 'var(--green)' : (member.sat || 7) >= 6 ? 'var(--amber)' : 'var(--red)' }"
                >
                  Sat: {{ member.sat || 7 }}/10
                </span>
              </div>
              <!-- Team member list -->
              <div v-if="member.members?.length" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border)">
                <div v-for="(tm, j) in member.members" :key="j" style="font-size: 11px; color: var(--muted); padding: 2px 0">
                  • {{ tm }}
                </div>
              </div>
            </AppCard>
          </div>
        </template>
        <EmptyState v-else icon="people" :title="t('noTeamData')" :desc="t('noTeamDataDesc')" />

        <!-- Manage my workload section -->
        <AppCard style="margin-top: 8px">
          <h4 style="font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 6px">
            🔋 {{ t('wbManage') }}
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px">
            <div style="font-size: 12px; color: var(--muted); line-height: 1.7; padding: 8px 12px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border)">
              • {{ t('wbDecompress') }} — {{ t('trackWorkload') }}
            </div>
            <div style="font-size: 12px; color: var(--muted); line-height: 1.7; padding: 8px 12px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border)">
              • {{ t('wbTalkSomeone') }} — {{ t('wbHelpline') }}
            </div>
          </div>
        </AppCard>
      </div>

      <!-- ═══ TAB 2: Nova AI Chat ═══ -->
      <template v-if="tab === 'nova'">
        <!-- Chat messages area -->
        <div ref="chatContainer" style="flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px">
          <div v-for="(msg, i) in messages" :key="i" :style="{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '10px' }">
            <!-- Nova avatar for assistant messages -->
            <div v-if="msg.role === 'assistant'" style="width: 32px; height: 32px; border-radius: 12px; flex-shrink: 0; background: var(--green); display: flex; align-items: center; justify-content: center; font-size: 16px; align-self: flex-end">
              💚
            </div>
            <!-- Message bubble -->
            <div
              :style="{
                maxWidth: '76%',
                background: msg.role === 'user' ? 'var(--tealBg)' : 'var(--bg2)',
                border: '1px solid ' + (msg.role === 'user' ? 'var(--tealBorder)' : 'var(--border)'),
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '12px 16px',
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--text)',
                whiteSpace: 'pre-wrap'
              }"
            >{{ msg.content }}</div>
          </div>
          <!-- Typing indicator -->
          <div v-if="sending" style="display: flex; gap: 10px; align-items: flex-end; margin-bottom: 8px">
            <div style="width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0; background: var(--green); display: flex; align-items: center; justify-content: center; font-size: 16px">💚</div>
            <div style="background: var(--greenBg); border: 1px solid var(--greenBorder); border-radius: 16px 16px 16px 4px; padding: 12px 16px; display: flex; gap: 6px; align-items: center">
              <span class="bounce-dot" style="width: 7px; height: 7px; background: #4DAB6D; border-radius: 50%; display: inline-block"></span>
              <span class="bounce-dot" style="width: 7px; height: 7px; background: #4DAB6D; border-radius: 50%; display: inline-block; animation-delay: 0.2s"></span>
              <span class="bounce-dot" style="width: 7px; height: 7px; background: #4DAB6D; border-radius: 50%; display: inline-block; animation-delay: 0.4s"></span>
            </div>
          </div>
          <div ref="bottomRef"></div>
        </div>

        <!-- Quick suggestion chips -->
        <div style="padding: 10px 20px 0; display: flex; gap: 6px; flex-wrap: wrap">
          <button
            v-for="(q, i) in quickChips" :key="i"
            @click="sendNova(q)"
            style="font-size: 11px; padding: 5px 12px; border-radius: 20px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); cursor: pointer"
          >{{ q }}</button>
        </div>

        <!-- Confidentiality notice -->
        <div style="padding: 6px 20px 0; font-size: 10px; color: var(--muted); text-align: center">
          🔒 {{ t('wbConf') }}
        </div>

        <!-- Input area -->
        <div style="padding: 12px 20px; border-top: 1px solid var(--border); display: flex; gap: 10px">
          <input
            v-model="novaInput"
            @keydown.enter="sendNova(novaInput)"
            :placeholder="t('wellbeingPlaceholder')"
            style="flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 11px; padding: 12px 16px; color: var(--text); font-size: 13px"
          />
          <button
            @click="sendNova(novaInput)"
            :disabled="!novaInput.trim() || sending"
            style="padding: 12px 18px; border-radius: 11px; background: var(--green); color: #fff; font-size: 14px; border: none; cursor: pointer"
            :style="{ opacity: (!novaInput.trim() || sending) ? 0.5 : 1 }"
          >→</button>
        </div>
      </template>

      <!-- ═══ TAB 3: Coaching Resources ═══ -->
      <div v-if="tab === 'coaching'" style="flex: 1; overflow-y: auto; padding: 20px">

        <!-- Session booking CTA -->
        <AppCard glow style="margin-bottom: 16px; text-align: center; padding: 28px 20px">
          <div style="margin-bottom: 10px"><ScalyoIcon name="star" :size="36" /></div>
          <h3 style="font-weight: 800; margin-bottom: 6px">{{ t('wbBookSession') }}</h3>
          <p style="font-size: 12px; color: var(--muted); margin-bottom: 16px">{{ t('wbBookHow') }}</p>
          <button
            class="btn btn-primary"
            style="padding: 10px 24px; border-radius: 10px; font-weight: 700; font-size: 13px"
            @click="novaInput = t('wbBookSession'); sendNova(t('wbBookSession'))"
          >
            {{ t('wbBookSession') }} →
          </button>
        </AppCard>

        <!-- What you get -->
        <AppCard style="margin-bottom: 12px">
          <h4 style="font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 6px">
            <ScalyoIcon name="lightbulb" :size="16" />
            {{ t('wbGetTitle') }}
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <div v-for="(feat, i) in coachingFeatures" :key="i" style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border)">
              <span style="font-size: 16px">{{ feat.icon }}</span>
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--text)">{{ feat.title }}</div>
                <div style="font-size: 11px; color: var(--muted)">{{ feat.desc }}</div>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Weekly KPI format -->
        <AppCard style="margin-bottom: 12px">
          <h4 style="font-weight: 800; margin-bottom: 8px">📊 {{ t('wbKpiWeekly') }}</h4>
          <p style="font-size: 12px; color: var(--muted); line-height: 1.7">
            {{ t('wbFormat') }}
          </p>
        </AppCard>

        <!-- Follow-up info -->
        <AppCard style="margin-bottom: 12px">
          <h4 style="font-weight: 800; margin-bottom: 8px">📅 {{ t('wbFollowUp') }}</h4>
          <div style="display: flex; flex-direction: column; gap: 6px">
            <div style="font-size: 12px; color: var(--muted); line-height: 1.7; padding: 8px 12px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border)">
              • Monthly: performance review + goal adjustment
            </div>
            <div style="font-size: 12px; color: var(--muted); line-height: 1.7; padding: 8px 12px; background: var(--surface); border-radius: 8px; border: 1px solid var(--border)">
              • Quarterly: deep-dive session + career development
            </div>
          </div>
        </AppCard>

        <!-- Helpline info -->
        <AppCard>
          <h4 style="font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 6px">
            💬 {{ t('wbTalkSomeone') }}
          </h4>
          <p style="font-size: 12px; color: var(--muted); line-height: 1.7; margin-bottom: 10px">
            {{ t('wbHelpline') }}
          </p>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--text)">
            <div>🇫🇷 France — <strong>3114</strong> (24/7)</div>
            <div>🇧🇪 Belgique — <strong>0800 32 123</strong></div>
            <div>🇨🇭 Suisse — <strong>143</strong></div>
            <div>🇨🇦 Canada — <strong>1-866-APPELLE</strong></div>
            <div>🇺🇸 USA — <strong>988</strong></div>
            <div>🇰🇷 한국 — <strong>1393</strong></div>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- ═══ RIGHT: Side panel — Resources & Support ═══ -->
    <div style="width: 300px; flex-shrink: 0; display: flex; flex-direction: column; overflow: hidden">
      <!-- Side panel header: Team Indicators -->
      <div style="padding: 16px 16px 12px; border-bottom: 1px solid var(--border); background: var(--bg1)">
        <div style="font-size: 12px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px">
          {{ t('teamWellbeing') }}
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 12px; color: var(--muted)">💚 {{ t('wellbeingScore') }}</span>
            <span style="font-size: 15px; font-weight: 900" :style="{ color: scoreColor }">{{ wbData.score }}/100</span>
          </div>
          <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 12px; color: var(--muted)">🧠 {{ t('burnoutRisk') }}</span>
            <span style="font-size: 12px; font-weight: 800" :style="{ color: burnoutColor }">{{ burnoutLabel }}</span>
          </div>
          <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center">
            <span style="font-size: 12px; color: var(--muted)">⚡ {{ t('workload') }}</span>
            <span style="font-size: 15px; font-weight: 900" :style="{ color: wbData.charge > 85 ? 'var(--red)' : wbData.charge > 70 ? 'var(--amber)' : 'var(--green)' }">{{ wbData.charge }}%</span>
          </div>
        </div>
      </div>

      <!-- Side panel body: Resources & quick actions -->
      <div style="flex: 1; overflow-y: auto; padding: 14px 16px">
        <div style="font-size: 12px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px">
          Resources
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px">
          <button
            v-for="(r, i) in sideResources" :key="i"
            @click="onResourceClick(i)"
            style="background: var(--bg2); border: 1px solid var(--border); border-radius: 12px; padding: 11px 12px; text-align: left; cursor: pointer"
          >
            <div style="display: flex; align-items: center; gap: 10px">
              <span style="font-size: 18px">{{ r.icon }}</span>
              <div>
                <div style="font-size: 12px; font-weight: 800; color: var(--text)">{{ r.title }}</div>
                <div style="font-size: 11px; color: var(--muted)">{{ r.desc }}</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { wellbeingApi, coachApi } from '../api'
import { useI18n } from '../i18n'
import { usePreferencesStore } from '../stores/preferences'
import { useAuthStore } from '../stores/auth'
import { useChat } from '../composables/useChat'
import AppCard from '../components/AppCard.vue'
import HealthBar from '../components/HealthBar.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const { t } = useI18n()
const prefsStore = usePreferencesStore()
const authStore = useAuthStore()

const tab = ref('overview')
const chatContainer = ref(null)
const bottomRef = ref(null)
const novaInput = ref('')

// ── Wellbeing data (editable) ──
const wbData = ref({
  score: 70,
  burnout: 'none',
  charge: 70,
  trend: '+0',
  alerts: [],
  team: []
})

onMounted(async () => {
  try {
    const { data } = await wellbeingApi.get()
    Object.assign(wbData.value, data)
  } catch { /* silent */ }
})

let saveTimer = null
async function saveWellbeing(updates) {
  Object.assign(wbData.value, updates)
  clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      await wellbeingApi.update(wbData.value)
    } catch (e) {
      console.error('saveWellbeing error:', e)
    }
  }, 400)
}

onUnmounted(() => { clearTimeout(saveTimer) })

// ── Computed team (parse if string) ──
const team = computed(() => {
  const raw = wbData.value.team
  if (!raw) return []
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return Array.isArray(raw) ? raw : []
})

// ── Score / burnout display ──
const scoreColor = computed(() =>
  wbData.value.score >= 70 ? 'var(--green)' : wbData.value.score >= 50 ? 'var(--amber)' : 'var(--red)'
)

const burnoutColor = computed(() => {
  const b = wbData.value.burnout
  return b === 'high' ? 'var(--red)' : b === 'moderate' ? 'var(--amber)' : 'var(--green)'
})

const burnoutLabel = computed(() => {
  const b = wbData.value.burnout
  if (b === 'low') return t('burnoutLow') + ' 🟢'
  if (b === 'high') return t('burnoutHigh') + ' 🔴'
  if (b === 'moderate') return t('burnoutModerate') + ' 🟡'
  return t('burnoutNone')
})

// ── Nova AI Chat (using useChat composable + local state) ──
const { messages, sending, send: chatSend } = useChat(async (msgs) => {
  const { data } = await coachApi.chat(
    msgs.map(m => ({ role: m.role, content: m.content })),
    'nova'
  )
  return data.content
})

// Quick suggestion chips
const quickChips = computed(() => [
  t('wbStressed'),
  t('wbExhausted'),
  t('wbTooManyAccounts'),
  t('wbManagerConflict'),
  t('wbDoubt'),
])

async function sendNova(text) {
  const msg = typeof text === 'string' ? text.trim() : novaInput.value.trim()
  if (!msg || sending.value) return
  novaInput.value = ''
  await chatSend(msg)
  await nextTick()
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}

// Scroll to bottom on new messages
watch(() => messages.value.length, async () => {
  await nextTick()
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
})

// ── Coaching resources data ──
const coachingFeatures = computed(() => [
  { icon: '🎯', title: t('wbKpiWeekly'), desc: t('wbFormat') },
  { icon: '🧘', title: t('wbDecompress'), desc: t('wbTalkSomeone') },
  { icon: '📈', title: t('wbFollowUp'), desc: 'Monthly + quarterly reviews' },
  { icon: '🔒', title: t('wbConf'), desc: 'End-to-end confidentiality' },
])

// ── Side panel resources ──
const sideResources = computed(() => [
  { icon: '💬', title: t('wbTalkSomeone'), desc: t('wbHelpline') },
  { icon: '🧘', title: t('wbDecompress'), desc: 'Breathing, mindfulness' },
  { icon: '📝', title: t('wbManage'), desc: t('trackWorkload') },
  { icon: '🔋', title: t('wbBookSession'), desc: t('wbBookHow') },
])

function onResourceClick(index) {
  // Switch to Nova tab and send a relevant message
  tab.value = 'nova'
  const triggers = [
    t('wbTalkSomeone'),
    t('wbDecompress'),
    t('wbManage'),
    t('wbBookSession'),
  ]
  nextTick(() => sendNova(triggers[index] || triggers[0]))
}
</script>
