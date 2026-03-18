<template>
  <div class="landing">
<!-- NAV -->
<nav id="main-nav" :class="{ scrolled: navScrolled }">
  <a href="/" class="nav-logo">
    <div class="nav-logo-icon">S</div>
    Scalyo
  </a>
  <div class="nav-links">
    <a href="#features" data-i18n="nav_features">Fonctionnalités</a>
    <a href="#roi" data-i18n="nav_roi">ROI</a>
    <a href="#pricing" data-i18n="nav_pricing">Tarifs</a>
    <a href="#faq" data-i18n="nav_faq">FAQ</a>
  </div>
  <div class="nav-right">
    <router-link to="/login" class="n-ghost" data-i18n="nav_login">Connexion</router-link>
    <router-link to="/login" class="n-solid" data-i18n="nav_cta">Essai gratuit →</router-link>
    <button class="hamburger" id="hamburger" aria-label="Menu" @click="mobileMenuOpen = !mobileMenuOpen">
      <span></span><span></span><span></span>
    </button>
  </div>
  <div class="lang-sw">
    <button id="ls-fr" data-l="fr" @click="setLang('fr')">FR</button>
    <button id="ls-en" data-l="en" @click="setLang('en')">EN</button>
    <button id="ls-kr" data-l="kr" @click="setLang('kr')">한국어</button>
  </div>
</nav>
<div class="mobile-menu" id="mobile-menu" :class="{ open: mobileMenuOpen }">
  <a href="#features" @click="closeMobile" data-i18n="nav_features">Fonctionnalités</a>
  <a href="#roi" @click="closeMobile" data-i18n="nav_roi">ROI</a>
  <a href="#pricing" @click="closeMobile" data-i18n="nav_pricing">Tarifs</a>
  <a href="#faq" @click="closeMobile" data-i18n="nav_faq">FAQ</a>
  <router-link to="/login" class="mm-cta" data-i18n="cta_free">Commencer gratuitement →</router-link>
</div>

<!-- HERO -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <div class="hero-badge rv">
      <div class="badge-dot"></div>
      <span data-i18n="hero_badge">Plateforme Customer Success — Nouvelle génération</span>
    </div>
    <h1 class="hero-h1 rv">
      Le Customer Success,<br/>
      <span class="accent" id="hero-reinvente" data-i18n="reinvente">réinventé.</span>
    </h1>
    <p class="hero-sub rv d1">
      Pilotez vos KPIs, protégez vos comptes, prenez soin de votre équipe.
      <strong id="hero-sub" data-i18n="hero_sub">La seule plateforme CS qui combine performance, relation client et bien-être équipe.</strong>
    </p>
    <div class="hero-cta rv d2">
      <router-link to="/login" class="btn-primary">
        Commencer gratuitement — 14 jours
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </router-link>
      <a href="#pricing" class="btn-secondary"><span data-i18n="see_pricing">Voir les tarifs</span></a>
    </div>
    <div class="hero-social-proof rv d3">
      <span data-i18n="proof_no_card">Sans carte bancaire</span>
      <div class="hsp-sep"></div>
      <span data-i18n="proof_14d">14 jours gratuits</span>
      <div class="hsp-sep"></div>
      <span data-i18n="proof_rgpd">RGPD · Données EU</span>
      <div class="hsp-sep"></div>
      <span data-i18n="proof_support">Support FR 7j/7</span>
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
        <div class="topbar-url">🔒 app.scalyo.app</div>
        <div class="topbar-status"><div class="status-dot"></div>En direct</div>
      </div>
      <div class="app-layout">
        <div class="app-sidebar">
          <div class="sb-logo">
            <div class="sb-logo-dot"></div>
            <span class="sb-logo-txt">Scalyo</span>
          </div>
          <div class="sb-section" data-i18n="demo_menu">Menu</div>
          <div class="sb-item active"><span class="sb-icon">▦</span><span data-i18n="demo_dashboard">Dashboard</span></div>
          <div class="sb-item"><span class="sb-icon">◎</span><span data-i18n="demo_portfolio">Portefeuille</span></div>
          <div class="sb-item"><span class="sb-icon">↗</span>KPIs</div>
          <div class="sb-item"><span class="sb-icon">♡</span><span data-i18n="demo_wellbeing">Bien-être</span></div>
          <div class="sb-item"><span class="sb-icon">◈</span><span data-i18n="demo_coach"><span data-i18n="feat_coach">Coach IA</span></span></div>
          <div class="sb-item"><span class="sb-icon">☑</span>Tasks</div>
          <div class="sb-item"><span class="sb-icon">✉</span><span data-i18n="feat_email">Email Studio</span></div>
        </div>
        <div class="app-main">
          <div class="app-header">
            <div class="app-title">Vue d'ensemble</div>
            <div class="app-subtitle"><div class="status-dot"></div>Mars 2025 · Mis à jour à l'instant</div>
          </div>
          <div class="kpi-grid">
            <div class="kpi"><div class="kpi-lbl">NRR</div><div class="kpi-val c-teal">112%</div><div class="kpi-delta c-green">↑ +4 pts vs M-1</div></div>
            <div class="kpi"><div class="kpi-lbl" data-i18n="demo_mrr">MRR sécurisé</div><div class="kpi-val">284K€</div><div class="kpi-delta c-green">+12K ce mois</div></div>
            <div class="kpi"><div class="kpi-lbl" data-i18n="demo_churn">Risques churn</div><div class="kpi-val c-amber">3</div><div class="kpi-delta c-amber" data-i18n="demo_action">⚠ Action requise</div></div>
            <div class="kpi"><div class="kpi-lbl" data-i18n="demo_wellbeing_kpi"><span data-i18n="feat_wb">Bien-être équipe</span></div><div class="kpi-val c-blue">7.8<span style="font-size:13px;color:var(--dt3)">/10</span></div><div class="kpi-delta c-green">En forme</div></div>
          </div>
          <div class="app-row2">
            <div class="app-card">
              <div class="card-lbl" data-i18n="demo_nrr">NRR — 6 derniers mois</div>
              <div class="chart-wrap">
                <div class="bar" style="height:40%;background:var(--dk4)"></div>
                <div class="bar" style="height:55%;background:var(--dk4)"></div>
                <div class="bar" style="height:48%;background:var(--dk4)"></div>
                <div class="bar" style="height:70%;background:var(--dk4)"></div>
                <div class="bar" style="height:64%;background:var(--dk4)"></div>
                <div class="bar" style="height:92%;background:linear-gradient(to top,var(--teal),rgba(15,123,108,.25))"></div>
              </div>
            </div>
            <div class="app-card">
              <div class="card-lbl" data-i18n="demo_priority">Comptes prioritaires</div>
              <div class="accounts-list">
                <div class="account"><span class="acc-name">Leroy Finance</span><span class="acc-tag tag-red" data-i18n="tag_critical">Critique</span></div>
                <div class="account"><span class="acc-name">TechPilot SAS</span><span class="acc-tag tag-amber" data-i18n="tag_risk">À risque</span></div>
                <div class="account"><span class="acc-name">NexFlow Pro</span><span class="acc-tag tag-green" data-i18n="tag_stable">Stable</span></div>
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
      <div class="stat-number">−34%</div>
      <div class="stat-label" data-i18n="stat1">Réduction du churn</div>
      <div class="stat-note" data-i18n="stat1n">Résultat moyen en 90 jours d'utilisation</div>
    </div>
    <div class="stat-cell rv d1">
      <div class="stat-number">+18pts</div>
      <div class="stat-label" data-i18n="stat2">De NRR gagnés</div>
      <div class="stat-note" data-i18n="stat2n">Grâce aux alertes prédictives et playbooks</div>
    </div>
    <div class="stat-cell rv d2">
      <div class="stat-number">6h</div>
      <div class="stat-label" data-i18n="stat3">Épargnées / semaine / CSM</div>
      <div class="stat-note" data-i18n="stat3n">Reporting et emails automatisés par l'IA</div>
    </div>
    <div class="stat-cell rv d3">
      <div class="stat-number">30j</div>
      <div class="stat-label" data-i18n="stat4">D'avance sur le churn</div>
      <div class="stat-note" data-i18n="stat4n">Détection des signaux faibles avant le départ</div>
    </div>
  </div>
</div>

<!-- FEATURES — alternating panels -->
<section class="section section-light" id="features">
  <div class="container">

    <!-- Panel 1 -->
    <div class="feat-panel rv" style="margin-bottom:100px">
      <div class="feat-text">
        <div class="label"><div class="label-line"></div><span data-i18n="feat1_tag">Portefeuille clients</span></div>
        <h2 class="h2-light"><span data-i18n="feat1_h2">Détectez le churn<br/>30 jours avant.</span></h2>
        <p class="feat-body"><span data-i18n="feat1_body">Health scores dynamiques, alertes prédictives, playbooks personnalisés. Vos CSMs savent exactement sur quel compte agir</span>, et quand.</p>
        <div class="feat-points">
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat1_p1">Alertes automatiques dès qu'un compte décroche</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat1_p2">Playbooks actionnables en un clic</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat1_p3">Historique complet des interactions client</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat1_p4">Priorisation intelligente du portefeuille</span></div>
        </div>
      </div>
      <div class="feat-visual">
        <div class="fv-pad">
          <div class="fv-header">
            <span class="fv-title" style="color:var(--dt)"><span data-i18n="pb_title">Playbook — Compte à risque</span></span>
            <span class="fv-badge badge-live"><span data-i18n="pb_ongoing">En cours</span></span>
          </div>
          <div class="playbook-list" style="margin-bottom:14px">
            <div class="pb-step done"><div class="pb-num done">✓</div><span class="pb-text"><span data-i18n="pb_s1">Email d'ouverture de dialogue envoyé</span></span></div>
            <div class="pb-step done"><div class="pb-num done">✓</div><span class="pb-text"><span data-i18n="pb_s2">Analyse de l'utilisation produit effectuée</span></span></div>
            <div class="pb-step" style="border-color:var(--teal);background:rgba(15,123,108,.04)"><div class="pb-num">3</div><span class="pb-text" style="color:var(--dt);font-weight:500" id="pb-step3">Planifier un appel de 30 minutes</span></div>
            <div class="pb-step"><div class="pb-num" style="opacity:.4">4</div><span class="pb-text" style="opacity:.5" id="pb-step4">Présenter la roadmap produit</span></div>
          </div>
          <div style="padding:10px 12px;border-radius:8px;background:rgba(15,123,108,.06);border:1px solid rgba(15,123,108,.15)">
            <div style="font-size:11px;font-weight:600;color:var(--teal);margin-bottom:2px"><span data-i18n="pb_ai_label">Recommandation IA</span></div>
            <div style="font-size:12.5px;color:var(--dt2);line-height:1.55" id="pb-ai-msg">Ce compte a baissé son usage de 40% ce mois. Un appel rapide peut retourner la situation avant le renouvellement J-21.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 2 -->
    <div class="feat-panel flip rv" style="margin-bottom:100px">
      <div class="feat-text">
        <div class="label"><div class="label-line"></div><span data-i18n="feat2_tag">Bien-être équipe</span></div>
        <h2 class="h2-light"><span data-i18n="feat2_h2">La seule plateforme<br/>qui prend soin de vos CSMs.</span></h2>
        <p class="feat-body"><span data-i18n="feat2_body">Mood scores, charge de travail, alertes burnout précoces. Une équipe épuisée ne retient pas ses clients — vous le savez</span>.</p>
        <div class="feat-points">
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat2_p1">Suivi hebdomadaire de l'état d'esprit de l'équipe</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat2_p2">Alerte burnout avant la crise, pas après</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat2_p3">Vue manager pour anticiper les surcharges</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat2_p4">Innovation absente de tous les outils CS existants</span></div>
        </div>
      </div>
      <div class="feat-visual">
        <div class="fv-pad">
          <div class="fv-header">
            <span class="fv-title" style="color:var(--dt)"><span id="d-wb-title" data-i18n="d_wb_title">Bien-être équipe — Cette semaine</span></span>
            <span class="fv-badge badge-live"><span id="d-wb-upd" data-i18n="d_wb_upd">Mis à jour</span></span>
          </div>
          <div class="wb-grid">
            <div class="wb-card">
              <div class="wb-label" id="d-wb-avg" data-i18n="d_wb_avg">Score moyen</div>
              <div class="wb-score" style="color:var(--teal)">7.8</div>
              <div class="wb-sub" id="d-wb-sub" data-i18n="d_wb_sub">Sur 10 · En forme</div>
              <div class="wb-bar"><div class="wb-fill" style="width:78%;background:var(--teal)"></div></div>
            </div>
            <div class="wb-card">
              <div class="wb-label" id="d-wb-load" data-i18n="d_wb_load">Charge perçue</div>
              <div class="wb-score" style="color:#FBBF24">6.2</div>
              <div class="wb-sub" data-i18n="wb_load_sub">Sur 10 · Élevée</div>
              <div class="wb-bar"><div class="wb-fill" style="width:62%;background:#FBBF24"></div></div>
            </div>
            <div class="wb-card" style="grid-column:1/-1">
              <div class="wb-label" data-i18n="wb_alert">Membres en alerte</div>
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div style="font-size:13px;color:var(--dt)">Marie D. — Score 4.5/10</div>
                <span style="font-size:11px;font-weight:600;color:#F87171;padding:2px 8px;border-radius:100px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.15)" id="wb-alert-tag" id="d-wb-warn" data-i18n="d_wb_warn">À surveiller</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Panel 3 -->
    <div class="feat-panel rv">
      <div class="feat-text">
        <div class="label"><div class="label-line"></div><span data-i18n="feat3_tag"><span data-i18n="feat_coach_cs">Coach IA Customer Success</span></span></div>
        <h2 class="h2-light"><span data-i18n="feat3_h2">Un expert CS<br/>disponible 24h/24.</span></h2>
        <p class="feat-body"><span data-i18n="feat3_body">Posez n'importe quelle question sur la rétention, les QBRs, un compte difficile. Réponses instantanées, ac</span>tionnables.</p>
        <div class="feat-points">
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat3_p1">Conseils personnalisés selon votre contexte</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat3_p2">Templates d'emails, scripts d'appels, plans d'action</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat3_p3">100% en français — pas de barrière linguistique</span></div>
          <div class="feat-point"><div class="fp-check">✓</div><span data-i18n="feat3_p4">Alimenté par des milliers de cas CS réels</span></div>
        </div>
      </div>
      <div class="feat-visual">
        <div class="fv-pad">
          <div class="fv-header">
            <span class="fv-title" id="demo-coach-fv-title" data-i18n="demo_coach_fv_title" style="color:var(--dt)">Coach CS IA</span>
            <span class="fv-badge badge-live" data-i18n="coach_online">En ligne</span>
          </div>
          <div class="coach-wrap">
            <div class="coach-msg" id="coach-user-msg">Mon client Leroy Finance parle de ne pas renouveler. Comment je gère ça ?</div>
            <div class="coach-author" id="demo-coach-author" data-i18n="demo_coach_author">Coach CS IA</div>
            <div class="coach-msg ai" id="coach-ai-msg" data-i18n="coach_ai">Avant l'appel, analysez les 3 derniers mois d'utilisation pour identifier la friction principale. Ouvrez avec "J'ai vu que vous utilisez moins X — qu'est-ce qui a changé ?" plutôt que de défendre le produit. Leur problème, pas le vôtre, doit occuper 80% de la conversation.</div>
            <div class="coach-input">
              <span class="coach-placeholder" id="coach-placeholder">Posez une question CS...</span>
              <div class="coach-send">↑</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>
