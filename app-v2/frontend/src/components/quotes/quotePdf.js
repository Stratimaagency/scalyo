/**
 * Quotes — PDF generation helper
 */
import { jsPDF } from 'jspdf'

export function downloadPdf(q, laws, billingCountry, t, clientName) {
  const doc = new jsPDF()
  const l = laws

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(q.company || clientName || t('qt_default_company'), 20, 25)

  doc.setDrawColor(200, 200, 200)
  doc.line(20, 32, 190, 32)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(t('qt_title') + ' — ' + q.id, 20, 45)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(t('qt_create_date') + ' : ' + q.createdAt, 20, 55)
  doc.text(t('qt_field_status') + ' : ' + t('qt_filter_' + q.status), 20, 62)
  doc.text(l.name + ' — ' + l.taxName + ' ' + l.tva + '%', 20, 72)

  doc.line(20, 78, 190, 78)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(t('qt_field_title') + ' :', 20, 88)
  doc.setFont('helvetica', 'normal')
  const titleLines = doc.splitTextToSize(q.title, 170)
  doc.text(titleLines, 20, 96)

  doc.setFontSize(10)
  doc.text(t('qt_field_amount') + ' (HT) : ' + l.currencySymbol + Number(q.amount).toFixed(2), 20, 110)
  doc.text(t('qt_field_tax') + ' (' + q.tax + '%) : ' + l.currencySymbol + Math.round(q.amount * q.tax / 100).toFixed(2), 20, 118)

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(t('qt_ttc') + ' : ' + l.currencySymbol + Math.round(q.amount * (1 + q.tax / 100)).toFixed(2), 20, 130)

  if (q.notes) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.line(20, 138, 190, 138)
    doc.text(t('qt_field_notes') + ' :', 20, 148)
    const noteLines = doc.splitTextToSize(q.notes, 170)
    doc.text(noteLines, 20, 156)
  }

  doc.setFontSize(8)
  doc.setTextColor(150)
  const privacyLines = doc.splitTextToSize(l.privacy, 170)
  doc.text(privacyLines, 20, 268)
  const legalY = 268 + (privacyLines.length * 4)
  const countryCode = (q.country || billingCountry).toLowerCase()
  const legalLines = doc.splitTextToSize(t('law_' + countryCode + '_legal'), 170)
  doc.text(legalLines, 20, legalY)

  doc.save('devis-' + q.id + '.pdf')
}
