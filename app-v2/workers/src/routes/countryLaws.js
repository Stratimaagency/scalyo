import { detectLanguage, t } from '../middleware/i18n.js'

const laws = {
  FR: {
    flag: '🇫🇷',
    name: { fr: 'France', en: 'France', ko: '프랑스' },
    hoursPerWeek: 35, hoursPerDay: 7, workDaysPerWeek: 5,
    vacationDays: 25, publicHolidays: 11,
    overtimeRate: 1.25, currency: '€', currencyCode: 'EUR', tva: 20,
    dataLaw: 'RGPD / CNIL',
    legalNumberLabel: { fr: 'N° SIRET', en: 'SIRET Number', ko: 'SIRET 번호' },
    legalNumberFormat: 'XXX XXX XXX XXXXX',
    contractTypes: {
      fr: ['CDI', 'CDD', 'Temps partiel', 'Freelance', 'Stage', 'Alternance'],
      en: ['Permanent', 'Fixed-term', 'Part-time', 'Freelance', 'Internship', 'Apprenticeship'],
      ko: ['무기계약', '기간제', '파트타임', '프리랜서', '인턴', '수습'],
    },
  },
  BE: {
    flag: '🇧🇪',
    name: { fr: 'Belgique', en: 'Belgium', ko: '벨기에' },
    hoursPerWeek: 38, hoursPerDay: 7.6, workDaysPerWeek: 5,
    vacationDays: 20, publicHolidays: 10,
    overtimeRate: 1.5, currency: '€', currencyCode: 'EUR', tva: 21,
    dataLaw: 'GDPR / APD',
    legalNumberLabel: { fr: 'N° BCE', en: 'BCE Number', ko: 'BCE 번호' },
    legalNumberFormat: 'XXXX.XXX.XXX',
    contractTypes: {
      fr: ['CDI', 'CDD', 'Temps partiel', 'Intérim', 'Indépendant'],
      en: ['Permanent', 'Fixed-term', 'Part-time', 'Interim', 'Self-employed'],
      ko: ['무기계약', '기간제', '파트타임', '파견', '자영업'],
    },
  },
  CH: {
    flag: '🇨🇭',
    name: { fr: 'Suisse', en: 'Switzerland', ko: '스위스' },
    hoursPerWeek: 42, hoursPerDay: 8.4, workDaysPerWeek: 5,
    vacationDays: 20, publicHolidays: 9,
    overtimeRate: 1.25, currency: 'CHF', currencyCode: 'CHF', tva: 8.1,
    dataLaw: 'nLPD 2023',
    legalNumberLabel: { fr: 'N° IDE (UID)', en: 'UID Number', ko: 'UID 번호' },
    legalNumberFormat: 'CHE-XXX.XXX.XXX',
    contractTypes: {
      fr: ['CDI', 'CDD', 'Temps partiel', 'Indépendant'],
      en: ['Permanent', 'Fixed-term', 'Part-time', 'Self-employed'],
      ko: ['무기계약', '기간제', '파트타임', '자영업'],
    },
  },
  CA: {
    flag: '🇨🇦',
    name: { fr: 'Canada', en: 'Canada', ko: '캐나다' },
    hoursPerWeek: 40, hoursPerDay: 8, workDaysPerWeek: 5,
    vacationDays: 10, publicHolidays: 9,
    overtimeRate: 1.5, currency: 'CAD', currencyCode: 'CAD', tva: 5,
    dataLaw: 'PIPEDA / Loi 25',
    legalNumberLabel: { fr: 'N° TPS', en: 'GST Number', ko: 'GST 번호' },
    legalNumberFormat: 'XXXXXXXXX RT XXXX',
    contractTypes: {
      fr: ['Temps plein', 'Temps partiel', 'Contractuel', 'Pigiste'],
      en: ['Full-time', 'Part-time', 'Contract', 'Freelance'],
      ko: ['정규직', '파트타임', '계약직', '프리랜서'],
    },
  },
  US: {
    flag: '🇺🇸',
    name: { fr: 'États-Unis', en: 'United States', ko: '미국' },
    hoursPerWeek: 40, hoursPerDay: 8, workDaysPerWeek: 5,
    vacationDays: 0, publicHolidays: 11,
    overtimeRate: 1.5, currency: '$', currencyCode: 'USD', tva: 0,
    dataLaw: 'CCPA / State Laws',
    legalNumberLabel: { fr: 'EIN', en: 'EIN', ko: 'EIN' },
    legalNumberFormat: 'XX-XXXXXXX',
    contractTypes: {
      fr: ['Temps plein', 'Temps partiel', 'Contractuel', 'Freelance'],
      en: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'W2', '1099'],
      ko: ['정규직', '파트타임', '계약직', '프리랜서'],
    },
  },
  KR: {
    flag: '🇰🇷',
    name: { fr: 'Corée du Sud', en: 'South Korea', ko: '대한민국' },
    hoursPerWeek: 40, hoursPerDay: 8, workDaysPerWeek: 5,
    vacationDays: 15, publicHolidays: 15,
    overtimeRate: 1.5, currency: '₩', currencyCode: 'KRW', tva: 10,
    dataLaw: 'PIPA 개인정보보호법',
    legalNumberLabel: { fr: 'N° Siren coréen', en: 'Business Reg. Number', ko: '사업자등록번호' },
    legalNumberFormat: 'XXX-XX-XXXXX',
    contractTypes: {
      fr: ['CDI', 'CDD', 'Temps partiel', 'Freelance'],
      en: ['Permanent', 'Fixed-term', 'Part-time', 'Freelance'],
      ko: ['정규직', '계약직', '파트타임', '프리랜서'],
    },
  },
}