<!-- ── FEATURES DETAIL ── -->
<div id="features-detail">
<section class="chips-section">
  <div class="chips-label" id="fl-chips-label">8 modules · 1 seule plateforme</div>
  <div class="chips-grid">
    <div class="chip active"><div class="chip-icon">🎯</div><div class="chip-label" id="fl-c1">Portefeuille</div></div>
    <div class="chip"><div class="chip-icon">📊</div><div class="chip-label" id="fl-c2">KPIs COPIL</div></div>
    <div class="chip"><div class="chip-icon">💚</div><div class="chip-label" id="fl-c3">Bien-être</div></div>
    <div class="chip"><div class="chip-icon">🤖</div><div class="chip-label" id="fl-c4">Coach IA</div></div>
    <div class="chip"><div class="chip-icon">✉️</div><div class="chip-label" id="fl-c5">Email Studio</div></div>
    <div class="chip"><div class="chip-icon">📅</div><div class="chip-label" id="fl-c6">Planning</div></div>
    <div class="chip"><div class="chip-icon">✅</div><div class="chip-label" id="fl-c7">Task Board</div></div>
    <div class="chip"><div class="chip-icon">📚</div><div class="chip-label" id="fl-c8">Ressources</div></div>
  </div>
</section>
<div class="stats-band">
  <div class="stats-grid">
    <div><div class="stat-n" id="fl-s1n">-34%</div><div class="stat-l" id="fl-s1l">Churn réduit</div><div class="stat-s" id="fl-s1s">En 90 jours d'utilisation</div></div>
    <div><div class="stat-n" id="fl-s2n">+18%</div><div class="stat-l" id="fl-s2l">NRR gagné</div><div class="stat-s" id="fl-s2s">Grâce aux alertes prédictives</div></div>
    <div><div class="stat-n" id="fl-s3n">6h</div><div class="stat-l" id="fl-s3l">Épargnées/sem/CSM</div><div class="stat-s" id="fl-s3s">Reporting IA automatisé</div></div>
    <div><div class="stat-n" id="fl-s4n">30j</div><div class="stat-l" id="fl-s4l">d'avance sur le churn</div><div class="stat-s" id="fl-s4s">Détection signaux faibles</div></div>
  </div>
</div>


<section class="mod-section" id="m1">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">🎯</span><span class="mod-tag-label" id="fl-m1tag">Portefeuille clients</span></div>
      <h2 class="mod-h2" id="fl-m1h2">Chaque compte sous<br/>contrôle. En temps réel.</h2>
      <p class="mod-body" id="fl-m1body">Health scores dynamiques, alertes prédictives et playbooks intégrés. Vos CSMs savent exactement quel compte nécessite une action — et laquelle.</p>
      <ul class="mod-list">
        <li><div class="mod-check">✓</div><span id="fl-m1p1">Score santé 0-10 mis à jour automatiquement</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m1p2">Alertes churn 30 jours avant la décision du client</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m1p3">Playbooks actionnables en 1 clic par scénario</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m1p4">Historique complet des interactions par compte</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m1p5">Filtrage par CSM, industrie, risk level, MRR</span></li>
      </ul>
      <router-link to="/login" class="mod-btn" id="fl-m1btn">Découvrir le module →</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span id="d-m1-head" data-i18n="d_m1_head">Portefeuille — Vue CSM</span> <span class="badge ba" id="d-m1-alerts" data-i18n="d_m1_alerts">3 alertes</span></div>
        <div class="hr"><div class="hr-name" style="font-size:12px">Leroy Finance</div><div class="hr-bar"><div class="hr-fill" style="width:25%;background:var(--red)"></div></div><div class="hr-val" style="color:var(--red)">2.5</div><span class="badge br" id="d-m1-crit" data-i18n="d_m1_crit">⚠ Critique</span></div>
        <div class="hr"><div class="hr-name" style="font-size:12px">Acme Corp</div><div class="hr-bar"><div class="hr-fill" style="width:62%;background:var(--amber)"></div></div><div class="hr-val" style="color:var(--amber)">6.2</div><span class="badge ba" id="d-m1-watch" data-i18n="d_m1_watch">Watch</span></div>
        <div class="hr"><div class="hr-name" style="font-size:12px">TechVision SAS</div><div class="hr-bar"><div class="hr-fill" style="width:87%;background:var(--teal)"></div></div><div class="hr-val" style="color:var(--teal)">8.7</div><span class="badge bg" id="d-m1-s1" data-i18n="d_m1_s1">✓ Stable</span></div>
        <div class="hr"><div class="hr-name" style="font-size:12px">BioMed Group</div><div class="hr-bar"><div class="hr-fill" style="width:91%;background:var(--teal)"></div></div><div class="hr-val" style="color:var(--teal)">9.1</div><span class="badge bg" id="d-m1-s2" data-i18n="d_m1_s2">✓ Stable</span></div>
        <div style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(55,53,47,.06)">
          <div style="font-size:10px;color:var(--dt3);text-transform:uppercase;font-weight:700;letter-spacing:.06em;margin-bottom:8px" id="d-m1-reco" data-i18n="d_m1_reco">🤖 Recommandation IA</div>
          <div style="background:rgba(18,205,184,.06);border:1px solid rgba(18,205,184,.14);border-radius:9px;padding:11px;font-size:12px;color:var(--dt2)" id="d-m1-ai" data-i18n="d_m1_ai">Usage −40% ce mois. Initier un call de 30 min avec Leroy Finance avant le 15.</div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="mod-section" id="m2">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">📊</span><span class="mod-tag-label" id="fl-m2tag">KPIs COPIL</span></div>
      <h2 class="mod-h2" id="fl-m2h2">Vos comités pilotage<br/>prêts en 5 minutes.</h2>
      <p class="mod-body" id="fl-m2body">Centralisez NRR, churn rate, MRR sécurisé, CSAT et tous vos indicateurs. Le rapport COPIL se génère automatiquement chaque semaine.</p>
      <ul class="mod-list">
        <li><div class="mod-check">✓</div><span id="fl-m2p1">NRR, GRR, Churn Rate, MRR, CSAT, CES en temps réel</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m2p2">Historique 12 mois avec courbes d'évolution</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m2p3">Objectifs personnalisables avec indicateur d'atteinte</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m2p4">Rapport COPIL exportable PDF / Excel</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m2p5">Import CSV de vos données existantes</span></li>
      </ul>
      <router-link to="/login" class="mod-btn" id="fl-m2btn">Voir le dashboard →</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span id="demo-copil-period">COPIL — Février 2025</span> <span class="badge bg" id="demo-copil-badge">✓ Objectifs atteints</span></div>
        <div class="kpi-g">
          <div class="kpi-c"><div class="kpi-l">NRR</div><div class="kpi-v" style="color:var(--teal)">112%</div><div class="kpi-d dp" id="demo-kpi-d1">▲ +4% vs mois préc.</div></div>
          <div class="kpi-c"><div class="kpi-l">Churn Rate</div><div class="kpi-v" style="color:var(--red)">3.2%</div><div class="kpi-d dp" id="demo-kpi-d2">▼ −0.8% vs objectif</div></div>
          <div class="kpi-c"><div class="kpi-l" id="demo-mrr-sec" data-i18n="demo_mrr_sec">MRR Sécurisé</div><div class="kpi-v">€84K</div><div class="kpi-d dp">▲ +€6K</div></div>
          <div class="kpi-c"><div class="kpi-l">CSAT</div><div class="kpi-v" style="color:var(--teal)">91%</div><div class="kpi-d dp">▲ +3%</div></div>
        </div>
        <div style="margin-top:14px;height:54px;position:relative">
          <svg width="100%" height="54" viewBox="0 0 300 54" fill="none" preserveAspectRatio="none">
            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#12CDB8" stop-opacity=".25"/><stop offset="100%" stop-color="#12CDB8" stop-opacity="0"/></linearGradient></defs>
            <path d="M0,46 C50,40 80,30 110,24 C140,18 160,34 190,22 C220,12 250,16 300,6" stroke="rgba(18,205,184,.5)" stroke-width="1.5" fill="none"/>
            <path d="M0,46 C50,40 80,30 110,24 C140,18 160,34 190,22 C220,12 250,16 300,6 L300,54 L0,54Z" fill="url(#g1)"/>
          </svg>
        </div>
        <div style="font-size:10px;color:var(--dt3);text-align:center;margin-top:4px">NRR 6 mois · Objectif 110%</div>
      </div>
    </div>
  </div>
