<template>
  <div ref="rootEl" class="landing">
    <LandingNavbar
      :scrolled="scrolled"
      :locale="locale"
      :langs="langs"
      :app-url="appUrl"
      :t="t"
      @locale-change="locale = $event"
    />

    <LandingHero :app-url="appUrl" :t="t" />

    <LandingMockupFrame
      :active-demo="activeDemo"
      :demo-tabs="demoTabs"
      :t="t"
      @demo-change="activeDemo = $event"
    >
      <template #default="{ activeDemoVal }">
        <LandingMockupPanels
          :active-demo="activeDemo"
          :mock-accounts="mockAccounts"
          :t="t"
        />
      </template>
    </LandingMockupFrame>

    <LandingStats :stats-data="statsData" />

    <LandingFeatures
      :modules-data="modulesData"
      :active-module="activeModule"
      :app-url="appUrl"
      :t="t"
      @module-change="activeModule = $event"
    />

    <LandingRoiCalc :t="t" :locale="locale" />

    <LandingIntegrations :integrations="integrations" :t="t" />

    <LandingWhyScalyo :selling-points="sellingPoints" :t="t" />

    <LandingPricing :t="t" />

    <LandingFaq :faq-items="faqItems" :t="t" />

    <LandingCta :app-url="appUrl" :t="t" />

    <LandingFooter :app-url="appUrl" :locale="locale" :t="t" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { L } from '@/i18n/landing'

import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingMockupFrame from '@/components/landing/LandingMockupFrame.vue'
import LandingMockupPanels from '@/components/landing/LandingMockupPanels.vue'
import LandingStats from '@/components/landing/LandingStats.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
import LandingRoiCalc from '@/components/landing/LandingRoiCalc.vue'
import LandingIntegrations from '@/components/landing/LandingIntegrations.vue'
import LandingWhyScalyo from '@/components/landing/LandingWhyScalyo.vue'
import LandingPricing from '@/components/landing/LandingPricing.vue'
import LandingFaq from '@/components/landing/LandingFaq.vue'
import LandingCta from '@/components/landing/LandingCta.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const appUrl = ''

const locale = ref('fr')
const langs = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'kr', label: '한국어' },
]
function t(key) {
  return (L[locale.value] || L.fr)[key] || L.fr[key] || key
}

const rootEl = ref(null)
const scrolled = ref(false)
const activeDemo = ref(0)
const activeModule = ref(0)

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

const statsData = computed(() => [
  { n: '-34%', l: t('stat1'), s: t('stat1n'), icon: '📉' },
  { n: '+18%', l: t('stat2'), s: t('stat2n'), icon: '📈' },
  { n: '6h',   l: t('stat3'), s: t('stat3n'), icon: '⏱️' },
  { n: '30j',  l: t('stat4'), s: t('stat4n'), icon: '🔮' },
])

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

const integrations = computed(() => [
  { icon: '☁️', name: 'Salesforce', tag: t('integ_sf_tag') },
  { icon: '📧', name: 'Gmail', tag: t('integ_gmail_tag') },
  { icon: '📬', name: 'IMAP', tag: t('integ_imap_tag') },
  { icon: '💬', name: 'Slack', tag: t('integ_slack_tag') },
  { icon: '📹', name: 'Zoom', tag: t('integ_zoom_tag') },
  { icon: '📆', name: 'Calendly', tag: t('integ_calendly_tag') },
  { icon: '📋', name: 'Asana', tag: t('integ_asana_tag') },
])

const sellingPoints = computed(() => [
  { icon: '🔗', label: t('sell_1_label'), desc: t('sell_1_desc') },
  { icon: '⚡', label: t('sell_2_label'), desc: t('sell_2_desc') },
  { icon: '🛡️', label: t('sell_3_label'), desc: t('sell_3_desc') },
  { icon: '🤖', label: t('sell_4_label'), desc: t('sell_4_desc') },
  { icon: '💚', label: t('sell_5_label'), desc: t('sell_5_desc') },
  { icon: '💎', label: t('sell_6_label'), desc: t('sell_6_desc') },
  { icon: '🧩', label: t('sell_7_label'), desc: t('sell_7_desc') },
  { icon: '🌐', label: t('sell_8_label'), desc: t('sell_8_desc') },
  { icon: '🔒', label: t('sell_9_label'), desc: t('sell_9_desc') },
])

const faqItems = computed(() => [
  { q: t('faq_q1'), a: t('faq_a1') },
  { q: t('faq_q2'), a: t('faq_a2') },
  { q: t('faq_q3'), a: t('faq_a3') },
  { q: t('faq_q4'), a: t('faq_a4') },
  { q: t('faq_q5'), a: t('faq_a5') },
  { q: t('faq_q6'), a: t('faq_a6') },
  { q: t('faq_q7'), a: t('faq_a7') },
  { q: t('faq_q8'), a: t('faq_a8') },
  { q: t('faq_q9'), a: t('faq_a9') },
  { q: t('faq_q10'), a: t('faq_a10') },
  { q: t('faq_q11'), a: t('faq_a11') },
])

function onScroll() { scrolled.value = window.scrollY > 30 }

let observer = null
let demoCycleTimer = null
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })

  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.remove('anim-hidden')
          e.target.classList.add('anim-visible')
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

<style src="@/assets/landing.css"></style>
