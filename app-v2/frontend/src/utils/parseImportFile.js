import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export async function parseImportFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const isExcel = ['xlsx', 'xls', 'xlsm'].includes(ext)
  const isCsv = ['csv', 'tsv'].includes(ext)

  if (isExcel) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' })
          const sheetName = wb.SheetNames[0]
          const sheet = wb.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
          const headers = rows.length > 0 ? Object.keys(rows[0]) : []
          resolve({
            type: 'spreadsheet',
            headers,
            rows,
            sample: rows.slice(0, 5),
            rowCount: rows.length,
            fileName: file.name,
          })
        } catch (err) { reject(err) }
      }
      reader.onerror = () => reject(new Error('File read error'))
      reader.readAsArrayBuffer(file)
    })
  }

  if (isCsv) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const rows = result.data || []
          const headers = result.meta?.fields || (rows.length > 0 ? Object.keys(rows[0]) : [])
          resolve({
            type: 'spreadsheet',
            headers,
            rows,
            sample: rows.slice(0, 5),
            rowCount: rows.length,
            fileName: file.name,
          })
        },
        error: (err) => reject(err),
      })
    })
  }

  // Fallback: read as text
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve({
      type: 'text',
      raw: e.target.result,
      headers: [],
      rows: [],
      sample: [],
      rowCount: 0,
      fileName: file.name,
    })
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsText(file, 'utf-8')
  })
}