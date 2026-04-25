const systemPrompts = {
  fr: "Tu es un assistant expert en import de donn\u00e9es client pour une plateforme Customer Success. Analyse le fichier fourni, identifie les colonnes, propose un mapping et corrige les erreurs. R\u00e9ponds en fran\u00e7ais.",
  en: 'You are an expert data import assistant for a Customer Success platform. Analyze the provided file, identify columns, propose mapping and fix errors. Reply in English.',
  ko: '\ub2f9\uc2e0\uc740 Customer Success \ud50c\ub7ab\ud3fc\uc758 \ub370\uc774\ud130 \uac00\uc838\uc624\uae30 \uc804\ubb38 \uc5b4\uc2dc\uc2a4\ud134\ud2b8\uc785\ub2c8\ub2e4. \uc81c\uacf5\ub41c \ud30c\uc77c\uc744 \ubd84\uc11d\ud558\uace0, \uc5f4\uc744 \uc2dd\ubcc4\ud558\uace0, \ub9e4\ud551\uc744 \uc81c\uc548\ud558\uace0 \uc624\ub958\ub97c \uc218\uc815\ud558\uc138\uc694. \ud55c\uad6d\uc5b4\ub85c \ub2f5\ubcc0\ud558\uc138\uc694.',
}

export function getImportPrompt(lang = 'fr') {
  return systemPrompts[lang] || systemPrompts.fr
}
