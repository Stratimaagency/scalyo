import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useSnapshotStore = defineStore('snapshots', () => {
  const snapshots = ref([])
  const comparePeriod = ref('30d')

  async function loadSnapshots() {
    try {
      const { data, error } = await supabase.from('snapshots').select('*').order('date', { ascending: false }).limit(91)
      if (!error && data) snapshots.value = data
    } catch (e) { console.error('snapshots.loadSnapshots failed:', e.message || e) }
  }

  async function saveSnapshot(kpiValues) {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const existing = snapshots.value.find(s => s.date === today)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (existing) {
        existing.kpis = { ...kpiValues }
        await supabase.from('snapshots').update({ kpis: kpiValues }).eq('id', existing.id)
      } else {
        const { data, error } = await supabase.from('snapshots').insert([{ user_id: user.id, date: today, kpis: kpiValues }]).select()
        if (!error && data && data.length) {
          snapshots.value.unshift(data[0])
          if (snapshots.value.length > 91) {
            const toRemove = snapshots.value.sort((a, b) => b.date.localeCompare(a.date)).slice(91)
            snapshots.value = snapshots.value.slice(0, 91)
            for (const old of toRemove) { await supabase.from('snapshots').delete().eq('id', old.id) }
          }
        }
      }
    } catch (e) { console.error('snapshots.saveSnapshot failed:', e.message || e) }
  }

  function periodToDays(period) {
    const map = { 'day': 1, '1d': 1, 'week': 7, '7d': 7, 'month': 30, '30d': 30, '90d': 90 }
    return map[period] || 30
  }

  function getSnapshot(period) {
    if (!snapshots.value.length) return null
    const daysBack = periodToDays(period)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - daysBack)
    const targetStr = targetDate.toISOString().slice(0, 10)
    const sorted = [...snapshots.value].sort((a, b) => b.date.localeCompare(a.date))
    const found = sorted.find(s => s.date <= targetStr)
    return found?.kpis || null
  }

  function calcChange(kpiId, currentValue, period, lowerIsBetter = false) {
    const past = getSnapshot(period)
    if (!past || past[kpiId] === undefined || past[kpiId] === null || past[kpiId] === currentValue) {
      return { value: null, type: 'neutral', hasData: false }
    }
    const diff = currentValue - past[kpiId]
    const pct = past[kpiId] !== 0 ? ((diff / Math.abs(past[kpiId])) * 100).toFixed(1) : null
    const isPositive = lowerIsBetter ? diff < 0 : diff > 0
    const sign = diff > 0 ? '+' : ''
    const displayValue = pct !== null ? `${sign}${pct}%` : `${sign}${diff.toFixed(1)}`
    return { value: displayValue, type: isPositive ? 'up' : lowerIsBetter ? 'down-good' : 'down', hasData: true }
  }

  return { snapshots, comparePeriod, saveSnapshot, getSnapshot, calcChange, loadSnapshots, periodToDays }
}, { persist: false })