</section>
<section class="mod-section" id="m3">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">💚</span><span class="mod-tag-label" id="fl-m3tag">Bien-être équipe</span></div>
      <h2 class="mod-h2" id="fl-m3h2">La seule plateforme CS<br/>qui protège vos CSMs.</h2>
      <p class="mod-body" id="fl-m3body">Une équipe épuisée perd ses clients. Scalyo suit le moral, la charge et le burnout avant la crise — pas après.</p>
      <ul class="mod-list">
        <li><div class="mod-check">✓</div><span id="fl-m3p1">Check-in hebdomadaire anonyme (mood + charge)</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m3p2">Alerte burnout 3 semaines avant les signes visibles</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m3p3">Vue manager de l'équipe complète</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m3p4">Nova — coach bien-être IA intégré</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m3p5">Fonctionnalité absente de tous les outils CS</span></li>
      </ul>
      <router-link to="/login" class="mod-btn" id="fl-m3btn">Activer le module →</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span id="d-m3-head" data-i18n="d_m3_head">Bien-être équipe — Cette semaine</span> <span class="badge ba" id="d-m3-badge" data-i18n="d_m3_badge">1 alerte</span></div>
        <div class="wb-g">
          <div class="wb-c"><div class="wb-n">7.2</div><div class="wb-l" id="d-m3-avg" data-i18n="d_m3_avg">Score moyen</div></div>
          <div class="wb-c"><div class="wb-n" style="color:var(--amber)">7.1</div><div class="wb-l" id="d-m3-load" data-i18n="d_m3_load">Charge perçue</div></div>
          <div class="wb-c"><div class="wb-n" style="color:var(--red)">1</div><div class="wb-l" id="d-m3-alrt" data-i18n="d_m3_alrt">En alerte</div></div>
        </div>
        <div style="background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.18);border-radius:9px;padding:11px;margin-bottom:12px">
          <div style="font-size:10px;font-weight:700;color:var(--amber);margin-bottom:3px" id="d-m3-burn" id="demo-burnout-lbl" data-i18n="demo_burnout">⚠ Alerte burnout précoce</div>
          <div style="font-size:12px;color:var(--dt2)" id="d-m3-sara" data-i18n="d_m3_sara">Sarah M. — Charge 9.1/10 depuis 3 semaines. Check-in recommandé avant vendredi.</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <div style="flex:1;height:5px;background:rgba(18,205,184,.12);border-radius:100px;overflow:hidden"><div style="width:72%;height:100%;background:var(--teal);border-radius:100px"></div></div>
          <div style="font-size:10px;color:var(--dt3)" id="d-m3-trnd" data-i18n="d_m3_trnd">Tendance stable →</div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="mod-section" id="m4">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">🤖</span><span class="mod-tag-label" id="fl-m4tag">Coach IA Customer Success</span></div>
      <h2 class="mod-h2" id="fl-m4h2">Un expert CS disponible<br/>à 3h du matin.</h2>
      <p class="mod-body" id="fl-m4body">Posez n'importe quelle question sur la rétention, un QBR, un compte difficile. Réponses instantanées, contextuelles, actionnables.</p>
      <ul class="mod-list">
        <li><div class="mod-check">✓</div><span id="fl-m4p1">Spécialisé Customer Success B2B SaaS</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m4p2">Templates emails rétention, scripts QBR</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m4p3">Plans d'action churn, expansion, onboarding</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m4p4">Historique de vos conversations conservé</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m4p5">Propulsé par IA — zéro configuration</span></li>
      </ul>
      <router-link to="/login" class="mod-btn" id="fl-m4btn">Poser une question →</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span id="demo-coach-head" data-i18n="demo_coach_head">Coach IA CS</span> <span class="badge bg" id="demo-coach-online" data-i18n="demo_coach_online">● En ligne</span></div>
        <div class="msgs">
          <div class="msg msg-u" id="demo-coach-q1" data-i18n="demo_coach_q1">Mon client Leroy Finance veut ne pas renouveler. J'ai un call demain, que faire ?</div>
          <div class="msg msg-a"><div class="msg-tag" id="demo-coach-tag1" data-i18n="demo_coach_tag1">🤖 Coach CS</div><span id="demo-coach-a1" data-i18n="demo_coach_a1">Analysez les 3 derniers mois : usage, tickets, dernière interaction. Identifiez <strong>la vraie friction</strong>. Ouvrez avec : <em>"Qu'est-ce qui vous rendrait 100% satisfait ?"</em></span></div>
          <div class="msg msg-u" id="demo-coach-q2" data-i18n="demo_coach_q2">Il demande une remise de 20%</div>
          <div class="msg msg-a"><div class="msg-tag" id="demo-coach-tag2" data-i18n="demo_coach_tag2">🤖 Coach CS</div><span id="demo-coach-a2" data-i18n="demo_coach_a2">Ne cédez pas immédiatement. Proposez : plan annuel (même économie), onboarding renforcé, ou accès fonctionnalités Growth...</span></div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="mod-section" id="m5">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">✉️</span><span class="mod-tag-label" id="fl-m5tag">Email Studio</span></div>
      <h2 class="mod-h2" id="fl-m5h2">Emails CS professionnels<br/>en 30 secondes.</h2>
      <p class="mod-body" id="fl-m5body">Bibliothèque de templates CS éprouvés + générateur IA. Check-in, QBR, churn, expansion — chaque contexte a son template parfait.</p>
      <ul class="mod-list">
        <li><div class="mod-check">✓</div><span id="fl-m5p1">15+ templates CS : onboarding, QBR, churn, expansion</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m5p2">Génération IA depuis votre contexte client</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m5p3">Variables dynamiques personnalisables</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m5p4">Copie 1 clic vers Gmail / Outlook</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m5p5">Templates disponibles en FR, EN, KR</span></li>
      </ul>
      <router-link to="/login" class="mod-btn" id="fl-m5btn">Créer un email →</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span id="demo-email-head" data-i18n="demo_email_head">Email Studio</span> <span class="badge bg" id="demo-ai-badge" data-i18n="demo_ai_badge">✓ Généré par IA</span></div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
          <span id="demo-tag-checkin" data-i18n="demo_tag_checkin" style="font-size:11px;background:rgba(18,205,184,.1);border:1px solid rgba(18,205,184,.2);color:var(--teal);padding:4px 10px;border-radius:100px">Check-in mensuel</span>
          <span id="demo-tag-churn" data-i18n="demo_tag_churn" style="font-size:11px;background:rgba(55,53,47,.04);border:1px solid rgba(55,53,47,.09);color:var(--dt3);padding:4px 10px;border-radius:100px">Alerte churn</span>
          <span style="font-size:11px;background:rgba(55,53,47,.04);border:1px solid rgba(55,53,47,.09);color:var(--dt3);padding:4px 10px;border-radius:100px">QBR</span>
        </div>
        <div class="ep">
          <div class="ep-row"><div class="ep-lbl" id="demo-email-to" data-i18n="demo_email_to">À :</div><div>marc@leroyfinance.com</div></div>
          <div class="ep-row"><div class="ep-lbl" id="d-m5-lbl" data-i18n="d_m5_lbl">Objet :</div><div style="font-weight:600" id="d-m5-subj" data-i18n="d_m5_subj">Point mensuel Scalyo — Janvier 2025</div></div>
          <div style="margin-top:10px;padding-top:10px" id="d-m5-body">Bonjour Marc,<br/><br/>J'espère que janvier s'est bien passé. Ce mois : 3 alertes résolues, NRR stable à 108%.<br/><br/>Prochain RDV : QBR le 28 février à 14h.<br/><br/><span style="color:var(--teal)">Sophie · Customer Success Scalyo</span></div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="mod-section" id="m6">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">📅</span><span class="mod-tag-label" id="fl-m6tag">Planning & Calendrier CS</span></div>
      <h2 class="mod-h2" id="fl-m6h2">Tous vos QBRs et rendez-vous<br/>centralisés.</h2>
      <p class="mod-body" id="fl-m6body">Calendrier CS dédié avec vue mensuelle et hebdomadaire. QBRs, calls de rétention, onboardings — tout au même endroit avec rappels.</p>
      <ul class="mod-list">
        <li><div class="mod-check">✓</div><span id="fl-m6p1">Calendrier dédié Customer Success</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m6p2">Catégories : QBR, Onboarding, Churn, Expansion</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m6p3">Vue mensuelle / hebdomadaire / liste</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m6p4">Rappels et alertes d'échéances</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m6p5">Lien compte client associé à chaque événement</span></li>
      </ul>
      <router-link to="/login" class="mod-btn" id="fl-m6btn">Ouvrir le planning →</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span id="d-m6-head" data-i18n="d_m6_head">Planning CS — Février 2025</span> <span class="badge bg" id="d-m6-ev" data-i18n="d_m6_ev">12 événements</span></div>
        <div class="cal">
          <div class="cal-c cal-ev"><div class="cal-title">📊 QBR Leroy</div><div class="cal-sub">14h · 1h</div></div>
          <div class="cal-c"></div>
          <div class="cal-c cal-ev cal-td"><div class="cal-title" style="color:var(--blue)">🚀 Onboarding</div><div class="cal-sub">10h · Acme</div></div>
          <div class="cal-c cal-ev"><div class="cal-title" id="d-m6-ret" data-i18n="d_m6_ret">📞 Rétention</div><div class="cal-sub">15h30</div></div>
          <div class="cal-c"></div>
          <div class="cal-c"></div>
          <div class="cal-c cal-ev"><div class="cal-title">📊 QBR TechV.</div><div class="cal-sub">11h · 1h30</div></div>
          <div class="cal-c"></div>
          <div class="cal-c cal-ev"><div class="cal-title" style="color:var(--amber)">⚠ Follow-up</div><div class="cal-sub">16h · Leroy</div></div>
          <div class="cal-c"></div>
        </div>
        <div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap">
          <span style="font-size:10px;color:var(--dt3);display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--teal);border-radius:2px;display:inline-block"></span>QBR</span>
          <span style="font-size:10px;color:var(--dt3);display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--blue);border-radius:2px;display:inline-block"></span>Onboarding</span>
          <span style="font-size:10px;color:var(--dt3);display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;background:var(--amber);border-radius:2px;display:inline-block"></span>Rétention</span>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="mod-section" id="m7">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">✅</span><span class="mod-tag-label" id="fl-m7tag">Task Board</span></div>
      <h2 class="mod-h2" id="fl-m7h2">Vos actions CS organisées<br/>en Kanban ou Sprints.</h2>
      <p class="mod-body" id="fl-m7body">Kanban CS avec colonnes Todo / En cours / Fait + mode Sprint pour les équipes agiles. Chaque tâche liée à un compte client.</p>
      <ul class="mod-list">
        <li><div class="mod-check">✓</div><span id="fl-m7p1">Kanban CS : À faire / En cours / Bloqué / Fait</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m7p2">Mode Sprint avec capacité et vélocité</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m7p3">Assignation par CSM, priorité, deadline</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m7p4">Matrice Eisenhower intégrée (urgent/important)</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m7p5">Suivi des tâches en retard avec alertes</span></li>
      </ul>
      <router-link to="/login" class="mod-btn" id="fl-m7btn">Ouvrir le board →</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head" id="demo-tb-head">Task Board — Sprint 4 <span class="badge ba" id="demo-tb-late">2 en retard</span></div>
        <div class="task-g">
          <div>
            <div class="task-col-h" id="demo-col-1">À faire</div>
            <div class="task-card tc-t"><strong style="font-size:11px">QBR BioMed</strong><br/><span style="font-size:10px;color:var(--dt3)">Sophie · 15 fév</span></div>
            <div class="task-card tc-b"><strong style="font-size:11px">Emails check-in × 5</strong><br/><span style="font-size:10px;color:var(--dt3)">Thomas · 18 fév</span></div>
          </div>
          <div>
            <div class="task-col-h" id="demo-col-2">En cours</div>
            <div class="task-card tc-a"><strong style="font-size:11px">Playbook Leroy</strong><br/><span style="font-size:10px;color:var(--amber)" id="demo-card-late">⚠ En retard</span></div>
            <div class="task-card tc-t"><strong style="font-size:11px">Analyse usage Acme</strong><br/><span style="font-size:10px;color:var(--dt3)">Sophie</span></div>
          </div>
          <div>
            <div class="task-col-h" id="demo-col-3">Terminé</div>
            <div class="task-card tc-t" style="opacity:.55"><strong style="font-size:11px">✓ QBR TechVision</strong><br/><span style="font-size:10px;color:var(--dt3)" id="demo-done-1" id="demo-done-1">Fait le 10 fév</span></div>
            <div class="task-card tc-t" style="opacity:.55"><strong style="font-size:11px">✓ Onboarding Acme</strong><br/><span style="font-size:10px;color:var(--dt3)" id="demo-done-2" id="demo-done-2">Fait le 8 fév</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<section class="mod-section" id="m8">
  <div class="mod-inner">
    <div class="mod-text rv">
      <div class="mod-tag"><span class="mod-tag-icon">📚</span><span class="mod-tag-label" id="fl-m8tag">Ressources CS</span></div>
      <h2 class="mod-h2" id="fl-m8h2">La bibliothèque CS<br/>dont vous avez besoin.</h2>
      <p class="mod-body" id="fl-m8body">Guides pratiques, playbooks téléchargeables, scripts QBR et templates — directement accessibles depuis votre espace de travail.</p>
      <ul class="mod-list">
        <li><div class="mod-check">✓</div><span id="fl-m8p1">Guide : réduire le churn en 30 jours (PDF)</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m8p2">Templates QBR prêts à utiliser</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m8p3">Scripts d'appels de rétention (3 scénarios)</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m8p4">Playbooks par verticale (SaaS, Services, FinTech)</span></li>
        <li><div class="mod-check">✓</div><span id="fl-m8p5">Mis à jour régulièrement par l'équipe Scalyo</span></li>
      </ul>
      <router-link to="/login" class="mod-btn" id="fl-m8btn">Accéder aux ressources →</router-link>
    </div>
    <div class="mod-visual rv d2">
      <div class="mv">
        <div class="mv-head"><span id="demo-lib-title">Bibliothèque CS</span> <span class="badge bg" id="demo-lib-badge">18 ressources</span></div>
        <div class="res-list">
          <router-link to="/login" class="res-item" style="text-decoration:none;color:inherit;"><div class="res-icon">📖</div><div class="res-info"><strong id="demo-guide1" data-i18n="demo_guide1">Guide : Réduire le churn en 30 jours</strong><span>PDF · 24 pages · Jan. 2025</span></div><div class="res-dl">↓</div></router-link>
          <router-link to="/login" class="res-item" style="text-decoration:none;color:inherit;"><div class="res-icon">📊</div><div class="res-info"><strong>Template QBR SaaS B2B</strong><span>XLSX + Google Slides</span></div><div class="res-dl">↓</div></router-link>
          <router-link to="/login" class="res-item" style="text-decoration:none;color:inherit;"><div class="res-icon">📞</div><div class="res-info"><strong id="demo-script1" data-i18n="demo_script1">Script appel rétention</strong><span id="demo-pdf1" data-i18n="demo_pdf1">PDF · 3 scénarios</span></div><div class="res-dl">↓</div></router-link>
          <router-link to="/login" class="res-item res-new" style="text-decoration:none;color:inherit;"><div class="res-icon">🎯</div><div class="res-info"><strong style="color:var(--teal)" id="demo-pb-new">Nouveau : Playbook Expansion</strong><span id="demo-pb-sub">Upsell strategies · Fév. 2025</span></div><div class="res-dl">↓</div></router-link>
        </div>
      </div>
    </div>
  </div>
