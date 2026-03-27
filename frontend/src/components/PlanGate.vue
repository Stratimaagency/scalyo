<template>
  <div v-if="isLocked" class="plan-gate">
    <div class="plan-gate-blur">
      <slot />
    </div>
    <div class="plan-gate-overlay">
      <div class="plan-gate-card">
        <span class="plan-gate-badge">{{ requiredPlan.toUpperCase() }}</span>
        <span class="plan-gate-icon">&#x1F513;</span>
        <h3 class="plan-gate-title">{{ title }}</h3>
        <p class="plan-gate-desc">{{ desc }}</p>
        <button class="plan-gate-btn" @click="$router.push({ name: 'settings' })">{{ btnLabel }}</button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useI18n } from '../i18n'

const props = defineProps({
  requiredPlan: { type: String, default: 'Growth' },
  moduleName: { type: String, default: '' },
})

const authStore = useAuthStore()
const { t, lang } = useI18n()

const PLAN_RANK = { Starter: 0, Growth: 1, Elite: 2 }

const isLocked = computed(() => {
  const current = authStore.company?.plan || 'Starter'
  return (PLAN_RANK[current] ?? 0) < (PLAN_RANK[props.requiredPlan] ?? 1)
})

const title = computed(() => {
  const name = props.moduleName || ''
  if (lang.value === 'en') return `Unlock ${name}`
  if (lang.value === 'kr') return `${name} 잠금 해제`
  return `Débloquez ${name}`
})

const desc = computed(() => {
  const plan = props.requiredPlan
  if (lang.value === 'en') return `Available on the ${plan} plan. Discover Scalyo's full potential.`
  if (lang.value === 'kr') return `${plan} 플랜에서 사용 가능합니다. Scalyo의 전체 잠재력을 발견하세요.`
  return `Disponible sur le plan ${plan}. Découvrez tout le potentiel de Scalyo.`
})

const btnLabel = computed(() => {
  if (lang.value === 'en') return 'Unlock now'
  if (lang.value === 'kr') return '지금 잠금 해제'
  return 'Débloquer maintenant'
})
</script>

<style scoped>
.plan-gate {
  position: relative;
  height: 100%;
  overflow: hidden;
}
.plan-gate-blur {
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
  height: 100%;
  opacity: 0.5;
}
.plan-gate-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.7) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.plan-gate-card {
  background: var(--bg);
  border-radius: 24px;
  padding: 40px 52px;
  text-align: center;
  box-shadow: 0 12px 48px rgba(0,0,0,0.15);
  border: 2px solid var(--teal);
  max-width: 420px;
}
.plan-gate-badge {
  background: var(--teal-bg, rgba(77,182,160,0.1));
  color: var(--teal);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 4px 14px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 16px;
  border: 1px solid var(--teal-border, rgba(77,182,160,0.2));
}
.plan-gate-icon {
  font-size: 52px;
  display: block;
  margin-bottom: 14px;
}
.plan-gate-title {
  font-size: 22px;
  font-weight: 900;
  margin-bottom: 10px;
}
.plan-gate-desc {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 24px;
  line-height: 1.6;
}
.plan-gate-btn {
  background: var(--teal);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 16px 36px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  width: 100%;
  box-shadow: 0 4px 16px rgba(77,182,160,0.3);
  transition: transform 0.15s;
}
.plan-gate-btn:hover {
  transform: translateY(-1px);
}

/* Dark theme support */
:root[data-theme="dark"] .plan-gate-overlay {
  background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.7) 100%);
}
</style>
