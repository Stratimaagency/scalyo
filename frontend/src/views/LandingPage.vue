<template>
  <div class="landing" ref="rootEl">

    <!-- ═══════════════════ NAVBAR ═══════════════════ -->
    <nav class="nav" :class="{ scrolled }">
      <div class="nav-inner">
        <router-link to="/" class="logo-link">
          <ScalyoLogo :size="34" />
          <span class="logo-text">Scalyo</span>
        </router-link>

        <div class="nav-links hide-mobile">
          <a href="#features" @click.prevent="scrollTo('features')">{{ t('nav_features') }}</a>
          <a href="#roi" @click.prevent="scrollTo('roi')">{{ t('nav_roi') }}</a>
          <a href="#pricing" @click.prevent="scrollTo('pricing')">{{ t('nav_pricing') }}</a>
          <a href="#faq" @click.prevent="scrollTo('faq')">{{ t('nav_faq') }}</a>
        </div>

        <div class="nav-right hide-mobile">
          <div class="lang-switch">
            <button v-for="l in langs" :key="l.code" :class="{ active: locale === l.code }" @click="locale = l.code">{{ l.label }}</button>
          </div>
          <a :href="appUrl + '/login'" class="btn-ghost-sm">{{ t('nav_login') }}</a>
          <a :href="appUrl + '/login'" class="btn-primary-sm">{{ t('nav_cta') }}</a>
        </div>

        <button class="burger hide-desktop" @click="mobileMenu = !mobileMenu" aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      <!-- Mobile menu -->
      <transition name="slide-down">
        <div v-if="mobileMenu" class="mobile-menu">
          <a href="#features" @click.prevent="scrollTo('features'); mobileMenu = false">{{ t('nav_features') }}</a>
          <a href="#roi" @click.prevent="scrollTo('roi'); mobileMenu = false">{{ t('nav_roi') }}</a>
          <a href="#pricing" @click.prevent="scrollTo('pricing'); mobileMenu = false">{{ t('nav_pricing') }}</a>
          <a href="#faq" @click.prevent="scrollTo('faq'); mobileMenu = false">{{ t('nav_faq') }}</a>
          <div class="lang-switch">
            <button v-for="l in langs" :key="l.code" :class="{ active: locale === l.code }" @click="locale = l.code">{{ l.label }}</button>
          </div>
          <a :href="appUrl + '/login'" class="btn-ghost-sm">{{ t('nav_login') }}</a>
          <a :href="appUrl + '/login'" class="btn-primary-sm">{{ t('nav_cta_mobile') }}</a>
        </div>
      </transition>
    </nav>

    <!-- ═══════════════════ HERO ═══════════════════ -->
    <section class="hero">
      <div class="hero-glow" />
      <div class="container hero-content anim-section" data-anim="fade-up">
        <div class="hero-badge">
          <span class="badge-dot" />
          {{ t('hero_badge') }}
        </div>

        <h1 class="hero-title" v-html="t('hero_h1')"></h1>

        <p class="hero-sub">{{ t('hero_sub') }}</p>

        <div class="hero-ctas">
          <a :href="appUrl + '/login'" class="btn-primary lg glow-btn">{{ t('cta_free_14') }}</a>
          <a href="#pricing" class="btn-outline lg" @click.prevent="scrollTo('pricing')">{{ t('see_pricing') }}</a>
        </div>

        <div class="proof-row">
          <span class="proof-item">✓ {{ t('proof_no_card') }}</span>
          <span class="proof-item">✓ {{ t('proof_14d') }}</span>
          <span class="proof-item">✓ {{ t('proof_rgpd') }}</span>
          <span class="proof-item">✓ {{ t('proof_support') }}</span>
        </div>
      </div>

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

    <!-- ═══════════════════ STATS ═══════════════════ -->
    <section class="stats-section anim-section" data-anim="fade-up">
      <div class="container">
        <div class="stats-grid">
          <div v-for="(s, i) in statsData" :key="i" class="stat-card">
            <span class="stat-emoji emoji-3d">{{ s.icon }}</span>
            <div class="stat-number">{{ s.n }}</div>
            <div class="stat-label">{{ s.l }}</div>
            <div class="stat-note">{{ s.s }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ FEATURES ═══════════════════ -->
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

    <!-- ═══════════════════ ROI CALCULATOR ═══════════════════ -->
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
              <label>{{ t('roi_lbl_arr') }}: <strong>€{{ roiArr.toLocaleString() }}</strong></label>
              <input type="range" v-model.number="roiArr" min="1000" max="100000" step="1000" />
            </div>
            <div class="roi-field">
              <label>{{ t('roi_lbl_churn') }}: <strong>{{ roiChurn }}%</strong></label>
              <input type="range" v-model.number="roiChurn" min="1" max="30" />
            </div>
          </div>

          <div class="roi-results">
            <div class="roi-main-result">
              <span class="roi-big">€{{ roiSaved.toLocaleString() }}</span>
              <span class="roi-desc">{{ t('roi_main_label') }}</span>
            </div>
            <div class="roi-details">
              <div class="roi-detail"><span class="roi-dl">{{ t('roi_arr') }}</span><span class="roi-dv">€{{ roiTotalArr.toLocaleString() }}</span></div>
              <div class="roi-detail"><span class="roi-dl">{{ t('roi_cost') }}</span><span class="roi-dv red">€{{ roiChurnCost.toLocaleString() }}</span></div>
              <div class="roi-detail"><span class="roi-dl">{{ t('roi_time') }}</span><span class="roi-dv green">{{ roiTimeSaved }}h</span></div>
              <div class="roi-detail"><span class="roi-dl">{{ t('roi_mult') }}</span><span class="roi-dv purple">{{ roiMultiplier }}x</span></div>
            </div>
            <div class="roi-plan">
              <span class="roi-plan-label">{{ t('roi_plan_rec') }}:</span>
              <span class="roi-plan-value">{{ roiRecommendedPlan }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ INTEGRATIONS ═══════════════════ -->
    <section class="integ-section anim-section" data-anim="fade-up">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">{{ t('integ_tag') }}</span>
          <h2 v-html="t('integ_h2')"></h2>
          <p class="section-sub">{{ t('integ_sub') }}</p>
        </div>
        <div class="integ-grid">
          <div v-for="ig in integrations" :key="ig.name" class="integ-card">
            <span class="integ-icon">{{ ig.icon }}</span>
            <strong>{{ ig.name }}</strong>
            <small>{{ ig.tag }}</small>
            <span class="integ-avail">{{ t('integ_available') }}</span>
          </div>
        </div>
        <p class="integ-more">{{ t('integ_more') }}</p>
      </div>
    </section>

    <!-- ═══════════════════ WHY SCALYO ═══════════════════ -->
    <section class="why-section anim-section" data-anim="fade-up">
      <div class="container">
        <div class="section-header">
          <h2>{{ t('sell_title') }}</h2>
          <p class="section-sub">{{ t('sell_subtitle') }}</p>
        </div>
        <div class="sell-grid">
          <div v-for="(s, i) in sellingPoints" :key="i" class="sell-card">
            <span class="sell-icon emoji-3d">{{ s.icon }}</span>
            <h4>{{ s.label }}</h4>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ PRICING ═══════════════════ -->
    <section id="pricing" class="pricing-section">
      <div class="container">
        <div class="section-header anim-section" data-anim="fade-up">
          <span class="section-tag">{{ t('pricing_tag') }}</span>
          <h2 v-html="t('pricing_h2')"></h2>
          <p class="pricing-note" v-html="t('pricing_note')"></p>
        </div>

        <div class="plans-grid anim-section" data-anim="fade-up">
          <!-- Starter -->
          <div class="plan-card">
            <div class="plan-name">STARTER</div>
            <div class="plan-price"><span class="currency">€</span>97<span class="period">/{{ locale === 'kr' ? '월' : locale === 'en' ? 'mo' : 'mois' }}</span></div>
            <div class="plan-desc">{{ t('plan_1csm') }}</div>
            <ul class="plan-features">
              <li>✓ {{ t('feat_5acc') }}</li>
              <li>✓ {{ t('feat_dash') }}</li>
              <li>✓ {{ t('feat_tasks') }}</li>
              <li>✓ {{ t('feat_res') }}</li>
              <li>✓ {{ t('feat_wb') }}</li>
              <li>✓ {{ t('feat_coach') }}</li>
            </ul>
            <a :href="appUrl + '/login'" class="btn-outline plan-btn">{{ t('cta_trial') }}</a>
          </div>

          <!-- Growth -->
          <div class="plan-card popular">
            <div class="popular-badge">⭐ {{ t('badge_popular') }}</div>
            <div class="plan-name">GROWTH</div>
            <div class="plan-price"><span class="currency">€</span>297<span class="period">/{{ locale === 'kr' ? '월' : locale === 'en' ? 'mo' : 'mois' }}</span></div>
            <div class="plan-desc">{{ t('plan_10csm') }}</div>
            <ul class="plan-features">
              <li>✓ {{ t('feat_unlim_acc') }}</li>
              <li>✓ {{ t('feat_dash_adv') }}</li>
              <li>✓ {{ t('feat_coach_cs') }}</li>
              <li>✓ {{ t('feat_email_ai') }}</li>
              <li>✓ {{ t('feat_import') }}</li>
              <li>✓ {{ t('feat_support') }}</li>
            </ul>
            <a :href="appUrl + '/login'" class="btn-primary plan-btn glow-btn">{{ t('cta_trial') }}</a>
          </div>

          <!-- Elite -->
          <div class="plan-card">
            <div class="plan-name">ELITE</div>
            <div class="plan-price"><span class="currency">€</span>697<span class="period">/{{ locale === 'kr' ? '월' : locale === 'en' ? 'mo' : 'mois' }}</span></div>
            <div class="plan-desc">{{ t('plan_unlim_csm') }}</div>
            <ul class="plan-features">
              <li>✓ {{ t('feat_all_growth') }}</li>
              <li>✓ {{ t('feat_playbooks') }}</li>
              <li>✓ {{ t('feat_coaching') }}</li>
              <li>✓ {{ t('feat_onboarding') }}</li>
              <li>✓ {{ t('feat_sla') }}</li>
              <li>✓ {{ t('feat_multi') }}</li>
            </ul>
            <a :href="appUrl + '/login'" class="btn-outline plan-btn">{{ t('cta_trial') }}</a>
          </div>
        </div>

        <p class="plan-footnote" v-html="t('plan_footnote')"></p>
      </div>
    </section>

    <!-- ═══════════════════ FAQ ═══════════════════ -->
    <section id="faq" class="faq-section">
      <div class="container">
        <div class="section-header anim-section" data-anim="fade-up">
          <span class="section-tag">{{ t('faq_tag') }}</span>
          <h2 v-html="t('faq_h2')"></h2>
        </div>

        <div class="faq-list anim-section" data-anim="fade-up">
          <div v-for="(item, i) in faqItems" :key="i" class="faq-item" :class="{ open: openFaq === i }" @click="openFaq = openFaq === i ? null : i">
            <div class="faq-q">
              <span>{{ item.q }}</span>
              <span class="faq-toggle">{{ openFaq === i ? '−' : '+' }}</span>
            </div>
            <div class="faq-a">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════ FINAL CTA ═══════════════════ -->
    <section class="final-cta-section anim-section" data-anim="fade-up">
      <div class="final-cta-glow" />
      <div class="container center">
        <span class="section-tag light">{{ t('end_section_tag') }}</span>
        <h2 class="final-cta-title" v-html="t('end_h2')"></h2>
        <p class="final-cta-sub">{{ t('end_sub') }}</p>
        <div class="final-cta-btns">
          <a :href="appUrl + '/login'" class="btn-primary lg glow-btn">{{ t('cta_start_free') }}</a>
          <a href="mailto:contact@scalyo.app" class="btn-outline-light lg">{{ t('cta_talk') }}</a>
        </div>
        <p class="final-cta-note">{{ t('end_note') }}</p>
      </div>
    </section>

    <!-- ═══════════════════ FOOTER ═══════════════════ -->
    <footer class="footer-section">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo"><ScalyoLogo :size="28" /><span>Scalyo</span></div>
            <p>{{ t('footer_desc') }}</p>
            <p class="footer-markets">{{ t('footer_markets') }}</p>
          </div>
          <div class="footer-col">
            <h4>{{ t('footer_col_product') }}</h4>
            <a href="#features" @click.prevent="scrollTo('features')">{{ t('footer_features') }}</a>
            <a href="#pricing" @click.prevent="scrollTo('pricing')">{{ t('footer_pricing') }}</a>
            <a href="#roi" @click.prevent="scrollTo('roi')">{{ t('footer_roi_calc') }}</a>
            <a :href="appUrl + '/login'">{{ t('footer_signin') }}</a>
          </div>
          <div class="footer-col">
            <h4>{{ t('footer_col_resources') }}</h4>
            <a href="#">{{ t('footer_blog') }}</a>
            <a href="#">{{ t('footer_guides') }}</a>
            <a href="#">{{ t('footer_playbooks') }}</a>
            <a href="#">{{ t('footer_docs') }}</a>
          </div>
          <div class="footer-col">
            <h4>{{ t('footer_col_contact') }}</h4>
            <a href="mailto:contact@scalyo.app">contact@scalyo.app</a>
            <a href="#">{{ t('footer_support') }}</a>
            <a href="javascript:void(0)" @click="showLegal = true">{{ t('footer_rgpd') }}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>{{ t('footer_copy') }}</span>
        </div>
      </div>
    </footer>

  </div>

<Transition name="modal-fade">
  <div v-if="showLegal" class="lm-overlay" @click.self="showLegal = false">
    <div class="lm-box">
      <div class="lm-head">
        <div class="lm-legal-tabs">
          <button class="lm-tab" :class="{ active: legalTab === 'rgpd' }" @click="legalTab = 'rgpd'">{{ t('footer_rgpd') }}</button>
          <button class="lm-tab" :class="{ active: legalTab === 'legal' }" @click="legalTab = 'legal'">{{ t('footer_legal') }}</button>
        </div>
        <button class="lm-close" @click="showLegal = false">×</button>
      </div>
      <div class="lm-body">
        <div v-if="legalTab === 'rgpd'" v-html="rgpdContent" />
        <div v-if="legalTab === 'legal'" v-html="legalContent" />
      </div>
    </div>
  </div>
</Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import ScalyoLogo from '@/components/ScalyoLogo.vue'
import { L } from '@/i18n/landing'

const showLegal = ref(false)
const legalTab = ref('rgpd')

const appUrl = 'http://localhost:5174'

const locale = ref('fr')

const rgpdContent = computed(() => {
  const lang = locale.value
  const content = {
    fr: `<p><strong>Dernière mise à jour : Janvier 2025</strong></p><h4>1. Responsable du traitement</h4><p>Scalyo (Stratimaagency) est responsable du traitement de vos données personnelles. Contact DPO : <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. Données collectées</h4><ul><li>Identification : nom, email professionnel</li><li>Utilisation : actions sur la plateforme, logs de connexion</li><li>Données métier : comptes clients, KPIs (saisies par vous)</li><li>Facturation : traitée exclusivement par Stripe</li></ul><h4>3. Base légale (RGPD Art. 6)</h4><p>Exécution du contrat pour les données de service. Consentement pour les emails marketing. Obligation légale pour la facturation.</p><h4>4. Conservation</h4><p>Données conservées pendant la durée de l'abonnement + 3 ans après résiliation. Données de facturation conservées 10 ans.</p><h4>5. Hébergement & sécurité</h4><p>Supabase — région Europe (Irlande, conforme RGPD). Chiffrement AES-256, TLS 1.3. Cloudflare CDN.</p><h4>6. Vos droits</h4><ul><li>✓ Accès à vos données</li><li>✓ Rectification</li><li>✓ Effacement (droit à l'oubli)</li><li>✓ Portabilité (export JSON/CSV)</li><li>✓ Opposition au traitement</li></ul><p>Exercer vos droits : <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — Réponse sous 30 jours. Réclamation possible auprès de la CNIL.</p><h4>7. Cookies</h4><p>Cookies fonctionnels uniquement (session, langue). Aucun cookie publicitaire.</p>`,
    en: `<p><strong>Last updated: January 2025</strong></p><h4>1. Data Controller</h4><p>Scalyo (Stratimaagency) is the controller of your personal data. DPO contact: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. Data Collected</h4><ul><li>Identification: name, professional email</li><li>Usage: platform actions, login logs</li><li>Business data: client accounts, KPIs (entered by you)</li><li>Billing: processed exclusively by Stripe</li></ul><h4>3. Legal Basis (GDPR Art. 6)</h4><p>Contract performance for service data. Consent for marketing emails. Legal obligation for billing.</p><h4>4. Retention</h4><p>Data retained for subscription duration + 3 years after termination. Billing data retained 10 years.</p><h4>5. Hosting & Security</h4><p>Supabase — Europe region (Ireland, GDPR compliant). AES-256 encryption, TLS 1.3. Cloudflare CDN.</p><h4>6. Your Rights</h4><ul><li>✓ Access to your data</li><li>✓ Rectification</li><li>✓ Erasure (right to be forgotten)</li><li>✓ Portability (JSON/CSV export)</li><li>✓ Right to object</li></ul><p>Exercise your rights: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — Response within 30 days.</p><h4>7. Cookies</h4><p>Functional cookies only (session, language). No advertising cookies.</p>`,
    kr: `<p><strong>최종 업데이트: 2025년 1월</strong></p><h4>1. 데이터 처리 책임자</h4><p>Scalyo(Stratimaagency)는 귀하의 개인정보 처리 책임자입니다. DPO 연락처: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p><h4>2. 수집 데이터</h4><ul><li>식별 정보: 이름, 직장 이메일</li><li>이용 정보: 플랫폼 활동, 로그인 기록</li><li>비즈니스 데이터: 고객사, KPI (사용자 입력)</li><li>결제 정보: Stripe에서 단독 처리</li></ul><h4>3. 법적 근거 (GDPR 제6조)</h4><p>서비스 데이터: 계약 이행. 마케팅 이메일: 동의. 결제 데이터: 법적 의무.</p><h4>4. 보존 기간</h4><p>구독 기간 + 해지 후 3년. 결제 데이터는 10년 보존.</p><h4>5. 호스팅 및 보안</h4><p>Supabase — 유럽 리전 (아일랜드, GDPR 준수). AES-256 암호화, TLS 1.3. Cloudflare CDN.</p><h4>6. 귀하의 권리</h4><ul><li>✓ 개인정보 열람권</li><li>✓ 정정권</li><li>✓ 삭제권 (잊힐 권리)</li><li>✓ 이동권 (JSON/CSV 내보내기)</li><li>✓ 처리 반대권</li></ul><p>권리 행사: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a> — 30일 이내 답변.</p><h4>7. 쿠키</h4><p>기능적 쿠키만 사용 (세션, 언어). 광고 쿠키 없음.</p>`,
  }
  return content[lang] || content.fr
})

const legalContent = computed(() => {
  const lang = locale.value
  const content = {
    fr: `<h4>Éditeur</h4><p><strong>Stratimaagency</strong> (marque commerciale Scalyo)<br>Email : <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a><br>Site : scalyo.app</p><h4>Hébergement</h4><p>Cloudflare Pages — San Francisco, CA, USA<br>Supabase — infrastructure Europe (Irlande, conforme RGPD)<br>Stripe — paiements sécurisés, San Francisco, CA, USA</p><h4>Propriété intellectuelle</h4><p>Tous les éléments de Scalyo (marque, logo, code, contenus) sont la propriété exclusive de Stratimaagency. Toute reproduction sans autorisation écrite est interdite.</p><h4>Droit applicable</h4><p>Droit français. En cas de litige, compétence exclusive des tribunaux français.</p><h4>Contact</h4><p><a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p>`,
    en: `<h4>Publisher</h4><p><strong>Stratimaagency</strong> (trading as Scalyo)<br>Email: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a><br>Website: scalyo.app</p><h4>Hosting</h4><p>Cloudflare Pages — San Francisco, CA, USA<br>Supabase — Europe infrastructure (Ireland, GDPR compliant)<br>Stripe — secure payments, San Francisco, CA, USA</p><h4>Intellectual Property</h4><p>All Scalyo elements (brand, logo, code, content) are the exclusive property of Stratimaagency. Any reproduction without prior written authorization is prohibited.</p><h4>Applicable Law</h4><p>French law. In case of dispute, French courts have exclusive jurisdiction.</p><h4>Contact</h4><p><a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p>`,
    kr: `<h4>발행자</h4><p><strong>Stratimaagency</strong> (Scalyo 브랜드)<br>이메일: <a href='mailto:contact@scalyo.app'>contact@scalyo.app</a><br>웹사이트: scalyo.app</p><h4>호스팅</h4><p>Cloudflare Pages — San Francisco, CA, USA<br>Supabase — 유럽 인프라 (아일랜드, GDPR 준수)<br>Stripe — 안전한 결제, San Francisco, CA, USA</p><h4>지적 재산권</h4><p>Scalyo의 모든 요소(브랜드, 로고, 코드, 콘텐츠)는 Stratimaagency의 독점 자산입니다. 사전 서면 동의 없이 복제는 금지됩니다.</p><h4>준거법</h4><p>프랑스 법률 적용. 분쟁 시 프랑스 법원 단독 관할.</p><h4>문의</h4><p><a href='mailto:contact@scalyo.app'>contact@scalyo.app</a></p>`,
  }
  return content[lang] || content.fr
})
function t(key) {
  return (L[locale.value] || L.fr)[key] || L.fr[key] || key
}

const langs = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'kr', label: '한국어' },
]

