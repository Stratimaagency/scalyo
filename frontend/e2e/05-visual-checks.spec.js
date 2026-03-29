import { test, expect } from '@playwright/test'

test.describe('Visual & layout checks', () => {
  test('landing page renders visible content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Page should not be blank
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyHeight).toBeGreaterThan(500)
    // Should have some text content
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(100)
  })

  test('login page is properly sized', async ({ page }) => {
    await page.goto('/login')
    const loginCard = page.locator('.login-card')
    await expect(loginCard).toBeVisible()
    const box = await loginCard.boundingBox()
    expect(box).not.toBeNull()
    expect(box.width).toBeGreaterThan(300)
    expect(box.width).toBeLessThan(600)
  })

  test('register form fields are all visible', async ({ page }) => {
    await page.goto('/login')
    await page.locator('span[style*="font-weight: 600"][style*="cursor: pointer"]').last().click()
    await expect(page.locator('button.chip').first()).toBeVisible({ timeout: 3000 })
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    // Role chips (4 roles)
    const chips = page.locator('button.chip')
    const chipCount = await chips.count()
    expect(chipCount).toBeGreaterThanOrEqual(4)
    // Plan options (3 plans)
    await expect(page.locator('.plan-option')).toHaveCount(3)
  })

  test('no elements overflow the viewport on login', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/login')
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
    expect(hasHScroll).toBe(false)
  })

  test('no elements overflow the viewport on landing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
    expect(hasHScroll).toBe(false)
  })

  test('mobile viewport - login works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/login')
    await expect(page.locator('.login-card')).toBeVisible()
    const box = await page.locator('.login-card').boundingBox()
    expect(box.width).toBeLessThanOrEqual(375)
  })

  test('legal page tabs work', async ({ page }) => {
    await page.goto('/legal')
    const tabs = page.locator('button.legal-tab')
    await expect(tabs).toHaveCount(2)
    await tabs.nth(1).click()
    // Content should still be visible after tab switch
    const content = await page.locator('.legal-container').innerText()
    expect(content.length).toBeGreaterThan(50)
  })
})
