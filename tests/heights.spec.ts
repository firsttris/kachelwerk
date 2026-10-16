// No tile changes its height while it is used: every scene of the animations
// (scenes.ts) played through at a card pair's width, the heights of its tiles
// taken after each step. A button that goes away, a line that disappears or a
// label that wraps would make the dashboard jump.
import { expect, test } from '@playwright/test';
import { run, scenes } from './scenes';

for (const scene of scenes) {
  test(`${scene.file}: no tile changes its height`, async ({ page }) => {
    await page.goto(`/?lang=en&theme=dark&ids=${scene.ids.join(',')}&width=${scene.width ?? 540}`);
    const tiles = page.locator('#dark [data-entity]');
    await expect(tiles.first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const heights = () => tiles.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
    const first = await heights();
    for (const step of [...scene.steps].sort((a, b) => a.at - b.at)) {
      await run(page, step);
      // Past the transitions (heights animate in 500 ms at most)
      await page.waitForTimeout(600);
      expect(await heights(), `after ${JSON.stringify(step)}`).toEqual(first);
    }
  });
}
