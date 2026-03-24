<template>
  <div class="fade-in" style="display: flex; height: 100%; overflow: hidden;">
    <!-- Left panel: Account list -->
    <div :style="{
      width: selectedAccount ? '340px' : undefined,
      flex: selectedAccount ? undefined : 1,
      borderRight: '1px solid var(--border)',
      overflow: 'auto', padding: '20px 16px',
      flexShrink: 0, minWidth: '290px'
    }">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <h2 style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; display: flex; align-items: center; gap: 6px;">
          <ScalyoIcon name="briefcase" :size="22" /> {{ t('portfolio') }}
        </h2>
        <div style="display: flex; gap: 6px;">
          <button class="btn-base" @click="openAddModal"
            style="font-size: 11px; padding: 6px 13px; border-radius: 20px; background: var(--greenBg, var(--tealBg)); border: 1px solid var(--greenBorder, var(--tealBorder)); color: var(--green, var(--teal));">
            + {{ t('add') }}
          </button>
          <button class="btn-base" @click="showImport = true"
            style="font-size: 11px; padding: 6px 13px; border-radius: 20px; background: var(--tealBg); border: 1px solid var(--tealBorder); color: var(--teal);">
            <ScalyoIcon name="upload" :size="12" /> {{ t('importPortfolio') }}
          </button>
        </div>
      </div>

      <!-- Starter plan limit alert -->
      <div v-if="isStarterPlan && portfolioStore.accounts.length >= 6"
        style="margin-bottom: 10px; padding: 9px 12px; background: var(--amberBg, #fef3cd); border: 1px solid var(--amberBorder, #ffc107); border-radius: 9px; font-size: 12px; color: var(--amber, #856404);">
        <ScalyoIcon name="warning" :size="12" /> Starter plan: max 6 accounts. Upgrade to add more.
      </div>

      <!-- Import success message -->
      <div v-if="importMsg" style="margin-bottom: 10px; padding: 9px 12px; background: var(--greenBg, var(--tealBg)); border: 1px solid var(--greenBorder, var(--tealBorder)); border-radius: 9px; font-size: 12px; color: var(--green, var(--teal));">
        {{ importMsg }}
      </div>

      <!-- Search -->
      <input v-model="search" :placeholder="t('searchAccount')"
        style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 9px 12px; color: var(--text); font-size: 13px; margin-bottom: 12px;" />

      <!-- Risk filters with counts -->
      <div style="display: flex; gap: 5px; margin-bottom: 14px; flex-wrap: wrap;">
        <button v-for="f in filterOptions" :key="f.value" class="btn-base" @click="setFilter(f.value)"
          :style="{
            fontSize: '11px', padding: '4px 11px', borderRadius: '20px',
            background: filter === f.value ? 'var(--tealBg)' : 'var(--surface)',
            border: '1px solid ' + (filter === f.value ? 'var(--tealBorder)' : 'var(--border)'),
            color: filter === f.value ? 'var(--teal)' : 'var(--muted)'
          }">
          {{ f.label }} <span style="margin-left: 3px; opacity: 0.7;">{{ f.count }}</span>
        </button>
      </div>

      <!-- CSM filter (shown when >2 CSMs) -->
      <div v-if="csmList.length > 2" style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 11px; color: var(--muted); font-weight: 700;">{{ t('filterCsm') }}:</span>
        <select v-model="csmFilter" @change="persistCsmFilter"
          style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 5px 10px; color: var(--text); font-size: 12px; cursor: pointer;">
          <option value="">{{ t('allCsm') }}</option>
          <option v-for="csm in csmList" :key="csm" :value="csm">{{ csm }}</option>
        </select>
      </div>

      <!-- Account list -->
      <template v-if="filteredAccounts.length">
        <div v-for="acc in filteredAccounts" :key="acc.id" class="row-item"
          @click="selectAccount(acc)"
          :style="{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 10px', borderRadius: '11px', marginBottom: '4px',
            background: selectedAccount?.id === acc.id ? 'var(--tealBg)' : undefined,
            border: '1px solid ' + (selectedAccount?.id === acc.id ? 'var(--tealBorder)' : 'transparent'),
            cursor: 'pointer', transition: 'all .12s'
          }">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
            <div style="width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; color: #fff;"
              :style="{ background: riskColor(acc.risk) }">
              {{ (acc.name || '?')[0] }}
            </div>
            <div style="min-width: 0;">
              <div style="font-weight: 700; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ acc.name }}</div>
              <div style="font-size: 11px; color: var(--muted);">{{ acc.csm || t('unassigned') }} · {{ fmtMRR(acc.mrr || acc.arr) }}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
            <RiskPill :risk="acc.risk" />
            <div style="font-size: 10px; color: var(--muted);">Score {{ acc.health || 70 }}</div>
          </div>
        </div>
      </template>
      <EmptyState v-else-if="!portfolioStore.loading" icon="mailbox"
        :title="portfolioStore.accounts.length === 0 ? t('portfolioEmpty') : t('noAccountMatch')"
        :action="'+ ' + t('newAccount')" @action="openAddModal" />
    </div>

    <!-- Right panel: Account detail -->
    <div v-if="selectedAccount" class="side-panel" style="width: 400px; border-left: 1px solid var(--border); overflow: auto; background: var(--bg1); flex-shrink: 0;">
      <!-- Header -->
      <div style="padding: 16px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; position: sticky; top: 0; background: var(--bg1); z-index: 10;">
        <div style="display: flex; align-items: center; gap: 11px; min-width: 0;">
          <div style="width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; flex-shrink: 0; color: #fff;"
            :style="{ background: riskColor(selectedAccount.risk) }">
            {{ (selectedAccount.name || '?')[0] }}
          </div>
          <div style="min-width: 0;">
            <div style="font-weight: 800; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ selectedAccount.name }}</div>
            <div style="font-size: 12px; color: var(--muted);">{{ selectedAccount.industry || '\u2014' }} · {{ selectedAccount.csm || t('unassigned') }}</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0;">
          <button @click.stop="startEdit" style="background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px;" :title="t('edit')">
            <ScalyoIcon name="pencil" :size="16" />
          </button>
          <button @click="removeAccount" style="background: none; border: none; color: var(--faint); cursor: pointer; padding: 4px;" :title="t('delete')">
            <ScalyoIcon name="trash" :size="16" />
          </button>
          <button @click="selectedAccount = null" style="background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px;">
            <ScalyoIcon name="close" :size="16" />
          </button>
        </div>
      </div>

      <div style="padding: 0 18px;">
        <!-- Tabs -->
        <div class="tab-bar" style="margin: 14px 0;">
          <div v-for="[key, label] in detailTabs" :key="key"
            class="tab-item" :class="{ active: detailTab === key }"
            @click="detailTab = key"
            style="flex: 1; text-align: center; font-size: 12px;">
            {{ label }}
          </div>
        </div>

        <!-- Overview tab -->
        <template v-if="detailTab === 'overview'">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px;">
            <div style="background: var(--surface); border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 15px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ fmtMRR(selectedAccount.mrr || selectedAccount.arr) }}</div>
              <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">MRR</div>
            </div>
            <div style="background: var(--surface); border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 15px; font-weight: 900; font-family: 'JetBrains Mono', monospace;">{{ selectedAccount.health || 70 }}</div>
              <div style="font-size: 10px; color: var(--muted); margin-top: 2px;">Health</div>
            </div>
            <div style="background: var(--surface); border-radius: 12px; padding: 12px; text-align: center;">
              <RiskPill :risk="selectedAccount.risk" />
              <div style="font-size: 10px; color: var(--muted); margin-top: 5px;">{{ riskLabel(selectedAccount.risk) }}</div>
            </div>
          </div>

          <!-- Health bar -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); margin-bottom: 5px;">
              <span>Health Score</span>
              <span style="font-weight: 700; color: var(--text);">{{ selectedAccount.health || 70 }}/100</span>
            </div>
            <HealthBar :val="selectedAccount.health || 70" />
          </div>

          <!-- Renewal -->
          <div style="margin-bottom: 14px; font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; padding: 10px 14px; background: var(--surface); border-radius: 10px;">
            <span>{{ t('renewal') }}</span>
            <span style="font-weight: 700;" :style="{ color: isRenewalOverdue(selectedAccount.renewal) ? 'var(--red)' : 'var(--green)' }">{{ selectedAccount.renewal || 'N/A' }}</span>
          </div>

          <!-- Issues/alerts -->
          <div v-if="accountIssues.length" class="card card-danger" style="margin-bottom: 12px; padding: 12px;">
            <div style="font-weight: 800; font-size: 13px; color: var(--red); margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
              <ScalyoIcon name="warning" :size="14" /> Alert signals
            </div>
            <div v-for="(issue, i) in accountIssues" :key="i" style="display: flex; gap: 8px; padding: 5px 0; font-size: 12px; line-height: 1.4;">
              <span style="color: var(--red); flex-shrink: 0;">&rarr;</span>
              <span>{{ issue }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedAccount.notes" style="background: var(--surface); border-radius: 12px; padding: 14px; font-size: 13px; color: var(--muted); margin-bottom: 16px;">
            {{ selectedAccount.notes }}
          </div>
        </template>

        <!-- Todo tab -->
        <template v-if="detailTab === 'todo'">
          <div style="padding-top: 4px; padding-bottom: 20px;">
            <!-- Standard action todos -->
            <div style="margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 13px; margin-bottom: 10px; color: var(--text);">Actions</div>
              <div v-for="todo in standardTodos" :key="todo.type"
                style="display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <input type="checkbox" :checked="todo.done" @change="toggleStandardTodo(todo)"
                  style="margin-top: 3px; cursor: pointer; accent-color: var(--teal);" />
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13px; font-weight: 600;" :style="{ textDecoration: todo.done ? 'line-through' : 'none', opacity: todo.done ? 0.5 : 1 }">
                    {{ todo.label }}
                  </div>
                  <div v-if="todo.date" style="font-size: 11px; color: var(--muted); margin-top: 2px;">{{ todo.date }}</div>
                  <div v-if="todo.notes" style="font-size: 11px; color: var(--muted); margin-top: 2px; font-style: italic;">{{ todo.notes }}</div>
                </div>
                <input type="date" :value="todo.date" @change="updateTodoDate(todo, $event.target.value)"
                  style="background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 3px 6px; font-size: 11px; color: var(--text); cursor: pointer;" />
              </div>
            </div>

            <!-- Custom free tasks -->
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 700; font-size: 13px; margin-bottom: 10px; color: var(--text); display: flex; justify-content: space-between; align-items: center;">
                <span>Custom tasks</span>
                <button class="btn-base" @click="addFreeTask"
                  style="font-size: 11px; padding: 3px 10px; border-radius: 16px; background: var(--tealBg); border: 1px solid var(--tealBorder); color: var(--teal);">
                  + {{ t('addFreeTask') || 'Add task' }}
                </button>
              </div>
              <div v-for="(task, idx) in freeTasks" :key="idx"
                style="display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <input type="checkbox" :checked="task.done" @change="toggleFreeTask(idx)"
                  style="margin-top: 3px; cursor: pointer; accent-color: var(--teal);" />
                <div style="flex: 1; min-width: 0;">
                  <input v-model="task.label" placeholder="Task description..."
                    style="width: 100%; background: transparent; border: none; font-size: 13px; font-weight: 600; color: var(--text); outline: none; padding: 0;"
                    :style="{ textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.5 : 1 }" />
                  <input v-model="task.notes" placeholder="Notes..."
                    style="width: 100%; background: transparent; border: none; font-size: 11px; color: var(--muted); outline: none; padding: 0; margin-top: 2px; font-style: italic;" />
                </div>
                <input type="date" v-model="task.date"
                  style="background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 3px 6px; font-size: 11px; color: var(--text); cursor: pointer;" />
                <button @click="removeFreeTask(idx)" style="background: none; border: none; color: var(--faint); cursor: pointer; padding: 2px;">
                  <ScalyoIcon name="close" :size="12" />
                </button>
              </div>
              <div v-if="!freeTasks.length" style="font-size: 12px; color: var(--muted); padding: 8px 0; text-align: center;">
                No custom tasks yet.
              </div>
            </div>

            <!-- Save todos button -->
            <button class="btn-base" @click="saveTodos" :disabled="savingTodos"
              style="width: 100%; padding: 10px; border-radius: 12px; font-size: 13px; background: var(--teal); color: #FFFFFF; margin-top: 8px;">
              {{ savingTodos ? t('saving') : t('save') }}
            </button>
          </div>
        </template>

        <!-- Edit tab -->
        <template v-if="detailTab === 'edit'">
          <div style="padding-top: 4px; padding-bottom: 20px;">
            <AppField :label="t('accNameLabel')" v-model="editForm.name" required />
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <AppField label="CSM" v-model="editForm.csm" />
              <div class="field-group">
                <label class="field-label">Industry</label>
                <select v-model="editForm.industry"
                  style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text); font-size: 13px; cursor: pointer;">
                  <option value="">--</option>
                  <option v-for="ind in industrySectors" :key="ind.value" :value="ind.value">{{ ind.label }}</option>
                </select>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <AppField :label="mrrLabel" v-model="editForm.mrr" type="number" />
              <AppField label="Health (0-100)" v-model="editForm.health" type="number" />
            </div>
            <AppField :label="t('renewal')" v-model="editForm.renewal" />
            <AppField label="Contact" v-model="editForm.contact" />
            <AppField label="Email" v-model="editForm.contact_email" type="email" />
            <AppField label="Notes" v-model="editForm.notes" type="textarea" />

            <div v-if="editError" style="margin-top: 8px; padding: 8px 12px; background: var(--redBg, #fdd); border: 1px solid var(--redBorder, #fbb); border-radius: 8px; font-size: 12px; color: var(--red);">
              {{ editError }}
            </div>

            <button class="btn-base" @click="saveEdit" :disabled="!editForm.name || saving"
              style="width: 100%; padding: 11px; border-radius: 12px; font-size: 13px; background: var(--teal); color: #FFFFFF; margin-top: 8px;">
              {{ saving ? t('saving') : t('saveAcc') }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Add account modal -->
    <AppModal v-if="showAdd" :title="t('newAccount')" @close="closeAddModal">
      <div v-if="addError" style="margin-bottom: 12px; padding: 8px 12px; background: var(--redBg, #fdd); border: 1px solid var(--redBorder, #fbb); border-radius: 8px; font-size: 12px; color: var(--red);">
        {{ addError }}
      </div>

      <AppField :label="t('accNameLabel')" v-model="newAcc.name" required />
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <AppField label="CSM" v-model="newAcc.csm" placeholder="CSM name" />
        <div class="field-group">
          <label class="field-label">Industry</label>
          <select v-model="newAcc.industry"
            style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text); font-size: 13px; cursor: pointer;">
            <option value="">--</option>
            <option v-for="ind in industrySectors" :key="ind.value" :value="ind.value">{{ ind.label }}</option>
          </select>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <AppField :label="mrrLabel" v-model="newAcc.mrr" type="number" placeholder="0" />
        <AppField label="Health (0-100)" v-model="newAcc.health" type="number" />
      </div>
      <AppField :label="t('renewal')" v-model="newAcc.renewal" />
      <AppField label="Contact" v-model="newAcc.contact" />
      <AppField label="Email" v-model="newAcc.contact_email" type="email" />
      <AppField label="Notes" v-model="newAcc.notes" type="textarea" />

      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button class="btn btn-secondary" @click="closeAddModal" style="flex: 1;">{{ t('cancel') }}</button>
        <button class="btn btn-primary" :disabled="!newAcc.name || creating" @click="createAccount" style="flex: 2;">
          {{ creating ? t('addingAcc') : t('createAcc') }}
        </button>
      </div>
    </AppModal>

    <!-- Import modal -->
    <AppModal v-if="showImport" :title="t('importPortfolio')" @close="showImport = false" maxWidth="600px">
      <!-- File drop zone -->
      <div v-if="!importFile" class="import-drop-zone" @click="$refs.fileInput.click()"
        @dragover.prevent @dragenter.prevent @drop.prevent="handleDrop">
        <input ref="fileInput" type="file" accept=".csv" style="display: none" @change="handleFileSelect" />
        <div style="margin-bottom: 12px;"><ScalyoIcon name="folder" :size="36" /></div>
        <div style="font-weight: 700;">{{ t('importDropTitle') || 'Drop your CSV file here or click to browse' }}</div>
        <div style="font-size: 12px; color: var(--muted); margin-top: 6px;">{{ t('importDropHint') || 'Supported: CSV' }}</div>
      </div>

      <!-- Column mapping preview -->
      <template v-if="importFile && importPreview.length && !importRunning">
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px;">{{ t('importPreviewTitle') || 'Column mapping preview' }}</div>
          <div style="background: var(--surface); border-radius: 10px; padding: 12px; font-size: 12px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th v-for="col in importHeaders" :key="col" style="text-align: left; padding: 4px 8px; border-bottom: 1px solid var(--border); font-weight: 700; color: var(--teal); font-size: 11px; text-transform: uppercase;">
                    {{ col }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in importPreview.slice(0, 3)" :key="i">
                  <td v-for="col in importHeaders" :key="col" style="padding: 4px 8px; border-bottom: 1px solid var(--border); color: var(--text); font-size: 12px;">
                    {{ row[col] || '\u2014' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="font-size: 11px; color: var(--muted); margin-top: 6px;">
            {{ importPreview.length }} {{ t('importRowsDetected') || 'rows detected' }}.
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" @click="resetImport" style="flex: 1;">{{ t('cancel') }}</button>
          <button class="btn btn-primary" @click="runImport" style="flex: 2;">{{ t('importBtn') || 'Import' }} {{ importPreview.length }} {{ t('accounts') || 'accounts' }}</button>
        </div>
      </template>

      <!-- Import progress -->
      <div v-if="importRunning" style="padding: 20px 0; text-align: center;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 12px;">{{ t('importing') || 'Importing...' }}</div>
        <div style="background: var(--surface); border-radius: 8px; height: 8px; overflow: hidden; margin-bottom: 8px;">
          <div style="height: 100%; background: var(--teal); border-radius: 8px; transition: width .3s;" :style="{ width: importProgress + '%' }"></div>
        </div>
        <div style="font-size: 12px; color: var(--muted);">{{ importDone }}/{{ importTotal }} accounts</div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePortfolioStore } from '../stores/portfolio'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { useI18n } from '../i18n'
import { useFormatting, CURRENCIES } from '../composables/useFormatting'
import { portfolioApi } from '../api'
import HealthBar from '../components/HealthBar.vue'
import RiskPill from '../components/RiskPill.vue'
import AppModal from '../components/AppModal.vue'
import AppField from '../components/AppField.vue'
import EmptyState from '../components/EmptyState.vue'
import ScalyoIcon from '../components/ScalyoIcon.vue'

const portfolioStore = usePortfolioStore()
const authStore = useAuthStore()
const prefsStore = usePreferencesStore()
const { t } = useI18n()
const { fmtMRR, fmtARR, riskColor, riskLabel, parseItems } = useFormatting()

// ─── State ───
const search = ref('')
const filter = ref('all')
const csmFilter = ref('')
const showAdd = ref(false)
const showImport = ref(false)
const selectedAccount = ref(null)
const detailTab = ref('overview')
const creating = ref(false)
const saving = ref(false)
const savingTodos = ref(false)
const editForm = ref({})
const editError = ref('')
const addError = ref('')
const importMsg = ref('')

// Import state
const importFile = ref(null)
const importHeaders = ref([])
const importPreview = ref([])
const importRunning = ref(false)
const importProgress = ref(0)
const importDone = ref(0)
const importTotal = ref(0)

// Todo state
const accountTodos = ref([])
const freeTasks = ref([])

const DRAFT_ADD_KEY = 'scalyo_draft_add_account'
const DRAFT_EDIT_KEY = 'scalyo_draft_edit_account'

const defaultNewAcc = () => ({ name: '', csm: '', mrr: 0, health: 70, risk: 'low', industry: '', contact: '', contact_email: '', notes: '', renewal: '' })
const newAcc = ref(defaultNewAcc())

// ─── Industry sectors ───
const industrySectors = computed(() => [
  { value: 'SaaS', label: 'SaaS' },
  { value: 'ERP', label: 'ERP' },
  { value: 'FinTech', label: 'FinTech' },
  { value: 'HealthTech', label: 'HealthTech' },
  { value: 'EdTech', label: 'EdTech' },
  { value: 'Manufacturing', label: t('Manufacturing') || 'Manufacturing' },
  { value: 'Retail', label: t('Retail') || 'Retail' },
  { value: 'Logistics', label: t('Logistics') || 'Logistics' },
  { value: 'Services', label: 'Services' },
  { value: 'RealEstate', label: t('RealEstate') || 'Real Estate' },
  { value: 'Media', label: 'Media' },
  { value: 'Other', label: t('Other') || 'Other' },
])

// ─── Plan check ───
const isStarterPlan = computed(() => {
  const plan = authStore.company?.plan || 'Starter'
  return plan === 'Starter'
})

// ─── Currency-aware MRR label ───
const mrrLabel = computed(() => {
  const cur = CURRENCIES[prefsStore.currency] || CURRENCIES.EUR
  return `MRR (${cur.symbol})`
})

// ─── Standard todo templates ───
const STANDARD_TODO_TYPES = [
  { type: 'call', label: 'Call client' },
  { type: 'meeting', label: 'Schedule meeting' },
  { type: 'email', label: 'Send follow-up email' },
  { type: 'qbr', label: 'Prepare QBR' },
  { type: 'renewal', label: 'Renewal check' },
  { type: 'health_check', label: 'Health check review' },
]

const standardTodos = computed(() => {
  return STANDARD_TODO_TYPES.map(tmpl => {
    const existing = accountTodos.value.find(t => t.type === tmpl.type)
    return {
      type: tmpl.type,
      label: tmpl.label,
      done: existing?.done || false,
      date: existing?.date || '',
      notes: existing?.notes || '',
      id: existing?.id || null,
    }
  })
})

// ─── Lifecycle ───
onMounted(() => {
  portfolioStore.fetchAccounts()
  restoreFilters()
  restoreAddDraft()
})

// ─── Filter persistence ───
function restoreFilters() {
  try {
    const savedFilter = localStorage.getItem('scalyo_pf_filter')
    if (savedFilter) filter.value = savedFilter
    const savedSearch = localStorage.getItem('scalyo_pf_search')
    if (savedSearch) search.value = savedSearch
    const savedCsm = localStorage.getItem('scalyo_pf_csm')
    if (savedCsm) csmFilter.value = savedCsm
  } catch {}
}

function setFilter(val) {
  filter.value = val
  try { localStorage.setItem('scalyo_pf_filter', val) } catch {}
}

function persistCsmFilter() {
  try { localStorage.setItem('scalyo_pf_csm', csmFilter.value) } catch {}
}

watch(search, (val) => {
  try { localStorage.setItem('scalyo_pf_search', val) } catch {}
})

// ─── Draft saving for Add modal ───
function restoreAddDraft() {
  try {
    const draft = localStorage.getItem(DRAFT_ADD_KEY)
    if (draft) {
      const parsed = JSON.parse(draft)
      if (parsed && parsed.name) newAcc.value = { ...defaultNewAcc(), ...parsed }
    }
  } catch {}
}

function saveAddDraft() {
  try { localStorage.setItem(DRAFT_ADD_KEY, JSON.stringify(newAcc.value)) } catch {}
}

function clearAddDraft() {
  try { localStorage.removeItem(DRAFT_ADD_KEY) } catch {}
}

watch(newAcc, saveAddDraft, { deep: true })

// ─── Draft saving for Edit form ───
function saveEditDraft() {
  try { localStorage.setItem(DRAFT_EDIT_KEY, JSON.stringify(editForm.value)) } catch {}
}

function clearEditDraft() {
  try { localStorage.removeItem(DRAFT_EDIT_KEY) } catch {}
}

function restoreEditDraft(accId) {
  try {
    const draft = localStorage.getItem(DRAFT_EDIT_KEY)
    if (draft) {
      const parsed = JSON.parse(draft)
      if (parsed && parsed.id === accId) return parsed
    }
  } catch {}
  return null
}

watch(editForm, saveEditDraft, { deep: true })

// ─── Account selection ───
function selectAccount(acc) {
  selectedAccount.value = selectedAccount.value?.id === acc.id ? null : acc
}

watch(selectedAccount, (acc) => {
  if (acc) {
    const draft = restoreEditDraft(acc.id)
    const base = { ...acc }
    // Ensure mrr is populated for edit form (legacy accounts may only have arr)
    if (!base.mrr && base.arr) base.mrr = base.arr / 12
    editForm.value = draft || base
    detailTab.value = 'overview'
    editError.value = ''
    loadAccountTodos(acc.id)
  } else {
    accountTodos.value = []
    freeTasks.value = []
  }
})

// ─── Tabs ───
const detailTabs = computed(() => [
  ['overview', t('apercu') || (prefsStore.lang === 'en' ? 'Overview' : prefsStore.lang === 'kr' ? '\uAC1C\uC694' : 'Aper\u00E7u')],
  ['todo', 'Todo'],
  ['edit', t('editBtn') || t('edit')],
])

// ─── Computed lists ───
const csmList = computed(() => {
  const csms = new Set(portfolioStore.accounts.map(a => a.csm).filter(Boolean))
  return [...csms].sort()
})

const filterCounts = computed(() => ({
  all: portfolioStore.accounts.length,
  critical: portfolioStore.accounts.filter(a => a.risk === 'critical').length,
  medium: portfolioStore.accounts.filter(a => a.risk === 'medium').length,
  low: portfolioStore.accounts.filter(a => a.risk === 'low').length,
}))

const filterOptions = computed(() => [
  { value: 'all', label: t('allAccounts'), count: filterCounts.value.all },
  { value: 'critical', label: t('filterCritical'), count: filterCounts.value.critical },
  { value: 'medium', label: t('filterWatch'), count: filterCounts.value.medium },
  { value: 'low', label: t('filterHealthy'), count: filterCounts.value.low },
])

const filteredAccounts = computed(() => {
  let list = portfolioStore.accounts
  if (filter.value !== 'all') list = list.filter(a => a.risk === filter.value)
  if (csmFilter.value) list = list.filter(a => a.csm === csmFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(a => a.name.toLowerCase().includes(q) || (a.csm || '').toLowerCase().includes(q))
  }
  return list
})

const accountIssues = computed(() => {
  if (!selectedAccount.value) return []
  return parseItems(selectedAccount.value.issues)
})

// ─── Helpers ───
function isRenewalOverdue(renewal) {
  if (!renewal) return false
  if (renewal.includes('\u2212') || renewal.includes('-')) {
    const d = new Date(renewal)
    return !isNaN(d) && d < new Date()
  }
  return false
}

function computeRisk(health) {
  const h = parseInt(health) || 70
  return h >= 70 ? 'low' : h >= 40 ? 'medium' : 'critical'
}

// ─── Add modal ───
function openAddModal() {
  if (isStarterPlan.value && portfolioStore.accounts.length >= 6) return
  addError.value = ''
  showAdd.value = true
}

function closeAddModal() {
  showAdd.value = false
}

async function createAccount() {
  if (!newAcc.value.name) {
    addError.value = t('accountNameRequired') || t('nameRequired') || 'Account name is required'
    return
  }
  creating.value = true
  addError.value = ''
  try {
    const h = parseInt(newAcc.value.health) || 70
    const mrr = parseFloat(newAcc.value.mrr) || 0
    await portfolioStore.createAccount({
      ...newAcc.value,
      mrr,
      arr: mrr * 12,
      health: h,
      risk: computeRisk(h),
    })
    newAcc.value = defaultNewAcc()
    clearAddDraft()
    showAdd.value = false
  } catch (e) {
    addError.value = e?.response?.data?.error || e?.response?.data?.detail || t('errUnexpected') || 'An unexpected error occurred'
    console.error('createAccount error:', e)
  }
  creating.value = false
}

// ─── Edit ───
function startEdit() {
  if (selectedAccount.value) {
    const draft = restoreEditDraft(selectedAccount.value.id)
    editForm.value = draft || { ...selectedAccount.value }
  }
  detailTab.value = 'edit'
}

async function saveEdit() {
  if (!editForm.value.name) {
    editError.value = t('nameRequired') || 'Name is required'
    return
  }
  saving.value = true
  editError.value = ''
  try {
    const h = parseInt(editForm.value.health) || 70
    const mrr = parseFloat(editForm.value.mrr) || 0
    const payload = {
      ...editForm.value,
      mrr,
      arr: mrr * 12,
      health: h,
      risk: computeRisk(h),
    }
    const updated = await portfolioStore.updateAccount(selectedAccount.value.id, payload)
    selectedAccount.value = updated
    clearEditDraft()
    detailTab.value = 'overview'
  } catch (e) {
    editError.value = e?.response?.data?.error || e?.response?.data?.detail || t('errUnexpected') || 'An unexpected error occurred'
    console.error('updateAccount error:', e)
  }
  saving.value = false
}

// ─── Delete ───
async function removeAccount() {
  if (!selectedAccount.value) return
  if (!confirm(t('confirmDelete'))) return
  await portfolioStore.deleteAccount(selectedAccount.value.id)
  selectedAccount.value = null
}

// ─── Todos ───
async function loadAccountTodos(accountId) {
  try {
    const { data } = await portfolioApi.getTodos(accountId)
    const todos = data.results || data || []
    accountTodos.value = todos.filter(t => t.type && t.type !== 'free')
    freeTasks.value = todos.filter(t => t.type === 'free').map(t => ({
      id: t.id,
      label: t.label || t.title || '',
      done: t.done || false,
      date: t.date || '',
      notes: t.notes || '',
    }))
  } catch (e) {
    console.error('loadTodos error:', e)
    accountTodos.value = []
    freeTasks.value = []
  }
}

async function toggleStandardTodo(todo) {
  if (!selectedAccount.value) return
  const accId = selectedAccount.value.id
  const newDone = !todo.done
  try {
    if (todo.id) {
      await portfolioApi.updateTodo(accId, todo.id, { done: newDone })
    } else {
      await portfolioApi.createTodo(accId, { type: todo.type, label: todo.label, done: newDone, date: todo.date })
    }
    await loadAccountTodos(accId)
  } catch (e) {
    console.error('toggleTodo error:', e)
  }
}

async function updateTodoDate(todo, date) {
  if (!selectedAccount.value) return
  const accId = selectedAccount.value.id
  try {
    if (todo.id) {
      await portfolioApi.updateTodo(accId, todo.id, { date })
    } else {
      await portfolioApi.createTodo(accId, { type: todo.type, label: todo.label, done: false, date })
    }
    await loadAccountTodos(accId)
  } catch (e) {
    console.error('updateTodoDate error:', e)
  }
}

function addFreeTask() {
  freeTasks.value.push({ label: '', done: false, date: '', notes: '', id: null })
}

function toggleFreeTask(idx) {
  freeTasks.value[idx].done = !freeTasks.value[idx].done
}

function removeFreeTask(idx) {
  const task = freeTasks.value[idx]
  freeTasks.value.splice(idx, 1)
  if (task.id && selectedAccount.value) {
    portfolioApi.deleteTodo(selectedAccount.value.id, task.id).catch(() => {})
  }
}

async function saveTodos() {
  if (!selectedAccount.value) return
  savingTodos.value = true
  const accId = selectedAccount.value.id
  try {
    for (const task of freeTasks.value) {
      if (task.id) {
        await portfolioApi.updateTodo(accId, task.id, {
          type: 'free', label: task.label, done: task.done, date: task.date, notes: task.notes,
        })
      } else if (task.label) {
        await portfolioApi.createTodo(accId, {
          type: 'free', label: task.label, done: task.done, date: task.date, notes: task.notes,
        })
      }
    }
    await loadAccountTodos(accId)
  } catch (e) {
    console.error('saveTodos error:', e)
  }
  savingTodos.value = false
}

// ─── Import ───
function handleFileSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  importFile.value = file
  parseImportFile(file)
}

function handleDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  if (!file.name.endsWith('.csv')) return
  importFile.value = file
  parseImportFile(file)
}

