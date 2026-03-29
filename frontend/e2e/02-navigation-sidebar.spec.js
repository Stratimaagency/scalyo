import { test, expect } from '@playwright/test'

test.describe('Navigation & Routing', () => {
  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/app/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('all app routes exist and don\'t 404', async ({ page }) => {
    const routes = [
      '/app/dashboard', '/app/portfolio', '/app/kpis', '/app/tasks',
      '/app/planning', '/app/wellbeing', '/app/coach', '/app/resources',
      '/app/email-studio', '/app/settings', '/app/tips', '/app/roadmap',
      '/app/feedback', '/app/integrations', '/app/quotes', '/app/import',
    ]
    for (const route of routes) {
      const response = await page.goto(route)
      expect(response?.status()).toBeLessThan(400)
    }
  })

  test('landing page has CTA links', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Should have at least one link to /login
    const loginLinks = page.locator('a[href="/login"]')
    const count = await loginLinks.count()
    expect(count).toBeGreaterThan(0)
  })
})
