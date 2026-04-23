import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

function uid() { return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

const BLOCK_DEFAULTS = {
  kpi_grid: { kpis: [{ label: '', value: '', unit: '', trend: 'up', color: '#10b981' }] },
  kpi_single: { label: '', value: '', unit: '', trend: 'up', previous: '', color: '#7c3aed' },
  chart_bar: { labels: ['Jan', 'Fév', 'Mar'], datasets: [{ label: 'Série 1', data: [10, 20, 15], color: '#7c3aed' }] },
  chart_line: { labels: ['Jan', 'Fév', 'Mar', 'Avr'], datasets: [{ label: 'Série 1', data: [5, 12, 8, 18], color: '#3b82f6' }] },
  chart_donut: { labels: ['Sain', 'Vigilance', 'Critique'], data: [60, 25, 15], colors: ['#10b981', '#f59e0b', '#ef4444'] },
  text: { content: '', size: 'normal' },
  table: { headers: ['Col 1', 'Col 2', 'Col 3'], rows: [['', '', '']] },
  divider: { style: 'line' },
  image: { url: '', caption: '' },
  checklist: { items: [{ text: '', done: false }] },
  timeline: { events: [{ date: '', title: '', desc: '', status: 'done' }] },
  quote: { text: '', author: '', role: '' },
  action_plan: { actions: [{ what: '', who: '', when: '', status: 'todo' }] },
}

async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id
}

// Map DB snake_case row to frontend camelCase
function dbToCopil(r) {
  return {
    id: r.id,
    title: r.title || '',
    subtitle: r.subtitle || '',
    clientName: r.client_name || '',
    clientLogo: r.client_logo || null,
    period: r.period || '',
    date: r.date || new Date().toISOString().slice(0, 10),
    color: r.color || '#7c3aed',
    presenter: r.presenter || '',
    lang: r.lang || 'fr',
    blocks: r.blocks || [],
    shareToken: r.share_token || '',
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || new Date().toISOString(),
  }
}

// Map frontend camelCase to DB snake_case
function copilToDb(c) {
  const row = {}
  if (c.title !== undefined) row.title = c.title
  if (c.subtitle !== undefined) row.subtitle = c.subtitle
  if (c.clientName !== undefined) row.client_name = c.clientName
  if (c.clientLogo !== undefined) row.client_logo = c.clientLogo
  if (c.period !== undefined) row.period = c.period
  if (c.date !== undefined) row.date = c.date
  if (c.color !== undefined) row.color = c.color
  if (c.presenter !== undefined) row.presenter = c.presenter
  if (c.lang !== undefined) row.lang = c.lang
  if (c.blocks !== undefined) row.blocks = c.blocks
  if (c.shareToken !== undefined) row.share_token = c.shareToken
  row.updated_at = new Date().toISOString()
  return row
}

export const useKpiStore = defineStore('kpis', () => {
  const copils = ref([])
  const loading = ref(false)

  async function loadCopils() {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('copils')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      copils.value = (data || []).map(dbToCopil)
    } catch (e) {
      console.error('[kpis] loadCopils error:', e)
    } finally {
      loading.value = false
    }
  }

  async function createCopil(partial = {}) {
    const userId = await getCurrentUserId()
    if (!userId) return null
    const now = new Date().toISOString()
    const row = {
      user_id: userId,
      title: partial.title || '',
      subtitle: partial.subtitle || '',
      client_name: partial.clientName || '',
      client_logo: null,
      period: partial.period || '',
      date: new Date().toISOString().slice(0, 10),
      color: partial.color || '#7c3aed',
      presenter: partial.presenter || '',
      lang: partial.lang || 'fr',
      blocks: [],
      share_token: uid(),
      created_at: now,
      updated_at: now,
    }
    const { data, error } = await supabase.from('copils').insert(row).select().single()
    if (error) { console.error('[kpis] createCopil error:', error); return null }
    const copil = dbToCopil(data)
    copils.value.unshift(copil)
    return copil.id
  }

  async function updateCopil(id, changes) {
    const dbChanges = copilToDb(changes)
    const { error } = await supabase.from('copils').update(dbChanges).eq('id', id)
    if (error) { console.error('[kpis] updateCopil error:', error); return }
    const c = copils.value.find(c => c.id === id)
    if (c) Object.assign(c, changes, { updatedAt: new Date().toISOString() })
  }

  async function deleteCopil(id) {
    const { error } = await supabase.from('copils').delete().eq('id', id)
    if (error) { console.error('[kpis] deleteCopil error:', error); return }
    copils.value = copils.value.filter(c => c.id !== id)
  }

  async function duplicateCopil(id) {
    const orig = copils.value.find(c => c.id === id)
    if (!orig) return null
    const userId = await getCurrentUserId()
    if (!userId) return null
    const now = new Date().toISOString()
    const row = {
      user_id: userId,
      title: orig.title + ' (copie)',
      subtitle: orig.subtitle,
      client_name: orig.clientName,
      client_logo: orig.clientLogo,
      period: orig.period,
      date: orig.date,
      color: orig.color,
      presenter: orig.presenter,
      lang: orig.lang,
      blocks: JSON.parse(JSON.stringify(orig.blocks)),
      share_token: uid(),
      created_at: now,
      updated_at: now,
    }
    const { data, error } = await supabase.from('copils').insert(row).select().single()
    if (error) { console.error('[kpis] duplicateCopil error:', error); return null }
    const copil = dbToCopil(data)
    copils.value.unshift(copil)
    return copil.id
  }

  function getCopil(id) { return copils.value.find(c => c.id === id) }

  async function addBlock(copilId, type) {
    const c = copils.value.find(c => c.id === copilId)
    if (!c) return
    c.blocks.push({
      id: uid(),
      type,
      title: '',
      data: JSON.parse(JSON.stringify(BLOCK_DEFAULTS[type] || {})),
      visible: true,
      width: 'full',
    })
    c.updatedAt = new Date().toISOString()
    await supabase.from('copils').update({ blocks: c.blocks, updated_at: c.updatedAt }).eq('id', copilId)
  }

  async function updateBlock(copilId, blockId, changes) {
    const c = copils.value.find(c => c.id === copilId)
    if (!c) return
    const b = c.blocks.find(b => b.id === blockId)
    if (b) {
      Object.assign(b, changes)
      c.updatedAt = new Date().toISOString()
      await supabase.from('copils').update({ blocks: c.blocks, updated_at: c.updatedAt }).eq('id', copilId)
    }
  }

  async function deleteBlock(copilId, blockId) {
    const c = copils.value.find(c => c.id === copilId)
    if (!c) return
    c.blocks = c.blocks.filter(b => b.id !== blockId)
    c.updatedAt = new Date().toISOString()
    await supabase.from('copils').update({ blocks: c.blocks, updated_at: c.updatedAt }).eq('id', copilId)
  }

  async function reorderBlocks(copilId, newOrder) {
    const c = copils.value.find(c => c.id === copilId)
    if (!c) return
    const map = Object.fromEntries(c.blocks.map(b => [b.id, b]))
    c.blocks = newOrder.map(id => map[id]).filter(Boolean)
    c.updatedAt = new Date().toISOString()
    await supabase.from('copils').update({ blocks: c.blocks, updated_at: c.updatedAt }).eq('id', copilId)
  }

  return {
    copils, loading, loadCopils, createCopil, updateCopil, deleteCopil, duplicateCopil,
    getCopil, addBlock, updateBlock, deleteBlock, reorderBlocks, BLOCK_DEFAULTS,
  }
})
