<template>
  <div class="sat-card">
    <h3>{{ t('sat_portfolio_health') }}</h3>
    <div class="health-list">
      <div v-for="c in sortedClients" :key="c.id" class="hl-row">
        <div class="hl-left">
          <div class="hl-av" :class="c.status">{{ c.name[0] }}</div>
          <div class="hl-info">
            <strong>{{ c.name }}</strong>
            <span>{{ c.csm }} · {{ fmtCurrency(c.arr, locale, c.currency || 'EUR') }}</span>
          </div>
        </div>
        <div class="hl-right">
          <div class="hl-score-wrap">
            <span class="hl-score" :class="scoreColor(c.health * 10)">
              {{ (c.health * 10).toFixed(0) }}
            </span>
            <div class="hl-bar-bg">
              <div
                class="hl-bar"
                :class="scoreColor(c.health * 10)"
                :style="{ width: c.health * 10 + '%' }"
              />
            </div>
          </div>
          <span class="hl-status" :class="c.status">{{ t('status_' + c.status) }}</span>
        </div>
      </div>
      <div v-if="!sortedClients.length" class="sat-empty">{{ t('sat_no_clients') }}</div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { fmtCurrency, scoreColor } from './satisfactionHelpers'

const { t, locale } = useI18n({ useScope: 'global' })

defineProps({
  sortedClients: { type: Array, default: () => [] }
})
</script>
