import { test, expect } from '@playwright/test'

test.describe('Visual & layout checks', () => {
  test('landing page renders visible content', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Should have the Scalyo logo/brand
    const hasScalyo = await page.locator('text=Scalyo, text=scalyo').count()
    expect(hasScalyo).toBeGreaterThan(0)
    // Page should not be blank
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
    expect(bodyHeight).toBeGreaterThan(500)
  })

  test('login page is properly sized', async ({ page }) => {
    await page.goto('/login')
    // Login card should be visible and centered
    const loginCard = page.locator('.login-card')
    await expect(loginCard).toBeVisible()
    const box = await loginCard.boundingBox()
    expect(box).not.toBeNull()
    expect(box.width).toBeGreaterThan(300)
    expect(box.width).toBeLessThan(600)
  })

  test('register form fields are all visible', async ({ page }) => {
    await page.goto('/login')
    await page.locator('text=/Créer un compte|Create account|계정 생성/').click()
    // All fields should be visible without scrolling in the card
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    // Role chips
    const chips = page.locator('button.chip')
    const chipCount = await chips.count()
    expect(chipCount).toBeGreaterThanOrEqual(4) // 4 roles
    // Plan options
    const plans = page.locator('.plan-option')
    await expect(plans).toHaveCount(3)
  })

  test('no elements overflow the viewport on login', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/login')
    // Check no horizontal scroll
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
    await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
    await page.goto('/login')
    await expect(page.locator('.login-card')).toBeVisible()
    const box = await page.locator('.login-card').boundingBox()
    expect(box.width).toBeLessThanOrEqual(375)
  })

  test('legal page tabs work', async ({ page }) => {
    await page.goto('/legal')
    const tabs = page.locator('button.legal-tab')
    await expect(tabs).toHaveCount(2)
    // Click second tab
    await tabs.nth(1).click()
    // Content should change
    await expect(page.locator('.legal-content, div[v-html]')).toBeVisible()
  })
})
