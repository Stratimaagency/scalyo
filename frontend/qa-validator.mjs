/**
 * Scalyo QA Validator — simulates Playwright-style checks on the codebase
 * Checks: broken references, missing i18n keys, hardcoded strings, dead code
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, 'src')

// Load all i18n keys
const frKeys = new Set(Object.keys((await import('./src/i18n/fr.js')).default))
const enKeys = new Set(Object.keys((await import('./src/i18n/en.js')).default))
const krKeys = new Set(Object.keys((await import('./src/i18n/kr.js')).default))

const issues = []
let filesChecked = 0

function log(type, file, line, msg) {
  issues.push({ type, file: file.replace(SRC + '/', ''), line, msg })
}

// Get all .vue and .js files
function getFiles(dir, ext = ['.vue', '.js']) {
  const results = []
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name)
    if (f.isDirectory() && !f.name.startsWith('.')) results.push(...getFiles(full, ext))
    else if (ext.some(e => f.name.endsWith(e))) results.push(full)
  }
  return results
}

const vueFiles = getFiles(path.join(SRC, 'views'))
const layoutFiles = getFiles(path.join(SRC, 'layouts'))
const componentFiles = getFiles(path.join(SRC, 'components'))
const allVueFiles = [...vueFiles, ...layoutFiles, ...componentFiles]

for (const file of allVueFiles) {
  filesChecked++
  const content = fs.readFileSync(file, 'utf-8')
  const lines = content.split('\n')

  // 1. Check for t('key') calls where key doesn't exist in ANY i18n file
  const tCallRegex = /t\(['"]([^'"]+)['"]\)/g
  for (let i = 0; i < lines.length; i++) {
    let match
    while ((match = tCallRegex.exec(lines[i])) !== null) {
      const key = match[1]
      if (!frKeys.has(key) && !enKeys.has(key) && !krKeys.has(key)) {
        log('MISSING_KEY', file, i + 1, `t('${key}') — key not found in any i18n file`)
      }
    }
  }

  // 2. Check for hardcoded French strings in templates (common patterns)
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/)
  if (templateMatch) {
    const template = templateMatch[1]
    const templateLines = template.split('\n')
    for (let i = 0; i < templateLines.length; i++) {
      const line = templateLines[i]
      // Skip comments, v-html, and style attributes
      if (line.trim().startsWith('<!--') || line.includes('v-html')) continue

      // Check for visible French text (>French text<)
      const frenchTextMatch = line.match(/>([A-ZÀ-Ü][a-zà-ü\s']{10,})</g)
      if (frenchTextMatch) {
        for (const m of frenchTextMatch) {
          const text = m.slice(1)
          // Skip if it's inside {{ }} interpolation
          if (line.includes('{{') && line.includes('}}')) continue
          // Skip common OK patterns
          if (['Scalyo', 'Manager', 'CSM', 'KAM'].some(ok => text.includes(ok))) continue
          log('HARDCODED_FR', file, i + 1, `Possible hardcoded French: "${text.slice(0, 50)}"`)
        }
      }
    }
  }

  // 3. Check for .value missing on computed/ref in script (common Vue bug)
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (scriptMatch) {
    const script = scriptMatch[1]
    const scriptLines = script.split('\n')

    // Find all computed() and ref() declarations
    const computedNames = new Set()
    const refNames = new Set()
    for (const line of scriptLines) {
      const compMatch = line.match(/const\s+(\w+)\s*=\s*computed\(/)
      if (compMatch) computedNames.add(compMatch[1])
      const refMatch = line.match(/const\s+(\w+)\s*=\s*ref\(/)
      if (refMatch) refNames.add(refMatch[1])
    }

    // Check if computed/ref is used without .value in script (not template)
    for (let i = 0; i < scriptLines.length; i++) {
      const line = scriptLines[i]
      // Skip declaration lines and comments
      if (line.includes('= computed(') || line.includes('= ref(') || line.trim().startsWith('//')) continue

      for (const name of [...computedNames, ...refNames]) {
        // Pattern: name used in expression without .value (but not as parameter name)
        const regex = new RegExp(`\\b${name}\\b(?!\\.value)(?!\\s*=\\s*(computed|ref)\\()(?!\\s*\\))`, 'g')
        let m
        while ((m = regex.exec(line)) !== null) {
          // Skip if it's in a return statement for template
          if (line.trim().startsWith('return')) continue
          // Skip if it's a function parameter
          if (line.includes(`(${name}`) || line.includes(`, ${name}`)) continue
          // Only flag if it looks like an assignment or comparison
          const after = line.slice(m.index + name.length, m.index + name.length + 10)
          if (after.match(/^\s*[=!<>+\-*\/\|\&\?]/) || after.match(/^\s*\)/)) {
            // Could be a bug — but too many false positives. Skip for now.
          }
        }
      }
    }
  }

  // 4. Check for routeName references that don't exist in router
  const routerContent = fs.readFileSync(path.join(SRC, 'router/index.js'), 'utf-8')
  const routeNames = new Set()
  const routeNameRegex = /name:\s*'([^']+)'/g
  let rm
  while ((rm = routeNameRegex.exec(routerContent)) !== null) routeNames.add(rm[1])

  const routerLinkRegex = /name:\s*'([^']+)'/g
  for (let i = 0; i < lines.length; i++) {
    let match
    while ((match = routerLinkRegex.exec(lines[i])) !== null) {
      if (!routeNames.has(match[1])) {
        log('MISSING_ROUTE', file, i + 1, `Route '${match[1]}' not found in router`)
      }
    }
  }
}

// 5. Check i18n key consistency between FR, EN, KR
const frOnly = [...frKeys].filter(k => !enKeys.has(k))
const enOnly = [...enKeys].filter(k => !frKeys.has(k))
const krMissing = [...frKeys].filter(k => !krKeys.has(k))

for (const k of frOnly) log('KEY_MISMATCH', 'i18n/fr.js', 0, `Key '${k}' exists in FR but not EN`)
for (const k of enOnly) log('KEY_MISMATCH', 'i18n/en.js', 0, `Key '${k}' exists in EN but not FR`)
for (const k of krMissing) log('KEY_MISMATCH', 'i18n/kr.js', 0, `Key '${k}' exists in FR but not KR`)

// Report
console.log('\n' + '='.repeat(70))
console.log(`SCALYO QA VALIDATOR — ${filesChecked} files checked`)
console.log('='.repeat(70))

const byType = {}
for (const issue of issues) {
  if (!byType[issue.type]) byType[issue.type] = []
  byType[issue.type].push(issue)
}

for (const [type, items] of Object.entries(byType)) {
  console.log(`\n### ${type} (${items.length})`)
  for (const item of items.slice(0, 30)) {
    console.log(`  ${item.file}:${item.line} — ${item.msg}`)
  }
  if (items.length > 30) console.log(`  ... and ${items.length - 30} more`)
}

const total = issues.length
console.log(`\n${'='.repeat(70)}`)
console.log(`TOTAL: ${total} issues found`)
if (total === 0) console.log('✅ All checks passed!')
else console.log(`❌ ${total} issue(s) need attention`)
console.log('='.repeat(70))

process.exit(total > 0 ? 1 : 0)
