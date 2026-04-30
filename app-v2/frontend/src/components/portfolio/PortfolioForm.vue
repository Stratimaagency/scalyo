<template>
  <SlideOver :open="open" :title="editId ? t('port_edit_title') : t('port_create_title')" @close="$emit('close')">
    <form @submit.prevent="$emit('save')" class="sf">
      <div class="fg">
        <label>{{ t('port_field_name') }} *</label>
        <input v-model="form.name" required class="fi" />
      </div>
      <div class="fr">
        <div class="fg">
          <label>{{ t('port_field_industry') }}</label>
          <select v-model="form.industry" class="fi">
            <option v-for="i in industries" :key="i" :value="i">{{ i }}</option>
          </select>
        </div>
        <div class="fg">
          <label>{{ t('port_field_status') }}</label>
          <select v-model="form.status" class="fi">
            <option value="healthy">{{ t('status_healthy') }}</option>
            <option value="watch">{{ t('status_watch') }}</option>
            <option value="critical">{{ t('status_critical') }}</option>
          </select>
        </div>
      </div>
      <div class="fr">
        <div class="fg">
          <label>{{ t('port_field_arr') }}</label>
          <input v-model.number="form.arr" type="number" min="0" class="fi" />
        </div>
        <div class="fg">
          <label>{{ t('port_field_mrr') }}</label>
          <input v-model.number="form.mrr" type="number" min="0" class="fi" />
        </div>
      </div>
      <div class="fr">
        <div class="fg">
          <label>{{ t('port_field_health') }}</label>
          <input v-model.number="form.health" type="number" min="0" max="10" step="0.1" class="fi" />
        </div>
        <div class="fg">
          <label>{{ t('port_field_nps') }}</label>
          <input v-model.number="form.nps" type="number" min="-100" max="100" class="fi" />
        </div>
      </div>
      <div class="fr">
        <div class="fg">
          <label>{{ t('port_field_agent') }}</label>
          <select v-model="form.csmId" class="fi">
            <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
        </div>
        <div class="fg">
          <label>{{ t('port_field_renewal') }}</label>
          <input v-model="form.renewalDate" type="date" class="fi" />
        </div>
      </div>
      <div class="fdiv">{{ t('port_contact') }}</div>
      <div class="fg">
        <label>{{ t('port_field_contact_name') }}</label>
        <input v-model="form.cName" class="fi" />
      </div>
      <div class="fr">
        <div class="fg">
          <label>{{ t('port_field_contact_email') }}</label>
          <input v-model="form.cEmail" type="email" class="fi" />
        </div>
        <div class="fg">
          <label>{{ t('port_field_contact_role') }}</label>
          <input v-model="form.cRole" class="fi" />
        </div>
      </div>
      <div class="fa">
        <button type="button" class="btn-outline" @click="$emit('close')">{{ t('cancel') }}</button>
        <button type="submit" class="btn-primary">{{ editId ? t('save') : t('create') }}</button>
      </div>
    </form>
  </SlideOver>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import SlideOver from '@/components/SlideOver.vue'

const { t } = useI18n({ useScope: 'global' })

defineProps({
  open: { type: Boolean, default: false },
  editId: { type: [String, Number], default: null },
  form: { type: Object, required: true },
  industries: { type: Array, default: () => [] },
  members: { type: Array, default: () => [] }
})

defineEmits(['close', 'save'])
</script>
