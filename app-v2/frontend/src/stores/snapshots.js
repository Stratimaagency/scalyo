import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnapshotStore = defineStore('snapshots', () => {
  // Tableau de snapshots journaliers — max 31 entrées
  // Format : { date: 'YYYY-MM-DD', kpis: { arr: number, health_score: number, ... } }
  const snapshots = ref([])

  // Période de comparaison choisie par l'utilisateur : 'day' | 'week' | 'month'
  const comparePeriod = ref('week')

  // Sauvegarde un snapshot aujourd'hui si pas déjà fait aujourd'hui
  function saveSnapshot(kpiValues) {
    const today = new Date().toISOString().slice(0, 10)
    const existing = snapshots.value.find(s => s.date === today)
    if (existing) {
      // Mettre à jour le snapshot du jour avec les valeurs les plus récentes
      existing.kpis = { ...kpiValues }
    } else {
      snapshots.value.push({ date: today, kpis: { ...kpiValues } })
      // Garder seulement les 31 derniers jours
      if (snapshots.value.length > 31) {
        snapshots.value = snapshots.value
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 31)
      }
    }
  }

  // Récupère le snapshot le plus proche de N jours en arrière
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

    // Chercher le snapshot le plus proche de la date cible (avant ou égal)
    const sorted = [...snapshots.value].sort((a, b) => b.date.localeCompare(a.date))
    const found = sorted.find(s => s.date <= targetStr)
    return found?.kpis || null
  }

  // Calcule le changement entre la valeur actuelle et le snapshot
  // Retourne { value: string, type: 'up'|'down'|'down-good'|'neutral', hasData: boolean }
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

  return { snapshots, comparePeriod, saveSnapshot, getSnapshot, calcChange }
}, { persist: true })
