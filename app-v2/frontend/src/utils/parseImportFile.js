import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/**
 * Parse fichier importé : CSV, XLSX/XLS, JSON, texte brut
 * Retourne un objet { type, sheets, data, sheetNames? }
 */

/**
 * Nettoie le texte brut avant parsing CSV :
 * - Supprime les lignes markdown, code blocks, commentaires
 * - Détecte automatiquement le délimiteur (; , \t |)
 */
function cleanCSVText(raw) {
  const allLines = raw.split(/\r?\n/)
  const delimiters = [';', ',', '\t', '|']
  let bestDel = ','
  let maxAvg = 0
  for (const d of delimiters) {
    const counts = allLines.map(l => {
      let cnt = 0
      for (let i = 0; i < l.length; i++) { if (l[i] === d) cnt++ }
      return cnt
    }).filter(c => c > 0)
    if (counts.length === 0) continue
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length
    if (avg > maxAvg) { maxAvg = avg; bestDel = d }
  }
  const lineCounts = allLines.map(l => {
    let cnt = 0
    for (let i = 0; i < l.length; i++) { if (l[i] === bestDel) cnt++ }
    return cnt
  })
  const freq = {}
  lineCounts.forEach(c => { if (c > 0) freq[c] = (freq[c] || 0) + 1 })
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
  const expectedDels = sorted.length > 0 ? parseInt(sorted[0][0]) : 0
  const dataLines = []
  for (let i = 0; i < allLines.length; i++) {
    const cnt = lineCounts[i]
    if (cnt >= expectedDels - 2 && cnt <= expectedDels + 2 && cnt > 0) {
      let line = allLines[i]
      while (line.endsWith(bestDel)) line = line.slice(0, -1)
      dataLines.push(line)
    }
  }
  return { cleanedText: dataLines.join('\n'), delimiter: bestDel }
}

export async function parseImportFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (['csv', 'tsv', 'txt'].includes(ext)) {
    const rawText = await file.text()
    const { cleanedText, delimiter } = cleanCSVText(rawText)
    return new Promise((resolve, reject) => {
      Papa.parse(cleanedText, {
        header: true, skipEmptyLines: true, dynamicTyping: true, delimiter,
        complete: r => {
          const rows = r.data.filter(row => Object.values(row).some(v => v !== null && v !== ''))
          resolve({
            type: 'tabular',
            sheets: { Sheet1: { headers: r.meta.fields || [], rowCount: rows.length, sample: rows.slice(0, 10) } },
            data: rows.slice(0, 500)
          })
        },
        error: reject,
      })
    })
  }

  if (['xlsx', 'xls'].includes(ext)) {
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf, { cellDates: true, cellNF: false, cellText: false })
    const sheets = {}
    const allData = []
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName]
      const rawRows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false, blankrows: false })
      const cleanRows = rawRows.map(row => {
        const clean = {}
        for (const [k, v] of Object.entries(row)) {
          if (!k || k.startsWith('__EMPTY')) continue
          const str = String(v ?? '')
          if (str.startsWith('=') || str.includes('DUMMYFUNCTION') || str.includes('IFERROR(')) continue
          if (v === null || v === '') continue
          clean[String(k).trim()] = v
        }
        return clean
      }).filter(row => Object.keys(row).length >= 1)
      if (cleanRows.length > 0) {
        const allKeys = [...new Set(cleanRows.flatMap(r => Object.keys(r)))].slice(0, 30)
        sheets[sheetName] = { headers: allKeys, rowCount: cleanRows.length, sample: cleanRows.slice(0, 8) }
        cleanRows.slice(0, 60).forEach(row => allData.push({ _sheet: sheetName, ...row }))
      }
    }
    return { type: 'tabular', sheets, data: allData, sheetNames: wb.SheetNames }
  }

  if (ext === 'json') {
    const text = await file.text()
    try {
      const json = JSON.parse(text)
      const data = Array.isArray(json) ? json : [json]
      return {
        type: 'tabular',
        sheets: { JSON: { headers: Object.keys(data[0] || {}), rowCount: data.length, sample: data.slice(0, 10) } },
        data: data.slice(0, 500)
      }
    } catch {
      return { type: 'text', raw: text.slice(0, 8000), sheets: {} }
    }
  }

  const text = await file.text().catch(() => '')
  return { type: 'text', raw: text.slice(0, 8000), sheets: {} }
}
