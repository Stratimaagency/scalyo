<template>
  <div class="playbooks">
    <div v-if="!canAccessPlaybooks" class="pb-upsell">
      <div class="empty-icon">🔒</div>
      <h3>{{ t('pb_plan_required', { plan: 'Growth' }) }}</h3>
      <p>{{ t('pb_empty_desc') }}</p>
      <button class="btn-primary" @click="$router.push('/app/settings')">{{ t('pb_upgrade') }}</button>
    </div>
    <template v-else>
    <PbHeader
      :playbookCount="store.playbooks.length"
      v-model:search="search"
      @openTemplates="slideTemplate = true"
    />

    <PbFilters
      :filterTabs="filterTabs"
      v-model:activeFilter="activeFilter"
    />

    <PbKpis
      :activeCount="store.activePlaybooks.length"
      :doneMonth="store.doneThisMonth"
      :avgDuration="store.avgDuration"
      :successRate="store.successRate"
    />

    <div v-if="filteredPlaybooks.length" class="pb-list">
      <PbCard
        v-for="pb in filteredPlaybooks"
        :key="pb.id"
        :pb="pb"
        :clientLabel="clientName(pb.clientId)"
        @open="openDetail"
        @toggleStep="store.toggleStep"
        @complete="store.completePlaybook"
        @delete="store.deletePlaybook"
      />
    </div>

    <PbEmptyState
      v-else
      @activate="slideTemplate = true"
    />

    <PbTemplateSlide
      :open="slideTemplate"
      :templates="availableTemplates"
      @close="slideTemplate = false"
      @selectTemplate="selectTemplate"
    />

    <PbActivateSlide
      :open="slideActivate"
      :template="activatingTpl"
      :clients="clients.clients"
      :teamMembers="team.members"
      @close="slideActivate = false"
      @activate="doActivate"
    />
      </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlaybookStore } from '@/stores/playbooks'
import { useClientStore } from '@/stores/clients'
import { useTeamStore } from '@/stores/team'
import { useAuthStore } from '@/stores/auth'
import PbHeader from '@/components/playbooks/PbHeader.vue'
import PbFilters from '@/components/playbooks/PbFilters.vue'
import PbKpis from '@/components/playbooks/PbKpis.vue'
import PbCard from '@/components/playbooks/PbCard.vue'
import PbEmptyState from '@/components/playbooks/PbEmptyState.vue'
import PbTemplateSlide from '@/components/playbooks/PbTemplateSlide.vue'
import PbActivateSlide from '@/components/playbooks/PbActivateSlide.vue'
import '@/assets/playbooks.css'

const { t } = useI18n({ useScope: 'global' })
const store = usePlaybookStore()
const clients = useClientStore()
const team = useTeamStore()
const auth = useAuthStore()

const canAccessPlaybooks = computed(() => !!auth.currentPlan && auth.currentPlan !== 'starter')
const availableTemplates = computed(() => store.templatesForPlan(auth.currentPlan))

const search = ref('')
const activeFilter = ref('all')
const slideTemplate = ref(false)
const slideActivate = ref(false)
const activatingTpl = ref(null)

const filterTabs = computed(() => [
  { key: 'all', label: 'pb_filter_all', count: store.playbooks.length },
  { key: 'active', label: 'pb_filter_active', count: store.activePlaybooks.length },
  { key: 'done', label: 'pb_filter_done', count: store.donePlaybooks.length },
])

const filteredPlaybooks = computed(() => {
  let list = store.playbooks
  if (activeFilter.value === 'active')
    list = list.filter(p => p.status === 'active')
  else if (activeFilter.value === 'done')
    list = list.filter(p => p.status === 'done')
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(p => {
      const name = t('pb_template_' + p.templateKey).toLowerCase()
      const client = clientName(p.clientId).toLowerCase()
      return name.includes(q) || client.includes(q)
    })
  }
  return list
})

function clientName(id) {
  return clients.clients.find(c => c.id === id)?.name || ''
}

function selectTemplate(tpl) {
  activatingTpl.value = tpl
  slideTemplate.value = false
  slideActivate.value = true
}

function doActivate({ templateId, clientId, csmId }) {
  store.activateTemplate(templateId, clientId, csmId, auth.currentPlan)
  slideActivate.value = false
  activatingTpl.value = null
}

function openDetail(pb) {
  // Scroll into expanded view â already shown inline
}
</script>
