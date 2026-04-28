<template>
      <!-- Dashboard Mockup -->
      <div class="container mockup-wrapper anim-section" data-anim="fade-up-delay">
        <div class="browser-chrome">
          <div class="chrome-dots"><span /><span /><span /></div>
          <div class="chrome-url">
            <span class="chrome-lock">🔒</span>
            app.scalyo.app
          </div>
          <div class="chrome-live">
            <span class="live-dot" />
            {{ t('demo_live') }}
          </div>
        </div>

        <div class="mockup-body">
          <!-- Sidebar -->
          <div class="mock-sidebar">
            <div class="mock-sidebar-logo"><ScalyoLogo :size="22" /><span>Scalyo</span></div>
            <div
              v-for="(tab, i) in demoTabs"
              :key="tab.key"
              class="mock-tab"
              :class="{ active: activeDemo === i }"
              @click="activeDemo = i"
            >
              <span class="tab-icon">{{ tab.icon }}</span>
              <span class="tab-label hide-mobile">{{ t(tab.labelKey) }}</span>
            </div>
          </div>

          <!-- Main content -->
          <div class="mock-main">
            <transition name="mock-fade" mode="out-in">
              <!-- Dashboard Overview -->
              <div v-if="activeDemo === 0" key="dash" class="mock-panel">
                <div class="mock-header">
                  <h3>{{ t('demo_overview') }}</h3>
                  <span class="mock-date">{{ t('demo_today') }}</span>
                </div>
                <div class="mock-kpi-row">
                  <div class="mock-kpi"><span class="kpi-value purple">€2.4M</span><span class="kpi-label">{{ t('demo_arr') }}</span></div>
                  <div class="mock-kpi"><span class="kpi-value green">8.2</span><span class="kpi-label">{{ t('demo_avg_health') }}</span></div>
                  <div class="mock-kpi"><span class="kpi-value red">3</span><span class="kpi-label">{{ t('demo_critical') }}</span></div>
                  <div class="mock-kpi"><span class="kpi-value blue">90{{ t('demo_steps') === 'steps' ? 'd' : 'j' }}</span><span class="kpi-label">{{ t('demo_roadmap') }}</span></div>
                </div>
                <div class="mock-chart">
                  <div class="chart-label">{{ t('demo_nrr') }}</div>
                  <div class="chart-bars">
                    <div v-for="(h, i) in [65,72,68,78,85,92]" :key="i" class="chart-bar" :style="{ height: h + '%' }">
                      <span class="bar-val">{{ 100 + i * 2 }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Portfolio -->
              <div v-else-if="activeDemo === 1" key="port" class="mock-panel">
                <div class="mock-header">
                  <h3>{{ t('d_m1_head') }}</h3>
                  <span class="mock-badge warn">{{ t('d_m1_alerts') }}</span>
                </div>
                <div class="mock-accounts">
                  <div class="mock-acc" v-for="acc in mockAccounts" :key="acc.name">
                    <div class="acc-avatar" :style="{ background: acc.color }">{{ acc.name[0] }}</div>
                    <div class="acc-info">
                      <strong>{{ acc.name }}</strong>
                      <div class="health-bar"><div :style="{ width: acc.health * 10 + '%', background: acc.health > 7 ? '#10b981' : acc.health > 4 ? '#f59e0b' : '#ef4444' }" /></div>
                    </div>
                    <span class="acc-score" :style="{ color: acc.health > 7 ? '#10b981' : acc.health > 4 ? '#f59e0b' : '#ef4444' }">{{ acc.health.toFixed(1) }}</span>
                    <span class="acc-tag" :class="acc.health > 7 ? 'stable' : acc.health > 4 ? 'watch' : 'critical'">
                      {{ acc.health > 7 ? t('d_m1_s1') : acc.health > 4 ? t('d_m1_watch') : t('d_m1_crit') }}
                    </span>
                  </div>
                </div>
                <div class="mock-ai-box">
                  <span class="ai-label">{{ t('d_m1_reco') }}</span>
                  <p>{{ t('d_m1_ai') }}</p>
                </div>
              </div>

              <!-- Coach IA -->
              <div v-else-if="activeDemo === 2" key="coach" class="mock-panel mock-chat">
                <div class="mock-header chat-header">
                  <h3>{{ t('demo_coach_head') }}</h3>
                  <span class="online-badge">{{ t('demo_coach_online') }}</span>
                </div>
                <div class="chat-messages">
                  <div class="chat-msg user">{{ t('demo_coach_q1') }}</div>
                  <div class="chat-msg ai">
                    <span class="chat-tag">{{ t('demo_coach_tag1') }}</span>
                    {{ t('demo_coach_a1') }}
                  </div>
                  <div class="chat-msg user">{{ t('demo_coach_q2') }}</div>
                  <div class="chat-msg ai">
                    <span class="chat-tag">{{ t('demo_coach_tag2') }}</span>
                    {{ t('demo_coach_a2') }}
                  </div>
                </div>
                <div class="chat-input-bar">
                  <input :placeholder="t('coach_placeholder')" readonly />
                  <button class="send-btn">→</button>
                </div>
              </div>

              <!-- Wellbeing -->
              <div v-else-if="activeDemo === 3" key="wb" class="mock-panel">
                <div class="mock-header">
                  <h3>{{ t('d_m3_head') }}</h3>
                  <span class="mock-badge warn">{{ t('d_m3_badge') }}</span>
                </div>
                <div class="mock-kpi-row">
                  <div class="mock-kpi"><span class="kpi-value green">7.4</span><span class="kpi-label">{{ t('d_m3_avg') }}</span></div>
                  <div class="mock-kpi"><span class="kpi-value amber">6.8</span><span class="kpi-label">{{ t('d_m3_load') }}</span></div>
                  <div class="mock-kpi"><span class="kpi-value red">1</span><span class="kpi-label">{{ t('d_m3_alrt') }}</span></div>
                </div>
                <div class="mock-ai-box warn">
                  <span class="ai-label">{{ t('d_m3_burn') }}</span>
                  <p>{{ t('d_m3_sara') }}</p>
                </div>
                <div class="mock-trend">{{ t('d_m3_trnd') }}</div>
              </div>

              <!-- Email Studio -->
              <div v-else-if="activeDemo === 4" key="email" class="mock-panel">
                <div class="mock-header">
                  <h3>{{ t('demo_email_head') }}</h3>
                  <div class="email-tags">
                    <span class="etag">{{ t('demo_tag_checkin') }}</span>
                    <span class="etag">{{ t('demo_tag_churn') }}</span>
                  </div>
                </div>
                <div class="mock-email">
                  <div class="email-field"><strong>{{ t('demo_email_to') }}</strong> marc.duval@client.com</div>
                  <div class="email-field"><strong>{{ t('d_m5_lbl') }}</strong> {{ t('d_m5_subj') }}</div>
                  <div class="email-body" v-html="t('d_m5_body')"></div>
                  <div class="email-footer-badge">{{ t('demo_ai_badge') }}</div>
                </div>
              </div>

              <!-- Planning -->
              <div v-else-if="activeDemo === 5" key="plan" class="mock-panel">
                <div class="mock-header">
                  <h3>{{ t('d_m6_head') }}</h3>
                  <span class="mock-badge">{{ t('d_m6_ev') }}</span>
                </div>
                <div class="mock-calendar">
                  <div class="cal-grid">
                    <div v-for="d in 28" :key="d" class="cal-day" :class="{ today: d === 12, event: [3,7,12,15,21,25].includes(d) }">
                      {{ d }}
                      <span v-if="[3,7,12,15,21,25].includes(d)" class="cal-dot" />
                    </div>
                  </div>
                  <div class="cal-event-preview">
                    <span class="cal-ev-icon">📞</span>
                    {{ t('d_m6_ret') }} — Leroy Finance · 14:00
                  </div>
                </div>
              </div>

              <!-- Task Board -->
              <div v-else-if="activeDemo === 6" key="tasks" class="mock-panel">
                <div class="mock-header">
                  <h3>{{ t('demo_tb_head') }}</h3>
                  <span class="mock-badge warn">{{ t('demo_tb_late') }}</span>
                </div>
                <div class="mock-kanban mock-kanban-4">
                  <div class="kanban-col">
                    <div class="kanban-col-title">{{ t('demo_col_1') }} <span class="col-count">2</span></div>
                    <div class="kanban-card late">QBR Acme Corp <span class="card-tag">{{ t('demo_card_late') }}</span></div>
                    <div class="kanban-card">Check-in TechScale</div>
                  </div>
                  <div class="kanban-col">
                    <div class="kanban-col-title">{{ t('demo_col_2') }} <span class="col-count">2</span></div>
                    <div class="kanban-card active">Playbook Leroy Finance</div>
                    <div class="kanban-card active">Email expansion NovaTech</div>
                  </div>
                  <div class="kanban-col blocked-col">
                    <div class="kanban-col-title">{{ t('demo_col_4') }} <span class="col-count">1</span></div>
                    <div class="kanban-card blocked">Health check DataVault</div>
                  </div>
                  <div class="kanban-col done-col">
                    <div class="kanban-col-title">{{ t('demo_col_3') }} <span class="col-count">2</span></div>
                    <div class="kanban-card done">QBR MegaCorp <span class="done-date">{{ t('demo_done_1') }}</span></div>
                    <div class="kanban-card done">Onboarding Biotech <span class="done-date">{{ t('demo_done_2') }}</span></div>
                  </div>
                </div>
              </div>

              <!-- Import IA -->
              <div v-else-if="activeDemo === 7" key="import" class="mock-panel">
                <div class="mock-header">
                  <h3>🤖 {{ t('demo_import') }}</h3>
                  <span class="mock-badge green">{{ t('demo_import_badge') }}</span>
                </div>
                <div class="import-steps">
                  <div class="imp-step done"><span class="imp-dot done">✓</span><span>{{ t('demo_imp_s1') }}</span></div>
                  <div class="imp-step done"><span class="imp-dot done">✓</span><span>{{ t('demo_imp_s2') }}</span></div>
                  <div class="imp-step active"><span class="imp-dot active">3</span><span>{{ t('demo_imp_s3') }}</span></div>
                  <div class="imp-step"><span class="imp-dot">4</span><span>{{ t('demo_imp_s4') }}</span></div>
                </div>
                <div class="mock-ai-box">
                  <span class="ai-label">🤖 {{ t('demo_imp_detected') }}</span>
                  <p>{{ t('demo_imp_result') }}</p>
                </div>
                <div class="imp-preview-mini">
                  <div class="ipm-row header"><span>{{ t('demo_imp_col1') }}</span><span>ARR</span><span>Health</span><span>CSM</span></div>
                  <div class="ipm-row"><span>TechScale</span><span class="green">€120K</span><span class="green">9.1</span><span>Sophie M.</span></div>
                  <div class="ipm-row"><span>Acme Corp</span><span>€85K</span><span class="amber">6.4</span><span>Thomas R.</span></div>
                </div>
              </div>

              <!-- Resources -->
              <div v-else key="lib" class="mock-panel">
                <div class="mock-header">
                  <h3>{{ t('demo_lib_title') }}</h3>
                  <span class="mock-badge">{{ t('demo_lib_badge') }}</span>
                </div>
                <div class="mock-library">
                  <div class="lib-card">
                    <span class="lib-icon">📕</span>
                    <div><strong>{{ t('demo_guide1') }}</strong><br /><small>{{ t('demo_pdf1') }}</small></div>
                  </div>
                  <div class="lib-card">
                    <span class="lib-icon">📞</span>
                    <div><strong>{{ t('demo_script1') }}</strong><br /><small>{{ t('demo_pdf1') }}</small></div>
                  </div>
                  <div class="lib-card new">
                    <span class="lib-icon">🆕</span>
                    <div><strong>{{ t('demo_pb_new') }}</strong><br /><small>{{ t('demo_pb_sub') }}</small></div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </section>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ScalyoLogo from '@/components/ScalyoLogo.vue'
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()

const activeDemo = ref(0)

const demoTabs = [
  { key: 'dashboard', icon: '📊', labelKey: 'demo_dashboard' },
  { key: 'portfolio', icon: '🗂️', labelKey: 'demo_portfolio' },
  { key: 'coach',     icon: '🤖', labelKey: 'demo_coach' },
  { key: 'wellbeing', icon: '💚', labelKey: 'demo_wellbeing' },
  { key: 'email',     icon: '📧', labelKey: 'demo_email_head' },
  { key: 'planning',  icon: '📅', labelKey: 'fl_c6' },
  { key: 'tasks',     icon: '✅', labelKey: 'fl_c7' },
  { key: 'import',    icon: '🤖', labelKey: 'demo_import' },
  { key: 'resources', icon: '📚', labelKey: 'fl_c8' },
]

const mockAccounts = [
  { name: 'TechScale', health: 9.1, color: '#10b981' },
  { name: 'Acme Corp', health: 6.4, color: '#f59e0b' },
  { name: 'Biotech Group', health: 8.7, color: '#8b5cf6' },
  { name: 'Leroy Finance', health: 4.2, color: '#ef4444' },
]

let demoCycleTimer = null
onMounted(() => {
  demoCycleTimer = setInterval(() => {
    activeDemo.value = (activeDemo.value + 1) % demoTabs.length
  }, 5000)
})
onUnmounted(() => clearInterval(demoCycleTimer))
</script>

<style scoped>
/* ═══════════════════ DASHBOARD MOCKUP ═══════════════════ */
.mockup-wrapper { margin-top: 50px; perspective: 1200px; }
.browser-chrome { background: #f3f4f6; border-radius: 16px 16px 0 0; padding: 12px 20px; display: flex; align-items: center; gap: 16px; border: 1px solid var(--lp-border); border-bottom: none; }
.chrome-dots { display: flex; gap: 7px; }
.chrome-dots span { width: 11px; height: 11px; border-radius: 50%; }
.chrome-dots span:nth-child(1) { background: #ef4444; }
.chrome-dots span:nth-child(2) { background: #f59e0b; }
.chrome-dots span:nth-child(3) { background: #10b981; }
.chrome-url { flex: 1; background: rgba(0,0,0,0.05); padding: 6px 14px; border-radius: 8px; font-size: 0.78rem; color: var(--lp-muted); }
.chrome-lock { margin-right: 6px; }
.chrome-live { display: flex; align-items: center; gap: 6px; font-size: 0.72rem; color: var(--lp-green); font-weight: 600; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--lp-green); animation: live-pulse 2s infinite; }
.mockup-body { display: flex; background: var(--lp-bg2); border: 1px solid var(--lp-border); border-top: none; border-radius: 0 0 16px 16px; min-height: 380px; overflow: hidden; }
.mock-sidebar { width: 180px; background: rgba(255,255,255,0.02); border-right: 1px solid var(--lp-border); padding: 12px 8px; flex-shrink: 0; display: flex; flex-direction: column; gap: 2px; }
.mock-sidebar-logo { display: flex; align-items: center; gap: 6px; padding: 8px 10px 16px; font-weight: 700; font-size: 0.85rem; }
.mock-tab { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px; font-size: 0.78rem; color: var(--lp-muted); cursor: pointer; transition: all 0.2s; }
.mock-tab:hover { background: rgba(255,255,255,0.04); color: #fff; }
.mock-tab.active { background: rgba(124,58,237,0.15); color: var(--lp-purple-light); font-weight: 600; }
.tab-icon { font-size: 1rem; }
.mock-main { flex: 1; padding: 20px; overflow: hidden; }

/* Mock panels */
.mock-panel { animation: mock-enter 0.3s ease; }
@keyframes mock-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.mock-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.mock-header h3 { font-size: 0.95rem; font-weight: 600; }
.mock-date { font-size: 0.75rem; color: var(--lp-muted); }
.mock-badge { font-size: 0.68rem; padding: 3px 10px; border-radius: 6px; background: rgba(124,58,237,0.15); color: var(--lp-purple-light); }
.mock-badge.warn { background: rgba(239,68,68,0.12); color: var(--lp-red); }
.mock-badge.green { background: rgba(16,185,129,0.12); color: var(--lp-green); }
.mock-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; margin-bottom: 16px; }
.mock-kpi { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 10px; padding: 12px; text-align: center; }
.kpi-value { display: block; font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
.kpi-value.purple { color: var(--lp-purple-light); }
.kpi-value.green { color: var(--lp-green); }
.kpi-value.red { color: var(--lp-red); }
.kpi-value.amber { color: var(--lp-amber); }
.kpi-value.blue { color: var(--lp-blue); }
.kpi-label { font-size: 0.7rem; color: var(--lp-muted); }

/* Chart */
.mock-chart { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 10px; padding: 14px; }
.chart-label { font-size: 0.75rem; color: var(--lp-muted); margin-bottom: 10px; }
.chart-bars { display: flex; align-items: flex-end; gap: 12px; height: 100px; }
.chart-bar { flex: 1; background: linear-gradient(to top, var(--lp-purple), var(--lp-purple-light)); border-radius: 6px 6px 0 0; position: relative; min-height: 10px; transition: height 0.6s ease; }
.bar-val { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 0.6rem; color: var(--lp-muted); white-space: nowrap; }

/* Accounts */
.mock-accounts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.mock-acc { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--lp-surface); border-radius: 8px; }
.acc-avatar { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 0.75rem; flex-shrink: 0; }
.acc-info { flex: 1; }
.acc-info strong { font-size: 0.78rem; display: block; margin-bottom: 3px; }
.health-bar { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
.health-bar div { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
.acc-score { font-weight: 700; font-size: 0.85rem; min-width: 28px; text-align: right; }
.acc-tag { font-size: 0.6rem; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
.acc-tag.stable { background: rgba(16,185,129,0.12); color: var(--lp-green); }
.acc-tag.watch { background: rgba(245,158,11,0.12); color: var(--lp-amber); }
.acc-tag.critical { background: rgba(239,68,68,0.12); color: var(--lp-red); }

/* AI box */
.mock-ai-box { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 10px; padding: 12px; }
.mock-ai-box.warn { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.15); }
.ai-label { font-size: 0.72rem; font-weight: 600; color: var(--lp-purple-light); display: block; margin-bottom: 6px; }
.mock-ai-box.warn .ai-label { color: var(--lp-red); }
.mock-ai-box p { font-size: 0.78rem; color: var(--lp-muted); line-height: 1.5; }
.mock-trend { font-size: 0.75rem; color: var(--lp-muted); margin-top: 10px; text-align: center; }

/* Chat */
.mock-chat { display: flex; flex-direction: column; height: 340px; }
.chat-header { border-bottom: 1px solid var(--lp-border); padding-bottom: 12px; }
.online-badge { color: var(--lp-green); font-size: 0.75rem; }
.chat-messages { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 12px 0; }
.chat-msg { padding: 10px 14px; border-radius: 12px; font-size: 0.8rem; line-height: 1.5; max-width: 85%; }
.chat-msg.user { background: rgba(124,58,237,0.15); color: var(--lp-purple-light); align-self: flex-end; border-bottom-right-radius: 4px; }
.chat-msg.ai { background: var(--lp-surface); border: 1px solid var(--lp-border); align-self: flex-start; border-bottom-left-radius: 4px; }
.chat-tag { font-size: 0.68rem; font-weight: 600; color: var(--lp-purple-light); display: block; margin-bottom: 4px; }
.chat-input-bar { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid var(--lp-border); }
.chat-input-bar input { flex: 1; background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 10px; padding: 10px 14px; color: var(--lp-text); font-size: 0.82rem; outline: none; }
.send-btn { background: var(--lp-purple); color: #fff; border: none; border-radius: 10px; padding: 10px 16px; cursor: pointer; font-size: 1rem; }

/* Email */
.email-tags { display: flex; gap: 6px; }
.etag { font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; background: rgba(124,58,237,0.12); color: var(--lp-purple-light); }
.mock-email { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 10px; padding: 14px; }
.email-field { font-size: 0.78rem; padding: 6px 0; border-bottom: 1px solid var(--lp-border); color: var(--lp-muted); }
.email-body { font-size: 0.8rem; padding: 12px 0; line-height: 1.6; color: var(--lp-text); }
.email-footer-badge { font-size: 0.68rem; color: var(--lp-green); margin-top: 8px; }

/* Calendar */
.mock-calendar { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 10px; padding: 14px; }
.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 12px; }
.cal-day { text-align: center; font-size: 0.72rem; padding: 6px 2px; border-radius: 6px; position: relative; color: var(--lp-muted); }
.cal-day.today { background: var(--lp-purple); color: #fff; font-weight: 600; }
.cal-day.event { color: var(--lp-text); }
.cal-dot { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: var(--lp-purple-light); border-radius: 50%; }
.cal-event-preview { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; padding: 8px 10px; background: rgba(124,58,237,0.08); border-radius: 8px; }
.cal-ev-icon { font-size: 1rem; }

/* Kanban */
.mock-kanban { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.mock-kanban-4 { grid-template-columns: repeat(4, 1fr); }
.kanban-card.blocked { border-left: 3px solid var(--lp-amber); }
.kanban-col { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 10px; padding: 10px; }
.kanban-col-title { font-size: 0.72rem; font-weight: 600; color: var(--lp-muted); margin-bottom: 8px; display: flex; justify-content: space-between; }
.col-count { background: var(--lp-border); padding: 1px 6px; border-radius: 4px; font-size: 0.65rem; }
.kanban-card { background: #ffffff; border: 1px solid var(--lp-border); border-radius: 6px; padding: 8px; font-size: 0.72rem; margin-bottom: 6px; }
.kanban-card.late { border-left: 3px solid var(--lp-red); }
.kanban-card.active { border-left: 3px solid var(--lp-purple); }
.kanban-card.done { opacity: 0.6; }
.card-tag { display: block; font-size: 0.6rem; color: var(--lp-red); margin-top: 4px; }
.done-date { display: block; font-size: 0.6rem; color: var(--lp-muted); margin-top: 4px; }

/* Library */
.mock-library { display: flex; flex-direction: column; gap: 8px; }
.lib-card { display: flex; align-items: center; gap: 12px; background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 10px; padding: 12px; font-size: 0.78rem; }
.lib-card.new { border-color: rgba(124,58,237,0.3); background: rgba(124,58,237,0.05); }
.lib-icon { font-size: 1.4rem; }
.lib-card strong { font-size: 0.8rem; }
.lib-card small { color: var(--lp-muted); font-size: 0.7rem; }

.import-steps { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.imp-step { display: flex; align-items: center; gap: 10px; font-size: 0.78rem; color: var(--lp-muted); }
.imp-step.done { color: var(--lp-text); }
.imp-step.active { color: var(--lp-purple); font-weight: 600; }
.imp-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--lp-border); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0; color: var(--lp-muted); background: var(--lp-surface); }
.imp-dot.done { background: var(--lp-green); border-color: var(--lp-green); color: #fff; }
.imp-dot.active { background: var(--lp-purple); border-color: var(--lp-purple); color: #fff; }
.imp-preview-mini { margin-top: 10px; border: 1px solid var(--lp-border); border-radius: 8px; overflow: hidden; font-size: 0.7rem; }
.ipm-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 6px 10px; gap: 4px; }
.ipm-row.header { background: var(--lp-bg2); font-weight: 600; color: var(--lp-muted); font-size: 0.65rem; text-transform: uppercase; }
.ipm-row:not(.header) { border-top: 1px solid var(--lp-border); }
.ipm-row .green { color: var(--lp-green); font-weight: 600; }
.ipm-row .amber { color: var(--lp-amber); font-weight: 600; }

/* Mock transitions */
.mock-fade-enter-active, .mock-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.mock-fade-enter-from { opacity: 0; transform: translateY(10px); }
.mock-fade-leave-to { opacity: 0; transform: translateY(-10px); }

</style>