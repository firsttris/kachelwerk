import { expect, type Page } from '@playwright/test';

export interface Call {
  domain: string;
  service: string;
  data: Record<string, unknown>;
}

// Opens the demo page and waits until the cards are drawn
export const openDemo = async (page: Page, query = '') => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(`/?lang=en${query}`);
  await expect(page.locator('[data-entity]').first()).toBeVisible();
  // Vite answers a first request with 504 while it bundles: the page reloads once
  await page.waitForLoadState('networkidle');
  return errors;
};

// The service calls the cards made (demo.ts keeps them in window.calls)
export const calls = (page: Page) => page.evaluate(() => (window as unknown as { calls: Call[] }).calls);

export const card = (page: Page, entity: string) => page.locator(`#light [data-entity="${entity}"]`);

// Holds the pointer on an element for a while, as a finger does
export const hold = async (page: Page, target: ReturnType<Page['locator']>, ms: number) => {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error('not visible');
  await page.mouse.move(box.x + 20, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
};
