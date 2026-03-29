import { test, expect } from '@playwright/test'

test.describe('Landing & Auth', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })

  test('login page loads with all elements', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    // Login button — use class selector
    await expect(page.locator('.btn.btn-primary')).toBeVisible()
    // Switch to register link
    await expect(page.locator('.login-card span[style*="cursor: pointer"]').first()).toBeVisible()
  })

  test('register form shows 4 roles', async ({ page }) => {
    await page.goto('/login')
    // Switch to register mode — click the link with font-weight 600 (not the forgot password link)
    await page.locator('span[style*="font-weight: 600"][style*="cursor: pointer"]').last().click()
    // Wait for register form to appear
    await expect(page.locator('button.chip').first()).toBeVisible({ timeout: 3000 })
    // Should see 4 role chips
    const chips = page.locator('button.chip')
    await expect(chips).toHaveCount(4)
    await expect(chips.nth(0)).toBeVisible()
    await expect(chips.nth(1)).toBeVisible()
    await expect(chips.nth(2)).toBeVisible()
    await expect(chips.nth(3)).toBeVisible()
  })

  test('register form shows 3 plans', async ({ page }) => {
    await page.goto('/login')
    await page.locator('span[style*="font-weight: 600"][style*="cursor: pointer"]').last().click()
    await expect(page.locator('.plan-option').first()).toBeVisible({ timeout: 3000 })
    await expect(page.locator('.plan-option')).toHaveCount(3)
  })

  test('forgot password link works', async ({ page }) => {
    await page.goto('/login')
    // Click forgot password link (small text near password field)
    await page.locator('span[style*="cursor: pointer"][style*="teal"]').first().click()
    // Should show email field and a primary button
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('.btn.btn-primary')).toBeVisible()
    // Password field should be hidden
    await expect(page.locator('input[type="password"]')).not.toBeVisible()
  })

  test('legal page loads with tabs', async ({ page }) => {
    await page.goto('/legal')
    await expect(page.locator('button.legal-tab')).toHaveCount(2)
    await expect(page.locator('a[href="/"]')).toBeVisible()
  })

  test('login with empty fields shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('.btn.btn-primary').click()
    // Should show error message (red background)
    await expect(page.locator('[style*="redBg"]').or(page.locator('[style*="red"]'))).toBeVisible({ timeout: 3000 })
  })
})
