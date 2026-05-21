import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import { templates as defaultTemplates } from '@/components/email-studio/emailTemplates.js'
import * as Sentry from '@sentry/vue'

export const useEmailStudioStore = defineStore('emailStudio', () => {
  const auth = useAuthStore()

  // State
  const customTemplates = ref([])
  const sentEmails = ref([])
  const emailConfigured = ref(false)
  const loading = ref(false)
  const lastError = ref(null)

  // All templates: defaults + custom
  const allTemplates = computed(() => {
    const defaults = defaultTemplates.map(t => ({ ...t, source: 'default' }))
    const custom = customTemplates.value.map(t => ({
      id: t.id,
      nameKey: null,
      name: t.name,
      subjectKey: null,
      subject: t.subject,
      bodyKey: null,
      body: t.body,
      category: t.category,
      categoryKey: t.category,
      lang: t.lang,
      source: 'custom',
      created_by: t.created_by,
      created_at: t.created_at,
    }))
    return [...defaults, ...custom]
  })

  // Load org email config
  async function loadEmailConfig() {
    try {
      const { data } = await supabase.rpc('get_org_email_config', { p_owner_id: auth.user?.id })
      const row = Array.isArray(data) ? data[0] : data
      emailConfigured.value = !!row?.resend_api_key
    } catch (err) {
      emailConfigured.value = false
      console.error('[emailStudio] Config check failed:', err.message)
    }
  }

  // Load custom templates from Supabase
  async function loadCustomTemplates() {
    loading.value = true
    lastError.value = null
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      customTemplates.value = data || []
    } catch (err) {
      lastError.value = err.message
      console.error('[emailStudio] Load templates failed:', err.message)
      if (Sentry?.captureException) Sentry.captureException(err)
    } finally {
      loading.value = false
    }
  }

  // Save a custom template
  async function saveTemplate({ name, subject, body, category, lang }) {
    lastError.value = null
    try {
      const payload = {
        owner_id: auth.user?.id,
        created_by: auth.user?.id,
        name,
        subject,
        body,
        category: category || 'custom',
        lang: lang || 'fr',
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('email_templates')
        .insert(payload)
        .select()
        .single()

      if (error) throw error
      customTemplates.value.unshift(data)
      return data
    } catch (err) {
      lastError.value = err.message
      console.error('[emailStudio] Save template failed:', err.message)
      if (Sentry?.captureException) Sentry.captureException(err)
      return null
    }
  }

  // Update a custom template
  async function updateTemplate(id, updates) {
    lastError.value = null
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      const idx = customTemplates.value.findIndex(t => t.id === id)
      if (idx > -1) Object.assign(customTemplates.value[idx], updates)
      return true
    } catch (err) {
      lastError.value = err.message
      console.error('[emailStudio] Update template failed:', err.message)
      return false
    }
  }

  // Delete a custom template
  async function deleteTemplate(id) {
    lastError.value = null
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id)

      if (error) throw error
      customTemplates.value = customTemplates.value.filter(t => t.id !== id)
      return true
    } catch (err) {
      lastError.value = err.message
      console.error('[emailStudio] Delete template failed:', err.message)
      return false
    }
  }

  // Load sent email history with analytics
  async function loadSentEmails() {
    try {
      const { data, error } = await supabase
        .from('sent_emails')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100)

      if (error) throw error
      sentEmails.value = data || []
    } catch (err) {
      console.error('[emailStudio] Load history failed:', err.message)
      if (Sentry?.captureException) Sentry.captureException(err)
    }
  }

  // Replace variables in template content
  function replaceVariables(text, client) {
    if (!text || !client) return text || ''
    return text
      .replace(/\[Pr\u00e9nom\]/gi, client.name?.split(' ')[0] || '')
      .replace(/\[Nom\]/gi, client.name || '')
      .replace(/\[Entreprise\]/gi, client.name || '')
      .replace(/\[ENTREPRISE\]/gi, (client.name || '').toUpperCase())
      .replace(/\[Secteur\]/gi, client.industry || '')
      .replace(/\[ARR\]/gi, client.arr ? client.arr.toLocaleString() + ' \u20ac' : '')
      .replace(/\[MRR\]/gi, client.mrr ? client.mrr.toLocaleString() + ' \u20ac' : '')
      .replace(/\[NPS\]/gi, client.nps?.toString() || '')
      .replace(/\[Sant\u00e9\]/gi, client.health?.toString() || '')
      .replace(/\[CSM\]/gi, client.csm || '')
      .replace(/\[Statut\]/gi, client.status || '')
  }

  // Init
  async function init() {
    await Promise.all([
      loadEmailConfig(),
      loadCustomTemplates(),
      loadSentEmails(),
    ])
  }

  return {
    customTemplates,
    sentEmails,
    emailConfigured,
    loading,
    lastError,
    allTemplates,
    loadEmailConfig,
    loadCustomTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    loadSentEmails,
    replaceVariables,
    init,
  }
})
