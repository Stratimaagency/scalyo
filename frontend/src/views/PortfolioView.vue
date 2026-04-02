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
            style="font-size: 13px; padding: 6px 13px; border-radius: 20px; background: var(--greenBg, var(--tealBg)); border: 1px solid var(--greenBorder, var(--tealBorder)); color: var(--green, var(--teal));">
            + {{ t('add') }}
          </button>
          <button class="btn-base" @click="showImport = true"
            style="font-size: 13px; padding: 6px 13px; border-radius: 20px; background: var(--tealBg); border: 1px solid var(--tealBorder); color: var(--teal);">
            <ScalyoIcon name="upload" :size="12" /> {{ t('importPortfolio') }}
          </button>
          <button v-if="isManager && portfolioStore.accounts.length > 0" class="btn-base" @click="showBulkDelete = true"
            style="font-size: 13px; padding: 6px 13px; border-radius: 20px; background: var(--redBg); border: 1px solid var(--redBorder); color: var(--red);">
            <ScalyoIcon name="trash" :size="12" /> {{ t('bulkDelete') }}
          </button>
        </div>
      </div>

      <!-- Starter plan limit alert -->
      <div v-if="isStarterPlan && portfolioStore.accounts.length >= 6"
        style="margin-bottom: 10px; padding: 9px 12px; background: var(--amberBg, #fef3cd); border: 1px solid var(--amberBorder, #ffc107); border-radius: 9px; font-size: 12px; color: var(--amber, #856404);">
        <ScalyoIcon name="warning" :size="12" /> {{ t('starterLimitAlert') }}
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
        <span style="font-size: 13px; color: #2d3748; font-weight: 700;">{{ t('filterCsm') }}:</span>
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
              <div style="font-size: 13px; color: #2d3748;">{{ acc.csm || t('unassigned') }} · {{ fmtMRR(acc.mrr ?? acc.arr) }}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
            <RiskPill :risk="acc.risk" />
            <div style="font-size: 12px; color: #2d3748;">Score {{ acc.health || 70 }}</div>
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
            <div style="font-size: 12px; color: #2d3748;">{{ selectedAccount.industry || '\u2014' }} · {{ selectedAccount.csm || t('unassigned') }}</div>
          </div>
        </div>
        <div style="display: flex; gap: 6px; flex-shrink: 0;">
          <button class="btn btn-secondary" @click.stop="startEdit" style="font-size: 12px; padding: 6px 12px; display: flex; align-items: center; gap: 4px;">
            <ScalyoIcon name="pencil" :size="12" /> {{ t('edit') }}
          </button>
          <button class="btn btn-secondary" @click="removeAccount" style="font-size: 12px; padding: 6px 12px; display: flex; align-items: center; gap: 4px; color: var(--red);">
            <ScalyoIcon name="trash" :size="12" /> {{ t('delete') }}
          </button>
          <button class="btn btn-secondary" @click="selectedAccount = null" style="font-size: 12px; padding: 6px 12px;">
            <ScalyoIcon name="close" :size="12" />
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
              <div style="font-size: 15px; font-weight: 900; color: var(--teal); font-family: 'JetBrains Mono', monospace;">{{ fmtMRR(selectedAccount.mrr ?? selectedAccount.arr) }}</div>
              <div style="font-size: 12px; color: #2d3748; margin-top: 2px;">MRR</div>
            </div>
            <div style="background: var(--surface); border-radius: 12px; padding: 12px; text-align: center;">
              <div style="font-size: 15px; font-weight: 900; font-family: 'JetBrains Mono', monospace;">{{ selectedAccount.health || 70 }}</div>
              <div style="font-size: 12px; color: #2d3748; margin-top: 2px;">{{ t('health') }}</div>
            </div>
            <div style="background: var(--surface); border-radius: 12px; padding: 12px; text-align: center;">
              <RiskPill :risk="selectedAccount.risk" />
              <div style="font-size: 12px; color: #2d3748; margin-top: 5px;">{{ riskLabel(selectedAccount.risk) }}</div>
            </div>
          </div>

          <!-- Health bar -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #2d3748; margin-bottom: 5px;">
              <span>{{ t('healthScore') }}</span>
              <span style="font-weight: 700; color: var(--text);">{{ selectedAccount.health || 70 }}/100</span>
            </div>
            <HealthBar :val="selectedAccount.health || 70" />
          </div>

          <!-- Renewal -->
          <div style="margin-bottom: 14px; font-size: 12px; color: #2d3748; display: flex; justify-content: space-between; padding: 10px 14px; background: var(--surface); border-radius: 10px;">
            <span>{{ t('renewal') }}</span>
            <span style="font-weight: 700;" :style="{ color: isRenewalOverdue(selectedAccount.renewal) ? 'var(--red)' : 'var(--green)' }">{{ selectedAccount.renewal || 'N/A' }}</span>
          </div>

          <!-- Issues/alerts -->
          <div v-if="accountIssues.length" class="card card-danger" style="margin-bottom: 12px; padding: 12px;">
            <div style="font-weight: 800; font-size: 13px; color: var(--red); margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
              <ScalyoIcon name="warning" :size="14" /> {{ t('alertSignals') }}
            </div>
            <div v-for="(issue, i) in accountIssues" :key="i" style="display: flex; gap: 8px; padding: 5px 0; font-size: 12px; line-height: 1.4;">
              <span style="color: var(--red); flex-shrink: 0;">&rarr;</span>
              <span>{{ issue }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedAccount.notes" style="background: var(--surface); border-radius: 12px; padding: 14px; font-size: 13px; color: #2d3748; margin-bottom: 16px;">
            {{ selectedAccount.notes }}
          </div>
        </template>

        <!-- 360° tab — All modules linked -->
        <template v-if="detailTab === '360'">
          <div v-if="loading360" style="text-align: center; padding: 20px; color: #2d3748; font-size: 13px;">{{ t('loading') }}</div>
          <div v-else style="padding-top: 4px; padding-bottom: 20px;">

            <!-- KPIs snapshot -->
            <div style="margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 12px; color: #2d3748; text-transform: uppercase; margin-bottom: 8px;">📊 KPIs</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
                <div style="background: var(--surface); border-radius: 8px; padding: 10px; text-align: center;">
                  <div style="font-size: 16px; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--teal);">{{ fmtARR(selectedAccount.arr || (selectedAccount.mrr || 0) * 12) }}</div>
                  <div style="font-size: 9px; color: #2d3748;">ARR</div>
                </div>
                <div style="background: var(--surface); border-radius: 8px; padding: 10px; text-align: center;">
                  <div style="font-size: 16px; font-weight: 900; font-family: 'JetBrains Mono', monospace;" :style="{ color: (selectedAccount.health || 0) >= 70 ? 'var(--green)' : (selectedAccount.health || 0) >= 50 ? '#f59e0b' : 'var(--red)' }">{{ selectedAccount.health || 0 }}</div>
                  <div style="font-size: 9px; color: #2d3748;">Health</div>
                </div>
                <div style="background: var(--surface); border-radius: 8px; padding: 10px; text-align: center;">
                  <RiskPill :risk="selectedAccount.risk || 'low'" />
                  <div style="font-size: 9px; color: #2d3748; margin-top: 4px;">{{ t('smartImportRisk') }}</div>
                </div>
              </div>
            </div>

            <!-- Infos client -->
            <div style="margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 12px; color: #2d3748; text-transform: uppercase; margin-bottom: 8px;">👤 {{ t('contact') }}</div>
              <div style="background: var(--surface); border-radius: 8px; padding: 12px; font-size: 13px;">
                <div v-if="selectedAccount.contact" style="margin-bottom: 4px;"><strong>{{ selectedAccount.contact }}</strong></div>
                <div v-if="selectedAccount.contact_email" style="color: var(--teal);">{{ selectedAccount.contact_email }}</div>
                <div v-if="selectedAccount.industry" style="color: #2d3748; margin-top: 4px;">{{ t('industry') }}: {{ selectedAccount.industry }}</div>
                <div v-if="selectedAccount.csm" style="color: #2d3748; margin-top: 4px;">CSM: {{ selectedAccount.csm }}</div>
                <div v-if="selectedAccount.renewal" style="margin-top: 4px;" :style="{ color: isRenewalOverdue(selectedAccount.renewal) ? 'var(--red)' : 'var(--muted)' }">{{ t('renewalLabel') }}: {{ selectedAccount.renewal }}</div>
                <div v-if="!selectedAccount.contact && !selectedAccount.contact_email" style="color: #2d3748; font-style: italic;">{{ t('copilNoContact') }}</div>
              </div>
            </div>

            <!-- Tasks liées -->
            <div style="margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 12px; color: #2d3748; text-transform: uppercase; margin-bottom: 8px;">✅ {{ t('tasks') }} ({{ clientTasks.length }})</div>
              <div v-if="clientTasks.length">
                <div v-for="(task, i) in clientTasks.slice(0, 8)" :key="i" style="display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border);">
                  <span style="width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;" :style="{ background: task.color === 'red' ? 'var(--red)' : task.color === 'orange' ? '#f59e0b' : 'var(--teal)' }"></span>
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ task.title }}</div>
                    <div v-if="task.due" style="font-size: 12px; color: #2d3748;">{{ task.due }}</div>
                  </div>
                  <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: var(--surface); color: #2d3748;">{{ task.status || task.quadrant }}</span>
                </div>
              </div>
              <div v-else style="font-size: 12px; color: #2d3748; font-style: italic; padding: 8px 0;">{{ t('copilNoTasks') }}</div>
            </div>

            <!-- Événements / RDV -->
            <div style="margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 12px; color: #2d3748; text-transform: uppercase; margin-bottom: 8px;">📅 {{ t('planning') }} ({{ clientEvents.length }})</div>
              <div v-if="clientEvents.length">
                <div v-for="(ev, i) in clientEvents.slice(0, 5)" :key="i" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                  <div style="font-size: 12px; font-weight: 600;">{{ ev.title }}</div>
                  <div style="font-size: 13px; color: #2d3748;">{{ ev.date }} {{ ev.startTime || '' }}</div>
                </div>
              </div>
              <div v-else style="font-size: 12px; color: #2d3748; font-style: italic; padding: 8px 0;">{{ t('copilNoEvents') }}</div>
            </div>

            <!-- Devis liés -->
            <div style="margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 12px; color: #2d3748; text-transform: uppercase; margin-bottom: 8px;">📄 {{ t('quotes') }} ({{ clientQuotes.length }})</div>
              <div v-if="clientQuotes.length">
                <div v-for="(q, i) in clientQuotes.slice(0, 5)" :key="i" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                  <div>
                    <div style="font-size: 12px; font-weight: 600;">{{ q.title }}</div>
                    <div style="font-size: 12px; color: #2d3748;">{{ q.date }}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace;">{{ q.amount }}€</div>
                    <span style="font-size: 12px; padding: 1px 6px; border-radius: 4px;" :style="{ background: q.status === 'won' ? 'var(--greenBg)' : q.status === 'lost' ? 'var(--redBg)' : 'var(--surface)', color: q.status === 'won' ? 'var(--green)' : q.status === 'lost' ? 'var(--red)' : 'var(--muted)' }">{{ q.status }}</span>
                  </div>
                </div>
              </div>
              <div v-else style="font-size: 12px; color: #2d3748; font-style: italic; padding: 8px 0;">{{ t('copilNoQuotes') }}</div>
            </div>

            <!-- Notes -->
            <div v-if="selectedAccount.notes" style="margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 12px; color: #2d3748; text-transform: uppercase; margin-bottom: 8px;">📝 {{ t('notes') }}</div>
              <div style="background: var(--surface); border-radius: 8px; padding: 12px; font-size: 13px; color: #2d3748; line-height: 1.6;">{{ selectedAccount.notes }}</div>
            </div>

            <!-- Situation résumé -->
            <div style="background: var(--tealBg); border: 1px solid var(--tealBorder); border-radius: 10px; padding: 14px;">
              <div style="font-weight: 700; font-size: 12px; color: var(--teal); margin-bottom: 6px;">🧠 {{ t('copilSituation') }}</div>
              <div style="font-size: 12px; color: #2d3748; line-height: 1.6;">
                {{ selectedAccount.name }} — {{ selectedAccount.risk === 'critical' ? t('copilSituationCritical') : selectedAccount.risk === 'medium' ? t('copilSituationWatch') : t('copilSituationHealthy') }}
                {{ clientTasks.length ? t('copilSituationTasks').replace('{n}', clientTasks.length) : '' }}
                {{ clientEvents.length ? t('copilSituationEvents').replace('{n}', clientEvents.length) : '' }}
                {{ selectedAccount.renewal ? t('copilSituationRenewal').replace('{date}', selectedAccount.renewal) : '' }}
              </div>
            </div>
          </div>
        </template>

        <!-- Todo tab -->
        <template v-if="detailTab === 'todo'">
          <div style="padding-top: 4px; padding-bottom: 20px;">
            <!-- Standard action todos -->
            <div style="margin-bottom: 16px;">
              <div style="font-weight: 700; font-size: 13px; margin-bottom: 10px; color: var(--text);">{{ t('actions') }}</div>
              <div v-for="todo in standardTodos" :key="todo.type"
                style="display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <input type="checkbox" :checked="todo.done" @change="toggleStandardTodo(todo)"
                  style="margin-top: 3px; cursor: pointer; accent-color: var(--teal);" />
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13px; font-weight: 600;" :style="{ textDecoration: todo.done ? 'line-through' : 'none', opacity: todo.done ? 0.5 : 1 }">
                    {{ todo.label }}
                  </div>
                  <div v-if="todo.date" style="font-size: 13px; color: #2d3748; margin-top: 2px;">{{ todo.date }}</div>
                  <div v-if="todo.notes" style="font-size: 13px; color: #2d3748; margin-top: 2px; font-style: italic;">{{ todo.notes }}</div>
                </div>
                <input type="date" :value="todo.date" @change="updateTodoDate(todo, $event.target.value)"
                  style="background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 3px 6px; font-size: 13px; color: var(--text); cursor: pointer;" />
              </div>
            </div>

            <!-- Custom free tasks -->
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 700; font-size: 13px; margin-bottom: 10px; color: var(--text); display: flex; justify-content: space-between; align-items: center;">
                <span>{{ t('customTasks') }}</span>
                <button class="btn-base" @click="addFreeTask"
                  style="font-size: 13px; padding: 3px 10px; border-radius: 16px; background: var(--tealBg); border: 1px solid var(--tealBorder); color: var(--teal);">
                  + {{ t('addFreeTask') }}
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
                    style="width: 100%; background: transparent; border: none; font-size: 13px; color: #2d3748; outline: none; padding: 0; margin-top: 2px; font-style: italic;" />
                </div>
                <input type="date" v-model="task.date"
                  style="background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 3px 6px; font-size: 13px; color: var(--text); cursor: pointer;" />
                <button @click="removeFreeTask(idx)" style="background: none; border: 1px solid var(--border); border-radius: 6px; color: var(--red); cursor: pointer; padding: 4px 8px; font-size: 13px; display: flex; align-items: center; gap: 3px;">
                  <ScalyoIcon name="close" :size="10" /> {{ t('removeTask') }}
                </button>
              </div>
              <div v-if="!freeTasks.length" style="font-size: 12px; color: #2d3748; padding: 8px 0; text-align: center;">
                {{ t('noCustomTasks') }}
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
              <div class="field-group">
                <label class="field-label">{{ t('csmLabel') }}</label>
                <select v-model="editForm.csm"
                  style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text); font-size: 13px; cursor: pointer;">
                  <option value="">{{ t('unassigned') }}</option>
                  <option v-for="m in teamMembers" :key="m.id" :value="m.display_name || m.email">{{ m.display_name || m.email }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">{{ t('industry') }}</label>
                <select v-model="editForm.industry"
                  style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text); font-size: 13px; cursor: pointer;">
                  <option value="">--</option>
                  <option v-for="ind in industrySectors" :key="ind.value" :value="ind.value">{{ ind.label }}</option>
                </select>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <AppField :label="mrrLabel" v-model="editForm.mrr" type="number" />
              <AppField :label="t('healthScore') + ' (0-100)'" v-model="editForm.health" type="number" />
            </div>
            <AppField :label="t('renewal')" v-model="editForm.renewal" />
            <AppField :label="t('contact')" v-model="editForm.contact" />
            <AppField :label="t('emailPro')" v-model="editForm.contact_email" type="email" />
            <AppField :label="t('notes')" v-model="editForm.notes" type="textarea" />

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
        <div class="field-group">
          <label class="field-label">{{ t('csmLabel') }}</label>
          <select v-model="newAcc.csm"
            style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text); font-size: 13px; cursor: pointer;">
            <option value="">{{ t('unassigned') }}</option>
            <option v-for="m in teamMembers" :key="m.id" :value="m.display_name || m.email">{{ m.display_name || m.email }}</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">{{ t('industry') }}</label>
          <select v-model="newAcc.industry"
            style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; color: var(--text); font-size: 13px; cursor: pointer;">
            <option value="">--</option>
            <option v-for="ind in industrySectors" :key="ind.value" :value="ind.value">{{ ind.label }}</option>
          </select>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <AppField :label="mrrLabel" v-model="newAcc.mrr" type="number" placeholder="0" />
        <AppField :label="t('healthScore') + ' (0-100)'" v-model="newAcc.health" type="number" />
      </div>
      <AppField :label="t('renewal')" v-model="newAcc.renewal" />
      <AppField :label="t('contact')" v-model="newAcc.contact" />
      <AppField :label="t('emailPro')" v-model="newAcc.contact_email" type="email" />
      <AppField :label="t('notes')" v-model="newAcc.notes" type="textarea" />

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
        <div style="font-size: 12px; color: #2d3748; margin-top: 6px;">{{ t('importDropHint') || 'Supported: CSV' }}</div>
      </div>

      <!-- Column mapping preview -->
      <template v-if="importFile && importPreview.length && !importRunning">
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 8px;">{{ t('importPreviewTitle') || 'Column mapping preview' }}</div>
          <div style="background: var(--surface); border-radius: 10px; padding: 12px; font-size: 12px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th v-for="col in importHeaders" :key="col" style="text-align: left; padding: 4px 8px; border-bottom: 1px solid var(--border); font-weight: 700; color: var(--teal); font-size: 13px; text-transform: uppercase;">
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
          <div style="font-size: 13px; color: #2d3748; margin-top: 6px;">
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
        <div style="font-size: 12px; color: #2d3748;">{{ importDone }}/{{ importTotal }} {{ t('portfolio').toLowerCase() }}</div>
      </div>
    </AppModal>

    <!-- BULK DELETE MODAL — Double security -->
    <AppModal v-if="showBulkDelete" :title="t('bulkDeleteTitle')" @close="closeBulkDelete">
      <!-- Step 1: Choose what to delete -->
      <div v-if="bulkDeleteStep === 1">
        <p style="font-size: 13px; color: #2d3748; margin-bottom: 16px;">{{ t('bulkDeleteDesc') }}</p>

        <!-- Delete all -->
        <div class="card" style="padding: 14px; margin-bottom: 8px; cursor: pointer; border: 2px solid transparent;" :style="{ borderColor: bulkDeleteMode === 'all' ? 'var(--red)' : 'transparent' }" @click="bulkDeleteMode = 'all'">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="radio" v-model="bulkDeleteMode" value="all" />
            <div>
              <div style="font-weight: 700; font-size: 14px; color: var(--red);">🗑️ {{ t('bulkDeleteAll') }}</div>
              <div style="font-size: 12px; color: #2d3748;">{{ portfolioStore.accounts.length }} {{ t('portfolio').toLowerCase() }}</div>
            </div>
          </div>
        </div>

        <!-- Delete filtered -->
        <div v-if="filteredAccounts.length !== portfolioStore.accounts.length" class="card" style="padding: 14px; margin-bottom: 8px; cursor: pointer; border: 2px solid transparent;" :style="{ borderColor: bulkDeleteMode === 'filtered' ? 'var(--red)' : 'transparent' }" @click="bulkDeleteMode = 'filtered'">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="radio" v-model="bulkDeleteMode" value="filtered" />
            <div>
              <div style="font-weight: 700; font-size: 14px;">🔍 {{ t('bulkDeleteFiltered') }}</div>
              <div style="font-size: 12px; color: #2d3748;">{{ filteredAccounts.length }} {{ t('portfolio').toLowerCase() }} ({{ filter || t('search') }})</div>
            </div>
          </div>
        </div>

        <!-- Delete selected -->
        <div class="card" style="padding: 14px; margin-bottom: 16px; cursor: pointer; border: 2px solid transparent;" :style="{ borderColor: bulkDeleteMode === 'selected' ? 'var(--red)' : 'transparent' }" @click="bulkDeleteMode = 'selected'">
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="radio" v-model="bulkDeleteMode" value="selected" />
            <div>
              <div style="font-weight: 700; font-size: 14px;">☑️ {{ t('bulkDeleteSelected') }}</div>
              <div style="font-size: 12px; color: #2d3748;">{{ t('bulkDeleteSelectedDesc') }}</div>
            </div>
          </div>
        </div>

        <!-- Select individual accounts (only if mode = selected) -->
        <div v-if="bulkDeleteMode === 'selected'" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border); border-radius: 8px; padding: 8px; margin-bottom: 16px;">
          <label v-for="acc in filteredAccounts" :key="acc.id" style="display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; cursor: pointer;">
            <input type="checkbox" :value="acc.id" v-model="bulkDeleteIds" />
            {{ acc.name }} <span style="color: #2d3748; font-size: 13px;">· {{ acc.csm || '—' }}</span>
          </label>
        </div>

        <button class="btn btn-primary" style="width: 100%; justify-content: center; background: var(--red); border-color: var(--red);" :disabled="bulkDeleteMode === 'selected' && bulkDeleteIds.length === 0" @click="bulkDeleteStep = 2">
          {{ t('bulkDeleteNext') }} →
        </button>
      </div>

      <!-- Step 2: CONFIRM — type to confirm -->
      <div v-if="bulkDeleteStep === 2">
        <div style="background: var(--redBg); border: 1px solid var(--redBorder); border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <p style="font-size: 14px; font-weight: 700; color: var(--red); margin-bottom: 8px;">⚠️ {{ t('bulkDeleteWarning') }}</p>
          <p style="font-size: 13px; color: var(--red);">
            {{ bulkDeleteMode === 'all' ? portfolioStore.accounts.length : bulkDeleteMode === 'filtered' ? filteredAccounts.length : bulkDeleteIds.length }} {{ t('bulkDeleteCountMsg') }}
          </p>
        </div>

        <p style="font-size: 13px; color: #2d3748; margin-bottom: 8px;">{{ t('bulkDeleteTypeConfirm') }}</p>
        <input v-model="bulkDeleteConfirmText" :placeholder="t('bulkDeleteTypePlaceholder')" style="width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px; color: var(--text); font-size: 14px; margin-bottom: 16px;" />

        <div style="display: flex; gap: 8px;">
          <button class="btn" style="flex: 1; justify-content: center; padding: 12px; background: var(--red); color: #fff; border: none; border-radius: 10px; font-weight: 800; cursor: pointer;"
            :disabled="bulkDeleteConfirmText !== t('bulkDeleteTypePlaceholder') || bulkDeleting"
            @click="executeBulkDelete">
            {{ bulkDeleting ? '...' : t('bulkDeleteConfirmBtn') }}
          </button>
          <button class="btn btn-secondary" @click="bulkDeleteStep = 1">{{ t('back') }}</button>
        </div>
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
import { portfolioApi, teamApi, taskApi, planningApi, quotesApi } from '../api'
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
const showBulkDelete = ref(false)
const bulkDeleteStep = ref(1)
const bulkDeleteMode = ref('all')
const bulkDeleteIds = ref([])
const bulkDeleteConfirmText = ref('')
const bulkDeleting = ref(false)
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
const isManager = computed(() => authStore.user?.role === 'manager')

