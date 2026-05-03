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
    ko: '\uc774 \ubaa8\ub4c8\uc740 \ud604\uc7ac \ud50c\ub79c\uc5d0\uc11c \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
  },
  email_not_configured: {
    fr: "Configurez votre service d'envoi dans les param\u00e8tres Email Studio.",
    en: 'Configure your sending service in Email Studio settings.',
    ko: '\uc774\uba54\uc77c \uc2a4\ud29c\ub514\uc624 \uc124\uc815\uc5d0\uc11c \ubc1c\uc1a1 \uc11c\ube44\uc2a4\ub97c \uad6c\uc131\ud558\uc138\uc694.',
  },
  email_send_failed: {
    fr: "L'envoi de l'email a \u00e9chou\u00e9. V\u00e9rifiez votre cl\u00e9 Resend dans les param\u00e8tres.",
    en: 'Email sending failed. Check your Resend key in settings.',
    ko: '\uc774\uba54\uc77c \ubc1c\uc1a1\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4. \uc124\uc815\uc5d0\uc11c Resend \ud0a4\ub97c \ud655\uc778\ud558\uc138\uc694.',
  },
  quota_exceeded: {
    fr: "Quota de messages IA d\u00e9pass\u00e9 pour aujourd'hui.",
    en: 'AI message quota exceeded for today.',
    ko: "\uc624\ub298\uc758 AI \uba54\uc2dc\uc9c0 \ud55c\ub3c4\ub97c \ucd08\uacfc\ud588\uc2b5\ub2c8\ub2e4.",
  },
  rate_limited: {
    fr: 'Trop de requ\u00eates. Veuillez patienter quelques secondes.',
    en: 'Too many requests. Please wait a few seconds.',
    ko: '\uc694\uccad\uc774 \ub108\ubb34 \ub9ce\uc2b5\ub2c8\ub2e4. \uc7a0\uc2dc \ud6c4 \ub2e4\uc2dc \uc2dc\ub3c4\ud574\uc8fc\uc138\uc694.',
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
