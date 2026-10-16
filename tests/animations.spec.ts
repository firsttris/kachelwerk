// npm run animations: the moving pictures of the cards for the README and the docs
// (docs/animations/*.webp), as MUI's docs-tiles: each card in a short scene, taken frame by frame
// with Chrome's screencast and joined by ffmpeg (libwebp) into an animated WebP. Not a test, and
// apart from npm run screenshots: an animation never comes out twice the same.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';

test.skip(!process.env.KACHELWERK_ANIMATIONS, 'only with npm run animations');
test.setTimeout(10 * 60 * 1000);

const OUT = 'docs/animations';
// Twice the size: the screencast paints CSS pixels, the page is zoomed for sharp pictures
const SCALE = 2;
const FPS = 15;

type Action =
  // A state change as Home Assistant reports it
  | { set: string; state?: string; attributes?: Record<string, unknown> }
  // A tap on a button of a card, by its accessible name
  | { click: string; button: string };
type Step = Action & { at: number };

interface Scene {
  file: string;
  // The cards shown, in this order (the demo's entities, demo/examples.ts)
  ids: string[];
  width?: number;
  ms?: number;
  steps: Step[];
}

const set = (at: number, entity: string, state?: string, attributes?: Record<string, unknown>): Step => ({
  at,
  set: entity,
  state,
  attributes,
});
const click = (at: number, entity: string, button: string): Step => ({ at, click: entity, button });

