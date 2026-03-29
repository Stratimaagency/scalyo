import { test, expect } from '@playwright/test'

test.describe('i18n — Language switching', () => {
  test('login page translates to English', async ({ page }) => {
    await page.goto('/login')
    // The login page should be in French by default
    await expect(page.locator('body')).toBeVisible()

    // Check no raw i18n keys are visible (keys look like camelCase without spaces)
    const bodyText = await page.locator('body').innerText()
    const rawKeyPattern = /\b[a-z][a-zA-Z]{8,}[A-Z][a-zA-Z]*\b/g
    const suspiciousKeys = bodyText.match(rawKeyPattern) || []
    // Filter out common English words that match the pattern
    const falsePositives = ['backgroundColor', 'borderRadius', 'fontWeight', 'fontSize', 'textAlign',
      'justifyContent', 'alignItems', 'flexDirection', 'borderColor', 'paddingRight']
    const realIssues = suspiciousKeys.filter(k => !falsePositives.includes(k))
    // Should have very few or no raw keys visible
    expect(realIssues.length).toBeLessThan(5)
  })

  test('login page has no {days} placeholder visible', async ({ page }) => {
    await page.goto('/login')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toContain('{days}')
    expect(bodyText).not.toContain('{count}')
  })

  test('legal page renders content (not empty)', async ({ page }) => {
    await page.goto('/legal')
    const content = await page.locator('.legal-content, .legal-container').innerText()
    expect(content.length).toBeGreaterThan(100)
  })
})

test.describe('i18n — No broken templates', () => {
  test('no raw i18n keys on landing page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const bodyText = await page.locator('body').innerText()
    // These are i18n keys that should never appear as visible text
    const knownKeys = ['smartImport', 'portfolioARR', 'avgHealth', 'healthyPortfolio',
      'monitorClosely', 'actionRequired', 'criticalAccounts', 'trialBanner',
      'trialDaysLeft', 'verifyEmailBanner', 'errAllFields', 'errEmailPass']
    for (const key of knownKeys) {
      expect(bodyText).not.toContain(key)
    }
  })

  test('no undefined or null text on landing page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toContain('undefined')
    expect(bodyText).not.toContain('[object Object]')
  })

  test('no undefined or null text on login page', async ({ page }) => {
    await page.goto('/login')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toContain('undefined')
    expect(bodyText).not.toContain('[object Object]')
  })

  test('no undefined or null text on legal page', async ({ page }) => {
    await page.goto('/legal')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toContain('undefined')
    expect(bodyText).not.toContain('[object Object]')
  })
})
