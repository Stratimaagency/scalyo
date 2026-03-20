<template>
  <div class="landing">

<!-- NAV -->
<nav id="main-nav" :class="{ scrolled: navScrolled }">
  <a href="/" class="nav-logo">
    <div class="nav-logo-icon">S</div>
    Scalyo
  </a>
  <div class="nav-links">
    <a href="#features">{{ t('nav_features') }}</a>
    <a href="#roi">{{ t('nav_roi') }}</a>
    <a href="#pricing">{{ t('nav_pricing') }}</a>
    <a href="#faq">{{ t('nav_faq') }}</a>
  </div>
  <div class="nav-right">
    <router-link to="/login" class="n-ghost">{{ t('nav_login') }}</router-link>
    <router-link to="/login" class="n-solid">{{ t('nav_cta') }}</router-link>
    <button class="hamburger" :class="{ open: mobileMenuOpen }" aria-label="Menu" @click="mobileMenuOpen = !mobileMenuOpen">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="lang-sw">
    <button :class="{ active: lang === 'fr' }" @click="setLang('fr')">FR</button>
    <button :class="{ active: lang === 'en' }" @click="setLang('en')">EN</button>
    <button :class="{ active: lang === 'kr' }" @click="setLang('kr')">한국어</button>
  </div>
</nav>
<div class="mobile-menu" :class="{ open: mobileMenuOpen }">
  <a href="#features" @click="closeMobile">{{ t('nav_features') }}</a>
  <a href="#roi" @click="closeMobile">{{ t('nav_roi') }}</a>
  <a href="#pricing" @click="closeMobile">{{ t('nav_pricing') }}</a>
  <a href="#faq" @click="closeMobile">{{ t('nav_faq') }}</a>
  <router-link to="/login" class="mm-cta" @click="closeMobile">{{ t('cta_free') }}</router-link>
</div>

<!-- HERO -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <div class="hero-badge rv">
      <div class="badge-dot"></div>
      <span>{{ t('hero_badge') }}</span>
    </div>
    <h1 class="hero-h1 rv" v-html="t('hero_h1')"></h1>
    <p class="hero-sub rv d1" v-html="t('hero_sub')"></p>
    <div class="hero-cta rv d2">
      <router-link to="/login" class="btn-primary">
        {{ t('cta_free_14') }}
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </router-link>
      <a href="#pricing" class="btn-secondary">{{ t('see_pricing') }}</a>
    </div>
    <div class="hero-social-proof rv d3">
      <span>{{ t('proof_no_card') }}</span>
      <div class="hsp-sep"></div>
      <span>{{ t('proof_14d') }}</span>
      <div class="hsp-sep"></div>
      <span>{{ t('proof_rgpd') }}</span>
      <div class="hsp-sep"></div>
      <span>{{ t('proof_support') }}</span>
    </div>
  </div>

  <!-- SCREENSHOT -->
  <div class="hero-screenshot rv d3">
    <div class="screenshot-glow"></div>
    <div class="app-shell">
      <div class="app-topbar">
        <div class="topbar-dots">
          <div class="td" style="background:#FF5F57"></div>
          <div class="td" style="background:#FEBC2E"></div>
          <div class="td" style="background:#28C840"></div>
        </div>
        <div class="topbar-url">&#x1F512; app.scalyo.app</div>
        <div class="topbar-status"><div class="status-dot"></div>{{ t('demo_live') }}</div>
      </div>
      <div class="app-layout">
        <div class="app-sidebar">
          <div class="sb-logo">
            <div class="sb-logo-dot"></div>
            <span class="sb-logo-txt">Scalyo</span>
          </div>
          <div class="sb-section">{{ t('demo_menu') }}</div>
          <div class="sb-item active"><span class="sb-icon">&#x25A6;</span><span>{{ t('demo_dashboard') }}</span></div>
          <div class="sb-item"><span class="sb-icon">&#x25CE;</span><span>{{ t('demo_portfolio') }}</span></div>
          <div class="sb-item"><span class="sb-icon">&#x2197;</span>KPIs</div>
          <div class="sb-item"><span class="sb-icon">&#x2661;</span><span>{{ t('feat_wb') }}</span></div>
          <div class="sb-item"><span class="sb-icon">&#x25C8;</span><span>{{ t('feat_coach') }}</span></div>
          <div class="sb-item"><span class="sb-icon">&#x2611;</span>Tasks</div>
          <div class="sb-item"><span class="sb-icon">&#x2709;</span><span>{{ t('feat_email') }}</span></div>
        </div>
        <div class="app-main">
          <div class="app-header">
            <div class="app-title">Portefeuille clients</div>
            <div class="app-subtitle"><div class="status-dot"></div>{{ t('demo_updated') }}</div>
          </div>
          <div class="kpi-grid">
            <div class="kpi"><div class="kpi-lbl">NRR</div><div class="kpi-val c-teal">112%</div><div class="kpi-delta c-green">&#x2191; +4 pts vs M-1</div></div>
            <div class="kpi"><div class="kpi-lbl">{{ t('demo_mrr') }}</div><div class="kpi-val">284K&euro;</div><div class="kpi-delta c-green">+12K ce mois</div></div>
            <div class="kpi"><div class="kpi-lbl">{{ t('demo_churn') }}</div><div class="kpi-val c-amber">3</div><div class="kpi-delta c-amber">{{ t('demo_action') }}</div></div>
            <div class="kpi"><div class="kpi-lbl">{{ t('demo_wellbeing_kpi') }}</div><div class="kpi-val c-blue">7.8<span style="font-size:13px;color:var(--dt3)">/10</span></div><div class="kpi-delta c-green">En forme</div></div>
          </div>
          <div class="app-row2">
            <div class="app-card">
              <div class="card-lbl">{{ t('demo_nrr') }}</div>
              <div class="chart-wrap">
                <div class="bar" style="height:40%;background:var(--dk4)"></div>
                <div class="bar" style="height:55%;background:var(--dk4)"></div>
                <div class="bar" style="height:48%;background:var(--dk4)"></div>
                <div class="bar" style="height:70%;background:var(--dk4)"></div>
                <div class="bar" style="height:64%;background:var(--dk4)"></div>
                <div class="bar" style="height:92%;background:linear-gradient(to top,var(--teal),rgba(13,148,136,.25))"></div>
              </div>
            </div>
            <div class="app-card">
              <div class="card-lbl">{{ t('demo_priority') }}</div>
              <div class="accounts-list">
                <div class="account"><span class="acc-name">Leroy Finance</span><span class="acc-tag tag-red">{{ t('tag_critical') }}</span></div>
                <div class="account"><span class="acc-name">TechPilot SAS</span><span class="acc-tag tag-amber">{{ t('tag_risk') }}</span></div>
                <div class="account"><span class="acc-name">NexFlow Pro</span><span class="acc-tag tag-green">{{ t('tag_stable') }}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="stats-inner">
    <div class="stat-cell rv">
      <div class="stat-number">&minus;34%</div>
      <div class="stat-label">{{ t('stat1') }}</div>
      <div class="stat-note">{{ t('stat1n') }}</div>
    </div>
    <div class="stat-cell rv d1">
      <div class="stat-number">+18pts</div>
      <div class="stat-label">{{ t('stat2') }}</div>
      <div class="stat-note">{{ t('stat2n') }}</div>
    </div>
    <div class="stat-cell rv d2">
      <div class="stat-number">6h</div>
      <div class="stat-label">{{ t('stat3') }}</div>
      <div class="stat-note">{{ t('stat3n') }}</div>
    </div>
    <div class="stat-cell rv d3">
      <div class="stat-number">30j</div>
      <div class="stat-label">{{ t('stat4') }}</div>
      <div class="stat-note">{{ t('stat4n') }}</div>
    </div>
  </div>
</div>

<!-- FEATURES — alternating panels -->
<section class="section section-dark" id="features">
  <div class="container">

    <!-- Panel 1 -->
    <div class="feat-panel rv" style="margin-bottom:100px">
      <div class="feat-text">
        <div class="label"><div class="label-line"></div><span>{{ t('feat1_tag') }}</span></div>
        <h2 class="h2-light" v-html="t('feat1_h2')"></h2>
        <p class="feat-body">{{ t('feat1_body') }}</p>
        <div class="feat-points">
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat1_p1') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat1_p2') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat1_p3') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat1_p4') }}</span></div>
        </div>
      </div>
      <div class="feat-visual">
        <div class="fv-pad">
          <div class="fv-header">
            <span class="fv-title" style="color:var(--dt)">{{ t('pb_title') }}</span>
            <span class="fv-badge badge-live">{{ t('pb_ongoing') }}</span>
          </div>
          <div class="playbook-list" style="margin-bottom:14px">
            <div class="pb-step done"><div class="pb-num done">&#x2713;</div><span class="pb-text">{{ t('pb_s1') }}</span></div>
            <div class="pb-step done"><div class="pb-num done">&#x2713;</div><span class="pb-text">{{ t('pb_s2') }}</span></div>
            <div class="pb-step" style="border-color:var(--teal);background:rgba(13,148,136,.04)"><div class="pb-num">3</div><span class="pb-text" style="color:var(--dt);font-weight:500">{{ t('pb_step3') }}</span></div>
            <div class="pb-step"><div class="pb-num" style="opacity:.4">4</div><span class="pb-text" style="opacity:.5">{{ t('pb_step4') }}</span></div>
          </div>
          <div style="padding:10px 12px;border-radius:8px;background:rgba(13,148,136,.06);border:1px solid rgba(13,148,136,.15)">
            <div style="font-size:11px;font-weight:600;color:var(--teal);margin-bottom:2px">{{ t('pb_ai_label') }}</div>
            <div style="font-size:12.5px;color:var(--dt2);line-height:1.55">{{ t('pb_ai_msg') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 2 -->
    <div class="feat-panel flip rv" style="margin-bottom:100px">
      <div class="feat-text">
        <div class="label"><div class="label-line"></div><span>{{ t('feat2_tag') }}</span></div>
        <h2 class="h2-light" v-html="t('feat2_h2')"></h2>
        <p class="feat-body">{{ t('feat2_body') }}</p>
        <div class="feat-points">
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat2_p1') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat2_p2') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat2_p3') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat2_p4') }}</span></div>
        </div>
      </div>
      <div class="feat-visual">
        <div class="fv-pad">
          <div class="fv-header">
            <span class="fv-title" style="color:var(--dt)">{{ t('d_wb_title') }}</span>
            <span class="fv-badge badge-live">{{ t('d_wb_upd') }}</span>
          </div>
          <div class="wb-grid">
            <div class="wb-card">
              <div class="wb-label">{{ t('d_wb_avg') }}</div>
              <div class="wb-score" style="color:var(--teal)">7.8</div>
              <div class="wb-sub">{{ t('d_wb_sub') }}</div>
              <div class="wb-bar"><div class="wb-fill" style="width:78%;background:var(--teal)"></div></div>
            </div>
            <div class="wb-card">
              <div class="wb-label">{{ t('d_wb_load') }}</div>
              <div class="wb-score" style="color:#FBBF24">6.2</div>
              <div class="wb-sub">{{ t('wb_load_sub') }}</div>
              <div class="wb-bar"><div class="wb-fill" style="width:62%;background:#FBBF24"></div></div>
            </div>
            <div class="wb-card" style="grid-column:1/-1">
              <div class="wb-label">{{ t('wb_alert') }}</div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div style="font-size:13px;color:var(--dt)">Marie D. — Score 4.5/10</div>
                <span style="font-size:11px;font-weight:600;color:#F87171;padding:2px 8px;border-radius:100px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.15)">{{ t('d_wb_warn') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 3 -->
    <div class="feat-panel rv">
      <div class="feat-text">
        <div class="label"><div class="label-line"></div><span>{{ t('feat3_tag') }}</span></div>
        <h2 class="h2-light" v-html="t('feat3_h2')"></h2>
        <p class="feat-body">{{ t('feat3_body') }}</p>
        <div class="feat-points">
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat3_p1') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat3_p2') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat3_p3') }}</span></div>
          <div class="feat-point"><div class="fp-check">&#x2713;</div><span>{{ t('feat3_p4') }}</span></div>
        </div>
      </div>
      <div class="feat-visual">
        <div class="fv-pad">
          <div class="fv-header">
            <span class="fv-title" style="color:var(--dt)">{{ t('demo_coach_fv_title') }}</span>
            <span class="fv-badge badge-live">{{ t('coach_online') }}</span>
          </div>
          <div class="coach-wrap">
            <div class="coach-msg">{{ t('coach_user_msg') }}</div>
            <div class="coach-author">{{ t('demo_coach_author') }}</div>
            <div class="coach-msg ai" v-html="t('coach_ai')"></div>
            <div class="coach-input">
              <span class="coach-placeholder">{{ t('coach_placeholder') }}</span>
              <div class="coach-send">&#x2191;</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

<!-- FEATURES DETAIL -->
<div id="features-detail">
<section class="chips-section">
  <div class="chips-label">{{ t('fl_chips_label') }}</div>
  <div class="chips-grid">
    <div class="chip active"><div class="chip-icon">&#x1F3AF;</div><div class="chip-label">{{ t('fl_c1') }}</div></div>
    <div class="chip"><div class="chip-icon">&#x1F4CA;</div><div class="chip-label">{{ t('fl_c2') }}</div></div>
    <div class="chip"><div class="chip-icon">&#x1F49A;</div><div class="chip-label">{{ t('fl_c3') }}</div></div>
    <div class="chip"><div class="chip-icon">&#x1F916;</div><div class="chip-label">{{ t('fl_c4') }}</div></div>
    <div class="chip"><div class="chip-icon">&#x2709;&#xFE0F;</div><div class="chip-label">{{ t('fl_c5') }}</div></div>
    <div class="chip"><div class="chip-icon">&#x1F4C5;</div><div class="chip-label">{{ t('fl_c6') }}</div></div>
    <div class="chip"><div class="chip-icon">&#x2705;</div><div class="chip-label">{{ t('fl_c7') }}</div></div>
    <div class="chip"><div class="chip-icon">&#x1F4DA;</div><div class="chip-label">{{ t('fl_c8') }}</div></div>
  </div>
</section>
<div class="stats-band">
  <div class="stats-grid">
    <div><div class="stat-n">-34%</div><div class="stat-l">{{ t('fl_s1l') }}</div><div class="stat-s">{{ t('fl_s1s') }}</div></div>
    <div><div class="stat-n">+18%</div><div class="stat-l">{{ t('fl_s2l') }}</div><div class="stat-s">{{ t('fl_s2s') }}</div></div>
    <div><div class="stat-n">6h</div><div class="stat-l">{{ t('fl_s3l') }}</div><div class="stat-s">{{ t('fl_s3s') }}</div></div>
    <div><div class="stat-n">30j</div><div class="stat-l">{{ t('fl_s4l') }}</div><div class="stat-s">{{ t('fl_s4s') }}</div></div>
  </div>
</div>

<!-- Module 1 -->
<section class="mod-section" id="m1">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">&#x1F3AF;</span><span class="mod-tag-label">{{ t('fl_m1tag') }}</span></div>
      <h2 class="mod-h2">{{ t('fl_m1h2') }}</h2>
      <p class="mod-body">{{ t('fl_m1body') }}</p>
      <ul class="mod-list">
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m1p1') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m1p2') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m1p3') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m1p4') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m1p5') }}</span></li>
      </ul>
      <router-link to="/login" class="mod-btn">{{ t('fl_m1btn') }}</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span>{{ t('d_m1_head') }}</span> <span class="badge ba">{{ t('d_m1_alerts') }}</span></div>
        <div class="hr"><div class="hr-name" style="font-size:12px">Leroy Finance</div><div class="hr-bar"><div class="hr-fill" style="width:25%;background:var(--red)"></div></div><div class="hr-val" style="color:var(--red)">2.5</div><span class="badge br">{{ t('d_m1_crit') }}</span></div>
        <div class="hr"><div class="hr-name" style="font-size:12px">Acme Corp</div><div class="hr-bar"><div class="hr-fill" style="width:62%;background:var(--amber)"></div></div><div class="hr-val" style="color:var(--amber)">6.2</div><span class="badge ba">{{ t('d_m1_watch') }}</span></div>
        <div class="hr"><div class="hr-name" style="font-size:12px">TechVision SAS</div><div class="hr-bar"><div class="hr-fill" style="width:87%;background:var(--teal)"></div></div><div class="hr-val" style="color:var(--teal)">8.7</div><span class="badge bg">{{ t('d_m1_s1') }}</span></div>
        <div class="hr"><div class="hr-name" style="font-size:12px">BioMed Group</div><div class="hr-bar"><div class="hr-fill" style="width:91%;background:var(--teal)"></div></div><div class="hr-val" style="color:var(--teal)">9.1</div><span class="badge bg">{{ t('d_m1_s2') }}</span></div>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(240,246,252,.06)">
          <div style="font-size:10px;color:var(--dt3);text-transform:uppercase;font-weight:700;letter-spacing:.06em;margin-bottom:8px">{{ t('d_m1_reco') }}</div>
          <div style="background:rgba(13,148,136,.06);border:1px solid rgba(13,148,136,.14);border-radius:9px;padding:11px;font-size:12px;color:var(--dt2)">{{ t('d_m1_ai') }}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Module 2 -->
