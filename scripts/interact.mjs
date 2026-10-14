// Clicks through a tile on the demo page and screenshots the steps:
// node scripts/interact.mjs <entity> <button label> [ms ...]
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [entity, label, ...waits] = process.argv.slice(2);
const server = await createServer({ root: 'demo', configFile: 'vite.config.ts', server: { port: 4212 }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror', String(e)));
page.on('console', (m) => console.log('console', m.text()));
await page.goto('http://localhost:4212/');
await page.waitForTimeout(800);
const card = page.locator(`#light [data-entity="${entity}"]`);
await card.getByRole('button', { name: label, exact: true }).click();
mkdirSync('shots', { recursive: true });
let t = 0;
for (const ms of waits.map(Number)) {
  await page.waitForTimeout(ms - t);
  t = ms;
  await card.screenshot({ path: `shots/${entity}-${ms}.png` });
  console.log(`shots/${entity}-${ms}.png`, await card.getByRole('slider').first().getAttribute('aria-valuetext'));
}
await browser.close();
await server.close();
