import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/**
 * Parse fichier importé : retourne le contenu brut pour analyse IA
 * L'IA fait tout le travail : détection format, nettoyage, extraction
 */
export async function parseImportFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (['csv', 'tsv', 'txt'].includes(ext)) {
    const rawText = await file.text()
    return { type: 'text', raw: rawText, fileName: file.name }
  }

  if (['xlsx', 'xls'].includes(ext)) {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { cellDates: true, cellNF: false, cellText: false })
    let textContent = ''
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName]
      const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';', RS: '\n', blankrows: false })
      if (csv.trim()) {
        textContent += '--- Sheet: ' + sheetName + ' ---\n' + csv + '\n\n'
      }
    }
    return { type: 'text', raw: textContent, fileName: file.name }
  }

  if (ext === 'json') {
    const text = await file.text()
    return { type: 'text', raw: text, fileName: file.name }
  }

  const text = await file.text()
  return { type: 'text', raw: text, fileName: file.name }
}