</section>
</div>
<!-- ── END FEATURES DETAIL ── -->


<!-- ROI -->
<section class="section section-gray" id="roi">
  <div class="container">
    <div class="rv" style="margin-bottom:56px">
      <div class="label"><div class="label-line"></div><span data-i18n="roi_tag">Calculateur ROI</span></div>
      <h2 class="h2-light"><span data-i18n="roi_h2">Ce que Scalyo vous rapporte.</span></h2>
      <p class="sub-light"><span data-i18n="roi_sub">Ajustez selon votre équipe. Calcul conservateur.</span></p>
    </div>
    <div class="roi-wrap">
      <div class="rv">
        <div class="roi-sliders">
          <div><div class="rsl-label">Nombre de CSMs<span data-i18n="roi_lbl1_suffix"> </span><span id="v1">5</span></div><input type="range" id="r1" min="1" max="50" value="5"/></div>
          <div><div class="rsl-label">Comptes par CSM<span data-i18n="roi_lbl2_suffix"> </span><span id="v2">30</span></div><input type="range" id="r2" min="5" max="100" value="30"/></div>
          <div><div class="rsl-label"><span data-i18n="roi_arr_avg">ARR moyen par compte</span> <span id="v3">15K€</span></div><input type="range" id="r3" min="1000" max="100000" step="1000" value="15000"/></div>
          <div><div class="rsl-label"><span data-i18n="roi_churn_rate">Taux de churn actuel</span> <span id="v4">8%</span></div><input type="range" id="r4" min="1" max="30" value="8"/></div>
        </div>
      </div>
      <div class="rv d2">
        <div class="roi-big" id="rmain">54K€</div>
        <div class="roi-big-label"><span data-i18n="roi_main_label">récupérés par an en réduisant le churn de 30%</span></div>
        <div class="roi-table">
          <div class="roi-row"><span class="roi-row-label" data-i18n="roi_arr">ARR total du portefeuille</span><span class="roi-row-val" id="rarr">2.3M€</span></div>
          <div class="roi-row"><span class="roi-row-label" data-i18n="roi_cost">Coût du churn actuel / an</span><span class="roi-row-val" id="rcost">180K€</span></div>
          <div class="roi-row"><span class="roi-row-label" data-i18n="roi_time">Heures épargnées / mois</span><span class="roi-row-val" id="rtime">30h</span></div>
          <div class="roi-row"><span class="roi-row-label" data-i18n="roi_mult">ROI sur l'abonnement</span><span class="roi-row-val" id="rmult">15.2×</span></div>
        </div>
        <div class="roi-cta-row">
          <div>
            <div class="roi-cta-plan" data-i18n="roi_plan_label">Plan recommandé</div>
            <div class="roi-cta-name" id="rplan">Growth — 297€/mois</div>
          </div>
          <router-link to="/login" class="roi-cta-btn"><span data-i18n="cta_start">Démarrer →</span></router-link>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="section section-light" id="pricing">
  <div class="container">
    <div class="rv">
      <div class="label"><div class="label-line"></div><span data-i18n="pricing_tag">Tarifs</span></div>
      <div class="pricing-header">
        <div>
          <h2 class="h2-light" style="margin-bottom:0"><span data-i18n="pricing_h2">Simple. Transparent.</span></h2>
        </div>
      </div>
      <div class="pricing-note">
        <span id="pricing-note-text">Ces tarifs sont les <strong>prix de lancement</strong> de l'application. Ils augmenteront après la bêta. Les clients qui s'inscrivent maintenant conservent leur tarif <strong id="price-locked1" data-i18n="price_locked1">bloqué à vie</strong>.
      </div>
    </div>

    <div class="plans rv">
      <div class="plan">
        <div class="plan-top"></div>
        <div class="plan-name">Starter</div>
        <div class="plan-price-main"><span class="curr">€</span><span id="pa">97</span></div>
        <div class="plan-period">/mois · <span data-i18n="pricing_no_commit">sans engagement</span></div>
        <div class="plan-seats"><span data-i18n="plan_1csm">1 CSM</span></div>
        <div class="plan-divider"></div>
        <ul class="plan-features">
          <li><div class="pf-yes">✓</div><span data-i18n="feat_5acc">5 comptes clients</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_dash">Dashboard & KPIs</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_tasks">Task Board</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_res">Ressources CS</span></li>
          <li class="na"><div class="pf-no">—</div>Bien-être équipe</li>
          <li class="na"><div class="pf-no">—</div>Coach IA</li>
          <li class="na"><div class="pf-no">—</div>Email Studio</li>
        </ul>
        <a href="https://buy.stripe.com/bJebJ1amncpL7mBekAdfG01" class="plan-btn pb-outline"><span data-i18n="cta_trial">Commencer l'essai →</span></a>
      </div>

      <div class="plan featured">
        <div class="plan-top"></div>
        <div class="plan-tag"><span data-i18n="badge_popular">Le plus populaire</span></div>
        <div class="plan-name">Growth</div>
        <div class="plan-price-main"><span class="curr">€</span><span id="pb">297</span></div>
        <div class="plan-period">/mois · sans engagement</div>
        <div class="plan-seats"><span data-i18n="plan_10csm">Jusqu'à 10 CSMs</span></div>
        <div class="plan-divider"></div>
        <ul class="plan-features">
          <li><div class="pf-yes">✓</div><span data-i18n="feat_unlim">Comptes illimités</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_dash_adv">Dashboard & KPIs avancés</span></li>
          <li><div class="pf-yes">✓</div>Bien-être équipe</li>
          <li><div class="pf-yes">✓</div>Coach IA Customer Success</li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_email_ai">Email Studio IA</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_import">Import CSV / Excel</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_support">Support prioritaire</span></li>
        </ul>
        <a href="https://buy.stripe.com/eVqbJ10LN61n5et90gdfG00" class="plan-btn pb-teal">Commencer l'essai →</a>
      </div>

      <div class="plan">
        <div class="plan-top"></div>
        <div class="plan-name">Elite</div>
        <div class="plan-price-main"><span class="curr">€</span><span id="pc">697</span></div>
        <div class="plan-period">/mois · sans engagement</div>
        <div class="plan-seats"><span data-i18n="plan_unlim_csm">CSMs illimités</span></div>
        <div class="plan-divider"></div>
        <ul class="plan-features">
          <li><div class="pf-yes">✓</div><span data-i18n="feat_all_growth">Tout Growth inclus</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_playbooks">Playbooks sur-mesure</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_coaching">Session coaching mensuelle</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_onboarding">Onboarding dédié</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_sla">SLA 99,9% garanti</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_multi">Vue multi-équipes</span></li>
          <li><div class="pf-yes">✓</div><span data-i18n="feat_copil">COPIL automatisé</span></li>
        </ul>
        <a href="https://buy.stripe.com/eVqaEXeCD1L736l7WcdfG05" class="plan-btn pb-outline">Commencer l'essai →</a>
      </div>
    </div>

    <p class="plan-footnote rv" id="plan-footnote">14 jours d'essai gratuit · sans carte bancaire · annulation à tout moment · <strong id="price-locked2" data-i18n="price_locked2">prix de lancement bloqués à vie</strong></p>
  </div>
</section>


