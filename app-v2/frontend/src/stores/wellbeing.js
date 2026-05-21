import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { askScalyoAI } from '@/utils/askScalyoAI'

export const useWellbeingStore = defineStore('wellbeing', () => {
  const authStore = useAuthStore()

  // --- State ---
  const mood = ref('normal')
  const score = ref(70)
  const charge = ref(70)
  const weekEntries = ref([])
  const novaMessages = ref([])
  const novaLoading = ref(false)
  const todayEntry = ref(null)
  const saving = ref(false)
  const loaded = ref(false)

  // --- Getters ---
  const userId = computed(() => authStore.user?.id)
  const trend = computed(() => {
    if (weekEntries.value.length < 2) return 'stable'
    const recent = weekEntries.value.slice(-3)
    const avg = recent.reduce((s, e) => s + e.score, 0) / recent.length
    const prev = weekEntries.value.slice(-6, -3)
    if (!prev.length) return 'stable'
    const prevAvg = prev.reduce((s, e) => s + e.score, 0) / prev.length
    if (avg - prevAvg > 10) return 'improving'
    if (prevAvg - avg > 10) return 'declining'
    return 'stable'
  })
  const lastSessionSummary = computed(() => {
    const assistantMsgs = novaMessages.value.filter(m => m.role === 'assistant')
    if (!assistantMsgs.length) return null
    const last = assistantMsgs[assistantMsgs.length - 1]
    return last.content.substring(0, 200)
  })

  // --- Actions ---
  async function loadToday() {
    if (!userId.value) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('wellbeing_entries')
        .select('*')
        .eq('user_id', userId.value)
        .eq('entry_date', today)
        .maybeSingle()
      if (error) throw error
      if (data) {
        todayEntry.value = data
        mood.value = data.mood || 'normal'
        score.value = data.score ?? 70
        charge.value = data.charge ?? 70
      }
    } catch (e) { console.error('[Wellbeing] loadToday:', e) }
  }

  async function loadWeek() {
    if (!userId.value) return
    try {
      const since = new Date()
      since.setDate(since.getDate() - 30)
      const { data, error } = await supabase
        .from('wellbeing_entries')
        .select('entry_date, mood, score, charge, micro_action_completed')
        .eq('user_id', userId.value)
        .gte('entry_date', since.toISOString().split('T')[0])
        .order('entry_date', { ascending: true })
      if (error) throw error
      weekEntries.value = data || []
    } catch (e) { console.error('[Wellbeing] loadWeek:', e) }
  }

  async function saveMood(newMood) {
    mood.value = newMood
    await saveEntry()
  }

  async function saveScore(newScore) {
    score.value = newScore
    await saveEntry()
  }

  async function saveCharge(newCharge) {
    charge.value = newCharge
    await saveEntry()
  }

  async function saveEntry() {
    if (!userId.value || saving.value) return
    saving.value = true
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('wellbeing_entries')
        .upsert({
          user_id: userId.value,
          entry_date: today,
          mood: mood.value,
          score: score.value,
          charge: charge.value,
        }, { onConflict: 'user_id,entry_date' })
        .select()
        .single()
      if (error) throw error
      todayEntry.value = data
    } catch (e) { console.error('[Wellbeing] saveEntry:', e) }
    finally { saving.value = false }
  }

  async function completeMicroAction(actionKey) {
    if (!userId.value) return
    if (!todayEntry.value) await saveEntry()
    try {
      const { error } = await supabase
        .from('wellbeing_entries')
        .update({ micro_action: actionKey, micro_action_completed: true })
        .eq('id', todayEntry.value.id)
      if (error) throw error
    } catch (e) { console.error('[Wellbeing] completeMicroAction:', e) }
  }

  async function saveDeltaMood(deltaMood) {
    if (!userId.value || !todayEntry.value) return
    try {
      const { error } = await supabase
        .from('wellbeing_entries')
        .update({ delta_mood: deltaMood })
        .eq('id', todayEntry.value.id)
      if (error) throw error
    } catch (e) { console.error('[Wellbeing] saveDeltaMood:', e) }
  }

  // --- Nova Chat (persisted) ---
  async function loadNovaHistory() {
    if (!userId.value) return
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('id, role, content, created_at')
        .eq('user_id', userId.value)
        .eq('module', 'wellbeing')
        .order('created_at', { ascending: true })
        .limit(50)
      if (error) throw error
      novaMessages.value = (data || []).map(m => ({
        id: m.id, role: m.role, content: m.content
      }))
    } catch (e) { console.error('[Wellbeing] loadNovaHistory:', e) }
  }

  async function sendNova(message, lang) {
    if (!message?.trim() || novaLoading.value) return
    const userMsg = { id: Date.now(), role: 'user', content: message.trim() }
    novaMessages.value.push(userMsg)
    novaLoading.value = true

    // Persist user message
    try {
      await supabase.from('ai_messages').insert({
        user_id: userId.value, module: 'wellbeing',
        role: 'user', content: userMsg.content
      })
    } catch (e) { /* non-blocking */ }

    // Build context for Nova
    const context = {
      mood: mood.value, score: score.value, charge: charge.value,
      trend: trend.value,
      recentEntries: weekEntries.value.slice(-7).map(e => ({
        date: e.entry_date, mood: e.mood, score: e.score
      }))
    }

    try {
      const result = await askScalyoAI({
        module: 'wellbeing',
        message: userMsg.content,
        context,
        history: novaMessages.value.slice(-10).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant', content: m.content
        })),
        lang: lang || 'fr',
      })
      const reply = result.response || result.reply || result.content || ''
      const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: reply }
      novaMessages.value.push(assistantMsg)

      // Persist assistant message
      try {
        await supabase.from('ai_messages').insert({
          user_id: userId.value, module: 'wellbeing',
          role: 'assistant', content: reply
        })
      } catch (e) { /* non-blocking */ }
    } catch {
      novaMessages.value.push({
        id: Date.now() + 1, role: 'assistant', content: '__error__'
      })
    }
    novaLoading.value = false
  }

  async function clearNovaHistory() {
    if (!userId.value) return
    try {
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .eq('user_id', userId.value)
        .eq('module', 'wellbeing')
      if (error) throw error
      novaMessages.value = []
    } catch (e) { console.error('[Wellbeing] clearHistory:', e) }
  }

  // --- Init ---
  async function init() {
    if (loaded.value) return
    await Promise.all([loadToday(), loadWeek(), loadNovaHistory()])
    loaded.value = true
  }

  return {
    mood, score, charge, weekEntries, novaMessages, novaLoading,
    todayEntry, saving, loaded, trend, lastSessionSummary,
    init, loadToday, loadWeek, saveMood, saveScore, saveCharge,
    saveEntry, completeMicroAction, saveDeltaMood,
    sendNova, loadNovaHistory, clearNovaHistory,
  }
})
