/**
 * Centralized localStorage key management.
 * Single Responsibility: all storage keys and helpers in one place.
 */

const KEYS = {
  tokens: 'scalyo_tokens',
  user: 'scalyo_user',
  theme: 'scalyo_theme',
  lang: 'scalyo_lang',
  currency: 'scalyo_currency',
}

export function getTokens() {
  return JSON.parse(localStorage.getItem(KEYS.tokens) || '{}')
}

export function setTokens(tokens) {
  localStorage.setItem(KEYS.tokens, JSON.stringify(tokens))
}

export function clearAuth() {
  localStorage.removeItem(KEYS.tokens)
  localStorage.removeItem(KEYS.user)
}

export function getPreference(key) {
  return localStorage.getItem(KEYS[key])
}

export function setPreference(key, value) {
  localStorage.setItem(KEYS[key], value)
}

export const STORAGE_KEYS = KEYS