<!-- INTEGRATIONS -->
<section class="section section-light" id="integrations">
  <div class="container" style="text-align: center;">
    <div class="label" style="justify-content: center;"><div class="label-line"></div><span data-i18n="integ_tag">Intégrations</span><div class="label-line"></div></div>
    <h2 class="h2-light" style="margin-bottom: 16px"><span data-i18n="integ_h2">Connectez tous vos outils en un clic.</span></h2>
    <p style="color: var(--dt2); font-size: 16px; max-width: 600px; margin: 0 auto 32px; line-height: 1.7;">
      <span data-i18n="integ_sub">CRM, email, chat, visio, gestion de projets — Scalyo se connecte nativement aux outils que votre équipe utilise déjà.</span>
    </p>

    <!-- Category tabs -->
    <div class="integ-cats" id="integ-cats">
      <button class="integ-cat-btn active" data-cat="all"><span>🔌</span> <span data-i18n="integ_all">Tout</span></button>
      <button class="integ-cat-btn" data-cat="crm"><span>🏢</span> CRM</button>
      <button class="integ-cat-btn" data-cat="email"><span>📧</span> Email</button>
      <button class="integ-cat-btn" data-cat="chat"><span>💬</span> Chat</button>
      <button class="integ-cat-btn" data-cat="meeting"><span>📅</span> <span data-i18n="integ_meetings">Réunions</span></button>
      <button class="integ-cat-btn" data-cat="project"><span>📋</span> <span data-i18n="integ_projects">Projets</span></button>
      <button class="integ-cat-btn" data-cat="data"><span>📊</span> <span data-i18n="integ_data">Données</span></button>
    </div>

    <div class="integrations-grid" id="integrations-grid">
      <!-- CRM -->
      <div class="integration-card available" data-cat="crm">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23FF7A59' d='M267.5 78.7V44.3c15.1-7.2 25.6-22.6 25.6-40.3C293.1 1.8 291.3 0 289 0h-32c-2.2 0-4 1.8-4 4v.1c0 11.1-9 20.1-20.1 20.1-11.1 0-20.1-9-20.1-20.1V4c0-2.2-1.8-4-4-4h-32c-2.2 0-4 1.8-4 4c0 17.7 10.5 33.1 25.6 40.3v34.4C143.1 87.3 96 141 96 205.8c0 36.5 14.5 69.6 38 93.8l-53.4 53.4c-3 3-4.2 7.3-3.2 11.4s4.2 7.3 8.1 8.7l.6.2c6.6 2.3 13.8.4 18.5-4.8l50.2-55.6c24 17.5 53.5 27.8 85.2 27.8s61.2-10.3 85.2-27.8l50.2 55.6c4.7 5.2 11.9 7.1 18.5 4.8l.6-.2c3.9-1.4 6.9-4.6 8.1-8.7s-.2-8.4-3.2-11.4L346 299.6c23.5-24.2 38-57.3 38-93.8 0-64.8-47.1-118.5-108.5-127.1zM240 304c-54.2 0-98.2-44-98.2-98.2s44-98.2 98.2-98.2 98.2 44 98.2 98.2S294.2 304 240 304z'/%3E%3C/svg%3E" alt="HubSpot"/></div>
        <div class="integration-name">HubSpot CRM</div>
        <div class="integration-tag">Contacts &amp; Deals</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="crm">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%2300A1E0' d='M20 8c3.2 0 6.1 1.3 8.2 3.3C30 9.9 32.5 9 35.2 9c6.2 0 11.2 5.1 11.2 11.3 0 .5 0 1-.1 1.5C47.9 23.2 49 25.3 49 27.7c0 3.9-3 7.1-6.8 7.3H12.5C7.3 35 3 30.6 3 25.3c0-4.2 2.7-7.7 6.5-9C10.3 11.9 14.7 8 20 8z'/%3E%3C/svg%3E" alt="Salesforce"/></div>
        <div class="integration-name">Salesforce</div>
        <div class="integration-tag" data-i18n="integ_sf_tag">Comptes &amp; Opps</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="crm">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%2325C16F'/%3E%3Cpath fill='%23fff' d='M16 7c-2.8 0-5 2.2-5 5v8c0 2.8 2.2 5 5 5s5-2.2 5-5v-8c0-2.8-2.2-5-5-5zm2 13c0 1.1-.9 2-2 2s-2-.9-2-2v-8c0-1.1.9-2 2-2s2 .9 2 2v8z'/%3E%3C/svg%3E" alt="Pipedrive"/></div>
        <div class="integration-name">Pipedrive</div>
        <div class="integration-tag">Deals &amp; Contacts</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <!-- Email -->
      <div class="integration-card available" data-cat="email">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%234285F4' d='M6 10v28h10V23l8 6 8-6v15h10V10L34 22 24 14 14 22z'/%3E%3Cpath fill='%2334A853' d='M6 10l18 14v-4L6 8z'/%3E%3Cpath fill='%23FBBC04' d='M42 10L24 24v-4l18-12z'/%3E%3Cpath fill='%23EA4335' d='M6 10h6l12 10 12-10h6v2L24 24 6 12z'/%3E%3C/svg%3E" alt="Gmail"/></div>
        <div class="integration-name">Gmail</div>
        <div class="integration-tag" data-i18n="integ_gmail_tag">Boîte de réception</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="email">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%230078D4' d='M28 7v10h14V7zM28 20v11h14V20zM28 34v7h14v-7zM5 7l20 3v28L5 41z'/%3E%3Cellipse fill='%23fff' cx='15' cy='24' rx='6' ry='7'/%3E%3Cellipse fill='%230078D4' cx='15' cy='24' rx='4' ry='5'/%3E%3C/svg%3E" alt="Outlook"/></div>
        <div class="integration-name">Outlook 365</div>
        <div class="integration-tag">Mail &amp; Calendrier</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="email">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='4' y='10' width='40' height='28' rx='4' fill='%236B7280'/%3E%3Cpath fill='none' stroke='%23fff' stroke-width='2' d='M4 14l20 12 20-12'/%3E%3C/svg%3E" alt="IMAP"/></div>
        <div class="integration-name">IMAP / SMTP</div>
        <div class="integration-tag" data-i18n="integ_imap_tag">Tout fournisseur</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <!-- Chat -->
      <div class="integration-card available" data-cat="chat">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23E01E5A' d='M13 28a3 3 0 1 1-3-3h3v3zm1.5 0a3 3 0 1 1 6 0v7.5a3 3 0 1 1-6 0V28z'/%3E%3Cpath fill='%2336C5F0' d='M20 13a3 3 0 1 1 3-3v3h-3zm0 1.5a3 3 0 1 1 0 6h-7.5a3 3 0 1 1 0-6H20z'/%3E%3Cpath fill='%232EB67D' d='M35 20a3 3 0 1 1 3 3h-3v-3zm-1.5 0a3 3 0 1 1-6 0v-7.5a3 3 0 1 1 6 0V20z'/%3E%3Cpath fill='%23ECB22E' d='M28 35a3 3 0 1 1-3 3v-3h3zm0-1.5a3 3 0 1 1 0-6h7.5a3 3 0 1 1 0 6H28z'/%3E%3C/svg%3E" alt="Slack"/></div>
        <div class="integration-name">Slack</div>
        <div class="integration-tag" data-i18n="integ_slack_tag">Alertes &amp; Commandes</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="chat">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%235B5FC7' d='M34 16a5 5 0 100-10 5 5 0 000 10zM41 18h-8c-1.7 0-3 1.3-3 3v10c0 1.7 1.3 3 3 3h8c1.7 0 3-1.3 3-3V21c0-1.7-1.3-3-3-3z'/%3E%3Cpath fill='%237B83EB' d='M24 14a6 6 0 100-12 6 6 0 000 12zM33 17H11c-1.7 0-3 1.3-3 3v13c0 5 4 9 9 9h10c5 0 9-4 9-9V20c0-1.7-1.3-3-3-3z'/%3E%3C/svg%3E" alt="Teams"/></div>
        <div class="integration-name">Microsoft Teams</div>
        <div class="integration-tag">Bot &amp; Notifications</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="chat">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='6' y='6' width='36' height='36' rx='8' fill='%23286EFA'/%3E%3Cpath stroke='%23fff' stroke-width='2.5' stroke-linecap='round' fill='none' d='M16 18v8M21 16v12M26 16v12M31 18v8M14 32s3 3 10 3 10-3 10-3'/%3E%3C/svg%3E" alt="Intercom"/></div>
        <div class="integration-name">Intercom</div>
        <div class="integration-tag">Conversations</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <!-- Meeting -->
      <div class="integration-card available" data-cat="meeting">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%230F9D58' d='M8 12h20v24H8z'/%3E%3Cpath fill='%234285F4' d='M28 18l12-8v28l-12-8z'/%3E%3Cpath fill='%23FBBC04' d='M28 24l12-14h-12z'/%3E%3Cpath fill='%23EA4335' d='M28 24l12 14h-12z'/%3E%3C/svg%3E" alt="Google Meet"/></div>
        <div class="integration-name">Google Meet</div>
        <div class="integration-tag">Visio &amp; Calendrier</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="meeting">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='2' y='8' width='44' height='32' rx='8' fill='%232D8CFF'/%3E%3Cpath fill='%23fff' d='M10 16h16v12c0 1.1-.9 2-2 2H10V16zM30 20l8-4v16l-8-4V20z'/%3E%3C/svg%3E" alt="Zoom"/></div>
        <div class="integration-name">Zoom</div>
        <div class="integration-tag" data-i18n="integ_zoom_tag">Planification &amp; Enregistrement</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="meeting">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect x='6' y='8' width='36' height='34' rx='6' fill='%23006BFF'/%3E%3Crect x='6' y='8' width='36' height='10' rx='6' fill='%23004FC4'/%3E%3Ccircle cx='24' cy='30' r='6' fill='%23fff'/%3E%3Crect x='14' y='6' width='3' height='6' rx='1.5' fill='%23fff'/%3E%3Crect x='31' y='6' width='3' height='6' rx='1.5' fill='%23fff'/%3E%3C/svg%3E" alt="Calendly"/></div>
        <div class="integration-name">Calendly</div>
        <div class="integration-tag" data-i18n="integ_calendly_tag">Prise de RDV</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <!-- Project -->
      <div class="integration-card available" data-cat="project">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%230052CC' d='M43.5 23.2L25.8 5.5 24 3.7 8.7 19 3 24.7c-.7.7-.7 1.9 0 2.6L15.3 39.7 24 48.4l15.3-15.3.5-.5 3.7-3.7c.7-.7.7-1.9 0-2.7zM24 30.9l-6.9-6.9L24 17.1l6.9 6.9L24 30.9z'/%3E%3C/svg%3E" alt="Jira"/></div>
        <div class="integration-name">Jira</div>
        <div class="integration-tag">Tickets &amp; Sync</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="project">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='12' r='8' fill='%23F06A6A'/%3E%3Ccircle cx='12' cy='32' r='8' fill='%23F06A6A'/%3E%3Ccircle cx='36' cy='32' r='8' fill='%23F06A6A'/%3E%3C/svg%3E" alt="Asana"/></div>
        <div class="integration-name">Asana</div>
        <div class="integration-tag" data-i18n="integ_asana_tag">Projets &amp; Tâches</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <!-- Data -->
      <div class="integration-card available" data-cat="data">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%236B7280' d='M12 4h16l12 12v24c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4z'/%3E%3Cpath fill='%23fff' opacity='.5' d='M28 4l12 12h-8c-2.2 0-4-1.8-4-4V4z'/%3E%3Ctext x='24' y='35' text-anchor='middle' fill='%23fff' font-size='11' font-weight='700' font-family='sans-serif'%3ECSV%3C/text%3E%3C/svg%3E" alt="CSV"/></div>
        <div class="integration-name">Import CSV</div>
        <div class="integration-tag">Import 1-clic</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="data">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%2316A34A' d='M12 4h16l12 12v24c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V8c0-2.2 1.8-4 4-4z'/%3E%3Cpath fill='%23fff' opacity='.5' d='M28 4l12 12h-8c-2.2 0-4-1.8-4-4V4z'/%3E%3Ctext x='24' y='35' text-anchor='middle' fill='%23fff' font-size='9' font-weight='700' font-family='sans-serif'%3EXLSX%3C/text%3E%3C/svg%3E" alt="Excel"/></div>
        <div class="integration-name">Import Excel</div>
        <div class="integration-tag">Multi-feuilles</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
      <div class="integration-card available" data-cat="data">
        <div class="integration-icon"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='8' fill='%236366F1'/%3E%3Cpath fill='%23fff' d='M22.5 19.5c0-1.5 1.2-2.1 3.2-2.1 2.9 0 6.5 0.9 9.4 2.4V12c-3.1-1.3-6.3-1.8-9.4-1.8-7.7 0-12.8 4-12.8 10.7 0 10.4 14.3 8.7 14.3 13.2 0 1.8-1.5 2.3-3.7 2.3-3.2 0-7.3-1.3-10.5-3.1v7.9c3.6 1.5 7.2 2.2 10.5 2.2 7.9 0 13.3-3.9 13.3-10.7-.1-11.2-14.3-9.2-14.3-13.2z'/%3E%3C/svg%3E" alt="Stripe"/></div>
        <div class="integration-name">Stripe</div>
        <div class="integration-tag">Facturation &amp; MRR</div>
        <div class="integration-status live"><span data-i18n="integ_available">Disponible</span></div>
      </div>
    </div>

    <p style="color: var(--dt3); font-size: 13px; margin-top: 24px;">
      <span data-i18n="integ_more">+ Zendesk, Segment, Freshdesk, Notion, WhatsApp, Crisp et bien d'autres à venir.</span>
    </p>

    <!-- Arguments de vente -->
    <div class="vs-block">
      <div class="vs-title" data-i18n="sell_title">Pourquoi choisir Scalyo ?</div>
      <p class="vs-subtitle" data-i18n="sell_subtitle">8 raisons concrètes pour lesquelles les équipes CS les plus performantes choisissent Scalyo.</p>

      <div class="sell-grid">
        <div class="sell-card">
          <div class="sell-icon">🔗</div>
          <div class="sell-label" data-i18n="sell_1_label">17+ intégrations natives</div>
          <div class="sell-desc" data-i18n="sell_1_desc">Connectez votre CRM, email, chat et visio en un clic. Tout est inclus, sans surcoût ni middleware.</div>
        </div>
        <div class="sell-card">
          <div class="sell-icon">⚡</div>
          <div class="sell-label" data-i18n="sell_2_label">Opérationnel en 5 minutes</div>
          <div class="sell-desc" data-i18n="sell_2_desc">Pas de consultant, pas de code, pas de semaines de déploiement. Votre équipe est productive dès le premier jour.</div>
        </div>
        <div class="sell-card">
          <div class="sell-icon">🇪🇺</div>
          <div class="sell-label" data-i18n="sell_3_label">Données 100% européennes</div>
          <div class="sell-desc" data-i18n="sell_3_desc">Hébergement Supabase en Irlande, chiffrement AES-256, RGPD natif. Vos données ne quittent jamais l'UE.</div>
        </div>
        <div class="sell-card">
          <div class="sell-icon">🤖</div>
          <div class="sell-label" data-i18n="sell_4_label">Coach IA intégré</div>
          <div class="sell-desc" data-i18n="sell_4_desc">Un expert Customer Success disponible 24h/24. Conseils actionnables, scripts d'appels, templates d'emails.</div>
        </div>
        <div class="sell-card">
          <div class="sell-icon">💚</div>
          <div class="sell-label" data-i18n="sell_5_label">Bien-être équipe inclus</div>
          <div class="sell-desc" data-i18n="sell_5_desc">Suivi du moral, alertes burnout précoces, charge de travail. Prenez soin de vos CSMs, pas seulement de vos clients.</div>
        </div>
        <div class="sell-card">
          <div class="sell-icon">💰</div>
          <div class="sell-label" data-i18n="sell_6_label">Tarif transparent, bloqué à vie</div>
          <div class="sell-desc" data-i18n="sell_6_desc">Pas de devis, pas de mauvaise surprise. Prix affiché = prix payé. Les early adopters gardent leur tarif pour toujours.</div>
        </div>
        <div class="sell-card">
          <div class="sell-icon">📊</div>
          <div class="sell-label" data-i18n="sell_7_label">Tout-en-un : 8 modules intégrés</div>
          <div class="sell-desc" data-i18n="sell_7_desc">Portfolio, KPIs, bien-être, Coach IA, Email Studio, Planning, Tasks, Ressources — une seule plateforme au lieu de cinq.</div>
        </div>
        <div class="sell-card">
          <div class="sell-icon">🇫🇷</div>
          <div class="sell-label" data-i18n="sell_8_label">Support francophone 7j/7</div>
          <div class="sell-desc" data-i18n="sell_8_desc">Une équipe qui parle votre langue, disponible 7 jours sur 7. Pas de chatbot, de vraies personnes.</div>
        </div>
      </div>

      <div class="vs-highlights">
        <div class="vs-hl-card">
          <div class="vs-hl-number">0 €</div>
          <div class="vs-hl-text" data-i18n="sell_hl1">par intégration<br/>Tout est inclus dans votre plan</div>
        </div>
        <div class="vs-hl-card">
          <div class="vs-hl-number">5 min</div>
          <div class="vs-hl-text" data-i18n="sell_hl2">pour tout connecter<br/>Pas de consultant, pas de code</div>
        </div>
        <div class="vs-hl-card">
          <div class="vs-hl-number">100%</div>
          <div class="vs-hl-text" data-i18n="sell_hl3">natif, sans middleware<br/>Vos données restent en Europe</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section section-dark" id="faq">
  <div class="container">
    <div class="rv" style="margin-bottom:56px;text-align:center">
      <div class="label" style="justify-content:center"><div class="label-line"></div><span data-i18n="faq_tag">FAQ</span><div class="label-line"></div></div>
      <h2 class="h2-light"><span data-i18n="faq_h2">Questions fréquentes</span></h2>
    </div>
    <div class="faq-list">

      <div class="faq-item">
        <button class="faq-q" @click="toggleFaq($event)">
          Scalyo est-il adapté à ma taille d'équipe ?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p id="faq-a1" data-i18n="faq_a1">Oui. Scalyo est conçu pour les équipes CS de 1 à 50 CSMs. Le plan Starter convient à un CSM solo ou une petite équipe (jusqu'à 5 CSMs). Growth couvre jusqu'à 10 CSMs. Elite est taillé pour les équipes plus larges avec des besoins avancés de management et de coaching.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-q" @click="toggleFaq($event)">
          Mes données sont-elles sécurisées ?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p id="faq-a2" data-i18n="faq_a2">Scalyo est hébergé sur Supabase (infrastructure PostgreSQL chiffrée) et Cloudflare. Vos données sont isolées par entreprise grâce à une architecture multi-tenant avec politiques RLS (Row Level Security). Aucune donnée client n'est partagée entre comptes.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-q" @click="toggleFaq($event)">
          Puis-je changer de plan à tout moment ?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p id="faq-a3" data-i18n="faq_a3">Oui, vous pouvez upgrader ou downgrader votre abonnement à tout moment depuis les paramètres de votre compte. Le changement prend effet immédiatement. En cas d'upgrade, vous accédez aux nouvelles fonctionnalités sans délai.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-q" @click="toggleFaq($event)">
          L'IA Coach CS — comment ça fonctionne ?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p id="faq-a4" data-i18n="faq_a4">Le Coach CS IA est un assistant spécialisé Customer Success, entraîné sur les meilleures pratiques B2B SaaS : NRR, churn, QBR, expansion, management d'équipe. Il répond à vos questions opérationnelles en temps réel, avec des recommandations concrètes adaptées à votre contexte. Nova, l'assistante bien-être, accompagne vos CSMs sur la gestion du stress et la prévention du burnout.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-q" @click="toggleFaq($event)">
          Y a-t-il une période d'engagement ?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p id="faq-a5" data-i18n="faq_a5">Non. Scalyo fonctionne en abonnement mensuel sans engagement. Vous pouvez résilier à tout moment depuis votre espace client, sans frais ni pénalité. Votre accès reste actif jusqu'à la fin de la période déjà payée.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-q" @click="toggleFaq($event)">
          Le support est-il disponible en français ?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p>Oui, le support est 100% francophone. Vous pouvez nous contacter par email à info@scalyo.app. Les clients Elite bénéficient en plus d'une session de coaching mensuelle 1h avec une consultante CS dédiée.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-q" @click="toggleFaq($event)">
          Scalyo remplace-t-il mon CRM ?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p id="faq-a6" data-i18n="faq_a6">Non. Scalyo est complémentaire à votre CRM (Salesforce, HubSpot, Pipedrive...). Là où votre CRM gère le pipeline commercial, Scalyo se concentre sur la phase post-vente : santé client, prévention du churn, roadmap 90J, bien-être des CSMs et coaching. Les deux outils s'utilisent ensemble.</p>
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-q" @click="toggleFaq($event)">
          Que se passe-t-il après les 14 jours d'essai ?
          <span class="faq-icon">+</span>
        </button>
        <div class="faq-a">
          <p id="faq-a7" data-i18n="faq_a7">À l'issue de votre période d'essai gratuite, vous choisissez le plan qui correspond à votre équipe. Vos données sont conservées intégralement. Si vous ne souscrivez pas, votre compte passe en lecture seule pendant 30 jours avant suppression définitive.</p>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- END CTA -->