/* ── State ── */
const rootEl = ref(null)
const scrolled = ref(false)
const mobileMenu = ref(false)
const activeDemo = ref(0)
const activeModule = ref(0)
const openFaq = ref(null)

/* ROI */
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
  if (roiCsms.value <= 3) return t('roi_plan_starter')
  if (roiCsms.value <= 10) return t('roi_plan_growth')
  return t('roi_plan_elite')
})

/* ── Demo tabs ── */
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
  { name: 'Leroy Finance', health: 3.2, color: '#ef4444' },
  { name: 'NovaTech', health: 7.8, color: '#3b82f6' },
]

/* ── Stats ── */
const statsData = computed(() => [
  { n: '-34%', l: t('stat1'), s: t('stat1n'), icon: '📉' },
  { n: '+18%', l: t('stat2'), s: t('stat2n'), icon: '📈' },
  { n: '6h',   l: t('stat3'), s: t('stat3n'), icon: '⏱️' },
  { n: '30j',  l: t('stat4'), s: t('stat4n'), icon: '🔮' },
])

/* ── Modules (features) ── */
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

/* ── Integrations ── */
const integrations = computed(() => [
  { icon: '☁️', name: 'Salesforce', tag: t('integ_sf_tag') },
  { icon: '📧', name: 'Gmail', tag: t('integ_gmail_tag') },
  { icon: '📬', name: 'IMAP', tag: t('integ_imap_tag') },
  { icon: '💬', name: 'Slack', tag: t('integ_slack_tag') },
  { icon: '📹', name: 'Zoom', tag: t('integ_zoom_tag') },
  { icon: '📆', name: 'Calendly', tag: t('integ_calendly_tag') },
  { icon: '📋', name: 'Asana', tag: t('integ_asana_tag') },
])

