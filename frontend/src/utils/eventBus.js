import { useEventBus } from '@vueuse/core'
export const scalyoEvents = useEventBus('scalyo')

// Events:
// CLIENT_AT_RISK      → { client }
// CLIENT_RECOVERED    → { client }
// CSM_OVERLOADED      → { csm }
// PLAYBOOK_TRIGGERED  → { playbookId, clientName }
// OKR_BEHIND          → { okr }
// TASK_OVERDUE        → { task }