<section class="end-cta">
  <div class="end-glow"></div>
  <div class="end-inner rv">
    <div class="label" style="justify-content:center;margin-bottom:20px"><div class="label-line"></div>Commencer maintenant<div class="label-line"></div></div>
    <h2 class="end-h2"><span data-i18n="end_h2">Transformez votre<br/><em>Customer Success.</em></span></h2>
    <p class="end-sub"><span data-i18n="end_sub">Rejoignez les équipes CS qui performent avec Scalyo. 14 jours gratuits, sans carte bancaire.</span></p>
    <div class="end-btns">
      <router-link to="/login" class="btn-primary">
        Démarrer gratuitement
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </router-link>
      info@scalyo.app
    </div>
    <div class="end-note">info@scalyo.app · Support en français 7j/7</div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-grid">
    <div>
      <a href="/" class="nav-logo"><div class="nav-logo-icon">S</div>Scalyo</a>
      <p id="footer-desc">La plateforme Customer Success tout-en-un pour les équipes qui veulent performer.</p>
      <div class="footer-social">
        <a href="https://x.com/scalyo_app" target="_blank" rel="noopener" class="fsoc" aria-label="X">𝕏</a>
        <a href="https://linkedin.com/company/scalyo" target="_blank" rel="noopener" class="fsoc" aria-label="LinkedIn">in</a>
      </div>
    </div>
    <div class="footer-col">
      <h4 id="fc-product">Produit</h4>
      <a href="#features" id="fl-features">Fonctionnalités</a>
      <a href="#pricing" id="fl-pricing">Tarifs</a>
      <a href="#roi" id="fl-roi">Calculateur ROI</a>
      <router-link to="/login" id="fl-login">Se connecter</router-link>
    </div>
    <div class="footer-col">
      <h4 id="fc-resources">Ressources</h4>
      <a href="#m1" id="fl-blog">Blog CS</a>
      <a href="#m2" id="fl-guides">Guides & Templates</a>
      <a href="#m1" id="fl-playbooks">Playbooks gratuits</a>
      <a href="#m8" id="fl-docs">Documentation</a>
    </div>
    <div class="footer-col">
      <h4 id="fc-contact">Contact</h4>
      <a href="javascript:void(0)" @click="openModal('support')" id="fl-support">Support</a>
      <a href="javascript:void(0)" @click="openModal('rgpd')" id="fl-rgpd">RGPD</a>
      <a href="javascript:void(0)" @click="openModal('legal')" id="fl-legal">Mentions légales</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span id="footer-copy">© 2025 Scalyo · Tous droits réservés</span>
    <span id="footer-markets">🇫🇷 France · 🇧🇪 Belgique · 🇨🇭 Suisse · 🇨🇦 Québec</span>
  </div>
</footer>
<!-- ── MODAL SUPPORT ── -->
<div class="lm-overlay" id="modal-support" @click.self="closeAllModals">
  <div class="lm-box">
    <div class="lm-head">
      <h3 id="ms-title">Support</h3>
      <button class="lm-close" @click="closeAllModals">×</button>
    </div>
    <div class="lm-body">
      <p id="ms-desc">Notre équipe est disponible pour vous aider. Envoyez-nous un email ou utilisez le formulaire ci-dessous.</p>
      <a href="mailto:info@scalyo.app" 
        <div class="lm-email-icon">✉️</div>
        <div class="lm-email-info">
          <strong>info@scalyo.app</strong>
          <span id="ms-email-sub">Réponse en moins de 24h · Équipe francophone</span>
        </div>
      </a>
      <div class="lm-contact-form" id="contact-form-wrap">
        <div class="lm-row">
          <div class="lm-field">
            <label id="lbl-name">Votre nom</label>
            <input type="text" id="cf-name" placeholder="Lidia M.">
          </div>
          <div class="lm-field">
            <label id="lbl-email">Votre email</label>
            <input type="email" id="cf-email" placeholder="vous@entreprise.com">
          </div>
        </div>
        <div class="lm-field">
          <label id="lbl-subject">Sujet</label>
          <input type="text" id="cf-subject" placeholder="Question sur mon plan Starter...">
        </div>
        <div class="lm-field">
          <label id="lbl-msg">Message</label>
          <textarea id="cf-msg" placeholder="Décrivez votre problème ou question..."></textarea>
        </div>
        <button class="lm-submit" id="cf-submit" @click="submitContact">Envoyer →</button>
      </div>
      <div class="lm-success" id="contact-success">
        <div style="font-size:36px;margin-bottom:8px">✅</div>
        <strong id="ms-ok-title">Message envoyé !</strong>
        <p id="ms-ok-body">Nous reviendrons vers vous dans les 24 heures. Vérifiez vos spams si vous n'avez pas de réponse.</p>
      </div>
    </div>
  </div>
</div>

<!-- ── MODAL RGPD ── -->
<div class="lm-overlay" id="modal-rgpd" @click.self="closeAllModals">
  <div class="lm-box">
    <div class="lm-head">
      <h3 id="mr-title">Politique de confidentialité</h3>
      <button class="lm-close" @click="closeAllModals">×</button>
    </div>
    <div class="lm-body" id="mr-body"></div>
  </div>
</div>

<!-- ── MODAL LEGAL ── -->
<div class="lm-overlay" id="modal-legal" @click.self="closeAllModals">
  <div class="lm-box">
    <div class="lm-head">
      <h3 id="ml-title">Mentions légales</h3>
      <button class="lm-close" @click="closeAllModals">×</button>
    </div>
    <div class="lm-body" id="ml-body"></div>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { L, T } from '@/i18n/landing.js'

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
  // Update lang buttons
  nextTick(() => {
    document.querySelectorAll('.lang-sw button[data-l]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-l') === l)
    })
    // Re-apply data-i18n attributes for elements we can't easily make reactive
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      const val = t(key)
      if (val && val !== key) {
        if (val.includes('<') && val.includes('>')) {
          el.innerHTML = val
        } else {
          el.textContent = val
        }
      }
    })
    // Re-apply module lang
    applyModuleLang(l)
    // Re-apply modal lang
    applyModalLang(l)
    // Recalc ROI with translated plan name
    calcROI()
  })
}

// ── NAV SCROLL ──
const navScrolled = ref(false)
function onScroll() { navScrolled.value = window.scrollY > 40 }

// ── MOBILE MENU ──
const mobileMenuOpen = ref(false)
function closeMobile() { mobileMenuOpen.value = false }

// ── FAQ ──
function toggleFaq(e) {
  const btn = e.target.closest('.faq-q') || e.target
  const item = btn.closest('.faq-item')
  if (!item) return
  const isOpen = item.classList.contains('open')
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open')
    const icon = el.querySelector('.faq-icon')
    if (icon) icon.textContent = '+'
  })
  if (!isOpen) {
    item.classList.add('open')
    const icon = btn.querySelector('.faq-icon')
    if (icon) icon.textContent = '×'
  }
}

// ── INTEGRATION FILTERING ──
function filterInteg(e) {
  const btn = e.target.closest('.integ-cat-btn')
  if (!btn) return
  const cat = btn.dataset.cat
  document.querySelectorAll('.integ-cat-btn').forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  document.querySelectorAll('.integration-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none'
  })
}

// ── ROI CALCULATOR ──
function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M€'
  if (n >= 1e4) return Math.round(n / 1e3) + 'K€'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K€'
  return n + '€'
}

function syncRange(el) {
  if (!el) return
  const pct = ((+el.value - +el.min) / (+el.max - +el.min) * 100).toFixed(1)
  el.style.setProperty('--pct', pct + '%')
}

function calcROI() {
  const r1 = document.getElementById('r1')
  const r2 = document.getElementById('r2')
  const r3 = document.getElementById('r3')
  const r4 = document.getElementById('r4')
  if (!r1) return
  const csm = +r1.value, acc = +r2.value, arr = +r3.value, ch = +r4.value
  const v1 = document.getElementById('v1')
  const v2 = document.getElementById('v2')
  const v3 = document.getElementById('v3')
  const v4 = document.getElementById('v4')
  if (v1) v1.textContent = csm
  if (v2) v2.textContent = acc
  if (v3) v3.textContent = (arr >= 1000 ? Math.round(arr / 1000) + 'K' : arr) + '€'
  if (v4) v4.textContent = ch + '%'
  ;[r1, r2, r3, r4].forEach(syncRange)
  const total = csm * acc * arr
  const cost = Math.round(total * ch / 100)
  const rec = Math.round(cost * 0.3)
  const sub = csm <= 1 ? 97 * 12 : csm <= 10 ? 297 * 12 : 697 * 12
  const rmain = document.getElementById('rmain')
  const rarr = document.getElementById('rarr')
  const rcost = document.getElementById('rcost')
  const rtime = document.getElementById('rtime')
  const rmult = document.getElementById('rmult')
  const rplan = document.getElementById('rplan')
  if (rmain) rmain.textContent = fmt(rec)
  if (rarr) rarr.textContent = fmt(total)
  if (rcost) rcost.textContent = fmt(cost)
  if (rtime) rtime.textContent = (csm * 6) + 'h'
  if (rmult) rmult.textContent = sub > 0 ? (Math.round(rec / sub * 10) / 10) + '×' : '—'
  if (rplan) {
    const planKey = csm <= 1 ? 'roi_plan_starter' : csm <= 10 ? 'roi_plan_growth' : 'roi_plan_elite'
    rplan.textContent = t(planKey)
  }
}

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

const MODAL_I18N = {
  fr: { ms_title: 'Support', ms_desc: 'Notre équipe est disponible pour vous aider.', mr_title: 'Politique de confidentialité', ml_title: 'Mentions légales' },
  en: { ms_title: 'Support', ms_desc: 'Our team is available to help.', mr_title: 'Privacy policy', ml_title: 'Legal notice' },
  kr: { ms_title: '지원', ms_desc: '팀이 도움을 드릴 준비가 되어 있습니다.', mr_title: '개인정보 처리방침', ml_title: '법적 고지' }
}

