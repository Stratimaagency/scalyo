import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useSnapshotStore = defineStore('snapshots', () => {
  // Tableau de snapshots journaliers — max 31 entr\u00E9es
  // Format : { id, date: 'YYYY-MM-DD', kpis: { arr: number, health_score: number, ... } }
  const snapshots = ref([])

  // P\u00E9riode de comparaison choisie par l'utilisateur : 'day' | 'week' | 'month'
  const comparePeriod = ref('week')

  async function loadSnapshots() {
    try {
      const { data, error } = await supabase
        .from('snapshots')
        .select('*')
        .order('date', { ascending: false })
        .limit(31)
      if (!error && data) snapshots.value = data
    } catch (e) {
      console.error('snapshots.loadSnapshots failed:', e.message || e)
    }
  }

  // Sauvegarde un snapshot aujourd'hui si pas d\u00E9j\u00E0 fait aujourd'hui
  async function saveSnapshot(kpiValues) {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const existing = snapshots.value.find(s => s.date === today)
  
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
  
      if (existing) {
        // Mettre \u00E0 jour le snapshot du jour
        existing.kpis = { ...kpiValues }
        await supabase.from('snapshots').update({ kpis: kpiValues }).eq('id', existing.id)
      } else {
        const { data, error } = await supabase
          .from('snapshots')
          .insert([{ user_id: user.id, date: today, kpis: kpiValues }])
          .select()
        if (!error && data && data.length) {
          snapshots.value.unshift(data[0])
          // Garder seulement les 31 derniers jours
          if (snapshots.value.length > 31) {
            const toRemove = snapshots.value
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(31)
            snapshots.value = snapshots.value.slice(0, 31)
            // Supprimer les anciens de la DB
            for (const old of toRemove) {
              await supabase.from('snapshots').delete().eq('id', old.id)
            }
          }
        }
      }
    } catch (e) {
      console.error('snapshots.saveSnapshot failed:', e.message || e)
    }
  }

  // R\u00E9cup\u00E8re le snapshot le plus proche de N jours en arri\u00E8re
  function getSnapshot(period) {
    if (!snapshots.value.length) return null
    const today = new Date()
    let daysBack = 7
    if (period === 'day') daysBack = 1
    if (period === 'week') daysBack = 7
    if (period === 'month') daysBack = 30

    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() - daysBack)
    const targetStr = targetDate.toISOString().slice(0, 10)

    // Chercher le snapshot le plus proche de la date cible (avant ou \u00E9gal)
    const sorted = [...snapshots.value].sort((a, b) => b.date.localeCompare(a.date))
    const found = sorted.find(s => s.date <= targetStr)
    return found?.kpis || null
  }

  // Calcule le changement entre la valeur actuelle et le snapshot
  function calcChange(kpiId, currentValue, period, lowerIsBetter = false) {
    const past = getSnapshot(period)
    if (!past || past[kpiId] === undefined || past[kpiId] === currentValue) {
      return { value: null, type: 'neutral', hasData: false }
    }
    const diff = currentValue - past[kpiId]
    const pct = past[kpiId] !== 0
      ? ((diff / Math.abs(past[kpiId])) * 100).toFixed(1)
      : null

    const isPositive = lowerIsBetter ? diff < 0 : diff > 0
    const sign = diff > 0 ? '+' : ''
    const displayValue = pct !== null ? `${sign}${pct}%` : `${sign}${diff.toFixed(1)}`

    return {
      value: displayValue,
      type: isPositive ? 'up' : lowerIsBetter ? 'down-good' : 'down',
      hasData: true,
    }
  }

  return { snapshots, comparePeriod, saveSnapshot, getSnapshot, calcChange, loadSnapshots }
}, { persist: false })