<section class="mod-section" id="m2">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">&#x1F4CA;</span><span class="mod-tag-label">{{ t('fl_m2tag') }}</span></div>
      <h2 class="mod-h2">{{ t('fl_m2h2') }}</h2>
      <p class="mod-body">{{ t('fl_m2body') }}</p>
      <ul class="mod-list">
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m2p1') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m2p2') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m2p3') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m2p4') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m2p5') }}</span></li>
      </ul>
      <router-link to="/login" class="mod-btn">{{ t('fl_m2btn') }}</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span>{{ t('demo_copil_period') }}</span> <span class="badge bg">{{ t('demo_copil_badge') }}</span></div>
        <div class="kpi-g">
          <div class="kpi-c"><div class="kpi-l">NRR</div><div class="kpi-v" style="color:var(--teal)">112%</div><div class="kpi-d dp">{{ t('demo_kpi_d1') }}</div></div>
          <div class="kpi-c"><div class="kpi-l">Churn Rate</div><div class="kpi-v" style="color:var(--red)">3.2%</div><div class="kpi-d dp">{{ t('demo_kpi_d2') }}</div></div>
          <div class="kpi-c"><div class="kpi-l">{{ t('demo_mrr_sec') }}</div><div class="kpi-v">&euro;84K</div><div class="kpi-d dp">&#x25B2; +&euro;6K</div></div>
          <div class="kpi-c"><div class="kpi-l">CSAT</div><div class="kpi-v" style="color:var(--teal)">91%</div><div class="kpi-d dp">&#x25B2; +3%</div></div>
        </div>
        <div style="margin-top:14px;height:54px;position:relative">
          <svg width="100%" height="54" viewBox="0 0 300 54" fill="none" preserveAspectRatio="none">
            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#12CDB8" stop-opacity=".25"/><stop offset="100%" stop-color="#12CDB8" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,46 C50,40 80,30 110,24 C140,18 160,34 190,22 C220,12 250,16 300,6" stroke="rgba(13,148,136,.5)" stroke-width="1.5" fill="none"/>
            <path d="M0,46 C50,40 80,30 110,24 C140,18 160,34 190,22 C220,12 250,16 300,6 L300,54 L0,54Z" fill="url(#g1)"/>
          </svg>
        </div>
        <div style="font-size:10px;color:var(--dt3);text-align:center;margin-top:4px">NRR 6 mois &middot; Objectif 110%</div>
      </div>
    </div>
  </div>
</section>

<!-- Module 3 -->
<section class="mod-section" id="m3">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">&#x1F49A;</span><span class="mod-tag-label">{{ t('fl_m3tag') }}</span></div>
      <h2 class="mod-h2">{{ t('fl_m3h2') }}</h2>
      <p class="mod-body">{{ t('fl_m3body') }}</p>
      <ul class="mod-list">
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m3p1') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m3p2') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m3p3') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m3p4') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m3p5') }}</span></li>
      </ul>
      <router-link to="/login" class="mod-btn">{{ t('fl_m3btn') }}</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span>{{ t('d_m3_head') }}</span> <span class="badge ba">{{ t('d_m3_badge') }}</span></div>
        <div class="wb-g">
          <div class="wb-c"><div class="wb-n">7.2</div><div class="wb-l">{{ t('d_m3_avg') }}</div></div>
          <div class="wb-c"><div class="wb-n" style="color:var(--amber)">7.1</div><div class="wb-l">{{ t('d_m3_load') }}</div></div>
          <div class="wb-c"><div class="wb-n" style="color:var(--red)">1</div><div class="wb-l">{{ t('d_m3_alrt') }}</div></div>
        </div>
        <div style="background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.18);border-radius:9px;padding:11px;margin-bottom:12px">
          <div style="font-size:10px;font-weight:700;color:var(--amber);margin-bottom:3px">{{ t('demo_burnout') }}</div>
          <div style="font-size:12px;color:var(--dt2)">{{ t('d_m3_sara') }}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <div style="flex:1;height:5px;background:rgba(13,148,136,.12);border-radius:100px;overflow:hidden"><div style="width:72%;height:100%;background:var(--teal);border-radius:100px"></div></div>
          <div style="font-size:10px;color:var(--dt3)">{{ t('d_m3_trnd') }}</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Module 4 -->
<section class="mod-section" id="m4">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">&#x1F916;</span><span class="mod-tag-label">{{ t('fl_m4tag') }}</span></div>
      <h2 class="mod-h2">{{ t('fl_m4h2') }}</h2>
      <p class="mod-body">{{ t('fl_m4body') }}</p>
      <ul class="mod-list">
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m4p1') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m4p2') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m4p3') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m4p4') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m4p5') }}</span></li>
      </ul>
      <router-link to="/login" class="mod-btn">{{ t('fl_m4btn') }}</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span>{{ t('demo_coach_head') }}</span> <span class="badge bg">{{ t('demo_coach_online') }}</span></div>
        <div class="msgs">
          <div class="msg msg-u">{{ t('demo_coach_q1') }}</div>
          <div class="msg msg-a"><div class="msg-tag">{{ t('demo_coach_tag1') }}</div><span v-html="t('demo_coach_a1')"></span></div>
          <div class="msg msg-u">{{ t('demo_coach_q2') }}</div>
          <div class="msg msg-a"><div class="msg-tag">{{ t('demo_coach_tag2') }}</div><span v-html="t('demo_coach_a2')"></span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Module 5 -->
<section class="mod-section" id="m5">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">&#x2709;&#xFE0F;</span><span class="mod-tag-label">{{ t('fl_m5tag') }}</span></div>
      <h2 class="mod-h2">{{ t('fl_m5h2') }}</h2>
      <p class="mod-body">{{ t('fl_m5body') }}</p>
      <ul class="mod-list">
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m5p1') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m5p2') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m5p3') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m5p4') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m5p5') }}</span></li>
      </ul>
      <router-link to="/login" class="mod-btn">{{ t('fl_m5btn') }}</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span>{{ t('demo_email_head') }}</span> <span class="badge bg">{{ t('demo_ai_badge') }}</span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
          <span style="font-size:11px;background:rgba(13,148,136,.1);border:1px solid rgba(13,148,136,.2);color:var(--teal);padding:4px 10px;border-radius:100px">{{ t('demo_tag_checkin') }}</span>
          <span style="font-size:11px;background:rgba(240,246,252,.06);border:1px solid rgba(240,246,252,.08);color:var(--dt3);padding:4px 10px;border-radius:100px">{{ t('demo_tag_churn') }}</span>
          <span style="font-size:11px;background:rgba(240,246,252,.06);border:1px solid rgba(240,246,252,.08);color:var(--dt3);padding:4px 10px;border-radius:100px">QBR</span>
        </div>
        <div class="ep">
          <div class="ep-row"><div class="ep-lbl">{{ t('demo_email_to') }}</div><div>marc@leroy-finance.com</div></div>
          <div class="ep-row"><div class="ep-lbl">{{ t('d_m5_lbl') }}</div><div style="font-weight:600">{{ t('d_m5_subj') }}</div></div>
          <div style="margin-top:10px;padding-top:10px" v-html="t('d_m5_body')"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Module 6 -->
<section class="mod-section" id="m6">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">&#x1F4C5;</span><span class="mod-tag-label">{{ t('fl_m6tag') }}</span></div>
      <h2 class="mod-h2">{{ t('fl_m6h2') }}</h2>
      <p class="mod-body">{{ t('fl_m6body') }}</p>
      <ul class="mod-list">
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m6p1') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m6p2') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m6p3') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m6p4') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m6p5') }}</span></li>
      </ul>
      <router-link to="/login" class="mod-btn">{{ t('fl_m6btn') }}</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span>{{ t('d_m6_head') }}</span> <span class="badge bg">{{ t('d_m6_ev') }}</span></div>
        <div class="cal">
          <div class="cal-c cal-ev"><div class="cal-title">&#x1F4CA; QBR Leroy</div><div class="cal-sub">14h &middot; 1h</div></div>
          <div class="cal-c"></div>
          <div class="cal-c cal-ev cal-td"><div class="cal-title" style="color:var(--blue)">&#x1F680; Onboarding</div><div class="cal-sub">10h &middot; Acme</div></div>
          <div class="cal-c cal-ev"><div class="cal-title">{{ t('d_m6_ret') }}</div><div class="cal-sub">15h30</div></div>
          <div class="cal-c"></div>
          <div class="cal-c"></div>
          <div class="cal-c cal-ev"><div class="cal-title">&#x1F4CA; QBR TechV.</div><div class="cal-sub">11h &middot; 1h30</div></div>
          <div class="cal-c"></div>
          <div class="cal-c cal-ev"><div class="cal-title" style="color:var(--amber)">&#x26A0; Follow-up</div><div class="cal-sub">16h &middot; Leroy</div></div>
          <div class="cal-c"></div>
        </div>
        <div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap">
          <span style="font-size:10px;color:var(--dt3);display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--teal);border-radius:2px;display:inline-block"></span>QBR</span>
          <span style="font-size:10px;color:var(--dt3);display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--blue);border-radius:2px;display:inline-block"></span>Onboarding</span>
          <span style="font-size:10px;color:var(--dt3);display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--amber);border-radius:2px;display:inline-block"></span>{{ lang === 'fr' ? 'Retention' : lang === 'kr' ? '리텐션' : 'Retention' }}</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Module 7 -->
<section class="mod-section" id="m7">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">&#x2705;</span><span class="mod-tag-label">{{ t('fl_m7tag') }}</span></div>
      <h2 class="mod-h2">{{ t('fl_m7h2') }}</h2>
      <p class="mod-body">{{ t('fl_m7body') }}</p>
      <ul class="mod-list">
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m7p1') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m7p2') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m7p3') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m7p4') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m7p5') }}</span></li>
      </ul>
      <router-link to="/login" class="mod-btn">{{ t('fl_m7btn') }}</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head">{{ t('demo_tb_head') }} <span class="badge ba">{{ t('demo_tb_late') }}</span></div>
        <div class="task-g">
          <div>
            <div class="task-col-h">{{ t('demo_col_1') }}</div>
            <div class="task-card tc-t"><strong style="font-size:11px">QBR BioMed</strong><br/><span style="font-size:10px;color:var(--dt3)">Sophie &middot; 15 f&eacute;v</span></div>
            <div class="task-card tc-b"><strong style="font-size:11px">Emails check-in &times; 5</strong><br/><span style="font-size:10px;color:var(--dt3)">Thomas &middot; 18 f&eacute;v</span></div>
          </div>
          <div>
            <div class="task-col-h">{{ t('demo_col_2') }}</div>
            <div class="task-card tc-a"><strong style="font-size:11px">Playbook Leroy</strong><br/><span style="font-size:10px;color:var(--amber)">{{ t('demo_card_late') }}</span></div>
            <div class="task-card tc-t"><strong style="font-size:11px">Analyse usage Acme</strong><br/><span style="font-size:10px;color:var(--dt3)">Sophie</span></div>
          </div>
          <div>
            <div class="task-col-h">{{ t('demo_col_3') }}</div>
            <div class="task-card tc-t" style="opacity:.55"><strong style="font-size:11px">&#x2713; QBR TechVision</strong><br/><span style="font-size:10px;color:var(--dt3)">{{ t('demo_done_1') }}</span></div>
            <div class="task-card tc-t" style="opacity:.55"><strong style="font-size:11px">&#x2713; Onboarding Acme</strong><br/><span style="font-size:10px;color:var(--dt3)">{{ t('demo_done_2') }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Module 8 -->
<section class="mod-section" id="m8">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">&#x1F4DA;</span><span class="mod-tag-label">{{ t('fl_m8tag') }}</span></div>
      <h2 class="mod-h2">{{ t('fl_m8h2') }}</h2>
      <p class="mod-body">{{ t('fl_m8body') }}</p>
      <ul class="mod-list">
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m8p1') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m8p2') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m8p3') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m8p4') }}</span></li>
        <li><div class="mod-check">&#x2713;</div><span>{{ t('fl_m8p5') }}</span></li>
      </ul>
      <router-link to="/login" class="mod-btn">{{ t('fl_m8btn') }}</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span>{{ t('demo_lib_title') }}</span> <span class="badge bg">{{ t('demo_lib_badge') }}</span></div>
        <div class="res-list">
          <router-link to="/login" class="res-item" style="text-decoration:none;color:inherit;"><div class="res-icon">&#x1F4D6;</div><div class="res-info"><strong>{{ t('demo_guide1') }}</strong><span>PDF &middot; 24 pages &middot; Jan. 2025</span></div><div class="res-dl">&#x2193;</div></router-link>
          <router-link to="/login" class="res-item" style="text-decoration:none;color:inherit;"><div class="res-icon">&#x1F4CA;</div><div class="res-info"><strong>Template QBR SaaS B2B</strong><span>XLSX + Google Slides</span></div><div class="res-dl">&#x2193;</div></router-link>
          <router-link to="/login" class="res-item" style="text-decoration:none;color:inherit;"><div class="res-icon">&#x1F4DE;</div><div class="res-info"><strong>{{ t('demo_script1') }}</strong><span>{{ t('demo_pdf1') }}</span></div><div class="res-dl">&#x2193;</div></router-link>
          <router-link to="/login" class="res-item res-new" style="text-decoration:none;color:inherit;"><div class="res-icon">&#x1F3AF;</div><div class="res-info"><strong style="color:var(--teal)">{{ t('demo_pb_new') }}</strong><span>{{ t('demo_pb_sub') }}</span></div><div class="res-dl">&#x2193;</div></router-link>
        </div>
      </div>
    </div>
  </div>
</section>
</div>
<!-- END FEATURES DETAIL -->