function applyModalLang(l) {
  const ui = MODAL_I18N[l] || MODAL_I18N.fr
  const rc = RGPD_CONTENT[l] || RGPD_CONTENT.fr
  const lc = LEGAL_CONTENT[l] || LEGAL_CONTENT.fr
  const sm = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v }
  const sh = (id, v) => { const e = document.getElementById(id); if (e) e.innerHTML = v }
  sm('ms-title', ui.ms_title); sm('mr-title', ui.mr_title); sm('ml-title', ui.ml_title)
  sh('mr-body', rc); sh('ml-body', lc)
}

function closeAllModals() {
  modalSupport.value = false
  modalRgpd.value = false
  modalLegal.value = false
  document.querySelectorAll('.lm-overlay').forEach(m => m.classList.remove('open'))
  document.body.style.overflow = ''
}

function openModal(name) {
  applyModalLang(lang.value)
  const id = name === 'support' ? 'modal-support' : name === 'rgpd' ? 'modal-rgpd' : 'modal-legal'
  const el = document.getElementById(id)
  if (el) el.classList.add('open')
  document.body.style.overflow = 'hidden'
}

// ── CONTACT FORM ──
function submitContact() {
  const name = document.getElementById('cf-name')?.value?.trim()
  const email = document.getElementById('cf-email')?.value?.trim()
  const msg = document.getElementById('cf-msg')?.value?.trim()
  if (!name || !email || !msg) return
  const formWrap = document.getElementById('contact-form-wrap')
  const success = document.getElementById('contact-success')
  if (formWrap) formWrap.style.display = 'none'
  if (success) success.style.display = 'block'
  setTimeout(() => {
    if (formWrap) formWrap.style.display = 'block'
    if (success) success.style.display = 'none'
    ;['cf-name', 'cf-email', 'cf-subject', 'cf-msg'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.value = ''
    })
  }, 5000)
}

// ── MODULE LANG ──
function applyModuleLang(l) {
  const tr = T[l] || T.fr
  function s(id, v) { const e = document.getElementById(id); if (e && v) e.textContent = v }
  s('fl-chips-label', tr.chips_label)
  ;['c1','c2','c3','c4','c5','c6','c7','c8'].forEach(k => s('fl-' + k, tr[k]))
  ;['s1n','s1l','s1s','s2n','s2l','s2s','s3n','s3l','s3s','s4n','s4l','s4s'].forEach(k => s('fl-' + k, tr[k]))
  for (let m = 1; m <= 8; m++) {
    ;['tag','h2','body','p1','p2','p3','p4','p5','btn'].forEach(k => s('fl-m' + m + k, tr['m' + m + k]))
  }
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

  // ROI range inputs
  ;['r1', 'r2', 'r3', 'r4'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.addEventListener('input', calcROI)
  })

  // Apply language
  nextTick(() => {
    setLang(lang.value)
    calcROI()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

</script>

<style scoped>

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* main palette — Notion white */
  --dk: #FFFFFF;
  --dk2: #F7F6F3;
  --dk3: #FFFFFF;
  --dk4: #EDECE9;
  --dk5: #D3D1CB;
  --dt:  #37352F;
  --dt2: #6B6966;
  --dt3: #9B9A97;
  --dline: rgba(55,53,47,0.09);
  --dline2: rgba(55,53,47,0.16);

  /* light (testimonials) */
  --lk: #FFFFFF;
  --lk2: #F7F6F3;
  --lk3: #EDECE9;
  --lk4: #D3D1CB;
  --lt:  #37352F;
  --lt2: #6B6966;
  --lt3: #9B9A97;
  --lline: rgba(55,53,47,0.09);
  --lline2: rgba(55,53,47,0.16);

  /* brand — Notion teal */
  --teal: #0F7B6C;
  --teal2: rgba(15,123,108,0.08);
  --teal3: rgba(15,123,108,0.04);

  --f: 'Plus Jakarta Sans', -apple-system, system-ui, sans-serif;
  --rad: 12px;
}

html { scroll-behavior: smooth; overflow-x: hidden; }
body { font-family: var(--f); font-size: 16px; line-height: 1.65; letter-spacing: -0.01em; -webkit-font-smoothing: antialiased; overflow-x: hidden; background: var(--dk); color: var(--dt); }
a { text-decoration: none; }
img { display: block; max-width: 100%; }
::selection { background: rgba(15,123,108,0.15); color: var(--teal); }

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
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
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
  box-shadow: 0 0 0 1px rgba(55,53,47,.09);
}
.nav-logo span { color: var(--teal); }
.nav-links { display: flex; gap: 0; }
.nav-links a {
  padding: 7px 14px; border-radius: 7px;
  font-size: 14px; font-weight: 500; color: var(--dt2);
  transition: color .15s, background .15s;
}
.nav-links a:hover { color: var(--dt); background: rgba(55,53,47,.04); }
.nav-right { display: flex; align-items: center; gap: 8px; }
.n-ghost {
  padding: 7px 16px; border-radius: 8px;
  font-size: 14px; font-weight: 500; color: var(--dt2);
  border: 1px solid var(--dline2); transition: all .15s;
}
.n-ghost:hover { color: var(--dt); background: rgba(55,53,47,.04); }
.n-solid {
  padding: 8px 18px; border-radius: 8px;
  font-size: 14px; font-weight: 600; color: #fff;
  background: var(--teal);
  transition: all .2s;
  box-shadow: 0 1px 2px rgba(55,53,47,.08);
}
.n-solid:hover { background: #0a6b5e; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,123,108,.2); }

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
  position: absolute; left: 50%; top: 0;
  transform: translateX(-50%);
  width: 900px; height: 600px;
  background: radial-gradient(ellipse at 50% 0%, rgba(15,123,108,.06) 0%, transparent 60%);
  pointer-events: none; z-index: 0;
}
.hero-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }

.hero-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 5px 14px; border-radius: 100px;
  border: 1px solid var(--dline2);
  background: rgba(55,53,47,.03);
  font-size: 13px; font-weight: 500; color: var(--dt2);
  margin-bottom: 32px;
  backdrop-filter: blur(8px);
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); box-shadow: 0 0 4px rgba(15,123,108,.3); }

