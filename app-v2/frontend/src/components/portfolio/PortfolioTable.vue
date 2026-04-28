<template>
  <div class="table-wrap">
    <div class="th">
      <span class="c-name">{{ t('port_field_name') }}</span>
      <span class="c-ind hide-sm">{{ t('port_field_industry') }}</span>
      <span class="c-arr">{{ t('kpi_arr') }}</span>
      <span class="c-h">{{ t('kpi_health') }}</span>
      <span class="c-st hide-sm">{{ t('port_field_status') }}</span>
      <span class="c-csm hide-md">{{ t('port_field_agent') }}</span>
      <span class="c-ren hide-md">{{ t('port_renewal') }}</span>
      <span class="c-act hide-sm"></span>
    </div>
    <div v-for="c in clients" :key="c.id" class="tr" @click="$emit('edit', c)">
      <div class="c-name">
        <div class="av" :class="c.status">{{ c.name[0] }}</div>
        <div>
          <strong>{{ c.name }}</strong>
          <span class="sub" v-if="c.contacts?.[0]">{{ c.contacts[0].name }}</span>
        </div>
      </div>
      <span class="c-ind hide-sm">{{ c.industry }}</span>
      <span class="c-arr fw">€{{ fmtNum(c.arr) }}</span>
      <span class="c-h">
        <span class="pill" :class="sClass(c.status)">{{ c.health }}</span>
      </span>
      <span class="c-st hide-sm">
        <span class="sbadge" :class="c.status">{{ t('status_' + c.status) }}</span>
      </span>
      <span class="c-csm hide-md">{{ c.csm }}</span>
      <span class="c-ren hide-md" :class="{ soon: renewSoon(c) }">
        {{ fmtDate(c.renewalDate, locale) }}
      </span>
      <span class="c-act hide-sm">
        <button class="rb" @click.stop="$emit('edit', c)" :title="t('edit')">✏️</button>
        <template v-if="deleteId === c.id">
          <button class="rb del active" @click.stop="$emit('delete', c)" :title="t('port_delete_step2')">✓</button>
          <button class="rb" @click.stop="deleteId = null" :title="t('sm_reset_cancel')">✕</button>
        </template>
        <button v-else class="rb del" @click.stop="deleteId = c.id" :title="t('port_delete_step1')">🗑️</button>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fmtNum, fmtDate, sClass, renewSoon } from './portfolioHelpers.js'

const { t, locale } = useI18n({ useScope: 'global' })

defineProps({ clients: { type: Array, required: true } })
defineEmits(['edit', 'delete'])

const deleteId = ref(null)
</script>
