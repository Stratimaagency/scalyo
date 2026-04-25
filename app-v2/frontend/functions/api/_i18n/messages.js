const messages = {
  ai_not_configured: {
    fr: "Le service IA n'est pas configuré.",
    en: 'AI service is not configured.',
    ko: 'AI 서비스가 구성되지 않았습니다.',
  },
  ai_unavailable: {
    fr: 'Le service IA est temporairement indisponible.',
    en: 'AI service is temporarily unavailable.',
    ko: 'AI 서비스를 일시적으로 사용할 수 없습니다.',
  },
  invalid_request: {
    fr: 'Requête invalide.',
    en: 'Invalid request.',
    ko: '잘못된 요청입니다.',
  },
  module_not_found: {
    fr: 'Module introuvable.',
    en: 'Module not found.',
    ko: '모듈을 찾을 수 없습니다.',
  },
  module_not_allowed: {
    fr: "Ce module n'est pas disponible dans votre plan.",
    en: 'This module is not available in your plan.',
    ko: '이 모듈은 현재 플랜에서 사용할 수 없습니다.',
  },
  quota_exceeded: {
    fr: "Quota de messages IA dépassé pour aujourd'hui.",
    en: 'AI message quota exceeded for today.',
    ko: '오늘의 AI 메시지 한도를 초과했습니다.',
  },
  rate_limited: {
    fr: 'Trop de requêtes. Veuillez patienter quelques secondes.',
    en: 'Too many requests. Please wait a few seconds.',
    ko: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
  server_error: {
    fr: 'Erreur serveur.',
    en: 'Server error.',
    ko: '서버 오류.',
  },
  unauthorized: {
    fr: 'Non autorisé.',
    en: 'Unauthorized.',
    ko: '인증되지 않았습니다.',
  },
}

export function t(key, lang = 'fr') {
  const msg = messages[key]
  if (!msg) return key
  return msg[lang] || msg.en || key
}
