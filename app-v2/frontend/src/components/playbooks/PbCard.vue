<template>
  <div class="pb-card" @click="$emit('open', pb)">
    <div class="pbc-header">
      <div class="pbc-left">
        <span
          class="pbc-icon"
          :style="{ background: pb.color + '15', color: pb.color }"
        >{{ pb.icon }}</span>
        <div>
          <strong>{{ t('pb_template_' + pb.templateKey) }}</strong>
          <span class="pbc-client" v-if="pb.clientId">
            {{ clientLabel }}
          </span>
        </div>
      </div>
      <span class="pbc-status" :class="pb.status">
        {{ t('pb_status_' + pb.status) }}
      </span>
    </div>

    <div class="pbc-progress">
      <div class="pbc-progress-header">
        <span>{{ t('pb_progress') }}</span>
        <span class="pbc-pct">{{ progressPct }}%</span>
      </div>
      <div class="pbc-bar">
        <div
          class="pbc-fill"
          :style="{ width: progressPct + '%', background: pb.color }"
        />
      </div>
    </div>

    <div class="pbc-steps">
      <div
        v-for="step in pb.steps"
        :key="step.id"
        class="pbc-step"
        :class="{ done: step.done }"
      >
        <span
          class="step-check"
          @click.stop="$emit('toggleStep', pb.id, step.id)"
        >{{ step.done ? '✅' : '⬜' }}</span>
        <span class="step-title">{{ t(step.title) }}</span>
      </div>
    </div>

    <div class="pbc-footer">
      <span class="pbc-date">
        {{ t('pb_started') }} {{ formattedDate }}
      </span>
      <div class="pbc-btns">
        <button
          v-if="pb.status === 'active'"
          class="btn-sm green"
          @click.stop="$emit('complete', pb.id)"
        >{{ t('pb_complete') }}</button>
        <button
          class="btn-sm red"
          @click.stop="$emit('delete', pb.id)"
        >{{ t('pb_delete') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({ useScope: 'global' })

const props = defineProps({
  pb: { type: Object, required: true },
  clientLabel: { type: String, default: '' }
})

defineEmits(['open', 'toggleStep', 'complete', 'delete'])

const progressPct = computed(() => {
  if (!props.pb.steps.length) return 0
  return Math.round(
    (props.pb.steps.filter(s => s.done).length / props.pb.steps.length) * 100
  )
})

const formattedDate = computed(() => {
  if (!props.pb.startedAt) return '—'
  const loc = locale.value === 'ko' ? 'ko-KR'
    : locale.value === 'en' ? 'en-US' : 'fr-FR'
  return new Date(props.pb.startedAt).toLocaleDateString(loc, {
    day: 'numeric',
    month: 'short'
  })
})
</script>
