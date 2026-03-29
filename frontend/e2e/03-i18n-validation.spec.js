import { test, expect } from '@playwright/test'

test.describe('i18n — Language switching', () => {
  test('login page renders without raw i18n keys', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('body')).toBeVisible()
    const bodyText = await page.locator('body').innerText()
    // Should not contain common raw key patterns
    const rawKeys = ['smartImport', 'portfolioARR', 'avgHealth', 'trialBanner', 'errAllFields']
    for (const key of rawKeys) {
      expect(bodyText).not.toContain(key)
    }
  })

  test('login page has no {days} placeholder visible', async ({ page }) => {
    await page.goto('/login')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toContain('{days}')
    expect(bodyText).not.toContain('{count}')
  })

  test('legal page renders content (not empty)', async ({ page }) => {
    await page.goto('/legal')
    const content = await page.locator('.legal-container').innerText()
    expect(content.length).toBeGreaterThan(100)
  })
})

test.describe('i18n — No broken templates', () => {
  test('no raw i18n keys on landing page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const bodyText = await page.locator('body').innerText()
    const knownKeys = ['smartImport', 'portfolioARR', 'avgHealth', 'healthyPortfolio',
      'monitorClosely', 'actionRequired', 'criticalAccounts', 'trialBannerMsg',
      'trialDaysLeftMsg', 'verifyEmailBanner', 'errAllFields', 'errEmailPass']
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