// 360° data
const clientTasks = ref([])
const clientEvents = ref([])
const clientQuotes = ref([])
const loading360 = ref(false)

async function load360Data(accountName) {
  if (!accountName) return
  loading360.value = true
  try {
    // Load tasks (from JSON blob — filter by account name)
    const { data: taskData } = await taskApi.getTasks()
    const allTasks = taskData.tasks || []
    clientTasks.value = allTasks.filter(t => t.account && t.account.toLowerCase() === accountName.toLowerCase())

    // Load events (from JSON blob — filter by account)
    const { data: eventData } = await planningApi.getEvents()
    const allEvents = eventData.events || []
    clientEvents.value = allEvents.filter(e => e.account && e.account.toLowerCase() === accountName.toLowerCase())

    // Load quotes (filter by client name)
    try {
      const { data: quotesData } = await quotesApi.list()
      const allQuotes = Array.isArray(quotesData) ? quotesData : (quotesData.results || [])
      clientQuotes.value = allQuotes.filter(q => q.client && q.client.toLowerCase() === accountName.toLowerCase())
    } catch { clientQuotes.value = [] }
  } catch (e) {
    console.error('360 data load error:', e)
  }
  loading360.value = false
}

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
const STANDARD_TODO_TYPES = computed(() => {
  const l = prefsStore.lang
  return [
    { type: 'call', label: l === 'en' ? 'Call client' : l === 'kr' ? '고객 통화' : 'Appeler le client' },
    { type: 'meeting', label: l === 'en' ? 'Schedule meeting' : l === 'kr' ? '미팅 예약' : 'Planifier un meeting' },
    { type: 'email', label: l === 'en' ? 'Send follow-up email' : l === 'kr' ? '후속 이메일 전송' : 'Envoyer un email de suivi' },
    { type: 'qbr', label: l === 'en' ? 'Prepare QBR' : l === 'kr' ? 'QBR 준비' : 'Préparer le QBR' },
    { type: 'renewal', label: l === 'en' ? 'Renewal check' : l === 'kr' ? '갱신 확인' : 'Vérifier le renouvellement' },
    { type: 'health_check', label: l === 'en' ? 'Health check review' : l === 'kr' ? '헬스 체크 리뷰' : 'Revue du health check' },
  ]
})

