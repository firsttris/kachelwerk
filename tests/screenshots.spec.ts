// npm run screenshots: the pictures for the README and the docs, light and dark, in English
import { expect, test } from '@playwright/test';

const DIR = 'docs/screenshots';

// One picture per card type (only=…); hero is the README's picture on top, chosen cards whose
// widths fill the rows (ids=…)
const HERO = [
  'switch.licht_flur',
  'switch.licht_bad',
  'switch.server',
  'climate.bad',
  'climate.wohnraum',
  'cover.wohnzimmer',
  'cover.buero',
  'light.streifen',
].join(',');

const SHOTS: Record<string, string> = {
  hero: `ids=${HERO}`,
  shutter: 'only=shutter',
  light: 'only=light',
  thermostat: 'only=thermostat',
  aircon: 'only=aircon',
  floor: 'only=floor',
  window: 'only=window',
  garage: 'only=garage',
  lock: 'only=lock',
  'climate-sensor': 'only=climate-sensor',
  meter: 'only=meter',
  sensor: 'only=sensor',
  detector: 'only=detector',
  valve: 'only=valve',
  buttons: 'only=buttons',
};

test.skip(!process.env.KACHELWERK_SCREENSHOTS, 'only with npm run screenshots');

for (const theme of ['light', 'dark'] as const) {
  for (const [file, cards] of Object.entries(SHOTS)) {
    test(`${file} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 820, height: 900 });
      await page.goto(`/?lang=en&theme=${theme}&${cards}&width=780`);
      const section = page.locator(`#${theme}`);
      await expect(section.locator('[data-entity]').first()).toBeVisible();
      await page.waitForLoadState('networkidle');
      // Fonts and the lamps' first glow
      await page.waitForTimeout(800);
      await section.screenshot({
        path: `${DIR}/${file}${theme === 'dark' ? '-dark' : ''}.png`,
        animations: 'disabled',
      });
    });
  }
}
