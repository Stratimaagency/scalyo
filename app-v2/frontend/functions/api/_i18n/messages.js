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
  email_not_configured: {
    fr: "Configurez votre service d'envoi dans les paramètres Email Studio.",
    en: 'Configure your sending service in Email Studio settings.',
    ko: '이메일 스튜디오 설정에서 발송 서비스를 구성하세요.',
  },
  email_send_failed: {
    fr: "L'envoi de l'email a échoué. Vérifiez votre clé Resend dans les paramètres.",
    en: 'Email sending failed. Check your Resend key in settings.',
    ko: '이메일 발송에 실패했습니다. 설정에서 Resend 키를 확인하세요.',
  },
  quota_exceeded: {
    fr: "Quota de messages IA dépassé pour aujourd'hui.",
    en: 'AI message quota exceeded for today.',
    ko: "오늘의 AI 메시지 한도를 초과했습니다.",
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
  // Alpha invite system
  alpha_not_configured: {
    fr: "Le système d'invitation n'est pas configuré.",
    en: 'Invitation system is not configured.',
    ko: '초대 시스템이 구성되지 않았습니다.',
  },
  alpha_code_required: {
    fr: "Le code d'invitation est requis.",
    en: 'Invitation code is required.',
    ko: '초대 코드가 필요합니다.',
  },
  alpha_code_invalid: {
    fr: "Code d'invitation invalide.",
    en: 'Invalid invitation code.',
    ko: '유효하지 않은 초대 코드입니다.',
  },
}
  // Invite email
  invite_email_subject: {
    fr: 'Vous êtes invité(e) sur Scalyo',
    en: 'You are invited to Scalyo',
    ko: 'Scalyo에 초대되었습니다',
  },


export function t(key, lang = 'fr') {
  const msg = messages[key]
  if (!msg) return key
  return msg[lang] || msg.en || key
}
