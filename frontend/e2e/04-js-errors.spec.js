import { test, expect } from '@playwright/test'

test.describe('JavaScript console errors', () => {
  const pagesToCheck = [
    { name: 'Landing', url: '/' },
    { name: 'Login', url: '/login' },
    { name: 'Legal', url: '/legal' },
  ]

  for (const { name, url } of pagesToCheck) {
    test(`${name} page has no JS errors`, async ({ page }) => {
      const errors = []
      page.on('pageerror', (err) => {
        // Ignore known non-critical errors
        if (err.message.includes('ResizeObserver')) return
        if (err.message.includes('Failed to fetch')) return
        errors.push(err.message)
      })

      await page.goto(url)
      await page.waitForLoadState('networkidle')
      // Wait a bit for async operations
      await page.waitForTimeout(2000)

      if (errors.length > 0) {
        console.log(`JS errors on ${name}:`, errors)
      }
      expect(errors).toHaveLength(0)
    })
  }

  // Test that all authenticated routes at least load the shell
  // (they'll redirect to login, but shouldn't crash)
  const appRoutes = [
    'dashboard', 'portfolio', 'kpis', 'tasks', 'planning',
    'wellbeing', 'coach', 'resources', 'email-studio', 'settings',
    'tips', 'roadmap', 'feedback', 'integrations', 'quotes', 'import',
  ]

  for (const route of appRoutes) {
    test(`/app/${route} doesn't crash on load`, async ({ page }) => {
      const errors = []
      page.on('pageerror', (err) => {
        if (err.message.includes('ResizeObserver')) return
        if (err.message.includes('Failed to fetch')) return
        if (err.message.includes('Network Error')) return
        errors.push(err.message)
      })

      await page.goto(`/app/${route}`)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1000)

      expect(errors).toHaveLength(0)
    })
  }
})