const standardTodos = computed(() => {
  return STANDARD_TODO_TYPES.value.map(tmpl => {
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

// ─── Team members for CSM dropdown ───
const teamMembers = ref([])
async function loadTeamMembers() {
  try {
    const res = await teamApi.list()
    teamMembers.value = (res.data.members || []).filter(m => m.role === 'csm' || m.role === 'manager')
  } catch (e) {
    console.error('Failed to load team members:', e)
  }
}

// ─── Lifecycle ───
onMounted(() => {
  portfolioStore.fetchAccounts()
  loadTeamMembers()
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
    load360Data(acc.name)
  } else {
    accountTodos.value = []
    freeTasks.value = []
    clientTasks.value = []
    clientEvents.value = []
    clientQuotes.value = []
  }
})

// ─── Tabs ───
const detailTabs = computed(() => [
  ['overview', t('overview')],
  ['360', '360°'],
  ['todo', t('todoTab')],
  ['edit', t('editBtn')],
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
    if (!draft) {
      const base = { ...selectedAccount.value }
      if (!base.mrr && base.arr) base.mrr = base.arr / 12
      editForm.value = base
    } else {
      editForm.value = draft
    }
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
      name: editForm.value.name,
      csm: editForm.value.csm,
      industry: editForm.value.industry,
      mrr,
      arr: mrr * 12,
      health: h,
      risk: computeRisk(h),
      usage: editForm.value.usage ?? 70,
      renewal: editForm.value.renewal,
      contact: editForm.value.contact,
      contact_email: editForm.value.contact_email,
      notes: editForm.value.notes,
    }
    const updated = await portfolioStore.updateAccount(selectedAccount.value.id, payload)
    clearEditDraft()
    selectedAccount.value = updated
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

// ─── Bulk Delete ───
function closeBulkDelete() {
  showBulkDelete.value = false
  bulkDeleteStep.value = 1
  bulkDeleteMode.value = 'all'
  bulkDeleteIds.value = []
  bulkDeleteConfirmText.value = ''
}

async function executeBulkDelete() {
  bulkDeleting.value = true
  try {
    if (bulkDeleteMode.value === 'all') {
      await portfolioStore.bulkDeleteAccounts([], true)
    } else if (bulkDeleteMode.value === 'filtered') {
      const ids = filteredAccounts.value.map(a => a.id)
      await portfolioStore.bulkDeleteAccounts(ids)
    } else {
      await portfolioStore.bulkDeleteAccounts(bulkDeleteIds.value)
    }
    selectedAccount.value = null
    closeBulkDelete()
  } catch (e) {
    console.error('Bulk delete error:', e)
  }
  bulkDeleting.value = false
}

// ─── Todos ───
async function loadAccountTodos(accountId) {
  try {
    const { data } = await portfolioApi.getTodos(accountId)
    const todos = data.results || data || []
    accountTodos.value = todos.filter(t => t.type && t.type !== 'free')
    freeTasks.value = todos.filter(t => t.type === 'free').map(t => ({
      id: t.id,
      label: t.label || t.text || '',
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
  if (!selectedAccount.value || savingTodos.value) return
  savingTodos.value = true
  const accId = selectedAccount.value.id
  try {
    const promises = freeTasks.value.map(task => {
      if (task.id) {
        return portfolioApi.updateTodo(accId, task.id, {
          type: 'free', label: task.label, done: task.done, date: task.date, notes: task.notes,
        })
      } else if (task.label) {
        return portfolioApi.createTodo(accId, {
          type: 'free', label: task.label, done: task.done, date: task.date, notes: task.notes,
        })
      }
      return null
    }).filter(Boolean)
    await Promise.all(promises)
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
  let rows = importPreview.value
  if (isStarterPlan.value) {
    const currentCount = portfolioStore.accounts.length
    const maxAccounts = 6
    if (currentCount >= maxAccounts) {
      importMsg.value = 'Starter plan: max 6 accounts reached. Upgrade to import more.'
      setTimeout(() => { importMsg.value = '' }, 5000)
      return
    }
    const remaining = maxAccounts - currentCount
    if (rows.length > remaining) {
      rows = rows.slice(0, remaining)
      importMsg.value = `Starter plan: only ${remaining} accounts can be imported (limit: ${maxAccounts}).`
    }
  }

  importRunning.value = true
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
