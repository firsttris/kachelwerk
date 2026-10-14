// Screenshots of the demo page (demo/), both themes, for a look at the
// tiles without Home Assistant: node scripts/shots.mjs [width] [lang]
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const width = Number(process.argv[2] ?? 1280);
const lang = process.argv[3] ?? 'de';
const server = await createServer({ root: 'demo', configFile: 'vite.config.ts', server: { port: 4211 }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`http://localhost:4211/?lang=${lang}`);
await page.waitForTimeout(1200);
mkdirSync('shots', { recursive: true });
await page.screenshot({ path: `shots/demo-${width}-${lang}.png`, fullPage: true });
if (errors.length) console.log('Fehler:\n' + errors.join('\n'));
console.log(`shots/demo-${width}-${lang}.png`);
await browser.close();
await server.close();