<!-- ROI -->
<section class="section section-dark" id="roi">
  <div class="container">
    <div class="rv" style="margin-bottom:56px">
      <div class="label"><div class="label-line"></div><span>{{ t('roi_tag') }}</span></div>
      <h2 class="h2-light">{{ t('roi_h2') }}</h2>
      <p class="sub-light">{{ t('roi_sub') }}</p>
    </div>
    <div class="roi-wrap">
      <div class="rv">
        <div class="roi-sliders">
          <div>
            <div class="rsl-label">{{ t('roi_lbl_csm') }} <span>{{ roi.csm }}</span></div>
            <input type="range" min="1" max="50" v-model.number="roi.csm" :style="rangeStyle(roi.csm, 1, 50)"/>
          </div>
          <div>
            <div class="rsl-label">{{ t('roi_lbl_acc') }} <span>{{ roi.acc }}</span></div>
            <input type="range" min="5" max="100" v-model.number="roi.acc" :style="rangeStyle(roi.acc, 5, 100)"/>
          </div>
          <div>
            <div class="rsl-label">{{ t('roi_arr_avg') }} <span>{{ roi.arr >= 1000 ? Math.round(roi.arr/1000)+'K' : roi.arr }}&euro;</span></div>
            <input type="range" min="1000" max="100000" step="1000" v-model.number="roi.arr" :style="rangeStyle(roi.arr, 1000, 100000)"/>
          </div>
          <div>
            <div class="rsl-label">{{ t('roi_churn_rate') }} <span>{{ roi.churn }}%</span></div>
            <input type="range" min="1" max="30" v-model.number="roi.churn" :style="rangeStyle(roi.churn, 1, 30)"/>
          </div>
        </div>
      </div>
      <div class="rv d2">
        <div class="roi-big">{{ roiComputed.main }}</div>
        <div class="roi-big-label">{{ t('roi_main_label') }}</div>
        <div class="roi-table">
          <div class="roi-row"><span class="roi-row-label">{{ t('roi_arr') }}</span><span class="roi-row-val">{{ roiComputed.arr }}</span></div>
          <div class="roi-row"><span class="roi-row-label">{{ t('roi_cost') }}</span><span class="roi-row-val">{{ roiComputed.cost }}</span></div>
          <div class="roi-row"><span class="roi-row-label">{{ t('roi_time') }}</span><span class="roi-row-val">{{ roiComputed.time }}</span></div>
          <div class="roi-row"><span class="roi-row-label">{{ t('roi_mult') }}</span><span class="roi-row-val">{{ roiComputed.mult }}</span></div>
        </div>
        <div class="roi-cta-row">
          <div>
            <div class="roi-cta-plan">{{ t('roi_plan_label') }}</div>
            <div class="roi-cta-name">{{ roiComputed.plan }}</div>
          </div>
          <router-link to="/login" class="roi-cta-btn">{{ t('cta_start') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="section section-dark" id="pricing">
  <div class="container">
    <div class="rv">
      <div class="label"><div class="label-line"></div><span>{{ t('pricing_tag') }}</span></div>
      <div class="pricing-header">
        <div>
          <h2 class="h2-light" style="margin-bottom:0">{{ t('pricing_h2') }}</h2>
        </div>
      </div>
      <div class="pricing-note" v-html="t('pricing_note')"></div>
    </div>

    <div class="plans rv">
      <!-- Starter -->
      <div class="plan">
        <div class="plan-top"></div>
        <div class="plan-name">Starter</div>
        <div class="plan-price-main"><span class="curr">&euro;</span>97</div>
        <div class="plan-period">/mois &middot; {{ t('pricing_no_commit') }}</div>
        <div class="plan-seats">{{ t('plan_1csm') }}</div>
        <div class="plan-divider"></div>
        <ul class="plan-features">
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_5acc') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_dash') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_tasks') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_res') }}</li>
          <li class="na"><div class="pf-no">&mdash;</div>{{ t('feat_wb') }}</li>
          <li class="na"><div class="pf-no">&mdash;</div>{{ t('feat_coach') }}</li>
          <li class="na"><div class="pf-no">&mdash;</div>{{ t('feat_email') }}</li>
        </ul>
        <a href="https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01" target="_blank" class="plan-btn pb-outline">{{ t('cta_trial') }}</a>
      </div>

      <!-- Growth -->
      <div class="plan featured">
        <div class="plan-top"></div>
        <div class="plan-tag">{{ t('badge_popular') }}</div>
        <div class="plan-name">Growth</div>
        <div class="plan-price-main"><span class="curr">&euro;</span>297</div>
        <div class="plan-period">/mois &middot; {{ t('pricing_no_commit') }}</div>
        <div class="plan-seats">{{ t('plan_10csm') }}</div>
        <div class="plan-divider"></div>
        <ul class="plan-features">
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_unlim') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_dash_adv') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_wb') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_coach_cs') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_email_ai') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_import') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_support') }}</li>
        </ul>
        <a href="https://buy.stripe.com/eVqbJ10LN61n5et50gdfG00" target="_blank" class="plan-btn pb-teal">{{ t('cta_trial') }}</a>
      </div>

      <!-- Elite -->
      <div class="plan">
        <div class="plan-top"></div>
        <div class="plan-name">Elite</div>
        <div class="plan-price-main"><span class="curr">&euro;</span>697</div>
        <div class="plan-period">/mois &middot; {{ t('pricing_no_commit') }}</div>
        <div class="plan-seats">{{ t('plan_unlim_csm') }}</div>
        <div class="plan-divider"></div>
        <ul class="plan-features">
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_all_growth') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_playbooks') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_coaching') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_onboarding') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_sla') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_multi') }}</li>
          <li><div class="pf-yes">&#x2713;</div>{{ t('feat_copil') }}</li>
        </ul>
        <a href="https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05" target="_blank" class="plan-btn pb-outline">{{ t('cta_trial') }}</a>
      </div>
    </div>

    <p class="plan-footnote rv" v-html="t('plan_footnote')"></p>
  </div>
</section>


<!-- INTEGRATIONS -->
<section class="section section-dark" id="integrations">
  <div class="container" style="text-align: center;">
    <div class="label" style="justify-content: center;"><div class="label-line"></div><span>{{ t('integ_tag') }}</span><div class="label-line"></div></div>
    <h2 class="h2-light" style="margin-bottom: 16px">{{ t('integ_h2') }}</h2>
    <p style="color: var(--dt2); font-size: 16px; max-width: 600px; margin: 0 auto 32px; line-height: 1.7;">
      {{ t('integ_sub') }}
    </p>

    <!-- Category tabs -->
    <div class="integ-cats">
      <button v-for="cat in integCategories" :key="cat.key" class="integ-cat-btn" :class="{ active: activeIntegCat === cat.key }" @click="filterInteg(cat.key)">
        <span>{{ cat.icon }}</span> {{ cat.key === 'all' ? t('integ_all') : cat.key === 'meeting' ? t('integ_meetings') : cat.key === 'project' ? t('integ_projects') : cat.key === 'data' ? t('integ_data') : cat.label }}
      </button>
    </div>

    <div class="integrations-grid">
      <div v-for="(card, idx) in filteredIntegrations" :key="idx" class="integration-card available" :data-cat="card.cat">
        <div class="integration-icon"><img :src="card.icon" :alt="card.name"/></div>
        <div class="integration-name">{{ card.name }}</div>
        <div class="integration-tag">{{ card.tagKey ? t(card.tagKey) : card.tag }}</div>
        <div class="integration-status live">{{ t('integ_available') }}</div>
      </div>
    </div>

    <p style="color: var(--dt3); font-size: 13px; margin-top: 24px;">
      {{ t('integ_more') }}
    </p>

    <!-- Sales arguments -->
    <div class="vs-block">
      <div class="vs-title">{{ t('sell_title') }}</div>
      <p class="vs-subtitle">{{ t('sell_subtitle') }}</p>

      <div class="sell-grid">
        <div class="sell-card" v-for="i in 8" :key="'sell'+i">
          <div class="sell-icon">{{ sellIcons[i-1] }}</div>
          <div class="sell-label">{{ t('sell_'+i+'_label') }}</div>
          <div class="sell-desc">{{ t('sell_'+i+'_desc') }}</div>
        </div>
      </div>

      <div class="vs-highlights">
        <div class="vs-hl-card">
          <div class="vs-hl-number">0 &euro;</div>
          <div class="vs-hl-text" v-html="t('sell_hl1')"></div>
        </div>
        <div class="vs-hl-card">
          <div class="vs-hl-number">5 min</div>
          <div class="vs-hl-text" v-html="t('sell_hl2')"></div>
        </div>
        <div class="vs-hl-card">
          <div class="vs-hl-number">100%</div>
          <div class="vs-hl-text" v-html="t('sell_hl3')"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section section-dark" id="faq">
  <div class="container">
    <div class="rv" style="margin-bottom:56px;text-align:center">
      <div class="label" style="justify-content:center"><div class="label-line"></div><span>{{ t('faq_tag') }}</span><div class="label-line"></div></div>
      <h2 class="h2-light">{{ t('faq_h2') }}</h2>
    </div>
    <div class="faq-list">
      <div v-for="(item, index) in faqItems" :key="index" class="faq-item" :class="{ open: openFaqIndex === index }">
        <button class="faq-q" @click="toggleFaq(index)">
          {{ t('faq_q' + (index + 1)) }}
          <span class="faq-icon">{{ openFaqIndex === index ? '\u00D7' : '+' }}</span>
        </button>
        <div class="faq-a">
          <p>{{ t('faq_a' + (index + 1)) }}</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- END CTA -->
<section class="end-cta">
  <div class="end-glow"></div>
  <div class="end-inner rv">
    <div class="label" style="justify-content:center;margin-bottom:20px"><div class="label-line"></div>{{ t('end_section_tag') }}<div class="label-line"></div></div>
    <h2 class="end-h2" v-html="t('end_h2')"></h2>
    <p class="end-sub">{{ t('end_sub') }}</p>
    <div class="end-btns">
      <router-link to="/login" class="btn-primary">
        {{ t('cta_start_free') }}
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </router-link>
      <a href="mailto:support@scalyo.app" class="btn-secondary">{{ t('cta_talk') }}</a>
    </div>
    <div class="end-note">support@scalyo.app &middot; {{ t('end_note') }}</div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-grid">
    <div>
      <a href="/" class="nav-logo"><div class="nav-logo-icon">S</div>Scalyo</a>
      <p class="footer-desc">{{ t('footer_desc') }}</p>
      <div class="footer-social">
        <a href="https://x.com/scalyo_app" target="_blank" rel="noopener" class="fsoc" aria-label="X">&#x1D54F;</a>
        <a href="https://linkedin.com/company/scalyo" target="_blank" rel="noopener" class="fsoc" aria-label="LinkedIn">in</a>
      </div>
    </div>
    <div class="footer-col">
      <h4>{{ t('footer_col_product') }}</h4>
      <a href="#features">{{ t('footer_features') }}</a>
      <a href="#pricing">{{ t('footer_pricing') }}</a>
      <a href="#roi">{{ t('footer_roi_calc') }}</a>
      <router-link to="/login">{{ t('footer_signin') }}</router-link>
    </div>
    <div class="footer-col">
      <h4>{{ t('footer_col_resources') }}</h4>
      <a href="#m1">{{ t('footer_blog') }}</a>
      <a href="#m2">{{ t('footer_guides') }}</a>
      <a href="#m1">{{ t('footer_playbooks') }}</a>
      <a href="#m8">{{ t('footer_docs') }}</a>
    </div>
    <div class="footer-col">
      <h4>{{ t('footer_col_contact') }}</h4>
      <a href="javascript:void(0)" @click="modalSupport = true">{{ t('footer_support') }}</a>
      <a href="javascript:void(0)" @click="modalRgpd = true">{{ t('footer_rgpd') }}</a>
      <a href="javascript:void(0)" @click="modalLegal = true">{{ t('footer_legal') }}</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>{{ t('footer_copy') }}</span>
    <span>{{ t('footer_markets') }}</span>
  </div>
</footer>

<!-- MODAL SUPPORT -->
<div class="lm-overlay" :class="{ open: modalSupport }" @click.self="closeAllModals">
  <div class="lm-box">
    <div class="lm-head">
      <h3>{{ modalI18n.ms_title }}</h3>
      <button class="lm-close" @click="closeAllModals">&times;</button>
    </div>
    <div class="lm-body">
      <p>{{ modalI18n.ms_desc }}</p>
      <a href="mailto:support@scalyo.app" class="lm-email-link">
        <div class="lm-email-icon">&#x2709;&#xFE0F;</div>
        <div class="lm-email-info">
          <strong>support@scalyo.app</strong>
          <span>{{ modalI18n.ms_email_sub }}</span>
        </div>
      </a>
      <div class="lm-contact-form" v-if="!contactSuccess">
        <div class="lm-row">
          <div class="lm-field">
            <label>{{ modalI18n.lbl_name }}</label>
            <input type="text" v-model="contactForm.name" placeholder="Lidia M.">
          </div>
          <div class="lm-field">
            <label>{{ modalI18n.lbl_email }}</label>
            <input type="email" v-model="contactForm.email" placeholder="vous@entreprise.com">
          </div>
        </div>
        <div class="lm-field">
          <label>{{ modalI18n.lbl_subject }}</label>
          <input type="text" v-model="contactForm.subject" placeholder="Question sur mon plan Starter...">
        </div>
        <div class="lm-field">
          <label>{{ modalI18n.lbl_msg }}</label>
          <textarea v-model="contactForm.msg" placeholder="Decrivez votre probleme ou question..."></textarea>
        </div>
        <button class="lm-submit" @click="submitContact">{{ modalI18n.cf_submit }}</button>
      </div>
      <div class="lm-success" v-if="contactSuccess" style="display:block">
        <div style="font-size:36px;margin-bottom:8px">&#x2705;</div>
        <strong>{{ modalI18n.ms_ok_title }}</strong>
        <p>{{ modalI18n.ms_ok_body }}</p>
      </div>
    </div>
  </div>
</div>

<!-- MODAL RGPD -->
<div class="lm-overlay" :class="{ open: modalRgpd }" @click.self="closeAllModals">
  <div class="lm-box">
    <div class="lm-head">
      <h3>{{ modalI18n.mr_title }}</h3>
      <button class="lm-close" @click="closeAllModals">&times;</button>
    </div>
    <div class="lm-body" v-html="rgpdContent"></div>
  </div>
</div>

<!-- MODAL LEGAL -->
<div class="lm-overlay" :class="{ open: modalLegal }" @click.self="closeAllModals">
  <div class="lm-box">
    <div class="lm-head">
      <h3>{{ modalI18n.ml_title }}</h3>
      <button class="lm-close" @click="closeAllModals">&times;</button>
    </div>
    <div class="lm-body" v-html="legalContent"></div>
  </div>
</div>

  </div>
</template>


<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { L, T } from '../i18n/landing.js'

const router = useRouter()

// ── LANGUAGE ──
const lang = ref(localStorage.getItem('scalyo_lang') || 'fr')

function t(key) {
  const lBlock = L[lang.value] || L.fr
  const tBlock = T[lang.value] || T.fr
  return lBlock[key] || tBlock[key] || L.fr[key] || T.fr[key] || key
}

function setLang(l) {
  lang.value = l
  try { localStorage.setItem('scalyo_lang', l) } catch(e) {}
  document.documentElement.lang = l === 'kr' ? 'ko' : l
  nextTick(() => {})
}

// ── NAV SCROLL ──
const navScrolled = ref(false)
function onScroll() { navScrolled.value = window.scrollY > 40 }

// ── MOBILE MENU ──
const mobileMenuOpen = ref(false)
function closeMobile() { mobileMenuOpen.value = false }