const scenes: Scene[] = [
  {
    file: 'shutter',
    ids: ['cover.wohnzimmer'],
    width: 800,
    ms: 5200,
    steps: [
      click(400, 'cover.wohnzimmer', 'Down'),
      // The actuator reports its way down, as a real one does now and then
      set(2600, 'cover.wohnzimmer', 'closing', { current_position: 30 }),
      set(4000, 'cover.wohnzimmer', 'closed', { current_position: 0 }),
    ],
  },
  {
    file: 'light',
    ids: ['switch.licht_flur', 'switch.licht_bad', 'switch.server'],
    width: 760,
    steps: [
      set(500, 'switch.licht_bad', 'on'),
      set(1500, 'switch.server', 'off'),
      set(2500, 'switch.licht_flur', 'off'),
      set(3200, 'switch.server', 'on'),
    ],
  },
  {
    file: 'dimmer',
    ids: ['light.esstisch'],
    width: 800,
    steps: [
      set(400, 'light.esstisch', 'on', { brightness: 38 }),
      set(1500, 'light.esstisch', 'on', { brightness: 255 }),
      set(2700, 'light.esstisch', 'on', { brightness: 153 }),
    ],
  },
  {
    file: 'color-light',
    ids: ['light.streifen'],
    width: 560,
    steps: [
      set(400, 'light.streifen', 'on', { hs_color: [20, 90] }),
      set(1500, 'light.streifen', 'on', { hs_color: [160, 90] }),
      set(2700, 'light.streifen', 'on', { hs_color: [275, 90] }),
    ],
  },
  {
    file: 'thermostat',
    ids: ['climate.bad'],
    width: 800,
    steps: [
      set(500, 'climate.bad', undefined, { temperature: 23.5 }),
      set(1800, 'binary_sensor.fenster_bad', 'on'),
      set(1800, 'climate.bad', undefined, { hvac_action: 'idle' }),
      set(3200, 'binary_sensor.fenster_bad', 'off'),
      set(3200, 'climate.bad', undefined, { temperature: 21, hvac_action: 'heating' }),
    ],
  },
  {
    file: 'aircon',
    ids: ['climate.klima_wohnzimmer'],
    width: 560,
    ms: 5600,
    steps: [
      // Cold air, faster with the fan on high and the louvre swinging; then heating, off, cooling again
      set(800, 'climate.klima_wohnzimmer', undefined, { fan_mode: 'high', swing_mode: 'both' }),
      set(2200, 'climate.klima_wohnzimmer', 'heat', { hvac_action: 'heating', temperature: 24 }),
      set(3500, 'climate.klima_wohnzimmer', 'off', { hvac_action: 'off' }),
      set(4500, 'climate.klima_wohnzimmer', 'cool', {
        hvac_action: 'cooling',
        temperature: 22,
        fan_mode: 'auto',
        swing_mode: 'vertical',
      }),
    ],
  },
  {
    file: 'floor',
    ids: ['number.fbh_wohnzimmer'],
    width: 800,
    steps: [
      set(400, 'number.fbh_wohnzimmer', '15'),
      set(1800, 'number.fbh_wohnzimmer', '100'),
      set(3200, 'number.fbh_wohnzimmer', '62'),
    ],
  },
  {
    file: 'window',
    ids: ['sensor.griff_kueche', 'binary_sensor.fenster_keller'],
    width: 800,
    steps: [
      set(400, 'sensor.griff_kueche', 'closed'),
      set(1400, 'sensor.griff_kueche', 'open'),
      set(1400, 'binary_sensor.fenster_keller', 'on'),
      set(2800, 'sensor.griff_kueche', 'tilted'),
      set(2800, 'binary_sensor.fenster_keller', 'off'),
    ],
  },
  {
    file: 'garage',
    ids: ['cover.garage'],
    width: 560,
    ms: 5000,
    steps: [
      set(400, 'cover.garage', 'opening'),
      set(2200, 'cover.garage', 'open', { current_position: 100 }),
      set(3200, 'cover.garage', 'closing'),
      set(4400, 'cover.garage', 'closed', { current_position: 0 }),
    ],
  },
  {
    file: 'lock',
    ids: ['lock.haustuer'],
    width: 560,
    ms: 4600,
    steps: [
      set(400, 'lock.haustuer', 'unlocking'),
      set(1400, 'lock.haustuer', 'unlocked'),
      set(2800, 'lock.haustuer', 'locking'),
      set(3600, 'lock.haustuer', 'locked'),
    ],
  },
  {
    file: 'climate-sensor',
    ids: ['sensor.wz_temperatur'],
    width: 800,
    steps: [
      set(400, 'sensor.wz_feuchte', '31'),
      set(1600, 'sensor.wz_temperatur', '24.8'),
      set(1600, 'sensor.wz_feuchte', '72'),
      set(2800, 'sensor.wz_temperatur', '21.6'),
      set(2800, 'sensor.wz_feuchte', '48'),
    ],
  },
  {
    file: 'meter',
    ids: ['sensor.netz_leistung'],
    width: 560,
    ms: 4400,
    steps: [
      set(0, 'sensor.netz_leistung', '320'),
      set(1500, 'sensor.netz_leistung', '4200'),
      set(3000, 'sensor.netz_leistung', '-1840'),
    ],
  },
  {
    file: 'sensor',
    ids: ['sensor.co2_buero'],
    width: 800,
    steps: [
      set(400, 'sensor.co2_buero', '640'),
      set(1600, 'sensor.co2_buero', '1240'),
      set(2800, 'sensor.co2_buero', '2350'),
    ],
  },
  {
    file: 'detector',
    ids: ['binary_sensor.rauch_flur', 'binary_sensor.praesenz_buero'],
    width: 800,
    ms: 4000,
    steps: [
      set(0, 'binary_sensor.praesenz_buero', 'off'),
      set(600, 'binary_sensor.rauch_flur', 'on'),
      set(1200, 'binary_sensor.praesenz_buero', 'on'),
      set(3000, 'binary_sensor.rauch_flur', 'off'),
    ],
  },
  {
    file: 'valve',
    ids: ['switch.beet'],
    width: 800,
    steps: [set(600, 'switch.beet', 'off'), set(2000, 'switch.beet', 'on')],
  },
  {
    file: 'buttons',
    ids: ['event.flur_oben'],
    width: 800,
    steps: [
      set(600, 'event.flur_oben', '2026-10-14T12:00:01Z'),
      set(1800, 'event.flur_unten', '2026-10-14T12:00:02Z'),
      set(2800, 'event.flur_oben', '2026-10-14T12:00:03Z'),
    ],
  },
  // Robot vacuum and lawn mower
  {
    file: 'robot',
    ids: ['vacuum.saugroboter', 'lawn_mower.rasen'],
    width: 800,
    ms: 6400,
    steps: [
      // Both drive their lanes; the vacuum goes home and docks, the mower pauses and goes on
      set(2400, 'vacuum.saugroboter', 'returning'),
      set(4000, 'vacuum.saugroboter', 'docked'),
      set(3000, 'lawn_mower.rasen', 'paused'),
      set(4600, 'lawn_mower.rasen', 'mowing'),
    ],
  },
  // Media player
  {
    file: 'media',
    ids: ['media_player.wohnzimmer', 'media_player.fernseher'],
    width: 760,
    ms: 6000,
    steps: [
      // The equalizer dances while it plays; louder, a pause, the TV starts, the next track
      click(900, 'media_player.wohnzimmer', 'Mute'),
      click(1800, 'media_player.wohnzimmer', 'Unmute'),
      click(2600, 'media_player.wohnzimmer', 'Pause'),
      click(3300, 'media_player.fernseher', 'Play'),
      click(4300, 'media_player.wohnzimmer', 'Play'),
      set(5000, 'media_player.wohnzimmer', undefined, { media_title: 'Low Tide', media_position: 0, media_position_updated_at: new Date().toISOString() }),
    ],
  },
  // Water heater
  {
    file: 'water-heater',
    ids: ['water_heater.warmwasserspeicher'],
    width: 560,
    ms: 6000,
    steps: [
      // Heating up: the water rises and warms, then steams at the target; eco, and cold water drawn
      set(600, 'water_heater.warmwasserspeicher', undefined, { current_temperature: 50 }),
      set(1500, 'water_heater.warmwasserspeicher', undefined, { current_temperature: 53.5 }),
      set(2400, 'water_heater.warmwasserspeicher', undefined, { current_temperature: 55 }),
      click(3300, 'water_heater.warmwasserspeicher', 'Eco'),
      set(4300, 'water_heater.warmwasserspeicher', undefined, { current_temperature: 38 }),
      set(5200, 'water_heater.warmwasserspeicher', 'heat_pump', { operation_mode: 'heat_pump', current_temperature: 46.5 }),
    ],
  },
  // Alarm panel
  {
    file: 'alarm',
    ids: ['alarm_control_panel.werkstatt'],
    width: 560,
    ms: 6400,
    steps: [
      // Arming (the shield's edge runs out), armed away, someone comes in (pending), the alarm
      // sounds, disarmed, arming again
      set(900, 'alarm_control_panel.werkstatt', 'armed_away'),
      set(2100, 'alarm_control_panel.werkstatt', 'pending'),
      set(3200, 'alarm_control_panel.werkstatt', 'triggered'),
      set(4800, 'alarm_control_panel.werkstatt', 'disarmed'),
      set(5800, 'alarm_control_panel.werkstatt', 'arming'),
    ],
  },
  // Fan and humidifier
  {
    file: 'fan',
    ids: ['fan.ventilator_schlafzimmer', 'fan.deckenventilator'],
    width: 560,
    ms: 6400,
    steps: [
      // Up to full speed while sweeping, the ceiling fan turns the other way; then slow, off and on again
      set(600, 'fan.ventilator_schlafzimmer', undefined, { percentage: 100 }),
      set(1400, 'fan.deckenventilator', undefined, { direction: 'reverse', percentage: 83 }),
      set(3000, 'fan.ventilator_schlafzimmer', undefined, { percentage: 33, oscillating: false }),
      set(4000, 'fan.deckenventilator', 'off', { percentage: 0 }),
      set(5200, 'fan.deckenventilator', 'on', { direction: 'forward', percentage: 50 }),
      set(5400, 'fan.ventilator_schlafzimmer', undefined, { percentage: 66, oscillating: true }),
    ],
  },
  {
    file: 'humidifier',
    ids: ['humidifier.schlafzimmer', 'humidifier.keller'],
    width: 560,
    ms: 5600,
    steps: [
      // Mist rising, drops collecting; the target reached, then working again
      set(1800, 'humidifier.schlafzimmer', undefined, { humidity: 45 }),
      set(2600, 'humidifier.keller', undefined, { action: 'idle', current_humidity: 55 }),
      set(3600, 'humidifier.schlafzimmer', 'off', { action: 'off' }),
      set(4400, 'humidifier.keller', undefined, { action: 'drying', current_humidity: 68 }),
      set(4800, 'humidifier.schlafzimmer', 'on', { action: 'humidifying', humidity: 50 }),
    ],
  },
  // Presence and forecast cards
  {
    file: 'presence',
    ids: ['person.anna'],
    width: 560,
    ms: 4400,
    steps: [
      // Clara comes home, Ben leaves work, Tom heads out
      set(700, 'person.clara', 'home'),
      set(2000, 'person.ben', 'not_home'),
      set(3200, 'person.tom', 'not_home'),
    ],
  },
  {
    file: 'forecast',
    ids: ['weather.zuhause'],
    width: 560,
    ms: 6400,
    steps: [
      // The sky changes: sun, rain, a thunderstorm, snow, then hours instead of days
      set(300, 'weather.zuhause', 'sunny', { temperature: 21.3 }),
      set(1500, 'weather.zuhause', 'rainy', { temperature: 14.8 }),
      set(2700, 'weather.zuhause', 'lightning-rainy', { temperature: 16.2 }),
      set(3900, 'weather.zuhause', 'snowy', { temperature: -1.5 }),
      click(5000, 'weather.zuhause', 'Hours'),
    ],
  },
];

const run = async (page: Page, step: Step) => {
  if ('set' in step) {
    await page.evaluate(
      ({ entity, state, attributes }) =>
        (window as unknown as { kachelwerk: { set: (e: string, s?: string, a?: object) => void } }).kachelwerk.set(
          entity,
          state,
          attributes,
        ),
      { entity: step.set, state: step.state, attributes: step.attributes },
    );
  } else {
    await page
      .locator(`[data-entity="${step.click}"]`)
      .getByRole('button', { name: step.button, exact: true })
      .click();
  }
};

const record = async (page: Page, scene: Scene) => {
  const width = scene.width ?? 800;
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
