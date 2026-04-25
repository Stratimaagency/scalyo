const messages = {
  ai_not_configured: {
    fr: "Le service IA n'est pas configur\u00e9.",
    en: 'AI service is not configured.',
    ko: 'AI \uc11c\ube44\uc2a4\uac00 \uad6c\uc131\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4.',
  },
  ai_unavailable: {
    fr: 'Le service IA est temporairement indisponible.',
    en: 'AI service is temporarily unavailable.',
    ko: 'AI \uc11c\ube44\uc2a4\ub97c \uc77c\uc2dc\uc801\uc73c\ub85c \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
  },
  invalid_request: {
    fr: 'Requ\u00eate invalide.',
    en: 'Invalid request.',
    ko: '\uc798\ubabb\ub41c \uc694\uccad\uc785\ub2c8\ub2e4.',
  },
  module_not_found: {
    fr: 'Module introuvable.',
    en: 'Module not found.',
    ko: '\ubaa8\ub4c8\uc744 \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
  },
  module_not_allowed: {
    fr: "Ce module n'est pas disponible dans votre plan.",
    en: 'This module is not available in your plan.',
    ko: '\uc774 \ubaa8\ub4c8\uc740 \uadc0\ud558\uc758 \ud50c\ub79c\uc5d0\uc11c \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
  },
  quota_exceeded: {
    fr: "Quota de messages IA d\u00e9pass\u00e9 pour aujourd'hui.",
    en: 'AI message quota exceeded for today.',
    ko: '\uc624\ub298\uc758 AI \uba54\uc2dc\uc9c0 \ud55c\ub3c4\ub97c \ucd08\uacfc\ud588\uc2b5\ub2c8\ub2e4.',
  },
  rate_limited: {
    fr: 'Trop de requ\u00eates. Veuillez patienter quelques secondes.',
    en: 'Too many requests. Please wait a few seconds.',
    ko: '\uc694\uccad\uc774 \ub108\ubb34 \ub9ce\uc2b5\ub2c8\ub2e4. \uc7a0\uc2dc \uae30\ub2e4\ub824 \uc8fc\uc138\uc694.',
  },
  input_too_long: {
    fr: 'Message trop long (max 4000 caract\u00e8res).',
    en: 'Message too long (max 4000 characters).',
    ko: '\uba54\uc2dc\uc9c0\uac00 \ub108\ubb34 \uae41\ub2c8\ub2e4 (\ucd5c\ub300 4000\uc790).',
  },
  server_error: {
    fr: 'Erreur serveur.',
    en: 'Server error.',
    ko: '\uc11c\ubc84 \uc624\ub958.',
  },
  unauthorized: {
    fr: 'Non autoris\u00e9.',
    en: 'Unauthorized.',
    ko: '\uc778\uc99d\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4.',
  },
}

export function t(key, lang = 'fr') {
  const msg = messages[key]
  if (!msg) return key
  return msg[lang] || msg.en || key
}