// ── FAQ ──
const openFaqIndex = ref(-1)
const faqItems = computed(() => {
  return [1, 2, 3, 4, 5, 6, 7, 8].map(i => ({
    q: t('faq_q' + i),
    a: t('faq_a' + i)
  }))
})

function toggleFaq(index) {
  openFaqIndex.value = openFaqIndex.value === index ? -1 : index
}

// ── INTEGRATION FILTERING ──
const activeIntegCat = ref('all')

const integCategories = [
  { key: 'all', icon: '📋', label: 'Tout' },
  { key: 'crm', icon: '🏢', label: 'CRM' },
  { key: 'email', icon: '📧', label: 'Email' },
  { key: 'chat', icon: '💬', label: 'Chat' },
  { key: 'meeting', icon: '📹', label: 'Réunions' },
  { key: 'project', icon: '📁', label: 'Projets' },
  { key: 'data', icon: '📊', label: 'Données' }
]

const integrations = [
  { name: 'Salesforce', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%2300A1E0' d='M20 8c3.2 0 6.1 1.3 8.2 3.3C30 9.9 32.5 9 35.2 9c6.2 0 11.2 5.1 11.2 11.3 0 .5 0 1-.1 1.5C47.9 23.2 49 25.3 49 27.7c0 3.9-3 7.1-6.8 7.3H12.5C7.3 35 3 30.6 3 25.3c0-4.2 2.7-7.7 6.5-9C10.3 11.9 14.7 8 20 8z'/%3E%3C/svg%3E", tagKey: 'integ_sf_tag', cat: 'crm' },
  { name: 'HubSpot', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23FF7A59' d='M267.5 78.7V44.3c15.1-7.2 25.6-22.6 25.6-40.3C293.1 1.8 291.3 0 289 0h-32c-2.2 0-4 1.8-4 4v.1c0 11.1-9 20.1-20.1 20.1-11.1 0-20.1-9-20.1-20.1V4c0-2.2-1.8-4-4-4h-32c-2.2 0-4 1.8-4 4c0 17.7 10.5 33.1 25.6 40.3v34.4C143.1 87.3 96 141 96 205.8c0 36.5 14.5 69.6 38 93.8l-53.4 53.4c-3 3-4.2 7.3-3.2 11.4s4.2 7.3 8.1 8.7l.6.2c6.6 2.3 13.8.4 18.5-4.8l50.2-55.6c24 17.5 53.5 27.8 85.2 27.8s61.2-10.3 85.2-27.8l50.2 55.6c4.7 5.2 11.9 7.1 18.5 4.8l.6-.2c3.9-1.4 6.9-4.6 8.1-8.7s-.2-8.4-3.2-11.4L346 299.6c23.5-24.2 38-57.3 38-93.8 0-64.8-47.1-118.5-108.5-127.1zM240 304c-54.2 0-98.2-44-98.2-98.2s44-98.2 98.2-98.2 98.2 44 98.2 98.2S294.2 304 240 304z'/%3E%3C/svg%3E", tag: 'CRM & Contacts', cat: 'crm' },
  { name: 'Pipedrive', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%2325C16F'/%3E%3Cpath fill='%23fff' d='M16 7c-2.8 0-5 2.2-5 5v8c0 2.8 2.2 5 5 5s5-2.2 5-5v-8c0-2.8-2.2-5-5-5zm2 13c0 1.1-.9 2-2 2s-2-.9-2-2v-8c0-1.1.9-2 2-2s2 .9 2 2v8z'/%3E%3C/svg%3E", tag: 'CRM & Deals', cat: 'crm' },
  { name: 'Gmail', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%234285F4' d='M6 10v28h10V23l8 6 8-6v15h10V10L34 22 24 14 14 22z'/%3E%3Cpath fill='%2334A853' d='M6 10l18 14v-4L6 8z'/%3E%3Cpath fill='%23FBBC04' d='M42 10L24 24v-4l18-12z'/%3E%3Cpath fill='%23EA4335' d='M6 10h6l12 10 12-10h6v2L24 24 6 12z'/%3E%3C/svg%3E", tagKey: 'integ_gmail_tag', cat: 'email' },
  { name: 'Outlook', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%230078D4' d='M28 7v10h14V7zM28 20v11h14V20zM28 34v7h14v-7zM5 7l20 3v28L5 41z'/%3E%3Cellipse fill='%23fff' cx='15' cy='24' rx='6' ry='7'/%3E%3Cellipse fill='%230078D4' cx='15' cy='24' rx='4' ry='5'/%3E%3C/svg%3E", tag: 'Email & Calendar', cat: 'email' },
  { name: 'IMAP', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='4' y='10' width='40' height='28' rx='4' fill='%236B7280'/%3E%3Cpath fill='none' stroke='%23fff' stroke-width='2' d='M4 14l20 12 20-12'/%3E%3C/svg%3E", tagKey: 'integ_imap_tag', cat: 'email' },
  { name: 'Slack', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23E01E5A' d='M13 28a3 3 0 1 1-3-3h3v3zm1.5 0a3 3 0 1 1 6 0v7.5a3 3 0 1 1-6 0V28z'/%3E%3Cpath fill='%2336C5F0' d='M20 13a3 3 0 1 1 3-3v3h-3zm0 1.5a3 3 0 1 1 0 6h-7.5a3 3 0 1 1 0-6H20z'/%3E%3Cpath fill='%232EB67D' d='M35 20a3 3 0 1 1 3 3h-3v-3zm-1.5 0a3 3 0 1 1-6 0v-7.5a3 3 0 1 1 6 0V20z'/%3E%3Cpath fill='%23ECB22E' d='M28 35a3 3 0 1 1-3 3v-3h3zm0-1.5a3 3 0 1 1 0-6h7.5a3 3 0 1 1 0 6H28z'/%3E%3C/svg%3E", tagKey: 'integ_slack_tag', cat: 'chat' },
  { name: 'Teams', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%235B5FC7' d='M34 16a5 5 0 100-10 5 5 0 000 10zM41 18h-8c-1.7 0-3 1.3-3 3v10c0 1.7 1.3 3 3 3h8c1.7 0 3-1.3 3-3V21c0-1.7-1.3-3-3-3z'/%3E%3Cpath fill='%237B83EB' d='M24 14a6 6 0 100-12 6 6 0 000 12zM33 17H11c-1.7 0-3 1.3-3 3v13c0 5 4 9 9 9h10c5 0 9-4 9-9V20c0-1.7-1.3-3-3-3z'/%3E%3C/svg%3E", tag: 'Chat & Visio', cat: 'chat' },
  { name: 'Intercom', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='6' y='6' width='36' height='36' rx='8' fill='%23286EFA'/%3E%3Cpath stroke='%23fff' stroke-width='2.5' stroke-linecap='round' fill='none' d='M16 18v8M21 16v12M26 16v12M31 18v8M14 32s3 3 10 3 10-3 10-3'/%3E%3C/svg%3E", tag: 'Chat & Tickets', cat: 'chat' },
  { name: 'Zoom', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='2' y='8' width='44' height='32' rx='8' fill='%232D8CFF'/%3E%3Cpath fill='%23fff' d='M10 16h16v12c0 1.1-.9 2-2 2H10V16zM30 20l8-4v16l-8-4V20z'/%3E%3C/svg%3E", tagKey: 'integ_zoom_tag', cat: 'meeting' },
  { name: 'Google Meet', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%230F9D58' d='M8 12h20v24H8z'/%3E%3Cpath fill='%234285F4' d='M28 18l12-8v28l-12-8z'/%3E%3Cpath fill='%23FBBC04' d='M28 24l12-14h-12z'/%3E%3Cpath fill='%23EA4335' d='M28 24l12 14h-12z'/%3E%3C/svg%3E", tag: 'Video calls', cat: 'meeting' },
  { name: 'Calendly', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='6' y='8' width='36' height='34' rx='6' fill='%23006BFF'/%3E%3Crect x='6' y='8' width='36' height='10' rx='6' fill='%23004FC4'/%3E%3Ccircle cx='24' cy='30' r='6' fill='%23fff'/%3E%3Crect x='14' y='6' width='3' height='6' rx='1.5' fill='%23fff'/%3E%3Crect x='31' y='6' width='3' height='6' rx='1.5' fill='%23fff'/%3E%3C/svg%3E", tagKey: 'integ_calendly_tag', cat: 'meeting' },
  { name: 'Jira', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%230052CC' d='M43.5 23.2L25.8 5.5 24 3.7 8.7 19 3 24.7c-.7.7-.7 1.9 0 2.6L15.3 39.7 24 48.4l15.3-15.3.5-.5 3.7-3.7c.7-.7.7-1.9 0-2.7zM24 30.9l-6.9-6.9L24 17.1l6.9 6.9L24 30.9z'/%3E%3C/svg%3E", tag: 'Issues & Projects', cat: 'project' },
  { name: 'Asana', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='12' r='8' fill='%23F06A6A'/%3E%3Ccircle cx='12' cy='32' r='8' fill='%23F06A6A'/%3E%3Ccircle cx='36' cy='32' r='8' fill='%23F06A6A'/%3E%3C/svg%3E", tagKey: 'integ_asana_tag', cat: 'project' },
  { name: 'Stripe', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='8' fill='%236366F1'/%3E%3Cpath fill='%23fff' d='M22.5 19.5c0-1.5 1.2-2.1 3.2-2.1 2.9 0 6.5 0.9 9.4 2.4V12c-3.1-1.3-6.3-1.8-9.4-1.8-7.7 0-12.8 4-12.8 10.7 0 10.4 14.3 8.7 14.3 13.2 0 1.8-1.5 2.3-3.7 2.3-3.2 0-7.3-1.3-10.5-3.1v7.9c3.6 1.5 7.2 2.2 10.5 2.2 7.9 0 13.3-3.9 13.3-10.7-.1-11.2-14.3-9.2-14.3-13.2z'/%3E%3C/svg%3E", tag: 'Billing & MRR', cat: 'data' },
  { name: 'Import CSV', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%236B7280' d='M12 4h16l12 12v24c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4z'/%3E%3Cpath fill='%23fff' opacity='.5' d='M28 4l12 12h-8c-2.2 0-4-1.8-4-4V4z'/%3E%3Ctext x='24' y='35' text-anchor='middle' fill='%23fff' font-size='11' font-weight='700' font-family='sans-serif'%3ECSV%3C/text%3E%3C/svg%3E", tag: 'Import fichiers', cat: 'data' },
  { name: 'Excel', icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%2316A34A' d='M12 4h16l12 12v24c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4z'/%3E%3Cpath fill='%23fff' opacity='.5' d='M28 4l12 12h-8c-2.2 0-4-1.8-4-4V4z'/%3E%3Ctext x='24' y='35' text-anchor='middle' fill='%23fff' font-size='9' font-weight='700' font-family='sans-serif'%3EXLSX%3C/text%3E%3C/svg%3E", tag: 'Spreadsheets', cat: 'data' }
]

const filteredIntegrations = computed(() => {
  if (activeIntegCat.value === 'all') return integrations
  return integrations.filter(c => c.cat === activeIntegCat.value)
})

function filterInteg(cat) {
  activeIntegCat.value = cat
}

// ── SELL ICONS ──
const sellIcons = ['🔗', '⚡', '🇪🇺', '🤖', '💚', '💰', '📊', '🇫🇷']

// ── ROI CALCULATOR ──
const roi = reactive({ csm: 5, acc: 30, arr: 10000, churn: 10 })

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M€'
  if (n >= 1e4) return Math.round(n / 1e3) + 'K€'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K€'
  return n + '€'
}

function rangeStyle(value, min, max) {
  const pct = ((value - min) / (max - min) * 100).toFixed(1)
  return `--pct: ${pct}%`
}

const roiComputed = computed(() => {
  const total = roi.csm * roi.acc * roi.arr
  const cost = Math.round(total * roi.churn / 100)
  const rec = Math.round(cost * 0.3)
  const sub = roi.csm <= 1 ? 97 * 12 : roi.csm <= 10 ? 297 * 12 : 697 * 12
  const planKey = roi.csm <= 1 ? 'roi_plan_starter' : roi.csm <= 10 ? 'roi_plan_growth' : 'roi_plan_elite'
  return {
    main: fmt(rec),
    arr: fmt(total),
    cost: fmt(cost),
    time: (roi.csm * 6) + 'h',
    mult: sub > 0 ? (Math.round(rec / sub * 10) / 10) + '×' : '—',
    plan: t(planKey),
  }
})

// ── MODALS ──
const modalSupport = ref(false)
const modalRgpd = ref(false)
const modalLegal = ref(false)

const RGPD_CONTENT = {
  fr: `<p><strong>Dernière mise à jour : Janvier 2025</strong></p><h4>1. Responsable du traitement</h4><p>Scalyo (Stratimaagency) est responsable du traitement de vos données personnelles. Contact DPO : <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p><h4>2. Données collectées</h4><p>Nous collectons uniquement les données nécessaires au fonctionnement.</p><h4>3. Hébergement & sécurité</h4><p><strong>Supabase</strong> — région Europe (Irlande, conforme RGPD). Chiffrement AES-256 au repos, TLS 1.3 en transit. Isolation par entreprise via Row Level Security.</p><h4>4. Vos droits</h4><ul><li>✓ Accès à vos données</li><li>✓ Rectification</li><li>✓ Effacement (droit à l'oubli)</li><li>✓ Portabilité (export JSON/CSV)</li></ul><p>Exercer vos droits : <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p>`,
  en: `<p><strong>Last updated: January 2025</strong></p><h4>1. Data Controller</h4><p>Scalyo (Stratimaagency) is the controller of your personal data. DPO contact: <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p><h4>2. Data Collected</h4><p>Only data necessary for the service to function.</p><h4>3. Hosting & Security</h4><p><strong>Supabase</strong> — Europe region (Ireland, GDPR compliant). AES-256 encryption at rest, TLS 1.3 in transit. Row Level Security per company.</p><h4>4. Your Rights</h4><ul><li>✓ Access to your data</li><li>✓ Rectification</li><li>✓ Erasure (right to be forgotten)</li><li>✓ Portability (JSON/CSV export)</li></ul><p>Exercise your rights: <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p>`,
  kr: `<p><strong>최종 업데이트: 2025년 1월</strong></p><h4>1. 데이터 처리 책임자</h4><p>Scalyo(Stratimaagency)는 귀하의 개인정보 처리 책임자입니다. DPO 연락처: <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p><h4>2. 수집 데이터</h4><p>서비스 운영에 필요한 데이터만 수집합니다.</p><h4>3. 호스팅 및 보안</h4><p><strong>Supabase</strong> — 유럽 리전 (아일랜드, GDPR 준수). AES-256 암호화, TLS 1.3.</p><h4>4. 귀하의 권리</h4><ul><li>✓ 개인정보 열람권</li><li>✓ 정정권</li><li>✓ 삭제권</li><li>✓ 이동권 (JSON/CSV 내보내기)</li></ul><p>권리 행사: <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p>`
}

const LEGAL_CONTENT = {
  fr: `<h4>Éditeur</h4><p><strong>Stratimaagency</strong> (marque commerciale Scalyo)<br>Email : <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p><h4>Hébergement</h4><p><strong>Cloudflare Pages</strong> + <strong>Supabase</strong> Europe (Irlande) + <strong>Stripe</strong> paiements</p><h4>Propriété intellectuelle</h4><p>Tous les éléments de Scalyo sont la propriété exclusive de Stratimaagency.</p><h4>Contact</h4><p><a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p>`,
  en: `<h4>Publisher</h4><p><strong>Stratimaagency</strong> (trading as Scalyo)<br>Email: <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p><h4>Hosting</h4><p><strong>Cloudflare Pages</strong> + <strong>Supabase</strong> Europe (Ireland) + <strong>Stripe</strong> payments</p><h4>Intellectual Property</h4><p>All Scalyo elements are the exclusive property of Stratimaagency.</p><h4>Contact</h4><p><a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p>`,
  kr: `<h4>발행자</h4><p><strong>Stratimaagency</strong> (Scalyo 브랜드)<br>이메일: <a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p><h4>호스팅</h4><p><strong>Cloudflare Pages</strong> + <strong>Supabase</strong> 유럽 (아일랜드) + <strong>Stripe</strong> 결제</p><h4>지적 재산권</h4><p>Scalyo의 모든 요소는 Stratimaagency의 독점 자산입니다.</p><h4>문의</h4><p><a href="mailto:info@scalyo.app" style="color:var(--teal)">info@scalyo.app</a></p>`
}

const MODAL_I18N_DATA = {
  fr: { ms_title: 'Support', ms_desc: 'Notre équipe est disponible pour vous aider.', mr_title: 'Politique de confidentialité', ml_title: 'Mentions légales', lbl_name: 'Nom', lbl_email: 'Email', lbl_subject: 'Sujet', lbl_msg: 'Message', cf_submit: 'Envoyer', ms_email_sub: 'Réponse en moins de 24h', ms_ok_title: 'Message envoyé !', ms_ok_body: 'Nous reviendrons vers vous dans les 24 heures.' },
  en: { ms_title: 'Support', ms_desc: 'Our team is available to help.', mr_title: 'Privacy policy', ml_title: 'Legal notice', lbl_name: 'Name', lbl_email: 'Email', lbl_subject: 'Subject', lbl_msg: 'Message', cf_submit: 'Send', ms_email_sub: 'Reply within 24h', ms_ok_title: 'Message sent!', ms_ok_body: 'We will get back to you within 24 hours.' },
  kr: { ms_title: '지원', ms_desc: '팀이 도움을 드릴 준비가 되어 있습니다.', mr_title: '개인정보 처리방침', ml_title: '법적 고지', lbl_name: '이름', lbl_email: '이메일', lbl_subject: '제목', lbl_msg: '메시지', cf_submit: '보내기', ms_email_sub: '24시간 내 답변', ms_ok_title: '메시지 전송 완료!', ms_ok_body: '24시간 이내에 답변 드리겠습니다.' }
}

const rgpdContent = computed(() => RGPD_CONTENT[lang.value] || RGPD_CONTENT.fr)
const legalContent = computed(() => LEGAL_CONTENT[lang.value] || LEGAL_CONTENT.fr)
const modalI18n = computed(() => MODAL_I18N_DATA[lang.value] || MODAL_I18N_DATA.fr)

function closeAllModals() {
  modalSupport.value = false
  modalRgpd.value = false
  modalLegal.value = false
  document.body.style.overflow = ''
}

// ── CONTACT FORM ──
const contactForm = reactive({ name: '', email: '', subject: '', msg: '' })
const contactSuccess = ref(false)

function submitContact() {
  if (!contactForm.name || !contactForm.email || !contactForm.msg) return
  contactSuccess.value = true
  setTimeout(() => {
    contactSuccess.value = false
    contactForm.name = ''
    contactForm.email = ''
    contactForm.subject = ''
    contactForm.msg = ''
  }, 5000)
}

// ── INIT ──
onMounted(() => {
  window.addEventListener('scroll', onScroll)
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals() })

  // Auto-detect Korean browser
  if (!localStorage.getItem('scalyo_lang')) {
    const bl = (navigator.language || '').toLowerCase()
    if (bl.startsWith('ko')) {
      lang.value = 'kr'
    }
  }

  // Apply language
  nextTick(() => {
    setLang(lang.value)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

</script>

<style scoped>

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.landing {
  /* main palette — Soft dark slate */
  --dk: #181B20;
  --dk2: #1F2228;
  --dk3: #262A30;
  --dk4: #2E3238;
  --dk5: #363B42;
  --dt:  #F0F6FC;
  --dt2: rgba(240,246,252,.7);
  --dt3: rgba(240,246,252,.45);
  --dline: rgba(240,246,252,.08);
  --dline2: rgba(240,246,252,.14);

  /* cards on dark */
  --lk: #262A30;
  --lk2: #2E3238;
  --lk3: #363B42;
  --lk4: #3E444C;
  --lt:  #F0F6FC;
  --lt2: rgba(240,246,252,.7);
  --lt3: rgba(240,246,252,.45);
  --lline: rgba(240,246,252,.08);
  --lline2: rgba(240,246,252,.14);

  /* brand — Vibrant teal */
  --teal: #0D9488;
  --teal2: rgba(13,148,136,0.10);
  --teal3: rgba(13,148,136,0.05);
  --teal-glow: rgba(13,148,136,0.25);

  /* semantic colors */
  --red: #F87171;
  --amber: #FBBF24;
  --blue: #60A5FA;
  --green: #4ADE80;

  /* card backgrounds */
  --bg2: var(--dk3);
  --bg3: var(--dk4);

  --f: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
  --rad: 14px;
}

html { scroll-behavior: smooth; overflow-x: hidden; }
body { font-family: var(--f); font-size: 16px; line-height: 1.65; letter-spacing: -0.01em; -webkit-font-smoothing: antialiased; overflow-x: hidden; background: var(--dk); color: var(--dt); }
a { text-decoration: none; }
img { display: block; max-width: 100%; }
::selection { background: rgba(13,148,136,0.2); color: var(--teal); }

/* ── REVEAL ── */
.rv { opacity: 1; transform: none; }
.rv.in { opacity: 1; transform: none; }

/* ────────────────────────────────────
   NAVIGATION
──────────────────────────────────── */
nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 60px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background .3s, border-bottom .3s;
}
nav.scrolled {
  background: rgba(15,20,25,.88);
  backdrop-filter: blur(24px) saturate(2);
  -webkit-backdrop-filter: blur(24px) saturate(2);
  border-bottom: 1px solid var(--dline);
}
.nav-logo {
  display: flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: 17px; letter-spacing: -.03em;
  color: var(--dt);
}
.nav-logo-icon {
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--teal); display: grid; place-items: center;
  font-size: 15px; font-weight: 900; color: #fff; flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(240,246,252,.08);
}
.nav-logo span { color: var(--teal); }
.nav-links { display: flex; gap: 0; }
.nav-links a {
  padding: 7px 14px; border-radius: 7px;
  font-size: 14px; font-weight: 500; color: var(--dt2);
  transition: color .15s, background .15s;
}
.nav-links a:hover { color: var(--dt); background: rgba(240,246,252,.06); }
.nav-right { display: flex; align-items: center; gap: 8px; }
.n-ghost {
  padding: 7px 16px; border-radius: 8px;
  font-size: 14px; font-weight: 500; color: var(--dt2);
  border: 1px solid var(--dline2); transition: all .15s;
}
.n-ghost:hover { color: var(--dt); background: rgba(240,246,252,.06); }
.n-solid {
  padding: 8px 18px; border-radius: 8px;
  font-size: 14px; font-weight: 600; color: #fff;
  background: var(--teal);
  transition: all .2s;
  box-shadow: 0 1px 2px rgba(0,0,0,.3);
}
.n-solid:hover { background: #0b7d73; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(13,148,136,.2); }

/* ────────────────────────────────────
   HERO — dark, centered, Stripe/Notion
──────────────────────────────────── */
.hero {
  background: var(--dk);
  padding: 140px 24px 100px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
/* subtle noise texture overlay */
.hero::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: .012; pointer-events: none; z-index: 0;
}
/* single subtle radial glow */
.hero-glow {
  position: absolute; left: 50%; top: -100px;
  transform: translateX(-50%);
  width: 1200px; height: 800px;
  background: radial-gradient(ellipse at 50% 30%, rgba(13,148,136,.15) 0%, rgba(13,148,136,.05) 40%, transparent 70%);
  pointer-events: none; z-index: 0;
  animation: glow-pulse 6s ease-in-out infinite;
}
.hero-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }

.hero-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 18px; border-radius: 100px;
  border: 1px solid var(--dline2);
  background: rgba(240,246,252,.05);
  font-size: 13px; font-weight: 500; color: var(--dt2);
  margin-bottom: 32px;
  backdrop-filter: blur(12px);
}
.badge-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 8px var(--teal-glow), 0 0 16px rgba(13,148,136,.15); animation: pulse 2.5s ease-in-out infinite; }

.hero-h1 {
  font-size: clamp(48px, 7vw, 88px);
  font-weight: 900;
  letter-spacing: -.04em;
  line-height: 1.08;
  color: var(--dt);
  margin-bottom: 24px;
}
.hero-h1 .accent {
  background: linear-gradient(135deg, var(--teal), #14b8a6, #2dd4bf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: inline-block;
}
.hero-h1 .accent::before {
  content: '';
  position: absolute;
  inset: -30px -50px;
  background: radial-gradient(ellipse at 50% 50%, var(--teal-glow) 0%, rgba(13,148,136,.08) 50%, transparent 70%);
  border-radius: 50%;
  z-index: -1;
  animation: glow-pulse 6s ease-in-out infinite;
  filter: blur(24px);
  pointer-events: none;
}
@keyframes glow-pulse { 0%,100% { opacity: .6; } 50% { opacity: 1; } }

.hero-sub {
  font-size: clamp(16px, 2vw, 19px);
  font-weight: 400;
  color: var(--dt2);
  line-height: 1.65;
  max-width: 520px;
  margin: 0 auto 40px;
}
.hero-sub strong { color: var(--dt); font-weight: 500; }

.hero-cta {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; flex-wrap: wrap; margin-bottom: 56px;
}
.btn-primary {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: 10px;
  font-size: 15px; font-weight: 600; color: #fff;
  background: var(--teal);
  transition: all .2s cubic-bezier(.16,1,.3,1);
  box-shadow: 0 1px 3px rgba(0,0,0,.3), 0 0 0 1px rgba(13,148,136,.2);
}
.btn-primary:hover { background: #0b7d73; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,148,136,.15); }
.btn-primary svg { transition: transform .2s; }
.btn-primary:hover svg { transform: translateX(3px); }
.btn-secondary {
  padding: 14px 24px; border-radius: 10px;
  font-size: 15px; font-weight: 500; color: var(--dt2);
  border: 1px solid var(--dline2);
  transition: all .15s; background: rgba(240,246,252,.04);
}
.btn-secondary:hover { color: var(--dt); background: rgba(240,246,252,.06); border-color: rgba(240,246,252,.2); }

.hero-social-proof {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; font-size: 13px; color: var(--dt3); flex-wrap: wrap;
}
.hsp-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--dk5); }

/* PRODUCT SCREENSHOT — hero bottom */
.hero-screenshot {
  max-width: 1080px; margin: 80px auto 0;
  padding: 0 24px;
  position: relative;
}
.screenshot-glow {
  position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
  width: 80%; height: 200px;
  background: radial-gradient(ellipse, rgba(13,148,136,.12), transparent 70%);
  pointer-events: none;
}
.app-shell {
  border-radius: 20px; overflow: hidden;
  border: 1px solid var(--dline2);
  box-shadow: 0 20px 60px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.2), 0 0 0 1px var(--dline);
  transition: all .5s cubic-bezier(.16,1,.3,1);
}
.app-shell:hover {
  box-shadow: 0 28px 72px rgba(0,0,0,.5), 0 12px 32px rgba(0,0,0,.3);
  transform: translateY(-4px);
}
.app-topbar {
  height: 44px; background: var(--dk2); border-bottom: 1px solid var(--dline);
  display: flex; align-items: center; padding: 0 16px; gap: 8px;
}
.topbar-dots { display: flex; gap: 6px; }
.td { width: 11px; height: 11px; border-radius: 50%; }
.topbar-url {
  flex: 1; margin: 0 12px; height: 26px;
  background: var(--dk3); border-radius: 6px; border: 1px solid var(--dline);
  display: flex; align-items: center; padding: 0 10px; gap: 6px;
  font-size: 11.5px; color: var(--dt3); max-width: 320px; margin: 0 auto;
}
.topbar-status { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--dt3); }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #22C55E; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

.app-layout { display: flex; background: var(--dk); min-height: 420px; }
.app-sidebar {
  width: 200px; flex-shrink: 0;
  background: var(--dk2); border-right: 1px solid var(--dline);
  padding: 16px 10px;
}
.sb-logo { display: flex; align-items: center; gap: 7px; padding: 6px 8px; margin-bottom: 20px; }
.sb-logo-dot { width: 18px; height: 18px; border-radius: 5px; background: var(--teal); flex-shrink: 0; }
.sb-logo-txt { font-size: 13px; font-weight: 700; letter-spacing: -.025em; color: var(--dt); }
.sb-section { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--dt3); padding: 6px 10px 4px; margin-top: 8px; }
.sb-item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 10px; border-radius: 6px;
  font-size: 12.5px; color: var(--dt3);
  cursor: default; margin-bottom: 1px; transition: all .15s;
}
.sb-item:hover { background: var(--dk3); color: var(--dt2); }
.sb-item.active { background: var(--teal2); color: var(--teal); font-weight: 500; }
.sb-icon { width: 14px; text-align: center; flex-shrink: 0; font-size: 13px; }

.app-main { flex: 1; padding: 24px; overflow: hidden; }
.app-header { margin-bottom: 20px; }
.app-title { font-size: 17px; font-weight: 700; letter-spacing: -.025em; color: var(--dt); margin-bottom: 2px; }
.app-subtitle { font-size: 12px; color: var(--dt3); display: flex; align-items: center; gap: 5px; }
.kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 16px; }
.kpi {
  background: var(--dk2); border: 1px solid var(--dline);
  border-radius: 10px; padding: 14px 16px;
  transition: border-color .2s;
}
.kpi:hover { border-color: var(--dline2); }
.kpi-lbl { font-size: 10.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--dt3); margin-bottom: 8px; }
.kpi-val { font-size: 26px; font-weight: 700; letter-spacing: -.04em; line-height: 1; margin-bottom: 6px; color: var(--dt); }
.kpi-delta { font-size: 11px; font-weight: 500; }
.c-teal { color: var(--teal); }
.c-blue { color: #60A5FA; }
.c-green { color: #4ADE80; }
.c-amber { color: #FBBF24; }
.app-row2 { display: grid; grid-template-columns: 3fr 2fr; gap: 10px; }
.app-card { background: var(--dk2); border: 1px solid var(--dline); border-radius: 10px; padding: 16px; }
.card-lbl { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--dt3); margin-bottom: 14px; }
.chart-wrap { display: flex; align-items: flex-end; gap: 6px; height: 60px; }
.bar { border-radius: 3px 3px 0 0; flex: 1; min-width: 0; }
.accounts-list { display: flex; flex-direction: column; gap: 7px; }
.account {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; border-radius: 7px;
  background: var(--dk3); border: 1px solid var(--dline);
}
.acc-name { font-size: 12px; font-weight: 500; color: var(--dt); }
.acc-tag { padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 600; }
.tag-red { background: rgba(248,113,113,.08); color: #F87171; border: 1px solid rgba(248,113,113,.15); }
.tag-amber { background: rgba(251,191,36,.08); color: #FBBF24; border: 1px solid rgba(251,191,36,.15); }
.tag-green { background: rgba(74,222,128,.07); color: #4ADE80; border: 1px solid rgba(74,222,128,.12); }

/* ────────────────────────────────────
   ALL SECTIONS — full dark
──────────────────────────────────── */
.section-light { background: var(--dk); color: var(--dt); }
.section-dark  { background: var(--dk); color: var(--dt); }
.section-gray  { background: var(--dk2); color: var(--dt); }

.section { padding: 100px 24px; }
.container { max-width: 1100px; margin: 0 auto; }
.container-narrow { max-width: 720px; margin: 0 auto; }

/* section labels */
.label {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; letter-spacing: -.01em;
  color: var(--teal); margin-bottom: 14px;
}
.label-line { width: 16px; height: 1.5px; background: var(--teal); border-radius: 1px; }

/* section headings */
.h2-light {
  font-size: clamp(30px, 3.8vw, 48px);
  font-weight: 800; letter-spacing: -.03em; line-height: 1.12;
  color: var(--dt); margin-bottom: 16px;
}
.h2-dark {
  font-size: clamp(30px, 3.8vw, 48px);
  font-weight: 800; letter-spacing: -.03em; line-height: 1.12;
  color: var(--dt); margin-bottom: 16px;
}
.sub-light { font-size: 17px; color: var(--dt2); line-height: 1.75; max-width: 480px; }
.sub-dark  { font-size: 17px; color: var(--dt2); line-height: 1.75; max-width: 480px; }

/* ────────────────────────────────────
   STATS BAR
──────────────────────────────────── */
.stats-bar {
  background: var(--dk2);
  border-top: 1px solid var(--dline);
  border-bottom: 1px solid var(--dline);
}
.stats-inner {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(4,1fr);
  divide: true;
}
.stat-cell {
  padding: 36px 32px;
  border-right: 1px solid var(--dline);
}
.stat-cell:last-child { border-right: none; }
.stat-number {
  font-size: 56px; font-weight: 900; letter-spacing: -.06em; line-height: 1;
  background: linear-gradient(90deg, var(--teal), #14b8a6, #5eead4, #14b8a6, var(--teal));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
  margin-bottom: 8px;
}
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
.stat-label { font-size: 15px; font-weight: 600; color: var(--dt); margin-bottom: 4px; }
.stat-note { font-size: 12.5px; color: var(--dt3); line-height: 1.5; }

/* ────────────────────────────────────
   FEATURES — alternating panels
──────────────────────────────────── */
.feat-panel {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 80px; align-items: center;
}
.feat-panel.flip { direction: rtl; }
.feat-panel.flip > * { direction: ltr; }
.feat-text { }
.feat-title {
  font-size: clamp(24px, 2.5vw, 34px);
  font-weight: 700; letter-spacing: -.03em; line-height: 1.15;
  color: var(--dt); margin-bottom: 14px;
}
.feat-title.on-dark { color: var(--dt); }
.feat-body { font-size: 16px; color: var(--dt2); line-height: 1.7; margin-bottom: 24px; }
.feat-body.on-dark { color: var(--dt2); }
.feat-points { display: flex; flex-direction: column; gap: 10px; }
.feat-point {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 14px; color: var(--dt2); line-height: 1.55;
}
.feat-point.on-dark { color: var(--dt2); }
.fp-check {
  width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0; margin-top: 1px;
  background: var(--teal2); border: 1px solid rgba(13,148,136,.2);
  display: grid; place-items: center; font-size: 9px; color: var(--teal); font-weight: 700;
}
/* feature visual card */
.feat-visual {
  border-radius: 18px; overflow: hidden;
  border: 1.5px solid var(--dline2);
  box-shadow: 0 4px 16px rgba(240,246,252,.06), 0 16px 32px rgba(240,246,252,.06), 0 1px 2px rgba(0,0,0,.03);
  background: var(--dk3);
  transition: all .4s cubic-bezier(.16,1,.3,1);
  transform-style: preserve-3d;
}
.feat-visual:hover {
  transform: perspective(1000px) translateY(-6px) translateZ(8px) rotateX(1deg);
  box-shadow: 0 20px 40px rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.04), 0 0 0 1px rgba(13,148,136,.08);
  border-color: rgba(13,148,136,.2);
}
.feat-visual.dark-card {
  border-color: var(--dline2);
  box-shadow: 0 4px 16px rgba(240,246,252,.06), 0 16px 32px rgba(240,246,252,.06);
  background: var(--dk2);
}
.fv-pad { padding: 28px; }
.fv-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.fv-title { font-size: 14px; font-weight: 600; letter-spacing: -.02em; color: var(--dt); }
.fv-badge { padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.badge-live { background: rgba(74,222,128,.08); color: #4ADE80; border: 1px solid rgba(74,222,128,.15); }
.badge-live.dk { background: rgba(74,222,128,.08); color: #4ADE80; border: 1px solid rgba(74,222,128,.15); }

/* wellbeing widget */
.wb-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.wb-card { padding: 14px; border-radius: 10px; background: var(--dk4); border: 1px solid var(--dline); }
.wb-label { font-size: 10.5px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--dt3); margin-bottom: 10px; }
.wb-score { font-size: 36px; font-weight: 700; letter-spacing: -.04em; line-height: 1; margin-bottom: 4px; }
.wb-sub { font-size: 11px; color: var(--dt3); }
.wb-bar { height: 4px; border-radius: 2px; background: var(--dk5); margin-top: 10px; overflow: hidden; }
.wb-fill { height: 100%; border-radius: 2px; }

/* playbook widget */
.playbook-list { display: flex; flex-direction: column; gap: 8px; }
.pb-step {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 8px;
  border: 1px solid var(--dline); background: var(--dk3);
}
.pb-num {
  width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
  background: var(--teal2); border: 1px solid rgba(13,148,136,.2);
  display: grid; place-items: center;
  font-size: 10px; font-weight: 700; color: var(--teal);
}
.pb-done { background: rgba(74,222,128,.08); border-color: rgba(74,222,128,.15); }
.pb-num.done { background: rgba(74,222,128,.1); border-color: rgba(74,222,128,.2); color: #4ADE80; }
.pb-text { font-size: 12px; color: var(--dt2); }
.pb-step.done .pb-text { color: var(--dt3); text-decoration: line-through; }

/* coach widget */
.coach-wrap { }
.coach-msg {
  padding: 12px 14px; border-radius: 10px;
  background: var(--dk4); border: 1px solid var(--dline);
  font-size: 13px; color: var(--dt2); line-height: 1.6; margin-bottom: 10px;
}
.coach-msg.ai {
  background: var(--teal2); border-color: rgba(13,148,136,.15);
  color: var(--dt); border-radius: 10px 10px 10px 2px;
}
.coach-author { font-size: 10.5px; font-weight: 600; color: var(--teal); margin-bottom: 4px; }
.coach-input {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 12px; border-radius: 8px;
  background: var(--dk4); border: 1px solid var(--dline2);
  margin-top: 12px;
}
.coach-placeholder { font-size: 12.5px; color: var(--dt3); flex: 1; }
.coach-send {
  width: 28px; height: 28px; border-radius: 7px;
  background: var(--teal); display: grid; place-items: center; color: white;
  font-size: 12px; cursor: default;
}

/* ────────────────────────────────────
   ROI CALCULATOR
──────────────────────────────────── */
.roi-wrap {
  display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start;
}
.roi-sliders { display: flex; flex-direction: column; gap: 28px; }
.rsl-label { font-size: 14px; font-weight: 500; color: var(--dt); margin-bottom: 8px; display: flex; justify-content: space-between; }
.rsl-label span { font-weight: 600; color: var(--teal); }
input[type=range] {
  -webkit-appearance: none; width: 100%; height: 2px; outline: none; cursor: pointer; border-radius: 1px;
  background: linear-gradient(90deg, var(--teal) var(--pct,40%), var(--dline) var(--pct,40%));
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; border: 2px solid var(--teal); cursor: pointer;
  box-shadow: 0 0 0 3px rgba(13,148,136,.08), 0 1px 4px rgba(0,0,0,.3);
  transition: box-shadow .2s;
}
input[type=range]:hover::-webkit-slider-thumb { box-shadow: 0 0 0 5px rgba(13,148,136,.08), 0 1px 6px rgba(0,0,0,.3); }

.roi-result { }
.roi-big {
  font-size: 72px; font-weight: 800; letter-spacing: -.06em; line-height: 1;
  color: var(--teal); margin-bottom: 6px;
}
.roi-big-label { font-size: 15px; color: var(--dt2); margin-bottom: 40px; }
.roi-table { border: 1px solid var(--dline2); border-radius: 10px; overflow: hidden; }
.roi-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid var(--dline);
  font-size: 14px;
}
.roi-row:last-child { border-bottom: none; }
.roi-row-label { color: var(--dt2); }
.roi-row-val { font-weight: 600; color: var(--dt); font-variant-numeric: tabular-nums; }
.roi-cta-row {
  margin-top: 20px; padding: 16px 18px;
  border-radius: 10px; background: var(--teal);
  display: flex; align-items: center; justify-content: space-between;
}
.roi-cta-plan { font-size: 13px; color: rgba(255,255,255,.7); margin-bottom: 2px; }
.roi-cta-name { font-size: 15px; font-weight: 700; color: white; letter-spacing: -.02em; }
.roi-cta-btn {
  padding: 8px 16px; border-radius: 7px;
  background: rgba(255,255,255,.2); color: white;
  font-size: 13px; font-weight: 600; border: 1px solid rgba(255,255,255,.25);
  transition: all .15s; white-space: nowrap;
}
.roi-cta-btn:hover { background: rgba(255,255,255,.3); }

/* ────────────────────────────────────
   PRICING
──────────────────────────────────── */
.pricing-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; flex-wrap: wrap; gap: 20px; }
.pricing-note {
  font-size: 13.5px; color: var(--dt2); line-height: 1.6;
  padding: 13px 16px; border-radius: 8px;
  background: var(--dk3); border: 1px solid var(--dline2);
  border-left: 2px solid var(--teal);
  max-width: 540px; margin-bottom: 40px;
}
.pricing-note strong { color: var(--dt); font-weight: 600; }

.plans { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.plan {
  border-radius: 16px; padding: 28px;
  background: var(--dk3); border: 1.5px solid var(--dline2);
  position: relative; transition: all .4s cubic-bezier(.16,1,.3,1);
  transform-style: preserve-3d;
  box-shadow: 0 2px 8px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.03);
}
.plan:hover { box-shadow: 0 20px 40px rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.04); transform: perspective(800px) translateY(-8px) translateZ(10px); }
.plan.featured {
  border-color: var(--teal);
  background: var(--dk2);
  box-shadow: 0 0 0 1px var(--teal), 0 4px 16px rgba(13,148,136,.06);
}
.plan.featured:hover { transform: perspective(800px) translateY(-10px) translateZ(14px); box-shadow: 0 0 0 1.5px var(--teal), 0 24px 48px rgba(13,148,136,.15), 0 0 60px rgba(13,148,136,.06); }
.plan-top { height: 3px; background: transparent; border-radius: 14px 14px 0 0; margin: -28px -28px 24px; }
.plan.featured .plan-top { background: var(--teal); }
.plan-tag { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); padding: 3px 12px; border-radius: 100px; background: var(--teal); color: white; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.plan-name { font-size: 13px; font-weight: 600; color: var(--dt3); margin-bottom: 16px; text-transform: uppercase; letter-spacing: .06em; }
.plan-price-main { font-size: 52px; font-weight: 800; letter-spacing: -.05em; line-height: 1; color: var(--dt); margin-bottom: 2px; }
.plan-price-main .curr { font-size: 22px; font-weight: 500; color: var(--dt2); vertical-align: super; }
.plan.featured .plan-price-main { color: var(--teal); }
.plan-period { font-size: 13px; color: var(--dt3); margin-bottom: 4px; }
.plan-seats { font-size: 13px; color: var(--dt2); margin-bottom: 22px; font-weight: 500; }
.plan-divider { height: 1px; background: var(--dline); margin-bottom: 20px; }
.plan-features { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
.plan-features li { display: flex; align-items: center; gap: 9px; font-size: 14px; color: var(--dt2); }
.pf-yes { width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0; background: rgba(13,148,136,.12); border: 1.5px solid rgba(13,148,136,.25); display: grid; place-items: center; font-size: 10px; color: var(--teal); font-weight: 800; box-shadow: 0 1px 3px rgba(13,148,136,.15); }
.pf-no  { width: 17px; height: 17px; border-radius: 5px; flex-shrink: 0; background: var(--dk4); border: 1px solid var(--dline); display: grid; place-items: center; font-size: 8.5px; color: var(--dk5); }
.plan-features li.na { color: var(--dt3); }
.plan-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px; border-radius: 8px;
  font-size: 14px; font-weight: 600; letter-spacing: -.01em;
  transition: all .18s;
}
.pb-teal { background: var(--teal); color: white; }
.pb-teal:hover { background: #0b7d73; box-shadow: 0 4px 14px rgba(13,148,136,.25); }
.pb-outline { border: 1.5px solid var(--dline2); color: var(--dt2); }
.pb-outline:hover { background: var(--dk4); color: var(--dt); border-color: var(--dline2); }
.plan-footnote { font-size: 12px; color: var(--dt3); text-align: center; margin-top: 18px; }
.plan-footnote strong { color: var(--dt2); }

/* ────────────────────────────────────
   TESTIMONIAL
──────────────────────────────────── */
.testimonials { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.testi {
  padding: 28px; border-radius: 16px;
  background: var(--lk); border: 1.5px solid var(--lline2);
  transition: all .4s cubic-bezier(.16,1,.3,1);
  color: var(--lt); transform-style: preserve-3d;
  box-shadow: 0 2px 8px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.03);
}
.testi:hover { box-shadow: 0 20px 40px rgba(0,0,0,.08), 0 8px 16px rgba(0,0,0,.04); transform: perspective(800px) translateY(-8px) translateZ(10px) rotateX(1deg); }
.testi-stars { display: flex; gap: 3px; margin-bottom: 14px; }
.star { font-size: 18px; color: #FBBF24; filter: drop-shadow(0 1px 2px rgba(251,191,36,.4)); }
.testi-quote { font-size: 14.5px; color: var(--lt); line-height: 1.7; margin-bottom: 20px; }
.testi-author { display: flex; align-items: center; gap: 10px; }
.ta-ava { width: 44px; height: 44px; border-radius: 50%; background: var(--lk2); border: 2px solid var(--lline2); display: grid; place-items: center; font-size: 24px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.ta-name { font-size: 13.5px; font-weight: 600; color: var(--lt); margin-bottom: 1px; letter-spacing: -.01em; }
.ta-role { font-size: 12px; color: var(--lt3); }
.ta-result { font-size: 11.5px; font-weight: 600; color: var(--teal); margin-top: 3px; }

/* ────────────────────────────────────
   FAQ
──────────────────────────────────── */
.faq-list { max-width: 780px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; }
.faq-item { border-bottom: 1px solid var(--dline); }
.faq-item:first-child { border-top: 1px solid var(--dline); }
.faq-q {
  width: 100%; background: none; border: none; color: var(--dt);
  font-size: 17px; font-weight: 600; text-align: left;
  padding: 24px 0; cursor: pointer;
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
  transition: color .2s;
}
.faq-q:hover { color: var(--teal); }
.faq-icon { font-size: 22px; font-weight: 300; color: var(--teal); flex-shrink: 0; transition: transform .3s; }
.faq-item.open .faq-icon { transform: rotate(45deg); }
.faq-a { display: none; padding-bottom: 24px; }
.faq-item.open .faq-a { display: block; }
.faq-a p { color: var(--dt2); font-size: 15px; line-height: 1.7; margin: 0; }

/* ────────────────────────────────────
   END CTA — dark section
──────────────────────────────────── */
.end-cta {
  background: var(--dk);
  padding: 140px 24px;
  text-align: center;
  position: relative; overflow: hidden;
}
.end-glow {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  width: 800px; height: 400px;
  background: radial-gradient(ellipse, rgba(13,148,136,.04) 0%, transparent 65%);
  pointer-events: none;
}
.end-inner { position: relative; z-index: 1; }
.end-h2 {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 800; letter-spacing: -.04em; line-height: 1.05;
  color: var(--dt); margin-bottom: 20px;
}
.end-h2 em { font-style: normal; color: var(--teal); }
.end-sub { font-size: 17px; color: var(--dt2); line-height: 1.65; max-width: 500px; margin: 0 auto 40px; }
.end-btns { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
.end-note { margin-top: 20px; font-size: 13px; color: var(--dt3); }

/* ────────────────────────────────────
   FOOTER
──────────────────────────────────── */
footer {
  background: var(--dk);
  border-top: 1px solid var(--dline);
  padding: 60px 24px 32px;
}
.footer-grid {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px; margin-bottom: 48px;
}
.footer-desc { font-size: 13.5px; color: var(--dt3); line-height: 1.75; max-width: 240px; margin-top: 12px; }
.footer-social { display: flex; gap: 7px; margin-top: 16px; }
.fsoc { width: 32px; height: 32px; border-radius: 7px; background: var(--dk3); border: 1px solid var(--dline); display: grid; place-items: center; font-size: 13px; color: var(--dt3); transition: all .15s; }
.fsoc:hover { background: var(--teal2); color: var(--teal); border-color: rgba(13,148,136,.2); }
.footer-col h4 { font-size: 12px; font-weight: 600; color: var(--dt); margin-bottom: 14px; letter-spacing: -.01em; }
.footer-col a { display: block; font-size: 13.5px; color: var(--dt3); margin-bottom: 10px; transition: color .15s; }
.footer-col a:hover { color: var(--teal); }
.footer-bottom {
  max-width: 1100px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 24px; border-top: 1px solid var(--dline);
  font-size: 12.5px; color: var(--dt3);
}

/* ────────────────────────────────────
   INTEGRATIONS
──────────────────────────────────── */
.integ-cats { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
.integ-cat-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 100px;
  font-size: 14px; font-weight: 600; font-family: var(--f);
  background: var(--dk3); border: 1.5px solid var(--dline2);
  color: var(--dt2); cursor: pointer; transition: all .3s cubic-bezier(.16,1,.3,1);
  box-shadow: 0 2px 6px rgba(0,0,0,.04);
}
.integ-cat-btn span { font-size: 20px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.15)); }
.integ-cat-btn:hover { border-color: var(--teal); color: var(--dt); transform: translateY(-2px); box-shadow: 0 6px 16px rgba(13,148,136,.1); }
.integ-cat-btn.active { background: var(--teal); border-color: var(--teal); color: #fff; box-shadow: 0 4px 14px rgba(13,148,136,.25); }
.integrations-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 18px; max-width: 900px; margin: 0 auto;
}
.integration-card {
  background: var(--dk3); border: 1.5px solid var(--dline2);
  border-radius: 16px; padding: 24px 16px; text-align: center;
  transition: all .4s cubic-bezier(.16,1,.3,1);
  transform-style: preserve-3d;
  box-shadow: 0 2px 12px rgba(0,0,0,.2), 0 1px 3px rgba(0,0,0,.15);
}
.integration-card:hover {
  border-color: rgba(13,148,136,.4);
  transform: perspective(800px) translateY(-8px) translateZ(12px) rotateX(2deg);
  box-shadow: 0 20px 40px rgba(13,148,136,.12), 0 8px 16px rgba(0,0,0,.06), 0 0 0 1px rgba(13,148,136,.1);
}
.integration-card.available { border-color: rgba(13,148,136,.25); box-shadow: 0 2px 8px rgba(13,148,136,.06), 0 1px 2px rgba(0,0,0,.03); }
.integration-icon { font-size: 40px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 2px 4px rgba(0,0,0,.1)); transition: transform .4s cubic-bezier(.16,1,.3,1); }
.integration-card:hover .integration-icon { transform: scale(1.15) translateY(-2px); }
.integration-icon img { width: 48px; height: 48px; object-fit: contain; border-radius: 12px; transition: transform .4s cubic-bezier(.16,1,.3,1); filter: drop-shadow(0 2px 4px rgba(0,0,0,.15)); }
.integration-card:hover .integration-icon img { filter: drop-shadow(0 4px 10px rgba(0,0,0,.18)); }
.integration-name { font-size: 14px; font-weight: 700; color: var(--dt); margin-bottom: 4px; }
.integration-tag { font-size: 11px; color: var(--dt3); margin-bottom: 8px; }
.integration-status { font-size: 10px; font-weight: 600; padding: 3px 12px; border-radius: 100px; display: inline-block; }
.integration-status.live { background: rgba(13,148,136,.08); color: var(--teal); border: 1px solid rgba(13,148,136,.15); }

/* Competitive advantage */
.vs-block { margin-top: 64px; max-width: 900px; margin-left: auto; margin-right: auto; }
.vs-title { font-size: clamp(22px, 2.5vw, 30px); font-weight: 800; letter-spacing: -.03em; color: var(--dt); margin-bottom: 8px; text-align: center; }
.vs-subtitle { font-size: 15px; color: var(--dt2); text-align: center; margin-bottom: 32px; line-height: 1.7; }
.vs-table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 16px; overflow: hidden; border: 1px solid var(--dline2); background: var(--dk3); }
.vs-table thead th { padding: 16px 20px; font-size: 13px; font-weight: 700; text-align: center; background: var(--dk2); border-bottom: 1px solid var(--dline); color: var(--dt); }
.vs-table thead th:first-child { text-align: left; }
.vs-table thead th.vs-scalyo { background: rgba(13,148,136,.08); color: var(--teal); }
.vs-table tbody td { padding: 14px 20px; font-size: 14px; text-align: center; border-bottom: 1px solid var(--dline); color: var(--dt2); }
.vs-table tbody td:first-child { text-align: left; font-weight: 600; color: var(--dt); }
.vs-table tbody td.vs-scalyo { background: rgba(13,148,136,.03); }
.vs-table tbody tr:last-child td { border-bottom: none; }
.vs-check { color: var(--teal); font-weight: 700; font-size: 16px; }
.vs-cross { color: #D4432F; font-size: 14px; }
.vs-partial { color: #D4930F; font-size: 13px; font-weight: 500; }
.sell-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.sell-card { background: var(--dk3); border: 1.5px solid var(--dline2); border-radius: 16px; padding: 28px 22px; text-align: center; transition: all .4s cubic-bezier(.16,1,.3,1); transform-style: preserve-3d; box-shadow: 0 2px 8px rgba(0,0,0,.04); }
.sell-card:hover { transform: perspective(600px) translateY(-10px) translateZ(16px) rotateX(2deg); border-color: rgba(13,148,136,.35); box-shadow: 0 24px 48px rgba(13,148,136,.12), 0 12px 24px rgba(0,0,0,.08), 0 0 0 1px rgba(13,148,136,.15); }
.sell-icon { font-size: 40px; margin-bottom: 14px; filter: drop-shadow(0 3px 2px rgba(0,0,0,.15)) drop-shadow(0 6px 6px rgba(0,0,0,.08)); transition: transform .4s cubic-bezier(.16,1,.3,1); animation: emojiFloat 3s ease-in-out infinite; display: inline-block; }
.sell-card:hover .sell-icon { transform: scale(1.2) translateY(-4px); filter: drop-shadow(0 4px 4px rgba(0,0,0,.2)) drop-shadow(0 8px 10px rgba(0,0,0,.12)); }
.sell-label { font-size: 15px; font-weight: 700; color: var(--dt); margin-bottom: 8px; letter-spacing: -.02em; }
.sell-desc { font-size: 13px; color: var(--dt2); line-height: 1.6; }
.vs-highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }
.vs-hl-card { background: rgba(13,148,136,.04); border: 1.5px solid rgba(13,148,136,.15); border-radius: 14px; padding: 20px; text-align: center; transition: all .4s cubic-bezier(.16,1,.3,1); transform-style: preserve-3d; }
.vs-hl-card:hover { transform: perspective(800px) translateY(-6px) translateZ(8px); box-shadow: 0 16px 32px rgba(13,148,136,.1), 0 6px 12px rgba(0,0,0,.04); border-color: rgba(13,148,136,.3); }
.vs-hl-number { font-size: 28px; font-weight: 800; color: var(--teal); letter-spacing: -.04em; margin-bottom: 4px; }
.vs-hl-text { font-size: 13px; color: var(--dt2); line-height: 1.5; }

/* ────────────────────────────────────
   RESPONSIVE
──────────────────────────────────── */
/* ═══════════════════════════════════
   TABLET — 1020px
═══════════════════════════════════ */
@media (max-width: 1020px) {
  .feat-panel { grid-template-columns: 1fr; gap: 40px; }
  .feat-panel.flip { direction: ltr; }
  .roi-wrap { grid-template-columns: 1fr; }
  .plans { grid-template-columns: 1fr 1fr; gap: 14px; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .stats-inner { grid-template-columns: 1fr 1fr; }
  .integrations-grid { grid-template-columns: repeat(3, 1fr); }
  .sell-grid { grid-template-columns: repeat(2, 1fr); }
  .vs-highlights { gap: 10px; }
  .stat-cell { border-right: none; border-bottom: 1px solid var(--dline); }
  .stat-cell:nth-child(odd) { border-right: 1px solid var(--dline); }
}

/* ═══════════════════════════════════
   MOBILE — 768px
═══════════════════════════════════ */
@media (max-width: 768px) {

  /* NAV */
  nav { padding: 0 20px; height: 56px; }
  .nav-links { display: none; }
  .n-ghost { display: none; }
  .n-solid { padding: 9px 16px; font-size: 13px; }
  .nav-logo { font-size: 16px; }
  .nav-logo-icon { width: 28px; height: 28px; font-size: 13px; }

  /* HERO */
  .hero { padding: 90px 20px 56px; text-align: center; }
  .hero-badge { margin: 0 auto 20px; font-size: 12px; }
  .hero-h1 { font-size: clamp(36px, 9vw, 52px); letter-spacing: -.04em; }
  .hero-sub { font-size: 15px; max-width: 100%; margin: 0 auto 28px; }
  .hero-cta { flex-direction: column; align-items: stretch; gap: 10px; max-width: 340px; margin: 0 auto 24px; }
  .btn-primary { justify-content: center; padding: 15px 20px; font-size: 15px; }
  .btn-secondary { justify-content: center; padding: 14px 20px; font-size: 15px; }
  .hero-social-proof { flex-wrap: wrap; justify-content: center; gap: 10px; font-size: 12px; }
  .hsp-sep { display: none; }
  .hero-screenshot { margin-top: 40px; border-radius: 12px; }

  /* SECTIONS */
  .section { padding: 64px 20px; }
  .section-label { font-size: 11px; margin-bottom: 12px; }
  .h2-light, .h2-dark { font-size: clamp(26px, 7vw, 40px); margin-bottom: 12px; }
  .sub-light, .sub-dark { font-size: 15px; max-width: 100%; }

  /* STATS BAR */
  .stats-bar { padding: 40px 20px; }
  .stats-inner { grid-template-columns: 1fr 1fr; gap: 0; }
  .stat-cell { padding: 24px 16px; border-right: none; border-bottom: 1px solid var(--dline); }
  .stat-cell:nth-child(odd) { border-right: 1px solid var(--dline); }
  .stat-cell:nth-child(3), .stat-cell:nth-child(4) { border-bottom: none; }
  .stat-num { font-size: 36px; }
  .stat-label { font-size: 11px; }

  /* FEATURES */
  .feat-panel { grid-template-columns: 1fr; gap: 32px; }
  .feat-panel.flip { direction: ltr; }
  .feat-title { font-size: clamp(22px, 6vw, 32px); }
  .feat-body { font-size: 15px; }
  .feat-point { font-size: 13px; }
  .feat-visual { border-radius: 12px; }
  .fv-pad { padding: 20px; }

  /* WELLBEING WIDGET */
  .wb-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .wb-card { padding: 12px; }
  .wb-score { font-size: 28px; }

  /* ROI */
  .roi-wrap { grid-template-columns: 1fr; gap: 40px; }
  .roi-big { font-size: 56px; }
  .roi-big-label { font-size: 14px; margin-bottom: 28px; }
  .roi-row { padding: 12px 14px; font-size: 13px; }
  .rsl-label { font-size: 13px; }

  /* PRICING */
  .plans { grid-template-columns: 1fr; gap: 16px; max-width: 420px; margin: 0 auto; }
  .plan { padding: 24px; }
  .plan-top { margin: -24px -24px 20px; }
  .plan-price-main { font-size: 44px; }
  .pricing-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .plan-features li { font-size: 13px; }
  .plan-btn { padding: 13px; font-size: 14px; }
  .plan-footnote { font-size: 11px; }

  /* INTEGRATIONS */
  .integrations-grid { grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .integ-cats { gap: 6px; }
  .integ-cat-btn { padding: 7px 12px; font-size: 12px; }
  .sell-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .sell-card { padding: 18px 14px; }
  .sell-label { font-size: 14px; }
  .sell-desc { font-size: 12px; }
  .vs-highlights { grid-template-columns: 1fr; }
  .vs-title { font-size: 20px; }

  /* END CTA */
  .end-cta { padding: 80px 20px; text-align: center; }
  .end-h2 { font-size: clamp(28px, 8vw, 44px); }
  .end-sub { font-size: 15px; max-width: 100%; }
  .end-btns { flex-direction: column; align-items: stretch; max-width: 320px; margin: 0 auto; gap: 10px; }
  .end-btns a { justify-content: center; }

  /* FOOTER */
  .footer { padding: 48px 20px 24px; }
  .footer-grid { grid-template-columns: 1fr; gap: 32px; }
  .footer-bottom { flex-direction: column; gap: 8px; text-align: center; font-size: 12px; }
  .footer-bottom-links { justify-content: center; }
}

/* ═══════════════════════════════════
   SMALL MOBILE — 390px
═══════════════════════════════════ */
@media (max-width: 390px) {
  .hero-h1 { font-size: 32px; }
  .stat-num { font-size: 30px; }
  .plans { max-width: 100%; }
  .plan-price-main { font-size: 38px; }
  .wb-grid { grid-template-columns: 1fr; }
  .roi-big { font-size: 48px; }
  .integrations-grid { grid-template-columns: repeat(2, 1fr); }
  .sell-grid { grid-template-columns: 1fr; }
}
/* HAMBURGER + MOBILE MENU */
.hamburger {
  display: none; flex-direction: column; justify-content: center;
  gap: 5px; width: 36px; height: 36px; background: none;
  border: none; cursor: pointer; padding: 4px;
}
.hamburger span {
  display: block; height: 2px; width: 100%;
  background: var(--dt); border-radius: 2px;
  transition: all .25s cubic-bezier(.16,1,.3,1);
}
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

.mobile-menu {
  display: none; position: fixed; top: 56px; left: 0; right: 0;
  background: var(--dk); border-bottom: 1px solid var(--dline2);
  flex-direction: column; padding: 16px 20px 24px; gap: 4px;
  z-index: 99; box-shadow: 0 4px 16px rgba(0,0,0,.3);
}
.mobile-menu a {
  padding: 13px 0; font-size: 16px; font-weight: 500;
  color: var(--dt2); border-bottom: 1px solid var(--dline);
  text-decoration: none; transition: color .15s;
}
.mobile-menu a:last-child { border-bottom: none; }
.mobile-menu a:hover { color: var(--dt); }
.mobile-menu .mm-cta {
  margin-top: 12px; padding: 14px 20px; border-radius: 8px;
  background: var(--teal); color: white !important; font-weight: 600;
  text-align: center; border: none;
}
.mobile-menu.open { display: flex; }

@media (max-width: 768px) {
  .hamburger { display: flex; }
}

/* ── LANG SWITCHER ── */
.lang-sw { display:flex; gap:3px; align-items:center; margin-left:8px; }
.lang-sw button {
  background:none; border:1px solid transparent; cursor:pointer;
  font-size:13px; font-weight:600; padding:4px 9px; border-radius:7px;
  color:var(--dt3); transition:all .15s; letter-spacing:.01em;
}
.lang-sw button:hover { background:rgba(240,246,252,.06); color:var(--dt); }
.lang-sw button.active { background:rgba(13,148,136,.13); color:var(--teal); border-color:rgba(13,148,136,.3); }
@media(max-width:640px){ .lang-sw { display:none; } }

/* ── MODALES LÉGALES ── */
.lm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(6px);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;}
.lm-overlay.open{display:flex;}
.lm-box{background:var(--dk3);border:1px solid var(--dline2);border-radius:18px;width:100%;max-width:640px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;}
.lm-head{padding:24px 28px 0;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.lm-head h3{font-size:18px;font-weight:700;color:var(--dt);margin:0;}
.lm-close{background:none;border:1px solid var(--dline2);color:var(--dt3);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.lm-close:hover{background:rgba(240,246,252,.06);color:var(--dt);}
.lm-body{padding:20px 28px 28px;overflow-y:auto;flex:1;}
.lm-body p,.lm-body li{font-size:14px;color:var(--dt2);line-height:1.7;}
.lm-body h4{font-size:13px;font-weight:700;color:var(--teal);margin:20px 0 6px;text-transform:uppercase;letter-spacing:.06em;}
.lm-body ul{padding-left:16px;margin:4px 0 12px;}
.lm-body li{margin:4px 0;}
.lm-body a{color:var(--teal);}
.lm-email-link{display:flex;align-items:center;gap:10px;background:rgba(13,148,136,.08);border:1px solid rgba(13,148,136,.2);border-radius:10px;padding:14px 18px;margin-top:16px;text-decoration:none;transition:all .2s;}
.lm-email-link:hover{background:rgba(13,148,136,.14);border-color:rgba(13,148,136,.4);}
.lm-email-icon{font-size:22px;flex-shrink:0;}
.lm-email-info strong{display:block;color:var(--dt);font-size:14px;}
.lm-email-info span{font-size:13px;color:var(--dt3);}
.lm-contact-form{margin-top:20px;}
.lm-contact-form label{display:block;font-size:12px;font-weight:600;color:var(--dt3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em;}
.lm-contact-form input,.lm-contact-form textarea{width:100%;background:var(--dk2);border:1px solid rgba(240,246,252,.12);border-radius:8px;color:var(--dt);font-size:14px;padding:10px 14px;font-family:var(--f);transition:border .15s;box-sizing:border-box;}
.lm-contact-form input:focus,.lm-contact-form textarea:focus{outline:none;border-color:rgba(13,148,136,.4);}
.lm-contact-form textarea{resize:vertical;min-height:100px;}
.lm-contact-form .lm-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.lm-contact-form .lm-field{margin-bottom:12px;}
.lm-submit{width:100%;padding:12px;background:var(--teal);border:none;border-radius:10px;color:#07090F;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s;margin-top:4px;}
.lm-submit:hover{background:#0fb8a7;}
.lm-success{display:none;text-align:center;padding:20px;color:var(--teal);font-size:14px;}

.mod-section{padding:72px 5%;border-top:1px solid rgba(240,246,252,.06);}
/* ── FEATURES MODULES ── */
/* ── CHIPS SECTION ── */
.chips-section{background:var(--dk);padding:80px 24px 40px;text-align:center;}
.chips-label{text-align:center;font-size:12px;font-weight:700;color:var(--dt3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:28px;}
.chips-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:960px;margin:0 auto;}
.chip{background:var(--dk3);border:1.5px solid var(--dline2);border-radius:18px;padding:22px 14px;text-align:center;cursor:default;transition:all .35s cubic-bezier(.16,1,.3,1);transform-style:preserve-3d;}
.chip:hover,.chip.active{border-color:var(--teal);background:rgba(13,148,136,.06);transform:perspective(600px) translateY(-4px) translateZ(8px);box-shadow:0 8px 28px rgba(13,148,136,.12);}
.chip-icon{font-size:36px;margin-bottom:10px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.12));transition:transform .35s cubic-bezier(.16,1,.3,1);animation:emojiFloat 3s ease-in-out infinite;display:inline-block;}
.chip:nth-child(1) .chip-icon{animation-delay:0s;}
.chip:nth-child(2) .chip-icon{animation-delay:.35s;}
.chip:nth-child(3) .chip-icon{animation-delay:.7s;}
.chip:nth-child(4) .chip-icon{animation-delay:1.05s;}
.chip:nth-child(5) .chip-icon{animation-delay:1.4s;}
.chip:nth-child(6) .chip-icon{animation-delay:1.75s;}
.chip:nth-child(7) .chip-icon{animation-delay:2.1s;}
.chip:nth-child(8) .chip-icon{animation-delay:2.45s;}
.chip:hover .chip-icon{transform:scale(1.18) translateY(-4px);animation-play-state:paused;}
@keyframes emojiFloat{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-6px) scale(1.05);}}
.chip-label{font-size:13px;font-weight:700;color:var(--dt2);}
.chip.active .chip-label{color:var(--teal);}
/* ── STATS BAND ── */
.stats-band{background:var(--dk);padding:40px 24px 80px;}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;max-width:900px;margin:0 auto;text-align:center;}
.stat-n{font-size:clamp(36px,5vw,56px);font-weight:900;line-height:1;background:linear-gradient(90deg,var(--teal),#14b8a6,#5eead4,#14b8a6,var(--teal));background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite;}
.stat-l{font-size:14px;font-weight:700;color:var(--dt);margin-top:8px;}
.stat-s{font-size:12px;color:var(--dt3);margin-top:4px;}
.mod-inner{display:flex;align-items:center;gap:56px;max-width:1080px;margin:0 auto;}
.mod-section:nth-child(even) .mod-inner{flex-direction:row-reverse;}
.mod-text{flex:1;min-width:280px;}
.mod-visual{flex:1;min-width:280px;}
.mod-tag{display:inline-flex;align-items:center;gap:8px;margin-bottom:18px;}
.mod-tag-icon{font-size:18px;}
.mod-tag-label{font-size:11px;font-weight:700;color:var(--teal);text-transform:uppercase;letter-spacing:.08em;}
.mod-h2{font-size:clamp(24px,3.5vw,38px);font-weight:900;letter-spacing:-.025em;line-height:1.2;margin-bottom:14px;}
.mod-body{font-size:15px;color:var(--dt2);line-height:1.7;margin-bottom:22px;}
.mod-list{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:28px;}
.mod-list li{display:flex;align-items:flex-start;gap:10px;font-size:13px;color:var(--dt2);}
.mod-check{width:18px;height:18px;background:rgba(13,148,136,.1);border:1px solid rgba(13,148,136,.28);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;font-size:9px;color:var(--teal);}
.mod-btn{display:inline-flex;align-items:center;gap:8px;background:rgba(13,148,136,.09);border:1px solid rgba(13,148,136,.28);color:var(--teal);font-weight:700;font-size:13px;padding:10px 20px;border-radius:9px;transition:all .2s;cursor:pointer;}
.mod-btn:hover{background:rgba(13,148,136,.18);transform:translateY(-1px);}
.mv::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--teal),var(--blue));}
.mv-head{font-size:12px;font-weight:700;color:var(--dt3);margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
.badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:100px;}
.bg{background:rgba(13,148,136,.1);color:var(--teal);}
.ba{background:rgba(245,158,11,.1);color:var(--amber);}
.br{background:rgba(239,68,68,.1);color:var(--red);}
.hr-name{font-size:12px;font-weight:600;min-width:110px;}
.hr-bar{flex:1;height:5px;background:rgba(240,246,252,.06);border-radius:100px;overflow:hidden;}
.hr-fill{height:100%;border-radius:100px;}
.hr-val{font-size:11px;font-weight:700;min-width:26px;text-align:right;}
.kpi-c{background:var(--bg3);border-radius:11px;padding:13px;}
.kpi-l{font-size:10px;color:var(--dt3);margin-bottom:3px;}
.kpi-v{font-size:21px;font-weight:900;}
.kpi-d{font-size:10px;font-weight:700;margin-top:2px;}
.dp{color:var(--teal);}
.dn{color:var(--red);}
.wb-c{background:var(--bg3);border-radius:10px;padding:11px;text-align:center;}
.wb-n{font-size:21px;font-weight:900;color:var(--teal);}
.wb-l{font-size:10px;color:var(--dt3);margin-top:2px;}
.msg{border-radius:11px;padding:11px 13px;font-size:12px;line-height:1.5;max-width:92%;}
.msg-u{background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.18);align-self:flex-end;}
.msg-a{background:rgba(13,148,136,.06);border:1px solid rgba(13,148,136,.14);color:var(--dt2);}
.msg-tag{font-size:10px;font-weight:700;color:var(--teal);margin-bottom:3px;}
.ep-row{border-bottom:1px solid rgba(240,246,252,.06);padding:5px 0;display:flex;gap:8px;}
.ep-lbl{color:var(--dt3);min-width:44px;font-size:10px;}
.cal-c{background:var(--bg3);border-radius:8px;padding:8px;font-size:11px;min-height:52px;}
.cal-ev{background:rgba(13,148,136,.07);border:1px solid rgba(13,148,136,.15);}
.cal-td{border:1px solid rgba(59,130,246,.3);}
.cal-title{font-size:11px;font-weight:700;color:var(--teal);}
.cal-sub{font-size:10px;color:var(--dt3);}
.task-col-h{font-size:10px;font-weight:700;color:var(--dt3);margin-bottom:7px;text-transform:uppercase;letter-spacing:.06em;}
.task-card{border-radius:8px;padding:9px;font-size:11px;margin-bottom:6px;border-left:2px solid;}
.tc-t{border-color:var(--teal);background:rgba(13,148,136,.05);}
.tc-a{border-color:var(--amber);background:rgba(245,158,11,.05);}
.tc-b{border-color:var(--blue);background:rgba(59,130,246,.05);}
.res-item{display:flex;align-items:center;gap:12px;padding:11px;background:var(--bg3);border-radius:10px;transition:all .18s;cursor:pointer;}
.res-item:hover{background:rgba(13,148,136,.06);border-color:rgba(13,148,136,.2);}
.res-icon{font-size:20px;flex-shrink:0;}
.res-info strong{display:block;font-size:13px;font-weight:700;}
.res-info span{font-size:11px;color:var(--dt3);}
.res-dl{margin-left:auto;font-size:11px;color:var(--teal);font-weight:700;}
.res-new{background:rgba(13,148,136,.05);border:1px solid rgba(13,148,136,.14);}
.cta-h2{font-size:clamp(26px,4.5vw,46px);font-weight:900;letter-spacing:-.025em;margin-bottom:14px;}
.cta-sub{font-size:16px;color:var(--dt2);max-width:480px;margin:0 auto 36px;line-height:1.6;}
.plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:840px;margin:0 auto 24px;}
.plan-card{background:var(--bg2);border:1px solid rgba(240,246,252,.08);border-radius:18px;padding:26px;text-align:left;position:relative;transition:all .2s;}
.plan-card.featured{border-color:var(--teal);background:rgba(13,148,136,.04);}
.plan-card:hover{transform:translateY(-2px);}
.plan-pop{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--teal);color:#07090F;font-size:10px;font-weight:800;padding:4px 14px;border-radius:100px;white-space:nowrap;}
.plan-name{font-size:14px;font-weight:800;margin-bottom:4px;}
.plan-price{font-size:30px;font-weight:900;color:var(--teal);margin-bottom:4px;}
.plan-price span{font-size:13px;font-weight:500;color:var(--dt3);}
.plan-desc{font-size:12px;color:var(--dt3);margin-bottom:18px;}
.plan-btn{display:block;text-align:center;padding:11px;border-radius:10px;font-size:13px;font-weight:700;transition:all .2s;}
.plan-btn-p{background:var(--teal);color:#07090F;}
.plan-btn-p:hover{background:#0fb8a7;}
.plan-btn-o{border:1px solid var(--dline2);color:var(--dt2);}
.plan-btn-o:hover{border-color:var(--teal);color:var(--dt);}
.plan-note{font-size:12px;color:var(--dt3);}
.plan-note strong{color:var(--teal);}
.rv.visible{animation:fadeUp .6s ease forwards;}
.d1{animation-delay:.1s;}
.d2{animation-delay:.2s;}
.d3{animation-delay:.3s;}
@media(max-width:900px){.mod-inner{flex-direction:column!important;gap:28px;}
.chips-grid{grid-template-columns:repeat(4,1fr);}
.stats-grid{grid-template-columns:1fr 1fr;gap:20px;}
.plan-grid{grid-template-columns:1fr;}
.task-g{grid-template-columns:1fr;}
.kpi-g{grid-template-columns:1fr 1fr;}
}

/* ===== LANDING MOBILE COMPLÉMENTAIRE ===== */
@media (max-width: 480px) {
  /* Hero inner */
  .hero-inner { max-width: 100%; padding: 0 4px; }
  .hero-screenshot { width: 100%; overflow: hidden; }
  .hero-screenshot img, .hero-screenshot > * { max-width: 100%; }

  /* Containers */
  .container, .container-narrow { max-width: 100%; padding: 0 16px; }
  .stats-inner { grid-template-columns: 1fr 1fr; }

  /* Module démos - empêcher débordement */
  .mod-inner { flex-direction: column !important; gap: 20px; padding: 0 4px; }
  .mv, .fv-card { width: 100% !important; max-width: 100%; overflow: hidden; border-radius: 10px; }
  .mod-visual, .feat-visual { width: 100%; border-radius: 10px; }
  
  /* Task board mobile */
  .task-g { grid-template-columns: 1fr !important; }
  .task-col { min-width: 0; }
  
  /* KPI grid */
  .kpi-g { grid-template-columns: 1fr !important; }
  
  /* Plans */
  .plans { max-width: 100% !important; padding: 0 4px; }
  .plan { padding: 20px 16px; }
  
  /* LM box */
  .lm-box { max-width: 100% !important; border-radius: 12px; }
  
  /* Chips grid */
  .chips-grid { grid-template-columns: repeat(3,1fr) !important; gap: 6px; }
  
  /* Sub text */
  .sub-light, .sub-dark, .hero-sub, .end-sub, .cta-sub { max-width: 100% !important; }

  /* Pricing note */
  .pricing-note { max-width: 100%; font-size: 13px; }

  /* FAQ */
  .faq-inner { padding: 0 4px; }
  
  /* Section padding */
  .section { padding: 48px 16px; }
  
  /* End CTA */
  .end-sub { max-width: 100%; }
  
  /* Demo modules scroll sur petits écrans */
  .demo-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
}
/* ========================================== */

</style>
