import api from './client'

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  getCompany: () => api.get('/auth/company/'),
  updateCompany: (data) => api.patch('/auth/company/', data),
  getNotificationPrefs: () => api.get('/auth/notifications/'),
  updateNotificationPrefs: (data) => api.patch('/auth/notifications/', data),
  deleteAccount: () => api.delete('/auth/delete-account/'),
  changePassword: (data) => api.post('/auth/change-password/', data),
}

// Team
export const teamApi = {
  list: () => api.get('/team/'),
  invite: (data) => api.post('/team/', data),
  remove: (id) => api.delete(`/team/${id}`),
  limits: () => api.get('/team/limits'),
  getCsmAccounts: (id) => api.get(`/team/${id}/accounts`),
  setCsmAccounts: (id, account_ids) => api.put(`/team/${id}/accounts`, { account_ids }),
}

// Portfolio
export const portfolioApi = {
  getAccounts: (params) => api.get('/portfolio/accounts/', { params }),
  getAccount: (id) => api.get(`/portfolio/accounts/${id}/`),
  createAccount: (data) => api.post('/portfolio/accounts/', data),
  updateAccount: (id, data) => api.patch(`/portfolio/accounts/${id}/`, data),
  deleteAccount: (id) => api.delete(`/portfolio/accounts/${id}/`),
  importAccounts: (data) => api.post('/portfolio/accounts/import_accounts/', data),
  getTodos: (accountId) => api.get(`/portfolio/accounts/${accountId}/todos/`),
  createTodo: (accountId, data) => api.post(`/portfolio/accounts/${accountId}/todos/`, data),
  updateTodo: (accountId, todoId, data) => api.patch(`/portfolio/accounts/${accountId}/todos/${todoId}/`, data),
  deleteTodo: (accountId, todoId) => api.delete(`/portfolio/accounts/${accountId}/todos/${todoId}/`),
}

// KPIs
export const kpiApi = {
  getAll: () => api.get('/kpis/'),
  saveMonthly: (data) => api.post('/kpis/monthly/', data),
  saveCustom: (data) => api.post('/kpis/custom/', data),
  saveGoals: (data) => api.post('/kpis/goals/', data),
}

// Tasks
export const taskApi = {
  getTasks: () => api.get('/tasks/'),
  saveTasks: (tasks) => api.post('/tasks/save/', { tasks }),
}

// Planning
export const planningApi = {
  getEvents: () => api.get('/planning/'),
  saveEvents: (events) => api.post('/planning/save/', { events }),
}

// Wellbeing
export const wellbeingApi = {
  get: () => api.get('/wellbeing/'),
  update: (data) => api.patch('/wellbeing/update/', data),
}

// Roadmap
export const roadmapApi = {
  get: () => api.get('/roadmap/'),
  update: (data) => api.patch('/roadmap/update/', data),
}

// Coach
export const coachApi = {
  chat: (messages, mode = 'coach') => api.post('/coach/chat/', { messages, mode }),
}

// Feedback
export const feedbackApi = {
  create: (data) => api.post('/feedback/', data),
}

// Email Studio
export const emailStudioApi = {
  getTemplates: (lang) => api.get('/email-studio/templates/', { params: { lang } }),
  getTemplate: (id, lang) => api.get(`/email-studio/templates/${id}/`, { params: { lang } }),
  sendEmail: (data) => api.post('/email-studio/send/', data),
}

// Billing
export const billingApi = {
  createCheckout: (plan) => api.post('/billing/checkout/', { plan }),
  changePlan: (plan) => api.post('/billing/change-plan/', { plan }),
  openPortal: () => api.post('/billing/portal/'),
  getStatus: () => api.get('/billing/status/'),
}

// Integrations
export const integrationsApi = {
  list: () => api.get('/integrations/'),
  connect: (integration_key, config) => api.post('/integrations/', { integration_key, config }),
  disconnect: (key) => api.delete(`/integrations/${key}`),
  test: (integration_key, config) => api.post('/integrations/test', { integration_key, config }),
  sync: (key) => api.post(`/integrations/sync/${key}`),
  getOAuthUrl: (provider) => api.get(`/integrations/oauth/authorize/${provider}`),
}
