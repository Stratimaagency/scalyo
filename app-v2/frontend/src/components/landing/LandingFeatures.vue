<template>
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header anim-section" data-anim="fade-up">
          <span class="section-tag">{{ t('fl_chips_label') }}</span>
        </div>

        <!-- Module chips -->
        <div class="module-chips anim-section" data-anim="fade-up">
          <button
            v-for="(m, i) in modulesData"
            :key="i"
            class="module-chip"
            :class="{ active: activeModule === i }"
            @click="activeModule = i"
          >
            <span class="chip-icon">{{ m.icon }}</span>
            {{ m.chip }}
          </button>
        </div>

        <!-- Active module detail -->
        <transition name="module-fade" mode="out-in">
          <div class="module-detail anim-section" :key="activeModule" data-anim="fade-up">
            <div class="module-text">
              <span class="module-tag">{{ modulesData[activeModule].tag }}</span>
              <h2 class="module-title" v-html="modulesData[activeModule].h2"></h2>
              <p class="module-body">{{ modulesData[activeModule].body }}</p>
              <ul class="module-points">
                <li v-for="(p, j) in modulesData[activeModule].points" :key="j">
                  <span class="point-check">✓</span> {{ p }}
                </li>
              </ul>
              <a :href="appUrl + '/login'" class="btn-primary module-cta">{{ modulesData[activeModule].btn }}</a>
            </div>
            <div class="module-visual">
              <!-- Module-specific mockup -->
              <div class="module-mockup-card">
                <component :is="'div'" class="mmock-content">
                  <!-- Portfolio mockup -->
                  <template v-if="activeModule === 0">
                    <div class="mmock-head">{{ t('pb_title') }} <span class="mmock-badge">{{ t('pb_status') }}</span></div>
                    <div class="pb-step done"><span>✅</span> {{ t('pb_s1') }}</div>
                    <div class="pb-step done"><span>✅</span> {{ t('pb_s2') }}</div>
                    <div class="pb-step"><span>⬜</span> {{ t('pb_s3') }}</div>
                    <div class="pb-step"><span>⬜</span> {{ t('pb_s4') }}</div>
                    <div class="mmock-ai"><span>🤖</span> {{ t('pb_ai_msg') }}</div>
                  </template>
                  <!-- KPIs COPIL -->
                  <template v-else-if="activeModule === 1">
                    <div class="mmock-head">{{ t('demo_copil_period') }} <span class="mmock-badge green">{{ t('demo_copil_badge') }}</span></div>
                    <div class="copil-kpis">
                      <div class="copil-kpi"><strong>NRR</strong><span class="green">108%</span><small>{{ t('demo_kpi_d1') }}</small></div>
                      <div class="copil-kpi"><strong>Churn</strong><span class="red">4.2%</span><small>{{ t('demo_kpi_d2') }}</small></div>
                      <div class="copil-kpi"><strong>MRR</strong><span class="purple">€186K</span></div>
                      <div class="copil-kpi"><strong>CSAT</strong><span class="green">4.6/5</span></div>
                    </div>
                  </template>
                  <!-- Wellbeing -->
                  <template v-else-if="activeModule === 2">
                    <div class="mmock-head">{{ t('d_wb_title') }} <span class="mmock-badge">{{ t('d_wb_upd') }}</span></div>
                    <div class="wb-metrics">
                      <div class="wb-metric"><span class="wb-val green">7.4</span><span>{{ t('d_wb_avg') }}</span><small>{{ t('d_wb_sub') }}</small></div>
                      <div class="wb-metric"><span class="wb-val amber">6.8</span><span>{{ t('d_wb_load') }}</span></div>
                    </div>
                    <div class="mmock-ai warn"><span>⚠️</span> {{ t('demo_burnout') }}</div>
                  </template>
                  <!-- Coach IA -->
                  <template v-else-if="activeModule === 3">
                    <div class="mmock-head">{{ t('demo_coach_head') }} <span class="online-dot">{{ t('coach_online') }}</span></div>
                    <div class="mini-chat">
                      <div class="mc-user">{{ t('coach_user') }}</div>
                      <div class="mc-ai">🤖 {{ t('coach_ai') }}</div>
                    </div>
                  </template>
                  <!-- Email Studio -->
                  <template v-else-if="activeModule === 4">
                    <div class="mmock-head">{{ t('demo_email_head') }} <span class="mmock-badge">{{ t('demo_ai_badge') }}</span></div>
                    <div class="email-tags-mini">
                      <span>{{ t('demo_tag_checkin') }}</span>
                      <span>{{ t('demo_tag_churn') }}</span>
                    </div>
                    <div class="mini-email-body">{{ t('d_m5_subj') }}</div>
                  </template>
                  <!-- Planning -->
                  <template v-else-if="activeModule === 5">
                    <div class="mmock-head">{{ t('d_m6_head') }} <span class="mmock-badge">{{ t('d_m6_ev') }}</span></div>
                    <div class="mini-cal">
                      <div v-for="d in 7" :key="d" class="mini-cal-day" :class="{ active: d === 3 }">{{ d + 9 }}</div>
                    </div>
                    <div class="cal-event-mini">{{ t('d_m6_ret') }} — 14:00</div>
                  </template>
                  <!-- Task Board -->
                  <template v-else-if="activeModule === 6">
                    <div class="mmock-head">{{ t('demo_tb_head') }} <span class="mmock-badge warn">{{ t('demo_tb_late') }}</span></div>
                    <div class="mini-kanban mini-kanban-4">
                      <div class="mk-col"><div class="mk-title">{{ t('demo_col_1') }}</div><div class="mk-card">QBR Acme</div></div>
                      <div class="mk-col"><div class="mk-title">{{ t('demo_col_2') }}</div><div class="mk-card active">Playbook</div></div>
                      <div class="mk-col"><div class="mk-title">{{ t('demo_col_4') }}</div><div class="mk-card blocked-card">DataVault</div></div>
                      <div class="mk-col"><div class="mk-title">{{ t('demo_col_3') }}</div><div class="mk-card done">QBR Mega</div></div>
                    </div>
                  </template>
                  <!-- Resources -->
                  <template v-else>
                    <div class="mmock-head">{{ t('demo_lib_title') }} <span class="mmock-badge">{{ t('demo_lib_badge') }}</span></div>
                    <div class="mini-lib">
                      <div class="ml-card">📕 {{ t('demo_guide1') }}</div>
                      <div class="ml-card">📞 {{ t('demo_script1') }}</div>
                      <div class="ml-card new">🆕 {{ t('demo_pb_new') }}</div>
                    </div>
                  </template>
                </component>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLandingI18n } from '@/composables/useLandingI18n'