/* ── Selling points ── */
const sellingPoints = computed(() => [
  { icon: '🔗', label: t('sell_1_label'), desc: t('sell_1_desc') },
  { icon: '⚡', label: t('sell_2_label'), desc: t('sell_2_desc') },
  { icon: '🛡️', label: t('sell_3_label'), desc: t('sell_3_desc') },
  { icon: '🤖', label: t('sell_4_label'), desc: t('sell_4_desc') },
  { icon: '💚', label: t('sell_5_label'), desc: t('sell_5_desc') },
  { icon: '💎', label: t('sell_6_label'), desc: t('sell_6_desc') },
  { icon: '🧩', label: t('sell_7_label'), desc: t('sell_7_desc') },
  { icon: '🇫🇷', label: t('sell_8_label'), desc: t('sell_8_desc') },
])

/* ── FAQ ── */
const faqItems = computed(() => [
  { q: t('faq_q1'), a: t('faq_a1') },
  { q: t('faq_q2'), a: t('faq_a2') },
  { q: t('faq_q3'), a: t('faq_a3') },
  { q: t('faq_q4'), a: t('faq_a4') },
  { q: t('faq_q5'), a: t('faq_a5') },
  { q: t('faq_q6'), a: t('faq_a6') },
  { q: t('faq_q7'), a: t('faq_a7') },
  { q: t('faq_q8'), a: t('faq_a8') },
])