export function handleCountryLaws(request) {
  const lang = detectLanguage(request)
  const url = new URL(request.url)
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

  // GET /api/country-laws/all
  if (url.pathname === '/api/country-laws/all') {
    const allLaws = Object.entries(laws).map(([code, law]) => ({
      code, flag: law.flag, name: law.name[lang], currency: law.currency, tva: law.tva,
    }))
    return new Response(JSON.stringify(allLaws), { headers })
  }

  // GET /api/country-laws?country=FR
  const country = url.searchParams.get('country') || 'FR'
  const law = laws[country]
  if (!law) {
    return new Response(JSON.stringify({ error: t(lang, 'errors.notFound') }), { status: 404, headers })
  }

  const daysPerWeek = law.workDaysPerWeek || 5
  const totalWeeks = 52
  const workedDays = Math.round(totalWeeks * daysPerWeek - law.vacationDays - law.publicHolidays)
  const projectHoursYear = Math.round(workedDays * law.hoursPerDay)

  return new Response(JSON.stringify({
    code: country,
    flag: law.flag,
    name: law.name[lang],
    hoursPerWeek: law.hoursPerWeek,
    hoursPerDay: law.hoursPerDay,
    vacationDays: law.vacationDays,
    publicHolidays: law.publicHolidays,
    overtimeRate: law.overtimeRate,
    currency: law.currency,
    currencyCode: law.currencyCode,
    tva: law.tva,
    dataLaw: law.dataLaw,
    legalNumberLabel: law.legalNumberLabel[lang],
    legalNumberFormat: law.legalNumberFormat,
    contractTypes: law.contractTypes[lang],
    legalText: t(lang, `legal.${country}.dataProtection`),
    workLawText: t(lang, `legal.${country}.workLaw`),
    invoiceText: t(lang, `legal.${country}.invoiceRequired`),
    overtimeText: t(lang, `legal.${country}.overtime`),
    vacationText: t(lang, `legal.${country}.vacation`),
    workedDaysPerYear: workedDays,
    projectHoursPerYear: projectHoursYear,
  }), { headers })
}
