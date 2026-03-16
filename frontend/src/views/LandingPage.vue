<template>
  <div class="landing">
    <!-- Nav -->
    <nav class="landing-nav" :class="{ scrolled: scrolled }">
      <div class="nav-logo">
        <div class="nav-logo-icon">S</div>
        <span>Scal<span class="accent">yo</span></span>
      </div>
      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#roi">ROI</a>
      </div>
      <div class="nav-right">
        <router-link to="/login" class="n-ghost">Log in</router-link>
        <router-link to="/login" class="n-solid">Start Free</router-link>
      </div>
    </nav>

    <!-- Hero -->
    <header class="hero">
      <div class="hero-glow"></div>
      <div class="hero-inner">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Customer Success Platform
        </div>
        <h1 class="hero-h1">
          Le Customer Success,<br/><span class="accent">réinventé.</span>
        </h1>
        <p class="hero-sub">
          Pilotez vos KPIs, protégez vos comptes,<br/>
          <strong>prenez soin de votre équipe.</strong>
        </p>
        <div class="hero-cta">
          <router-link to="/login" class="btn-hero-primary">
            Démarrer gratuitement
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5-5-5-5"/></svg>
          </router-link>
          <a href="#features" class="btn-hero-secondary">Découvrir</a>
        </div>
        <div class="hero-social-proof">
          <span>14 jours gratuits</span>
          <span class="hsp-sep"></span>
          <span>Sans carte bancaire</span>
          <span class="hsp-sep"></span>
          <span>Données hébergées en Europe</span>
        </div>
      </div>
    </header>

    <!-- Stats bar -->
    <section class="stats-bar">
      <div class="stats-inner">
        <div class="stat-cell" v-for="stat in stats" :key="stat.number">
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-note">{{ stat.note }}</div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="section section-light">
      <div class="container">
        <div class="label"><span class="label-line"></span>Fonctionnalités</div>
        <h2 class="h2-light" style="margin-bottom: 56px">Tout ce dont votre équipe CS a besoin.</h2>

        <div v-for="(feat, i) in featurePanels" :key="i" :class="['feat-panel', { flip: i % 2 !== 0 }]" style="margin-bottom: 80px">
          <div class="feat-text">
            <div style="font-size: 28px; margin-bottom: 12px">{{ feat.icon }}</div>
            <h3 class="feat-title">{{ feat.title }}</h3>
            <p class="feat-body">{{ feat.body }}</p>
            <div class="feat-points">
              <div v-for="point in feat.points" :key="point" class="feat-point">
                <span class="fp-check">✓</span>
                <span>{{ point }}</span>
              </div>
            </div>
          </div>
          <div class="feat-visual">
            <div class="fv-pad">
              <div class="fv-header">
                <span class="fv-title">{{ feat.widgetTitle }}</span>
                <span class="fv-badge badge-live">Live</span>
              </div>
              <div style="background: var(--dk4, #EDECE9); border-radius: 8px; padding: 32px; text-align: center; color: var(--dt3, #9B9A97); font-size: 13px">
                {{ feat.widgetPreview }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="section section-dark">
      <div class="container">
        <div class="label"><span class="label-line"></span>Tarification</div>
        <h2 class="h2-dark" style="margin-bottom: 48px">Des équipes CS qui performent, des clients qui restent.</h2>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; max-width: 960px;">
          <div v-for="plan in plans" :key="plan.name" class="pricing-card" :class="{ popular: plan.popular }">
            <div v-if="plan.popular" class="pricing-popular-badge">Populaire</div>
            <div class="pricing-name">{{ plan.name }}</div>
            <div class="pricing-price">{{ plan.price }}<span class="pricing-period">/mois</span></div>
            <div class="pricing-desc">{{ plan.desc }}</div>
            <ul class="pricing-features">
              <li v-for="f in plan.features" :key="f">
                <span class="pricing-check">✓</span> {{ f }}
              </li>
            </ul>
            <router-link to="/login" class="pricing-cta" :class="{ primary: plan.popular }">
              {{ plan.popular ? 'Démarrer maintenant' : 'Commencer' }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-logo">
        <div class="nav-logo-icon" style="width: 24px; height: 24px; font-size: 12px; border-radius: 6px;">S</div>
        <span style="font-weight: 700; font-size: 15px; letter-spacing: -0.03em;">Scalyo</span>
      </div>
      <p>Annulation à tout moment · Facturation sécurisée via Stripe · Données hébergées en Europe · RGPD</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
function handleScroll() { scrolled.value = window.scrollY > 20; }
onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

const stats = [
  { number: '-35%', label: 'Churn réduit', note: 'En moyenne sur nos clients' },
  { number: '+22%', label: 'ARR protégé', note: 'Grâce aux alertes proactives' },
  { number: '4h', label: 'Gagnées par semaine', note: 'Par CSM en automatisation' },
  { number: '98%', label: 'Satisfaction équipe', note: 'Score wellbeing moyen' },
]

const featurePanels = [
  {
    icon: '📊', title: 'Dashboard intelligent', body: 'Vue d\'ensemble de votre portefeuille avec KPIs en temps réel, alertes critiques et score de santé.',
    points: ['Health Score automatique', 'Alertes churn proactives', 'ARR à risque en un coup d\'oeil'],
    widgetTitle: 'Dashboard', widgetPreview: 'KPI cards, health scores, critical alerts...'
  },
  {
    icon: '💼', title: 'Portefeuille vivant', body: 'Gérez tous vos comptes, assignations CSM, niveaux de risque et ARR en un seul endroit.',
    points: ['Import CSV/Excel', 'Todo list par compte', 'Filtres CSM et risque'],
    widgetTitle: 'Portfolio', widgetPreview: 'Account cards with health bars, risk pills...'
  },
  {
    icon: '💚', title: 'Bien-être équipe', body: 'Surveillez la santé de votre équipe, le risque de burnout et l\'équilibre de charge.',
    points: ['Score bien-être global', 'Détection burnout', 'Charge par CSM'],
    widgetTitle: 'Wellbeing', widgetPreview: 'Team scores, burnout indicators...'
  },
  {
    icon: '🤖', title: 'Coach IA', body: 'Conseils stratégiques CS propulsés par l\'IA pour vos décisions quotidiennes.',
    points: ['Expert CS francophone', 'Réponses contextuelles', 'Disponible 24/7'],
    widgetTitle: 'Coach IA', widgetPreview: 'Chat interface with AI responses...'
  },
]

const plans = [
  {
    name: 'Starter', price: '0€', desc: 'Pour commencer avec le CS structuré', popular: false,
    features: ['5 comptes clients', 'Dashboard & KPIs', 'Task Board', 'Email Studio'],
  },
  {
    name: 'Growth', price: '49€', desc: 'Pour les équipes CS en croissance', popular: true,
    features: ['Comptes illimités', 'CSMs illimités', 'Coach IA', 'Bien-être équipe', 'Planning'],
  },
  {
    name: 'Elite', price: '149€', desc: 'Pour les organisations CS avancées', popular: false,
    features: ['Tout dans Growth', 'Onboarding dédié', 'Support prioritaire', 'Session coaching mensuelle'],
  },
]
</script>

<style scoped>
/* Notion-like landing page */
:root {
  --dk: #FFFFFF;
  --dk2: #F7F6F3;
  --dk3: #FFFFFF;
  --dk4: #EDECE9;
  --dk5: #D3D1CB;
  --dt: #37352F;
  --dt2: #6B6966;
  --dt3: #9B9A97;
  --dline: rgba(55,53,47,0.09);
  --dline2: rgba(55,53,47,0.16);
  --land-teal: #0F7B6C;
  --land-teal2: rgba(15,123,108,0.08);
  --f: 'Plus Jakarta Sans', 'Inter', -apple-system, system-ui, sans-serif;
  --rad: 12px;
}
.landing { min-height: 100vh; background: #fff; color: #37352F; font-family: var(--f); }

/* Nav */
.landing-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 60px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.3s, border-bottom 0.3s;
}
.landing-nav.scrolled {
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid var(--dline);
}
.nav-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 17px; letter-spacing: -0.03em; color: var(--dt); }
.nav-logo-icon { width: 30px; height: 30px; border-radius: 8px; background: var(--land-teal); display: grid; place-items: center; font-size: 15px; font-weight: 900; color: #fff; flex-shrink: 0; }
.nav-logo .accent { color: var(--land-teal); }
.nav-links { display: flex; gap: 0; }
.nav-links a { padding: 7px 14px; border-radius: 7px; font-size: 14px; font-weight: 500; color: var(--dt2); transition: color 0.15s, background 0.15s; text-decoration: none; }
.nav-links a:hover { color: var(--dt); background: rgba(55,53,47,0.04); }
.nav-right { display: flex; align-items: center; gap: 8px; }
.n-ghost { padding: 7px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--dt2); border: 1px solid var(--dline2); transition: all 0.15s; text-decoration: none; }
.n-ghost:hover { color: var(--dt); background: rgba(55,53,47,0.04); }
.n-solid { padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; color: #fff; background: var(--land-teal); transition: all 0.2s; text-decoration: none; }
.n-solid:hover { background: #0a6b5e; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,123,108,0.2); }

/* Hero */
.hero { background: #fff; padding: 140px 24px 100px; text-align: center; position: relative; overflow: hidden; }
.hero-glow { position: absolute; left: 50%; top: 0; transform: translateX(-50%); width: 900px; height: 600px; background: radial-gradient(ellipse at 50% 0%, rgba(15,123,108,0.06) 0%, transparent 60%); pointer-events: none; z-index: 0; }
.hero-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }
.hero-badge { display: inline-flex; align-items: center; gap: 7px; padding: 5px 14px; border-radius: 100px; border: 1px solid var(--dline2); background: rgba(55,53,47,0.03); font-size: 13px; font-weight: 500; color: var(--dt2); margin-bottom: 32px; }
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--land-teal); box-shadow: 0 0 4px rgba(15,123,108,0.3); }
.hero-h1 { font-size: clamp(42px, 6.5vw, 80px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.08; color: var(--dt); margin-bottom: 24px; }
.hero-h1 .accent { color: var(--land-teal); }
.hero-sub { font-size: clamp(16px, 2vw, 19px); font-weight: 400; color: var(--dt2); line-height: 1.65; max-width: 520px; margin: 0 auto 40px; }
.hero-sub strong { color: var(--dt); font-weight: 500; }
.hero-cta { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 56px; }
.btn-hero-primary { display: flex; align-items: center; gap: 8px; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; color: #fff; background: var(--land-teal); transition: all 0.2s; text-decoration: none; box-shadow: 0 1px 3px rgba(55,53,47,0.08); }
.btn-hero-primary:hover { background: #0a6b5e; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,123,108,0.15); }
.btn-hero-secondary { padding: 14px 24px; border-radius: 10px; font-size: 15px; font-weight: 500; color: var(--dt2); border: 1px solid var(--dline2); transition: all 0.15s; background: rgba(55,53,47,0.03); text-decoration: none; }
.btn-hero-secondary:hover { color: var(--dt); background: rgba(55,53,47,0.04); }
.hero-social-proof { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: var(--dt3); flex-wrap: wrap; }
.hsp-sep { width: 3px; height: 3px; border-radius: 50%; background: var(--dk5); }

/* Stats bar */
.stats-bar { background: var(--dk2); border-top: 1px solid var(--dline); border-bottom: 1px solid var(--dline); }
.stats-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); }
.stat-cell { padding: 36px 32px; border-right: 1px solid var(--dline); }
.stat-cell:last-child { border-right: none; }
.stat-number { font-size: 48px; font-weight: 800; letter-spacing: -0.05em; line-height: 1; color: var(--land-teal); margin-bottom: 6px; }
.stat-label { font-size: 14px; font-weight: 500; color: var(--dt); margin-bottom: 4px; }
.stat-note { font-size: 12.5px; color: var(--dt3); line-height: 1.5; }

/* Sections */
.section { padding: 100px 24px; }
.section-light { background: var(--dk2); color: var(--dt); }
.section-dark { background: var(--dk); color: var(--dt); }
.container { max-width: 1100px; margin: 0 auto; }
.label { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; letter-spacing: -0.01em; color: var(--land-teal); margin-bottom: 14px; }
.label-line { width: 16px; height: 1.5px; background: var(--land-teal); border-radius: 1px; }
.h2-light, .h2-dark { font-size: clamp(30px, 3.8vw, 48px); font-weight: 800; letter-spacing: -0.03em; line-height: 1.12; color: var(--dt); margin-bottom: 16px; }

/* Feature panels */
.feat-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
.feat-panel.flip { direction: rtl; }
.feat-panel.flip > * { direction: ltr; }
.feat-title { font-size: clamp(24px, 2.5vw, 34px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; color: var(--dt); margin-bottom: 14px; }
.feat-body { font-size: 16px; color: var(--dt2); line-height: 1.7; margin-bottom: 24px; }
.feat-points { display: flex; flex-direction: column; gap: 10px; }
.feat-point { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--dt2); line-height: 1.55; }
.fp-check { width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0; margin-top: 1px; background: var(--land-teal2); border: 1px solid rgba(15,123,108,0.2); display: grid; place-items: center; font-size: 9px; color: var(--land-teal); font-weight: 700; }
.feat-visual { border-radius: 16px; overflow: hidden; border: 1px solid var(--dline2); box-shadow: 0 4px 16px rgba(55,53,47,0.06), 0 16px 32px rgba(55,53,47,0.04); background: var(--dk3); }
.fv-pad { padding: 28px; }
.fv-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.fv-title { font-size: 14px; font-weight: 600; letter-spacing: -0.02em; color: var(--dt); }
.fv-badge { padding: 3px 9px; border-radius: 100px; font-size: 11px; font-weight: 600; }
.badge-live { background: rgba(74,222,128,0.08); color: #4ADE80; border: 1px solid rgba(74,222,128,0.15); }

/* Pricing */
.pricing-card { background: #fff; border: 1px solid var(--dline2); border-radius: 16px; padding: 32px 28px; position: relative; transition: border-color 0.2s; }
.pricing-card:hover { border-color: rgba(55,53,47,0.24); }
.pricing-card.popular { border-color: var(--land-teal); box-shadow: 0 0 0 1px var(--land-teal); }
.pricing-popular-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: var(--land-teal); color: #fff; font-size: 11px; font-weight: 700; padding: 3px 14px; border-radius: 100px; }
.pricing-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
.pricing-price { font-size: 42px; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 4px; }
.pricing-period { font-size: 15px; font-weight: 400; color: var(--dt3); }
.pricing-desc { font-size: 14px; color: var(--dt2); margin-bottom: 24px; }
.pricing-features { list-style: none; margin-bottom: 24px; }
.pricing-features li { padding: 6px 0; font-size: 14px; color: var(--dt2); display: flex; gap: 8px; align-items: center; }
.pricing-check { color: var(--land-teal); font-weight: 700; font-size: 13px; }
.pricing-cta { display: block; text-align: center; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 1px solid var(--dline2); color: var(--dt2); transition: all 0.15s; text-decoration: none; }
.pricing-cta:hover { color: var(--dt); background: rgba(55,53,47,0.04); }
.pricing-cta.primary { background: var(--land-teal); color: #fff; border-color: var(--land-teal); }
.pricing-cta.primary:hover { background: #0a6b5e; }

/* Footer */
.landing-footer { text-align: center; padding: 40px 20px; color: var(--dt3); font-size: 13px; border-top: 1px solid var(--dline); }
.footer-logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; color: var(--dt); }

@media (max-width: 768px) {
  .hero-h1 { font-size: 32px; }
  .nav-links { display: none; }
  .feat-panel { grid-template-columns: 1fr; gap: 40px; }
  .feat-panel.flip { direction: ltr; }
  .stats-inner { grid-template-columns: 1fr 1fr; }
  .stat-cell:nth-child(2) { border-right: none; }
}
</style>