/* ── Scroll ── */
function onScroll() { scrolled.value = window.scrollY > 30 }
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  mobileMenu.value = false
}

/* ── Intersection Observer for animations ── */
let observer = null
let demoCycleTimer = null
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })

  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.08 })

  // Hide below-fold elements then observe them
  rootEl.value?.querySelectorAll('.anim-section').forEach(el => {
    const rect = el.getBoundingClientRect()
    if (rect.top > window.innerHeight) {
      el.classList.add('anim-hidden')
    }
    observer.observe(el)
  })

  // Auto-cycle dashboard tabs
  demoCycleTimer = setInterval(() => {
    activeDemo.value = (activeDemo.value + 1) % demoTabs.length
  }, 5000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  observer?.disconnect()
  clearInterval(demoCycleTimer)
})
</script>

<style scoped>
/* ═══════════════════ BASE ═══════════════════ */
* { box-sizing: border-box; margin: 0; padding: 0; }
.landing { --lp-purple: #7c3aed; --lp-purple-dark: #6d28d9; --lp-purple-light: #a78bfa; --lp-bg: #f8f9fb; --lp-bg2: #f3f4f6; --lp-surface: #ffffff; --lp-border: #e5e7eb; --lp-text: #1a1a2e; --lp-muted: #6b7280; --lp-green: #10b981; --lp-red: #ef4444; --lp-amber: #f59e0b; --lp-blue: #3b82f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: var(--lp-text); background: var(--lp-bg); line-height: 1.6; overflow-x: hidden; min-height: 100vh; }
.container { max-width: 1160px; margin: 0 auto; padding: 0 24px; }
.center { text-align: center; }
.accent { color: var(--lp-purple-light); }
a { color: inherit; text-decoration: none; }

/* ═══════════════════ ANIMATIONS ═══════════════════ */
.anim-section { opacity: 1; transform: translateY(0); }
.anim-section.anim-hidden { opacity: 0; transform: translateY(40px); transition: opacity 0.8s ease, transform 0.8s ease; }
.anim-section.anim-hidden.visible { opacity: 1; transform: translateY(0); }
.anim-section.anim-hidden[data-anim="fade-up-delay"] { transition-delay: 0.3s; }

@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes pulse-glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
@keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes live-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

.emoji-3d { display: inline-block; font-size: 2rem; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4)); animation: float 3s ease-in-out infinite; }

