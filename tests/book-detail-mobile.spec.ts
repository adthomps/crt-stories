import { test, expect } from '@playwright/test';

test.describe('Book Detail Mobile Layout', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 12
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });

  test('Book detail page stacks content in one column and is readable', async ({ page }) => {
    await page.goto('http://localhost:3000/books/true-story-of-trafalgar');


    // Wait for the main title to be visible (ensures page is loaded)
    await page.waitForSelector('h1.page-title', { state: 'visible', timeout: 10000 });
    await expect(page.locator('h1.page-title')).toBeVisible();

    // Check that the cover image is visible and full width
    const cover = page.locator('.book-detail-cover');
    await expect(cover).toBeVisible();
    const coverBox = await cover.boundingBox();
    expect(coverBox?.width).toBeGreaterThan(200); // Should be wide on mobile

    // Check that the tags are visible
    await expect(page.locator('.tag-list')).toBeVisible();

    // Check that the About the Book section is visible and not squeezed
    await expect(page.locator('h2', { hasText: 'About the Book' })).toBeVisible();
    const aboutSection = page.locator('h2', { hasText: 'About the Book' }).locator('..');
    const aboutBox = await aboutSection.boundingBox();
    expect(aboutBox?.width).toBeGreaterThan(200);

    // Check that the main content is not horizontally scrollable
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth - clientWidth).toBeLessThan(10);
  });
});
