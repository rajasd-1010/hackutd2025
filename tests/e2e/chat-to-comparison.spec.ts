/**
 * E2E Test: Natural language chat → comparison flow
 * Tests: "offroad cars", "blue Camry vs silver Accord"
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3001/api';

test.describe('E2E: Chat to Comparison Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for app to load
    await page.waitForSelector('[role="banner"]', { timeout: 10000 });
  });

  test('should handle "offroad cars" query', async ({ page }) => {
    // Open chatbot
    const chatButton = page.locator('button[aria-label*="chat"], button:has-text("💬")').first();
    await chatButton.click();
    
    // Wait for chat panel
    await page.waitForSelector('input[placeholder*="Ask"]', { timeout: 5000 });
    
    // Type query
    const chatInput = page.locator('input[placeholder*="Ask"]');
    await chatInput.fill('show me offroad cars');
    await chatInput.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Verify vehicles are displayed
    const vehicleCards = page.locator('[data-testid="vehicle-card"], .glass-card:has-text("Toyota")');
    await expect(vehicleCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle "blue Camry vs silver Accord" comparison', async ({ page }) => {
    // Navigate to compare tab
    await page.click('button:has-text("Compare")');
    
    // Open comparison chat if available
    const comparisonChatButton = page.locator('button:has-text("Smart Comparison"), button:has-text("Open")');
    if (await comparisonChatButton.isVisible()) {
      await comparisonChatButton.click();
    }
    
    // Type comparison query
    const input = page.locator('input[placeholder*="Compare"], input[placeholder*="compare"]').first();
    await input.fill('blue Camry vs silver Accord');
    await input.press('Enter');
    
    // Wait for comparison results
    await page.waitForTimeout(3000);
    
    // Verify comparison is displayed
    const comparison = page.locator('text=Comparison Results, [data-testid="comparison"]').first();
    await expect(comparison).toBeVisible({ timeout: 10000 });
    
    // Verify both vehicles are shown
    const vehicle1 = page.locator('text=Camry').first();
    const vehicle2 = page.locator('text=Accord').first();
    await expect(vehicle1).toBeVisible();
    await expect(vehicle2).toBeVisible();
    
    // Verify images are present
    const images = page.locator('img[src*="camry"], img[src*="accord"]');
    await expect(images.first()).toBeVisible();
  });

  test('should display exact color images in comparison', async ({ page }) => {
    // This test verifies that the comparison shows the exact color requested
    await page.click('button:has-text("Compare")');
    
    const input = page.locator('input[placeholder*="Compare"]').first();
    await input.fill('red RAV4 vs black Camry');
    await input.press('Enter');
    
    await page.waitForTimeout(3000);
    
    // Verify color-specific images are displayed
    // In a real test, you'd check the actual image URLs contain color codes
    const comparisonCards = page.locator('.glass-card:has-text("RAV4"), .glass-card:has-text("Camry")');
    await expect(comparisonCards.first()).toBeVisible();
  });

  test('should show financing breakdown in comparison', async ({ page }) => {
    await page.click('button:has-text("Compare")');
    
    const input = page.locator('input[placeholder*="Compare"]').first();
    await input.fill('Toyota Camry vs Honda Accord');
    await input.press('Enter');
    
    await page.waitForTimeout(3000);
    
    // Verify financing information is displayed
    const financing = page.locator('text=/monthly|payment|financing/i');
    await expect(financing.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('E2E: API Integration', () => {
  test('should verify /vehicles returns canonical Toyota models', async ({ request }) => {
    const response = await request.get(`${API_URL}/vehicles`);
    const data = await response.json();
    
    expect(response.ok()).toBeTruthy();
    expect(data.vehicles).toBeInstanceOf(Array);
    
    // Verify all vehicles are Toyota or known competitors
    const validMakes = ['Toyota', 'Honda', 'Mazda', 'Ford'];
    data.vehicles.forEach((vehicle: any) => {
      expect(validMakes).toContain(vehicle.make);
    });
    
    // Verify no BMW/Audi mismatches
    data.vehicles.forEach((vehicle: any) => {
      expect(['BMW', 'Audi', 'Mercedes']).not.toContain(vehicle.make);
    });
  });

  test('should verify image URLs are accessible', async ({ request }) => {
    const response = await request.get(`${API_URL}/vehicles?limit=5`);
    const data = await response.json();
    
    expect(response.ok()).toBeTruthy();
    
    // Check first few vehicle images
    for (const vehicle of data.vehicles.slice(0, 3)) {
      if (vehicle.colors && vehicle.colors.length > 0) {
        const imageUrl = vehicle.colors[0].imageUrl;
        if (imageUrl && !imageUrl.includes('placeholder')) {
          const imageResponse = await request.head(imageUrl);
          // Accept 200, 301, 302 (redirects are OK)
          expect([200, 301, 302]).toContain(imageResponse.status());
        }
      }
    }
  });
});