/* ═══════════════════ BUTTONS ═══════════════════ */
.btn-primary { background: linear-gradient(135deg, var(--lp-purple), var(--lp-purple-dark)); color: #fff; border: none; padding: 12px 28px; border-radius: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; display: inline-block; transition: all 0.3s; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,58,237,0.4); }
.btn-primary.lg { padding: 16px 36px; font-size: 1rem; border-radius: 14px; }
.btn-primary-sm { background: var(--lp-purple); color: #fff; border: none; padding: 8px 20px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-block; transition: all 0.2s; }
.btn-primary-sm:hover { background: var(--lp-purple-dark); }
.btn-outline { background: transparent; color: var(--lp-text); border: 1px solid var(--lp-border); padding: 12px 28px; border-radius: 12px; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: inline-block; transition: all 0.3s; }
.btn-outline:hover { border-color: var(--lp-purple-light); color: var(--lp-purple-light); }
.btn-outline.lg { padding: 16px 36px; font-size: 1rem; border-radius: 14px; }
.btn-outline-light { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.3); padding: 12px 28px; border-radius: 12px; font-size: 0.9rem; font-weight: 500; cursor: pointer; display: inline-block; transition: all 0.3s; }
.btn-outline-light:hover { background: rgba(255,255,255,0.18); }
.btn-outline-light.lg { padding: 16px 36px; font-size: 1rem; }
.btn-ghost-sm { color: var(--lp-muted); font-size: 0.85rem; padding: 8px 14px; border-radius: 8px; transition: color 0.2s; }
.btn-ghost-sm:hover { color: var(--lp-purple-light); }
.glow-btn { box-shadow: 0 0 30px rgba(124,58,237,0.3), 0 0 60px rgba(124,58,237,0.1); }

/* ═══════════════════ NAVBAR ═══════════════════ */
.nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; background: rgba(248,249,251,0.88); backdrop-filter: blur(20px); border-bottom: 1px solid transparent; transition: all 0.3s; }
.nav.scrolled { border-bottom-color: var(--lp-border); background: rgba(255,255,255,0.97); box-shadow: 0 1px 12px rgba(0,0,0,0.06); }
.nav-inner { max-width: 1160px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 20px; }
.logo-link { display: flex; align-items: center; gap: 8px; }
.logo-text { font-weight: 700; font-size: 1.1rem; color: var(--lp-text); }
.nav-links { display: flex; gap: 28px; flex: 1; margin-left: 40px; }
.nav-links a { color: var(--lp-muted); font-size: 0.875rem; font-weight: 500; transition: color 0.2s; }
.nav-links a:hover { color: var(--lp-purple); }
.nav-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
.lang-switch { display: flex; gap: 2px; background: var(--lp-surface); border-radius: 8px; padding: 2px; }
.lang-switch button { background: none; border: none; color: var(--lp-muted); font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.lang-switch button.active { color: #fff; background: var(--lp-purple); font-weight: 600; }
.burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 4px; margin-left: auto; }
.burger span { display: block; width: 22px; height: 2px; background: var(--lp-text); border-radius: 2px; }
.mobile-menu { padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 14px; border-top: 1px solid var(--lp-border); background: #fff; }
.mobile-menu a { color: var(--lp-muted); font-size: 0.9rem; }

/* ═══════════════════ HERO ═══════════════════ */
.hero { padding: 140px 0 60px; position: relative; overflow: hidden; }
.hero-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%); pointer-events: none; animation: pulse-glow 6s ease-in-out infinite; }
.hero-content { text-align: center; position: relative; z-index: 1; }
.hero-badge { display: inline-flex; align-items: center; gap: 10px; background: var(--lp-surface); border: 1px solid var(--lp-border); padding: 8px 20px; border-radius: 999px; font-size: 0.82rem; color: var(--lp-muted); margin-bottom: 32px; }
.badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--lp-purple); box-shadow: 0 0 12px var(--lp-purple); }
.hero-title { font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 800; line-height: 1.1; margin-bottom: 20px; letter-spacing: -0.02em; }
.hero-title :deep(.accent) { background: linear-gradient(135deg, var(--lp-purple-light), #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero-sub { font-size: 1.05rem; color: var(--lp-muted); max-width: 580px; margin: 0 auto 36px; line-height: 1.7; }
.hero-ctas { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
.proof-row { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; }
.proof-item { font-size: 0.8rem; color: var(--lp-muted); }

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

/* ═══════════════════ STATS ═══════════════════ */
.stats-section { padding: 80px 0; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.stat-card { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 16px; padding: 28px 20px; text-align: center; transition: transform 0.3s, box-shadow 0.3s; }
.stat-card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(124,58,237,0.12); }
.stat-emoji { margin-bottom: 12px; }
.stat-number { font-size: 2.6rem; font-weight: 800; background: linear-gradient(135deg, var(--lp-purple), var(--lp-purple-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 6px; }
.stat-label { font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; }
.stat-note { font-size: 0.78rem; color: var(--lp-muted); line-height: 1.5; }

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

/* ═══════════════════ ROI ═══════════════════ */
.roi-section { padding: 80px 0; background: var(--lp-bg2); }
.roi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
.roi-sliders { display: flex; flex-direction: column; gap: 24px; }
.roi-field label { display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 10px; }
.roi-field label strong { color: var(--lp-purple-light); }
.roi-field input[type="range"] { width: 100%; height: 6px; -webkit-appearance: none; background: var(--lp-border); border-radius: 3px; outline: none; }
.roi-field input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--lp-purple); cursor: pointer; box-shadow: 0 0 12px rgba(124,58,237,0.5); }
.roi-results { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 20px; padding: 28px; }
.roi-main-result { text-align: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--lp-border); }
.roi-big { display: block; font-size: 2.8rem; font-weight: 800; background: linear-gradient(135deg, var(--lp-green), #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
.roi-desc { font-size: 0.85rem; color: var(--lp-muted); }
.roi-details { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.roi-detail { display: flex; justify-content: space-between; font-size: 0.85rem; }
.roi-dl { color: var(--lp-muted); }
.roi-dv { font-weight: 600; }
.roi-dv.red { color: var(--lp-red); }
.roi-dv.green { color: var(--lp-green); }
.roi-dv.purple { color: var(--lp-purple-light); }
.roi-plan { background: rgba(124,58,237,0.08); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
.roi-plan-label { color: var(--lp-muted); }
.roi-plan-value { color: var(--lp-purple-light); font-weight: 600; }

/* ═══════════════════ INTEGRATIONS ═══════════════════ */
.integ-section { padding: 80px 0; }
.integ-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 32px 0 20px; }
.integ-card { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 14px; padding: 20px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.3s; }
.integ-card:hover { border-color: var(--lp-purple); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(124,58,237,0.1); }
.integ-icon { font-size: 2rem; margin-bottom: 4px; }
.integ-card strong { font-size: 0.9rem; }
.integ-card small { font-size: 0.72rem; color: var(--lp-muted); }
.integ-avail { font-size: 0.68rem; color: var(--lp-green); background: rgba(16,185,129,0.1); padding: 2px 10px; border-radius: 999px; }
.integ-more { text-align: center; font-size: 0.82rem; color: var(--lp-muted); margin-top: 20px; }

/* ═══════════════════ WHY SCALYO ═══════════════════ */
.why-section { padding: 80px 0; background: var(--lp-bg2); }
.sell-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 36px; }
.sell-card { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 16px; padding: 24px; transition: all 0.3s; }
.sell-card:hover { border-color: var(--lp-purple); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(124,58,237,0.1); }
.sell-icon { margin-bottom: 12px; font-size: 1.8rem; }
.sell-card h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 8px; }
.sell-card p { font-size: 0.82rem; color: var(--lp-muted); line-height: 1.6; }

/* ═══════════════════ PRICING ═══════════════════ */
.pricing-section { padding: 80px 0; }
.pricing-note { font-size: 0.82rem; color: var(--lp-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }
.pricing-note :deep(strong) { color: var(--lp-purple-light); }
.plans-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 40px; }
.plan-card { background: var(--lp-surface); border: 1px solid var(--lp-border); border-radius: 20px; padding: 32px 24px; position: relative; transition: all 0.3s; }
.plan-card:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.plan-card.popular { border-color: var(--lp-purple); box-shadow: 0 0 40px rgba(124,58,237,0.15); background: rgba(124,58,237,0.04); }
.popular-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--lp-purple), var(--lp-purple-dark)); color: #fff; font-size: 0.72rem; padding: 6px 20px; border-radius: 999px; font-weight: 600; white-space: nowrap; }
.plan-name { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; color: var(--lp-muted); margin-bottom: 14px; }
.plan-price { font-size: 2.8rem; font-weight: 800; margin-bottom: 6px; }
.currency { font-size: 1.6rem; vertical-align: top; margin-top: 8px; display: inline-block; }
.period { font-size: 0.9rem; color: var(--lp-muted); font-weight: 400; }
.plan-desc { font-size: 0.82rem; color: var(--lp-muted); margin-bottom: 24px; }
.plan-features { list-style: none; margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px; }
.plan-features li { font-size: 0.85rem; color: var(--lp-text); }
.plan-btn { display: block; text-align: center; width: 100%; }

.plan-footnote { text-align: center; font-size: 0.78rem; color: var(--lp-muted); margin-top: 28px; line-height: 1.6; }
.plan-footnote :deep(strong) { color: var(--lp-purple-light); }

/* ═══════════════════ FAQ ═══════════════════ */
.faq-section { padding: 80px 0; background: var(--lp-bg2); }
.faq-list { max-width: 700px; margin: 0 auto; }
.faq-item { border-bottom: 1px solid var(--lp-border); cursor: pointer; transition: background 0.2s; }
.faq-item:hover { background: rgba(124,58,237,0.03); }
.faq-q { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; font-size: 0.95rem; font-weight: 500; }
.faq-toggle { color: var(--lp-purple-light); font-size: 1.3rem; flex-shrink: 0; margin-left: 16px; }
.faq-a { max-height: 0; overflow: hidden; transition: max-height 0.4s ease, padding 0.4s ease; }
.faq-item.open .faq-a { max-height: 250px; padding-bottom: 18px; }
.faq-a p { font-size: 0.88rem; color: var(--lp-muted); line-height: 1.7; }

/* ═══════════════════ FINAL CTA ═══════════════════ */
.final-cta-section { padding: 120px 0; background: linear-gradient(135deg, #0f0a2e, #1e1145, #2d1b69); position: relative; overflow: hidden; }
.final-cta-glow { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%); pointer-events: none; animation: pulse-glow 5s ease-in-out infinite; }
.final-cta-title { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1.15; margin-bottom: 16px; position: relative; }
.final-cta-title :deep(em) { font-style: normal; background: linear-gradient(135deg, var(--lp-purple-light), #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.final-cta-sub { font-size: 1rem; color: rgba(255,255,255,0.6); margin-bottom: 36px; }
.final-cta-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
.final-cta-note { font-size: 0.78rem; color: rgba(255,255,255,0.4); }

/* ═══════════════════ FOOTER ═══════════════════ */
.footer-section { background: #080a14; padding: 60px 0 24px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 36px; border-bottom: 1px solid var(--lp-border); }
.footer-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; margin-bottom: 14px; }
.footer-brand p { font-size: 0.82rem; color: var(--lp-muted); line-height: 1.6; margin-bottom: 8px; }
.footer-markets { font-size: 0.78rem; }
.footer-col h4 { font-size: 0.875rem; font-weight: 600; margin-bottom: 14px; }
.footer-col a { display: block; font-size: 0.82rem; color: var(--lp-muted); margin-bottom: 10px; transition: color 0.2s; }
.footer-col a:hover { color: var(--lp-purple-light); }
.footer-bottom { padding-top: 20px; text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); }

/* ═══════════════════ RESPONSIVE ═══════════════════ */
@media (max-width: 900px) {
  .hide-mobile { display: none !important; }
  .burger { display: flex; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .module-detail { grid-template-columns: 1fr; }
  .roi-grid { grid-template-columns: 1fr; }
  .plans-grid { grid-template-columns: 1fr; max-width: 400px; margin-left: auto; margin-right: auto; }
  .sell-grid { grid-template-columns: repeat(2, 1fr); }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .mock-sidebar { width: auto; flex-direction: row; overflow-x: auto; border-right: none; border-bottom: 1px solid var(--lp-border); padding: 8px; }
  .mock-sidebar-logo { display: none; }
  .mockup-body { flex-direction: column; }
  .tab-label { display: none; }
  .mock-kanban { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .stats-grid, .sell-grid { grid-template-columns: 1fr; }
  .hero { padding: 110px 0 40px; }
  .hero-title { font-size: 2rem; }
  .footer-grid { grid-template-columns: 1fr; }
  .module-chips { gap: 6px; }
  .module-chip { padding: 6px 12px; font-size: 0.75rem; }
  .integ-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 901px) {
  .hide-desktop { display: none !important; }
}

/* Slide transition for mobile menu */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
.lm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; }
.lm-box { background: #ffffff; border-radius: 16px; width: 100%; max-width: 680px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.2); color: #1a1a1a; }
.lm-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; background: #fff; border-radius: 16px 16px 0 0; }
.lm-legal-tabs { display: flex; gap: 4px; }
.lm-tab { background: none; border: none; padding: 8px 16px; font-size: 0.88rem; font-weight: 500; cursor: pointer; border-radius: 8px; color: #6b7280; transition: all 0.15s; }
.lm-tab.active { background: #0f7b6c; color: #fff; font-weight: 600; }
.lm-tab:hover:not(.active) { background: #f3f4f6; }
.lm-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #9ca3af; padding: 4px 8px; border-radius: 6px; }
.lm-close:hover { background: #f3f4f6; }
.lm-body { overflow-y: auto; padding: 20px 24px; flex: 1; background: #ffffff; color: #1a1a1a; }
.lm-body h4 { font-size: 1rem; font-weight: 700; margin: 16px 0 6px; }
.lm-body p { font-size: 0.88rem; line-height: 1.7; color: #374151; margin-bottom: 10px; }
.lm-body ul { margin: 6px 0 10px 20px; }
.lm-body li { font-size: 0.88rem; color: #374151; margin-bottom: 4px; }
.lm-body a { color: #0f7b6c; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
@media (max-width: 600px) { .lm-box { max-height: 95vh; } .lm-legal-tabs { flex-wrap: wrap; } }
</style>