const { t } = useLandingI18n()

const activeModule = ref(0)
const modulesData = computed(() => [
  { icon: '🗂️', chip: t('fl_c1'), tag: t('fl_m1tag'), h2: t('fl_m1h2'), body: t('fl_m1body'), points: [t('fl_m1p1'), t('fl_m1p2'), t('fl_m1p3'), t('fl_m1p4'), t('fl_m1p5')], btn: t('fl_m1btn') },
  { icon: '📊', chip: t('fl_c2'), tag: t('fl_m2tag'), h2: t('fl_m2h2'), body: t('fl_m2body'), points: [t('fl_m2p1'), t('fl_m2p2'), t('fl_m2p3'), t('fl_m2p4'), t('fl_m2p5')], btn: t('fl_m2btn') },
  { icon: '💚', chip: t('fl_c3'), tag: t('fl_m3tag'), h2: t('fl_m3h2'), body: t('fl_m3body'), points: [t('fl_m3p1'), t('fl_m3p2'), t('fl_m3p3'), t('fl_m3p4'), t('fl_m3p5')], btn: t('fl_m3btn') },
  { icon: '🤖', chip: t('fl_c4'), tag: t('fl_m4tag'), h2: t('fl_m4h2'), body: t('fl_m4body'), points: [t('fl_m4p1'), t('fl_m4p2'), t('fl_m4p3'), t('fl_m4p4'), t('fl_m4p5')], btn: t('fl_m4btn') },
  { icon: '📧', chip: t('fl_c5'), tag: t('fl_m5tag'), h2: t('fl_m5h2'), body: t('fl_m5body'), points: [t('fl_m5p1'), t('fl_m5p2'), t('fl_m5p3'), t('fl_m5p4'), t('fl_m5p5')], btn: t('fl_m5btn') },
  { icon: '📅', chip: t('fl_c6'), tag: t('fl_m6tag'), h2: t('fl_m6h2'), body: t('fl_m6body'), points: [t('fl_m6p1'), t('fl_m6p2'), t('fl_m6p3'), t('fl_m6p4'), t('fl_m6p5')], btn: t('fl_m6btn') },
  { icon: '✅', chip: t('fl_c7'), tag: t('fl_m7tag'), h2: t('fl_m7h2'), body: t('fl_m7body'), points: [t('fl_m7p1'), t('fl_m7p2'), t('fl_m7p3'), t('fl_m7p4'), t('fl_m7p5')], btn: t('fl_m7btn') },
  { icon: '📚', chip: t('fl_c8'), tag: t('fl_m8tag'), h2: t('fl_m8h2'), body: t('fl_m8body'), points: [t('fl_m8p1'), t('fl_m8p2'), t('fl_m8p3'), t('fl_m8p4'), t('fl_m8p5')], btn: t('fl_m8btn') },
])
</script>

