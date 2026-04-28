import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/**
 * Parse fichier importé : CSV, XLSX/XLS, JSON, texte brut
 * Retourne un objet { type, sheets, data, sheetNames? }
 */
export async function parseImportFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true, skipEmptyLines: true, dynamicTyping: true,
        complete: r => resolve({
          type: 'tabular',
          sheets: { Sheet1: { headers: r.meta.fields || [], rowCount: r.data.length, sample: r.data.slice(0, 10) } },
          data: r.data.slice(0, 500)
        }),
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
