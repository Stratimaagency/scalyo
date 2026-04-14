import { defineStore } from 'pinia'
import { ref } from 'vue'

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

export const useKpiStore = defineStore('kpis', () => {
  const copils = ref(JSON.parse(localStorage.getItem('scalyo_copils') || '[]'))

  function save() { localStorage.setItem('scalyo_copils', JSON.stringify(copils.value)) }

  function createCopil(partial = {}) {
    const id = uid()
    const copil = {
      id,
      title: partial.title || '',
      subtitle: partial.subtitle || '',
      clientName: partial.clientName || '',
      clientLogo: null,
      period: partial.period || '',
      date: new Date().toISOString().slice(0, 10),
      color: partial.color || '#7c3aed',
      presenter: partial.presenter || '',
      lang: partial.lang || 'fr',
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shareToken: uid(),
    }
    copils.value.push(copil)
    save()
    return id
  }

  function updateCopil(id, changes) {
    const c = copils.value.find(c => c.id === id)
    if (c) { Object.assign(c, changes, { updatedAt: new Date().toISOString() }); save() }
  }

  function deleteCopil(id) {
    copils.value = copils.value.filter(c => c.id !== id)
    save()
  }

  function duplicateCopil(id) {
    const orig = copils.value.find(c => c.id === id)
    if (!orig) return null
    const newId = uid()
    const copy = JSON.parse(JSON.stringify(orig))
    copy.id = newId
    copy.title = orig.title + ' (copie)'
    copy.createdAt = new Date().toISOString()
    copy.updatedAt = new Date().toISOString()
    copy.shareToken = uid()
    copils.value.push(copy)
    save()
    return newId
  }

  function getCopil(id) { return copils.value.find(c => c.id === id) }

  function addBlock(copilId, type) {
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
    save()
  }

  function updateBlock(copilId, blockId, changes) {
    const c = copils.value.find(c => c.id === copilId)
    if (!c) return
    const b = c.blocks.find(b => b.id === blockId)
    if (b) { Object.assign(b, changes); c.updatedAt = new Date().toISOString(); save() }
  }

  function deleteBlock(copilId, blockId) {
    const c = copils.value.find(c => c.id === copilId)
    if (!c) return
    c.blocks = c.blocks.filter(b => b.id !== blockId)
    c.updatedAt = new Date().toISOString()
    save()
  }

  function reorderBlocks(copilId, newOrder) {
    const c = copils.value.find(c => c.id === copilId)
    if (!c) return
    const map = Object.fromEntries(c.blocks.map(b => [b.id, b]))
    c.blocks = newOrder.map(id => map[id]).filter(Boolean)
    c.updatedAt = new Date().toISOString()
    save()
  }

  return {
    copils, createCopil, updateCopil, deleteCopil, duplicateCopil,
    getCopil, addBlock, updateBlock, deleteBlock, reorderBlocks, BLOCK_DEFAULTS,
  }
}, { persist: true })
