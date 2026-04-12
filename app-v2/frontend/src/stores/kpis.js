import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useKpiStore = defineStore('kpis', () => {
  const copils = ref([])

  function addCopil(data) {
    copils.value.push({ id: 'copil_' + Date.now(), createdAt: new Date().toISOString().slice(0, 10), ...data })
  }

  function updateCopil(id, data) {
    const i = copils.value.findIndex(c => c.id === id)
    if (i !== -1) Object.assign(copils.value[i], data)
  }

  function deleteCopil(id) {
    copils.value = copils.value.filter(c => c.id !== id)
  }

  return { copils, addCopil, updateCopil, deleteCopil }
})