<style scoped>
/* ═══════════════════ FEATURES ═══════════════════ */
.features-section { padding: 80px 0; }
.section-header { text-align: center; margin-bottom: 40px; }
.section-tag { display: inline-block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--lp-purple); margin-bottom: 14px; }
.section-tag.light { color: rgba(255,255,255,0.7); }
.section-header h2 { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800; line-height: 1.15; margin-bottom: 14px; }
.section-header h2 :deep(.accent) { background: linear-gradient(135deg, var(--lp-purple-light), #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.section-sub { font-size: 0.95rem; color: var(--lp-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }

.module-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 48px; }
.module-chip { display: flex; align-items: center; gap: 6px; background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 999px; padding: 8px 18px; font-size: 0.82rem; color: var(--lp-muted); cursor: pointer; transition: all 0.3s; }
.module-chip:hover { border-color: var(--lp-purple); color: var(--lp-text); }
.module-chip.active { background: rgba(124,58,237,0.15); border-color: var(--lp-purple); color: var(--lp-purple-light); font-weight: 600; }
.chip-icon { font-size: 1.1rem; }

.module-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.module-tag { display: inline-block; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--lp-purple-light); margin-bottom: 12px; }
.module-title { font-size: 1.8rem; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
.module-title :deep(.accent) { background: linear-gradient(135deg, var(--lp-purple-light), #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.module-body { font-size: 0.9rem; color: var(--lp-muted); line-height: 1.7; margin-bottom: 20px; }
.module-points { list-style: none; margin-bottom: 24px; display: flex; flex-direction: column; gap: 10px; }
.module-points li { font-size: 0.85rem; display: flex; align-items: flex-start; gap: 8px; }
.point-check { color: var(--lp-green); font-weight: 700; flex-shrink: 0; }
.module-cta { margin-top: 4px; }

.module-visual { position: relative; }
.module-mockup-card { background: var(--lp-bg2); border: 1px solid var(--lp-border); border-radius: 16px; padding: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
.mmock-content { min-height: 240px; }
.mmock-head { font-size: 0.85rem; font-weight: 600; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; }
.mmock-badge { font-size: 0.65rem; padding: 3px 10px; border-radius: 6px; background: rgba(124,58,237,0.12); color: var(--lp-purple-light); }
.mmock-badge.green { background: rgba(16,185,129,0.12); color: var(--lp-green); }
.mmock-badge.warn { background: rgba(239,68,68,0.1); color: var(--lp-red); }
.mmock-ai { background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2); border-radius: 8px; padding: 10px; font-size: 0.78rem; color: var(--lp-muted); margin-top: 10px; line-height: 1.5; }
.mmock-ai.warn { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.15); }
.pb-step { display: flex; align-items: center; gap: 8px; padding: 8px 0; font-size: 0.8rem; border-bottom: 1px solid var(--lp-border); }
.pb-step.done { color: var(--lp-muted); }
.copil-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.copil-kpi { background: var(--lp-surface); border-radius: 10px; padding: 12px; text-align: center; }
.copil-kpi strong { display: block; font-size: 0.72rem; color: var(--lp-muted); margin-bottom: 4px; }
.copil-kpi span { font-size: 1.3rem; font-weight: 700; }
.copil-kpi small { display: block; font-size: 0.65rem; color: var(--lp-muted); margin-top: 2px; }
.copil-kpi .green { color: var(--lp-green); }
.copil-kpi .red { color: var(--lp-red); }
.copil-kpi .purple { color: var(--lp-purple-light); }
.wb-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.wb-metric { background: var(--lp-surface); border-radius: 10px; padding: 14px; text-align: center; }
.wb-val { display: block; font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
.wb-val.green { color: var(--lp-green); }
.wb-val.amber { color: var(--lp-amber); }
.wb-metric span:not(.wb-val) { font-size: 0.75rem; display: block; }
.wb-metric small { font-size: 0.68rem; color: var(--lp-muted); display: block; }
.online-dot { font-size: 0.75rem; color: var(--lp-green); }
.mini-chat { display: flex; flex-direction: column; gap: 8px; }
.mc-user { background: rgba(124,58,237,0.12); padding: 10px; border-radius: 10px; font-size: 0.8rem; align-self: flex-end; max-width: 85%; }
.mc-ai { background: var(--lp-surface); border: 1px solid var(--lp-border); padding: 10px; border-radius: 10px; font-size: 0.8rem; line-height: 1.5; }
.email-tags-mini { display: flex; gap: 6px; margin-bottom: 10px; }
.email-tags-mini span { font-size: 0.68rem; padding: 3px 8px; border-radius: 4px; background: rgba(124,58,237,0.1); color: var(--lp-purple-light); }
.mini-email-body { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 8px; padding: 12px; font-size: 0.8rem; color: var(--lp-muted); }
.mini-cal { display: flex; gap: 6px; margin-bottom: 10px; }
.mini-cal-day { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 0.78rem; background: var(--lp-surface); }
.mini-cal-day.active { background: var(--lp-purple); color: #fff; font-weight: 600; }
.cal-event-mini { font-size: 0.78rem; padding: 8px; background: rgba(124,58,237,0.08); border-radius: 8px; }
.mini-kanban { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.mini-kanban-4 { grid-template-columns: repeat(4, 1fr); }
.mk-card.blocked-card { border-left: 2px solid var(--lp-amber); }
.mk-col { background: var(--lp-surface); border-radius: 8px; padding: 8px; }
.mk-title { font-size: 0.65rem; font-weight: 600; color: var(--lp-muted); margin-bottom: 6px; }
.mk-card { font-size: 0.7rem; padding: 6px; background: #ffffff; border: 1px solid var(--lp-border); border-radius: 4px; margin-bottom: 4px; }
.mk-card.warn { border-left: 2px solid var(--lp-red); }
.mk-card.active { border-left: 2px solid var(--lp-purple); }
.mk-card.done { opacity: 0.5; }
.mini-lib { display: flex; flex-direction: column; gap: 6px; }
.ml-card { font-size: 0.78rem; padding: 10px; background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 8px; }
.ml-card.new { border-color: rgba(124,58,237,0.25); }

.module-fade-enter-active, .module-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.module-fade-enter-from { opacity: 0; transform: translateX(20px); }
.module-fade-leave-to { opacity: 0; transform: translateX(-20px); }

</style>