function parseImportFile(file) {
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const text = event.target.result
      const lines = text.split('\n').filter(l => l.trim())
      if (lines.length < 2) { resetImport(); return }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      importHeaders.value = headers
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim())
        const obj = {}
        headers.forEach((h, i) => { obj[h] = vals[i] || '' })
        return obj
      }).filter(r => r.name || r.account)
      importPreview.value = rows
    } catch {
      resetImport()
    }
  }
  reader.readAsText(file)
}

function resetImport() {
  importFile.value = null
  importHeaders.value = []
  importPreview.value = []
  importRunning.value = false
  importProgress.value = 0
  importDone.value = 0
  importTotal.value = 0
}

async function runImport() {
  // Check plan limit before importing
  if (isStarterPlan.value) {
    const currentCount = portfolioStore.accounts.length
    const maxAccounts = 6
    if (currentCount >= maxAccounts) {
      importMsg.value = 'Starter plan: max 6 accounts reached. Upgrade to import more.'
      setTimeout(() => { importMsg.value = '' }, 5000)
      return
    }
  }

  importRunning.value = true
  const rows = importPreview.value
  importTotal.value = rows.length
  importDone.value = 0
  importProgress.value = 0

  let ok = 0
  for (const row of rows) {
    try {
      const h = parseInt(row.health || '70') || 70
      const importMrr = parseFloat(row.mrr || '0') || 0
      const importArr = parseFloat(row.arr || '0') || (importMrr * 12)
      await portfolioStore.createAccount({
        name: row.name || row.account || '',
        csm: row.csm || '',
        mrr: importMrr,
        arr: importArr,
        health: h,
        risk: computeRisk(h),
        industry: row.industry || '',
        contact: row.contact || '',
        contact_email: row.email || row.contact_email || '',
        notes: row.notes || '',
        renewal: row.renewal || '',
      })
      ok++
    } catch {}
    importDone.value++
    importProgress.value = Math.round((importDone.value / importTotal.value) * 100)
  }

  showImport.value = false
  resetImport()
  await portfolioStore.fetchAccounts()
  importMsg.value = `${ok}/${rows.length} accounts imported`
  setTimeout(() => { importMsg.value = '' }, 5000)
}
</script>
