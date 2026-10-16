// npm run screenshots: the pictures for the README and the docs, light and dark, in English
import { expect, test } from '@playwright/test';

const DIR = 'docs/screenshots';

// One picture per card type (only=…); hero is the README's picture on top: two
// sections side by side as in HA's sections view, a card pair as wide as in a
// real dashboard (sections=…, cards of a section by ;)
const HERO = [
  [
    'switch.licht_flur',
    'switch.licht_bad',
    'switch.server',
    'climate.wohnraum',
    'media_player.wohnzimmer',
    'cover.wohnzimmer',
    'fan.ventilator_schlafzimmer',
  ],
  ['light.streifen', 'weather.zuhause', 'alarm_control_panel.haus', 'person.anna', 'vacuum.saugroboter'],
]
  .map((section) => section.join(','))
  .join(';');

const SHOTS: Record<string, string> = {
  hero: `sections=${HERO}`,
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
  robot: 'only=robot',
  // Media player
  media: 'only=media',
  // Water heater
  'water-heater': 'only=water-heater',
  alarm: 'only=alarm',
  // Fan and humidifier
  fan: 'only=fan',
  humidifier: 'only=humidifier',
  // Presence and forecast cards
  presence: 'only=presence',
  forecast: 'only=forecast',
};

test.skip(!process.env.KACHELWERK_SCREENSHOTS, 'only with npm run screenshots');

for (const theme of ['light', 'dark'] as const) {
  for (const [file, cards] of Object.entries(SHOTS)) {
    test(`${file} ${theme}`, async ({ page }) => {
      // The sections bring their own width
      const hero = cards.startsWith('sections=');
      await page.setViewportSize({ width: hero ? 1100 : 820, height: 900 });
      await page.goto(`/?lang=en&theme=${theme}&${cards}${hero ? '' : '&width=780'}`);
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
