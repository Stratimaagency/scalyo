/**
 * Manager View — Shared helpers
 */

export function wellbeingClass(score) {
  return score >= 70 ? 'green' : score >= 50 ? 'amber' : 'red'
}

export function workloadClass(load) {
  return load <= 60 ? 'green' : load <= 80 ? 'amber' : 'red'
}

export function moodEmoji(mood) {
  const map = { great: '😄', happy: '😊', neutral: '🙂', stressed: '😟', exhausted: '😩' }
  return map[mood] || '🙂'
}