.hero-h1 {
  font-size: clamp(42px, 6.5vw, 80px);
  font-weight: 800;
  letter-spacing: -.03em;
  line-height: 1.08;
  color: var(--dt);
  margin-bottom: 24px;
}
.hero-h1 .accent { color: var(--teal); }

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
  box-shadow: 0 1px 3px rgba(55,53,47,.08), 0 0 0 1px rgba(15,123,108,.2);
}
.btn-primary:hover { background: #0a6b5e; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,123,108,.15); }
.btn-primary svg { transition: transform .2s; }
.btn-primary:hover svg { transform: translateX(3px); }
.btn-secondary {
  padding: 14px 24px; border-radius: 10px;
  font-size: 15px; font-weight: 500; color: var(--dt2);
  border: 1px solid var(--dline2);
  transition: all .15s; background: rgba(55,53,47,.03);
}
.btn-secondary:hover { color: var(--dt); background: rgba(55,53,47,.04); border-color: rgba(55,53,47,.20); }

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
  background: radial-gradient(ellipse, rgba(15,123,108,.06), transparent 70%);
  pointer-events: none;
}
.app-shell {
  border-radius: 16px; overflow: hidden;
  border: 1px solid var(--dline2);
  box-shadow: 0 16px 48px rgba(55,53,47,.08), 0 0 0 1px var(--dline);
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
.kpi-val { font-size: 26px; font-weight: 700; letter-spacing: -.04em; line-height: 1; margin-bottom: 6px; }
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
.section-light { background: var(--dk2); color: var(--dt); }
.section-dark  { background: var(--dk);  color: var(--dt); }
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
  font-size: 48px; font-weight: 800; letter-spacing: -.05em; line-height: 1;
  color: var(--teal); margin-bottom: 6px;
}
.stat-label { font-size: 14px; font-weight: 500; color: var(--dt); margin-bottom: 4px; }
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
  background: var(--teal2); border: 1px solid rgba(15,123,108,.2);
  display: grid; place-items: center; font-size: 9px; color: var(--teal); font-weight: 700;
}
/* feature visual card */
.feat-visual {
  border-radius: 16px; overflow: hidden;
  border: 1px solid var(--dline2);
  box-shadow: 0 4px 16px rgba(55,53,47,.06), 0 16px 32px rgba(55,53,47,.04);
  background: var(--dk3);
}
.feat-visual.dark-card {
  border-color: var(--dline2);
  box-shadow: 0 4px 16px rgba(55,53,47,.06), 0 16px 32px rgba(55,53,47,.04);
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
  background: var(--teal2); border: 1px solid rgba(15,123,108,.2);
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
  background: var(--teal2); border-color: rgba(15,123,108,.15);
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
  box-shadow: 0 0 0 3px rgba(15,123,108,.08), 0 1px 4px rgba(55,53,47,.10);
  transition: box-shadow .2s;
}
input[type=range]:hover::-webkit-slider-thumb { box-shadow: 0 0 0 5px rgba(15,123,108,.08), 0 1px 6px rgba(55,53,47,.10); }

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
  border-radius: 14px; padding: 28px;
  background: var(--dk3); border: 1px solid var(--dline2);
  position: relative; transition: box-shadow .2s, transform .25s;
}
.plan:hover { box-shadow: 0 4px 16px rgba(55,53,47,.06); transform: translateY(-3px); }
.plan.featured {
  border-color: var(--teal);
  background: var(--dk2);
  box-shadow: 0 0 0 1px var(--teal), 0 4px 16px rgba(15,123,108,.06);
}
.plan.featured:hover { transform: translateY(-4px); box-shadow: 0 0 0 1px var(--teal), 0 8px 24px rgba(15,123,108,.10); }
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
.pf-yes { width: 17px; height: 17px; border-radius: 5px; flex-shrink: 0; background: rgba(15,123,108,.1); border: 1px solid rgba(15,123,108,.2); display: grid; place-items: center; font-size: 8.5px; color: var(--teal); font-weight: 800; }
.pf-no  { width: 17px; height: 17px; border-radius: 5px; flex-shrink: 0; background: var(--dk4); border: 1px solid var(--dline); display: grid; place-items: center; font-size: 8.5px; color: var(--dk5); }
.plan-features li.na { color: var(--dt3); }
.plan-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 12px; border-radius: 8px;
  font-size: 14px; font-weight: 600; letter-spacing: -.01em;
  transition: all .18s;
}
.pb-teal { background: var(--teal); color: white; }
.pb-teal:hover { background: #0a6b5e; box-shadow: 0 4px 14px rgba(15,123,108,.25); }
.pb-outline { border: 1.5px solid var(--dline2); color: var(--dt2); }
.pb-outline:hover { background: var(--dk4); color: var(--dt); border-color: var(--dline2); }
.plan-footnote { font-size: 12px; color: var(--dt3); text-align: center; margin-top: 18px; }
.plan-footnote strong { color: var(--dt2); }

/* ────────────────────────────────────
   TESTIMONIAL
──────────────────────────────────── */
.testimonials { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.testi {
  padding: 28px; border-radius: 14px;
  background: white; border: 1px solid var(--lline2);
  transition: box-shadow .2s, transform .2s;
  color: var(--lt);
}
.testi:hover { box-shadow: 0 4px 16px rgba(55,53,47,.06); transform: translateY(-3px); }
.testi-stars { display: flex; gap: 3px; margin-bottom: 14px; }
.star { font-size: 13px; color: #FBBF24; }
.testi-quote { font-size: 14.5px; color: var(--lt); line-height: 1.7; margin-bottom: 20px; }
.testi-author { display: flex; align-items: center; gap: 10px; }
.ta-ava { width: 38px; height: 38px; border-radius: 50%; background: var(--lk2); border: 2px solid var(--lline2); display: grid; place-items: center; font-size: 18px; flex-shrink: 0; }
.ta-name { font-size: 13.5px; font-weight: 600; color: var(--lt); margin-bottom: 1px; letter-spacing: -.01em; }
.ta-role { font-size: 12px; color: var(--lt3); }
.ta-result { font-size: 11.5px; font-weight: 600; color: var(--teal); margin-top: 3px; }

/* ────────────────────────────────────
   FAQ
──────────────────────────────────── */
.faq-list { max-width: 780px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; }
.faq-item { border-bottom: 1px solid rgba(55,53,47,0.09); }
.faq-item:first-child { border-top: 1px solid rgba(55,53,47,0.09); }
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
  background: radial-gradient(ellipse, rgba(15,123,108,.04) 0%, transparent 65%);
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
.fsoc:hover { background: var(--teal2); color: var(--teal); border-color: rgba(15,123,108,.2); }
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
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 100px;
  font-size: 13px; font-weight: 600; font-family: var(--f);
  background: var(--dk3); border: 1px solid var(--dline2);
  color: var(--dt2); cursor: pointer; transition: all .15s;
}
.integ-cat-btn:hover { border-color: var(--teal); color: var(--dt); }
.integ-cat-btn.active { background: var(--teal); border-color: var(--teal); color: #fff; }
.integrations-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px; max-width: 860px; margin: 0 auto;
}
.integration-card {
  background: var(--dk3); border: 1px solid var(--dline2);
  border-radius: 12px; padding: 20px 16px; text-align: center;
  transition: all .2s;
}
.integration-card:hover { border-color: rgba(55,53,47,.24); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.06); }
.integration-card.available { border-color: rgba(15,123,108,.3); }
.integration-icon { font-size: 28px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; }
.integration-icon img { width: 32px; height: 32px; object-fit: contain; }
.integration-name { font-size: 13px; font-weight: 700; color: var(--dt); margin-bottom: 4px; }
.integration-tag { font-size: 11px; color: var(--dt3); margin-bottom: 8px; }
.integration-status { font-size: 10px; font-weight: 600; padding: 2px 10px; border-radius: 100px; display: inline-block; }
.integration-status.live { background: rgba(15,123,108,.08); color: var(--teal); }

/* Competitive advantage */
.vs-block { margin-top: 64px; max-width: 900px; margin-left: auto; margin-right: auto; }
.vs-title { font-size: clamp(22px, 2.5vw, 30px); font-weight: 800; letter-spacing: -.03em; color: var(--dt); margin-bottom: 8px; text-align: center; }
.vs-subtitle { font-size: 15px; color: var(--dt2); text-align: center; margin-bottom: 32px; line-height: 1.7; }
.vs-table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 16px; overflow: hidden; border: 1px solid var(--dline2); background: var(--dk3); }
.vs-table thead th { padding: 16px 20px; font-size: 13px; font-weight: 700; text-align: center; background: var(--dk2); border-bottom: 1px solid var(--dline); color: var(--dt); }
.vs-table thead th:first-child { text-align: left; }
.vs-table thead th.vs-scalyo { background: rgba(15,123,108,.08); color: var(--teal); }
.vs-table tbody td { padding: 14px 20px; font-size: 14px; text-align: center; border-bottom: 1px solid var(--dline); color: var(--dt2); }
.vs-table tbody td:first-child { text-align: left; font-weight: 600; color: var(--dt); }
.vs-table tbody td.vs-scalyo { background: rgba(15,123,108,.03); }
.vs-table tbody tr:last-child td { border-bottom: none; }
.vs-check { color: var(--teal); font-weight: 700; font-size: 16px; }
.vs-cross { color: #D4432F; font-size: 14px; }
.vs-partial { color: #D4930F; font-size: 13px; font-weight: 500; }
.sell-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
.sell-card { background: var(--dk3); border: 1px solid var(--dline2); border-radius: 14px; padding: 24px 20px; text-align: left; transition: all .3s cubic-bezier(.16,1,.3,1); transform-style: preserve-3d; }
.sell-card:hover { transform: perspective(600px) translateY(-6px) translateZ(10px); border-color: rgba(77,182,160,.25); box-shadow: 0 12px 32px rgba(0,0,0,.2), 0 0 0 1px rgba(77,182,160,.1); }
.sell-icon { font-size: 28px; margin-bottom: 12px; filter: drop-shadow(0 2px 1px rgba(0,0,0,.2)) drop-shadow(0 4px 3px rgba(0,0,0,.1)); }
.sell-label { font-size: 15px; font-weight: 700; color: var(--dt); margin-bottom: 8px; letter-spacing: -.02em; }
.sell-desc { font-size: 13px; color: var(--dt2); line-height: 1.6; }
.vs-highlights { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 28px; }
.vs-hl-card { background: rgba(15,123,108,.04); border: 1px solid rgba(15,123,108,.15); border-radius: 12px; padding: 20px; text-align: center; }
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
  z-index: 99; box-shadow: 0 4px 16px rgba(55,53,47,.08);
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
.lang-sw button:hover { background:rgba(55,53,47,.04); color:var(--dt); }
.lang-sw button.active { background:rgba(15,123,108,.13); color:var(--teal); border-color:rgba(15,123,108,.3); }
@media(max-width:640px){ .lang-sw { display:none; } }

/* ── MODALES LÉGALES ── */
.lm-overlay{position:fixed;inset:0;background:rgba(55,53,47,.5);backdrop-filter:blur(6px);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;}
.lm-overlay.open{display:flex;}
.lm-box{background:#FFFFFF;border:1px solid rgba(55,53,47,.12);border-radius:18px;width:100%;max-width:640px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;}
.lm-head{padding:24px 28px 0;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.lm-head h3{font-size:18px;font-weight:700;color:var(--dt);margin:0;}
.lm-close{background:none;border:1px solid rgba(55,53,47,.12);color:rgba(55,53,47,.5);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;transition:all .15s;}
.lm-close:hover{background:rgba(55,53,47,.04);color:var(--dt);}
.lm-body{padding:20px 28px 28px;overflow-y:auto;flex:1;}
.lm-body p,.lm-body li{font-size:14px;color:var(--dt2);line-height:1.7;}
.lm-body h4{font-size:13px;font-weight:700;color:var(--teal);margin:20px 0 6px;text-transform:uppercase;letter-spacing:.06em;}
.lm-body ul{padding-left:16px;margin:4px 0 12px;}
.lm-body li{margin:4px 0;}
.lm-body a{color:var(--teal);}
.lm-email-link{display:flex;align-items:center;gap:10px;background:rgba(18,205,184,.08);border:1px solid rgba(18,205,184,.2);border-radius:10px;padding:14px 18px;margin-top:16px;text-decoration:none;transition:all .2s;}
.lm-email-link:hover{background:rgba(18,205,184,.14);border-color:rgba(18,205,184,.4);}
.lm-email-icon{font-size:22px;flex-shrink:0;}
.lm-email-info strong{display:block;color:var(--dt);font-size:14px;}
.lm-email-info span{font-size:13px;color:var(--dt3);}
.lm-contact-form{margin-top:20px;}
.lm-contact-form label{display:block;font-size:12px;font-weight:600;color:var(--dt3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em;}
.lm-contact-form input,.lm-contact-form textarea{width:100%;background:var(--dk2);border:1px solid rgba(55,53,47,.12);border-radius:8px;color:var(--dt);font-size:14px;padding:10px 14px;font-family:var(--f);transition:border .15s;box-sizing:border-box;}
.lm-contact-form input:focus,.lm-contact-form textarea:focus{outline:none;border-color:rgba(18,205,184,.4);}
.lm-contact-form textarea{resize:vertical;min-height:100px;}
.lm-contact-form .lm-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.lm-contact-form .lm-field{margin-bottom:12px;}
.lm-submit{width:100%;padding:12px;background:var(--teal);border:none;border-radius:10px;color:#07090F;font-weight:700;font-size:14px;cursor:pointer;transition:all .2s;margin-top:4px;}
.lm-submit:hover{background:#0fb8a7;}
.lm-success{display:none;text-align:center;padding:20px;color:var(--teal);font-size:14px;}

.mod-section{padding:72px 5%;border-top:1px solid rgba(55,53,47,.06);}
/* ── FEATURES MODULES ── */
.chips-label{text-align:center;font-size:12px;font-weight:700;color:var(--dt3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:28px;}
.chips-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:900px;margin:0 auto;}
.chip{background:var(--bg2);border:1px solid rgba(55,53,47,.07);border-radius:14px;padding:16px 12px;text-align:center;cursor:default;transition:all .22s;}
.chip:hover,.chip.active{border-color:var(--teal);background:rgba(18,205,184,.07);transform:translateY(-2px);box-shadow:0 4px 20px rgba(18,205,184,.12);}
.chip-icon{font-size:26px;margin-bottom:8px;}
.chip-label{font-size:12px;font-weight:700;color:var(--dt2);}
.chip.active .chip-label{color:var(--teal);}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;max-width:860px;margin:0 auto;text-align:center;}
.stat-n{font-size:clamp(30px,4.5vw,50px);font-weight:900;background:linear-gradient(135deg,var(--teal),var(--blue));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;}
.stat-l{font-size:14px;font-weight:700;color:var(--dt2);margin-top:6px;}
.stat-s{font-size:12px;color:var(--dt3);margin-top:3px;}
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
.mod-check{width:18px;height:18px;background:rgba(18,205,184,.1);border:1px solid rgba(18,205,184,.28);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;font-size:9px;color:var(--teal);}
.mod-btn{display:inline-flex;align-items:center;gap:8px;background:rgba(18,205,184,.09);border:1px solid rgba(18,205,184,.28);color:var(--teal);font-weight:700;font-size:13px;padding:10px 20px;border-radius:9px;transition:all .2s;cursor:pointer;}
.mod-btn:hover{background:rgba(18,205,184,.18);transform:translateY(-1px);}
.mv::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--teal),var(--blue));}
.mv-head{font-size:12px;font-weight:700;color:var(--dt3);margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}
.badge{font-size:10px;font-weight:700;padding:3px 8px;border-radius:100px;}
.bg{background:rgba(18,205,184,.1);color:var(--teal);}
.ba{background:rgba(245,158,11,.1);color:var(--amber);}
.br{background:rgba(239,68,68,.1);color:var(--red);}
.hr-name{font-size:12px;font-weight:600;min-width:110px;}
.hr-bar{flex:1;height:5px;background:rgba(55,53,47,.04);border-radius:100px;overflow:hidden;}
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
.msg-a{background:rgba(18,205,184,.06);border:1px solid rgba(18,205,184,.14);color:var(--dt2);}
.msg-tag{font-size:10px;font-weight:700;color:var(--teal);margin-bottom:3px;}
.ep-row{border-bottom:1px solid rgba(55,53,47,.06);padding:5px 0;display:flex;gap:8px;}
.ep-lbl{color:var(--dt3);min-width:44px;font-size:10px;}
.cal-c{background:var(--bg3);border-radius:8px;padding:8px;font-size:11px;min-height:52px;}
.cal-ev{background:rgba(18,205,184,.07);border:1px solid rgba(18,205,184,.15);}
.cal-td{border:1px solid rgba(59,130,246,.3);}
.cal-title{font-size:11px;font-weight:700;color:var(--teal);}
.cal-sub{font-size:10px;color:var(--dt3);}
.task-col-h{font-size:10px;font-weight:700;color:var(--dt3);margin-bottom:7px;text-transform:uppercase;letter-spacing:.06em;}
.task-card{border-radius:8px;padding:9px;font-size:11px;margin-bottom:6px;border-left:2px solid;}
.tc-t{border-color:var(--teal);background:rgba(18,205,184,.05);}
.tc-a{border-color:var(--amber);background:rgba(245,158,11,.05);}
.tc-b{border-color:var(--blue);background:rgba(59,130,246,.05);}
.res-item{display:flex;align-items:center;gap:12px;padding:11px;background:var(--bg3);border-radius:10px;transition:all .18s;cursor:pointer;}
.res-item:hover{background:rgba(18,205,184,.06);border-color:rgba(18,205,184,.2);}
.res-icon{font-size:20px;flex-shrink:0;}
.res-info strong{display:block;font-size:13px;font-weight:700;}
.res-info span{font-size:11px;color:var(--dt3);}
.res-dl{margin-left:auto;font-size:11px;color:var(--teal);font-weight:700;}
.res-new{background:rgba(18,205,184,.05);border:1px solid rgba(18,205,184,.14);}
.cta-h2{font-size:clamp(26px,4.5vw,46px);font-weight:900;letter-spacing:-.025em;margin-bottom:14px;}
.cta-sub{font-size:16px;color:var(--dt2);max-width:480px;margin:0 auto 36px;line-height:1.6;}
.plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:840px;margin:0 auto 24px;}
.plan-card{background:var(--bg2);border:1px solid rgba(55,53,47,.09);border-radius:18px;padding:26px;text-align:left;position:relative;transition:all .2s;}
.plan-card.featured{border-color:var(--teal);background:rgba(18,205,184,.04);}
.plan-card:hover{transform:translateY(-2px);}
.plan-pop{position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--teal);color:#07090F;font-size:10px;font-weight:800;padding:4px 14px;border-radius:100px;white-space:nowrap;}
.plan-name{font-size:14px;font-weight:800;margin-bottom:4px;}
.plan-price{font-size:30px;font-weight:900;color:var(--teal);margin-bottom:4px;}
.plan-price span{font-size:13px;font-weight:500;color:var(--dt3);}
.plan-desc{font-size:12px;color:var(--dt3);margin-bottom:18px;}
.plan-btn{display:block;text-align:center;padding:11px;border-radius:10px;font-size:13px;font-weight:700;transition:all .2s;}
.plan-btn-p{background:var(--teal);color:#07090F;}
.plan-btn-p:hover{background:#0fb8a7;}
.plan-btn-o{border:1px solid rgba(55,53,47,.14);color:var(--dt2);}
.plan-btn-o:hover{border-color:rgba(55,53,47,.25);color:var(--dt);}
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
