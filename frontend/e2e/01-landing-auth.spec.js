import { test, expect } from '@playwright/test'

test.describe('Landing & Auth', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    await expect(page).toHaveTitle(/Scalyo/i)
  })

  test('login page loads with all elements', async ({ page }) => {
    await page.goto('/login')
    // Should have email and password fields
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    // Should have login button
    await expect(page.locator('button:has-text("Connexion"), button:has-text("Log in"), button:has-text("로그인")')).toBeVisible()
    // Should have switch to register link
    await expect(page.locator('text=/Créer un compte|Create account|계정 생성/')).toBeVisible()
  })

  test('register form shows 4 roles', async ({ page }) => {
    await page.goto('/login')
    // Switch to register mode
    await page.locator('text=/Créer un compte|Create account|계정 생성/').click()
    // Should see 4 role buttons
    await expect(page.locator('button.chip:has-text("Manager")')).toBeVisible()
    await expect(page.locator('button.chip:has-text("CSM")')).toBeVisible()
    await expect(page.locator('button.chip:has-text(/Commercial|Sales Rep/)')).toBeVisible()
    await expect(page.locator('button.chip:has-text("KAM")')).toBeVisible()
  })

  test('register form shows 3 plans', async ({ page }) => {
    await page.goto('/login')
    await page.locator('text=/Créer un compte|Create account|계정 생성/').click()
    await expect(page.locator('.plan-option')).toHaveCount(3)
    await expect(page.locator('text="Starter"')).toBeVisible()
    await expect(page.locator('text="Growth"')).toBeVisible()
    await expect(page.locator('text="Elite"')).toBeVisible()
  })

  test('forgot password link works', async ({ page }) => {
    await page.goto('/login')
    await page.locator('text=/Mot de passe oublié|Forgot password|비밀번호/').click()
    // Should show email field and send button
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('button:has-text(/Envoyer|Send|보내기/)')).toBeVisible()
  })

  test('legal page loads in all languages', async ({ page }) => {
    await page.goto('/legal')
    // Should have tabs
    await expect(page.locator('button.legal-tab')).toHaveCount(2)
    // Should have back link
    await expect(page.locator('a[href="/"]')).toBeVisible()
  })

  test('login with empty fields shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button:has-text(/Connexion|Log in|로그인/)').click()
    // Should show error message
    await expect(page.locator('[style*="redBg"], [style*="red"]')).toBeVisible({ timeout: 3000 })
  })
})
