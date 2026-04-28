<template>
  <div ref="rootEl" class="landing">
    <LandingNavbar />
    <LandingHero />
    <LandingMockup />
    <LandingStats />
    <LandingFeatures />
    <LandingRoiCalc />
    <LandingIntegrations />
    <LandingWhyScalyo />
    <LandingPricing />
    <LandingFaq />
    <LandingCta />
    <LandingFooter />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingMockup from '@/components/landing/LandingMockup.vue'
import LandingStats from '@/components/landing/LandingStats.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
import LandingRoiCalc from '@/components/landing/LandingRoiCalc.vue'
import LandingIntegrations from '@/components/landing/LandingIntegrations.vue'
import LandingWhyScalyo from '@/components/landing/LandingWhyScalyo.vue'
import LandingPricing from '@/components/landing/LandingPricing.vue'
import LandingFaq from '@/components/landing/LandingFaq.vue'
import LandingCta from '@/components/landing/LandingCta.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const rootEl = ref(null)

let observer = null
onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        observer.unobserve(e.target)
      }
    })
  }, { threshold: 0.08 })

  rootEl.value?.querySelectorAll('.anim-section').forEach(el => {
    const rect = el.getBoundingClientRect()
    if (rect.top > window.innerHeight) {
      el.classList.add('anim-hidden')
    }
    observer.observe(el)
  })
})

onUnmounted(() => observer?.disconnect())
</script>

<style>
/* ═══ Shared landing styles (non-scoped: apply across child components) ═══ */
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

/* ═══════════════════ RESPONSIVE ═══════════════════ */
@media (max-width: 1100px) {
  .plans-grid { grid-template-columns: repeat(2, 1fr); }
}
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

<style scoped>
.landing { overflow-x: hidden; }
</style>
