import { useEventBus } from '@vueuse/core'

export const scalyoEvents = useEventBus('scalyo')

// Events disponibles :
// CLIENT_AT_RISK      → payload: client
// CLIENT_RECOVERED    → payload: client
// CSM_OVERLOADED      → payload: csm
// PLAYBOOK_TRIGGERED  → payload: { playbookId, clientName }
// OKR_BEHIND          → payload: okr
// TASK_OVERDUE        → payload: task
