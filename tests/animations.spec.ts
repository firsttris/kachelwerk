// npm run animations: the moving pictures of the cards for the README and the docs
// (docs/animations/*.webp), as MUI's docs-tiles: each card in a short scene, taken frame by frame
// with Chrome's screencast and joined by ffmpeg (libwebp) into an animated WebP. Not a test, and
// apart from npm run screenshots: an animation never comes out twice the same.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { run, type Scene, type Step, scenes } from './scenes';

test.skip(!process.env.KACHELWERK_ANIMATIONS, 'only with npm run animations');
test.setTimeout(10 * 60 * 1000);

const OUT = 'docs/animations';
// Twice the size: the screencast paints CSS pixels, the page is zoomed for sharp pictures
const SCALE = 2;
const FPS = 15;


const record = async (page: Page, scene: Scene) => {
  const width = scene.width ?? 540;
  await page.goto(`/?lang=en&theme=dark&ids=${scene.ids.join(',')}&width=${width}`);
  const section = page.locator('#dark');
  await expect(section.locator('[data-entity]').first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  // The shown cards with a margin, not the whole grid (the boxes count the zoom already)
  const boxes = await section.locator('[data-entity]').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }),
  );
  const margin = 16 * SCALE;
  const left = Math.max(0, Math.min(...boxes.map((b) => b.x)) - margin);
  const top = Math.max(0, Math.min(...boxes.map((b) => b.y)) - margin);
  const clip = {
    x: left,
    y: top,
    width: Math.max(...boxes.map((b) => b.right)) + margin - left,
    height: Math.max(...boxes.map((b) => b.bottom)) + margin - top,
  };

  const dir = mkdtempSync(join(tmpdir(), `kachelwerk-${scene.file}-`));
  const frames: { file: string; time: number }[] = [];
  const cdp = await page.context().newCDPSession(page);
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const file = join(dir, `${String(frames.length).padStart(5, '0')}.jpg`);
    writeFileSync(file, Buffer.from(data, 'base64'));
    frames.push({ file, time: metadata.timestamp ?? Date.now() / 1000 });
    void cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => undefined);
  });
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('no viewport');
  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    everyNthFrame: 1,
    maxWidth: viewport.width,
    maxHeight: viewport.height,
  });

  const steps = [...scene.steps].sort((a, b) => a.at - b.at);
  const duration = scene.ms ?? Math.max(3600, (steps.at(-1)?.at ?? 0) + 1400);
  const start = Date.now();
  while (Date.now() - start < duration) {
    while (steps.length > 0 && steps[0].at <= Date.now() - start) await run(page, steps.shift() as Step);
    await page.waitForTimeout(30);
  }
  await cdp.send('Page.stopScreencast');
  await cdp.detach();
  if (frames.length === 0) throw new Error(`no frames for ${scene.file}`);

  // Each frame as long as it was on screen (the last one until the end)
  const end = frames[0].time + duration / 1000;
  const list = frames
    .map((f, i) => `file '${f.file}'\nduration ${Math.max(0.001, (frames[i + 1]?.time ?? end) - f.time).toFixed(4)}`)
    .join('\n');
  writeFileSync(join(dir, 'frames.txt'), `${list}\nfile '${frames.at(-1)?.file}'\n`);

  // The cards with the section's padding (even sizes, as the WebP encoder wants them)
  const even = (n: number) => 2 * Math.floor(n / 2);
  mkdirSync(OUT, { recursive: true });
  execFileSync('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    join(dir, 'frames.txt'),
    '-vf',
    // boundingBox already counts the zoom: its pixels are the frame's
    `fps=${FPS},crop=${even(clip.width)}:${even(clip.height)}:${even(clip.x)}:${even(clip.y)}`,
    '-c:v',
    'libwebp_anim',
    '-loop',
    '0',
    // Below 100 the encoder leaves traces where something shrinks (still lossy)
    '-quality',
    '100',
    '-compression_level',
    '6',
    '-pix_fmt',
    'yuv420p',
    join(OUT, `${scene.file}.webp`),
  ]);
  rmSync(dir, { recursive: true, force: true });
};

test('animations', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 880 * SCALE, height: 900 * SCALE },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addInitScript((zoom) => {
    document.addEventListener('DOMContentLoaded', () => {
      document.documentElement.style.zoom = String(zoom);
    });
  }, SCALE);
  const only = process.env.ANIMATIONS ? process.env.ANIMATIONS.split(',') : undefined;
  for (const scene of scenes) {
    if (only && !only.includes(scene.file)) continue;
    await test.step(scene.file, () => record(page, scene));
  }
});
