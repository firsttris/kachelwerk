import { expect, test } from '@playwright/test';
import { calls, card, hold, openDemo } from './demo';

test('every card renders without an error, in both themes', async ({ page }) => {
  const errors = await openDemo(page);
  await expect(page.locator('#light [data-entity]')).not.toHaveCount(0);
  const count = await page.locator('[data-entity]').count();
  for (let i = 0; i < count; i++) {
    const host = page.locator('[data-entity]').nth(i);
    // Each card drew its tile into its shadow root
    expect(await host.evaluate((el) => el.shadowRoot?.querySelector('[data-slot="tile"]') !== null)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('shutter: up sets the position and the shutter travels there', async ({ page }) => {
  await openDemo(page);
  const kitchen = card(page, 'cover.kueche');
  await kitchen.getByRole('button', { name: 'Up', exact: true }).click();
  expect(await calls(page)).toContainEqual({
    domain: 'cover',
    service: 'set_cover_position',
    data: { entity_id: 'cover.kueche', position: 100 },
  });
  await expect(kitchen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Moving to 100 %');
});

test('light: a tap toggles, holding opens the more-info dialog instead', async ({ page }) => {
  await openDemo(page);
  await page.evaluate(() =>
    document.addEventListener('hass-more-info', (e) => {
      (window as unknown as { moreInfo: string }).moreInfo = (e as CustomEvent).detail.entityId;
    }),
  );
  const bath = card(page, 'switch.licht_bad').getByRole('button');
  await bath.click();
  await expect(bath).toHaveAttribute('aria-pressed', 'true');
  await hold(page, bath, 700);
  expect(await page.evaluate(() => (window as unknown as { moreInfo: string }).moreInfo)).toBe('switch.licht_bad');
  // The hold did not switch it again
  await expect(bath).toHaveAttribute('aria-pressed', 'true');
  expect((await calls(page)).filter((c) => c.service === 'toggle')).toHaveLength(1);
});

test('dimmer: a tap on the bar sets the brightness', async ({ page }) => {
  await openDemo(page);
  const bar = card(page, 'light.esstisch').getByRole('slider');
  await bar.scrollIntoViewIfNeeded();
  const box = await bar.boundingBox();
  if (!box) throw new Error('bar not visible');
  await page.mouse.click(box.x + box.width * 0.3, box.y + box.height / 2);
  expect(await calls(page)).toContainEqual({
    domain: 'light',
    service: 'turn_on',
    data: { entity_id: 'light.esstisch', brightness_pct: 30 },
  });
});

test('thermostat: quick steps are sent once', async ({ page }) => {
  await openDemo(page);
  const plus = card(page, 'climate.bad').getByRole('button', { name: 'Increase Temperature' });
  await plus.click();
  await plus.click();
  await page.waitForTimeout(900);
  const sent = (await calls(page)).filter((c) => c.service === 'set_temperature');
  expect(sent).toEqual([{ domain: 'climate', service: 'set_temperature', data: { entity_id: 'climate.bad', temperature: 23 } }]);
});

test('aircon: steps, mode, fan, the range and power', async ({ page }) => {
  await openDemo(page);
  const climate = (service: string) =>
    calls(page).then((all) => all.filter((c) => c.service === service).map((c) => c.data));
  const living = card(page, 'climate.klima_wohnzimmer');
  const plus = living.getByRole('button', { name: 'Increase Temperature' });
  await plus.click();
  await plus.click();
  await page.waitForTimeout(900);
  expect(await climate('set_temperature')).toEqual([{ entity_id: 'climate.klima_wohnzimmer', temperature: 23 }]);

  const heat = living.getByRole('button', { name: 'Heat', exact: true });
  await heat.click();
  await expect(heat).toHaveAttribute('aria-pressed', 'true');
  await expect(living.getByRole('status').first()).toHaveText('Heating');
  await living.getByRole('combobox', { name: 'Fan' }).selectOption('high');
  expect(await climate('set_fan_mode')).toEqual([{ entity_id: 'climate.klima_wohnzimmer', fan_mode: 'high' }]);

  // heat_cool: pick the low end, step it down; both ends are sent
  const bedroom = card(page, 'climate.klima_schlafzimmer');
  await bedroom.getByRole('button', { name: /^Heat to/ }).click();
  await bedroom.getByRole('button', { name: 'Decrease Temperature' }).click();
  await page.waitForTimeout(900);
  expect(await climate('set_temperature')).toContainEqual({
    entity_id: 'climate.klima_schlafzimmer',
    target_temp_low: 19.5,
    target_temp_high: 24,
  });

  const guest = card(page, 'climate.klima_gaestezimmer');
  await guest.getByRole('button', { name: 'Turn on' }).click();
  expect(await climate('turn_on')).toEqual([{ entity_id: 'climate.klima_gaestezimmer' }]);
  await expect(guest.getByRole('button', { name: 'Power Off' })).toHaveAttribute('aria-pressed', 'true');
});

test('garage: a tap does not open the door, holding does', async ({ page }) => {
  await openDemo(page);
  const open = card(page, 'cover.garage').getByRole('button', { name: 'Open' });
  await hold(page, open, 100);
  expect((await calls(page)).some((c) => c.service === 'open_cover')).toBe(false);
  await hold(page, open, 1000);
  expect(await calls(page)).toContainEqual({ domain: 'cover', service: 'open_cover', data: { entity_id: 'cover.garage' } });
});

test('lock: half a slide does nothing, the whole way opens', async ({ page }) => {
  await openDemo(page);
  const knob = card(page, 'lock.haustuer').getByRole('slider');
  await knob.scrollIntoViewIfNeeded();
  const k = await knob.boundingBox();
  const t = await knob.locator('..').boundingBox();
  if (!k || !t) throw new Error('slider not visible');
  const y = k.y + k.height / 2;
  const slide = async (to: number) => {
    await page.mouse.move(k.x + 20, y);
    await page.mouse.down();
    await page.mouse.move(to, y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(400);
  };
  await slide(t.x + t.width * 0.5);
  expect((await calls(page)).some((c) => c.service === 'open')).toBe(false);
  await slide(t.x + t.width - 10);
  expect(await calls(page)).toContainEqual({ domain: 'lock', service: 'open', data: { entity_id: 'lock.haustuer' } });
});

test('buttons: a short press runs the key, a long one its hold', async ({ page }) => {
  await openDemo(page);
  const morning = card(page, 'script.gute_nacht').getByRole('button', { name: /^Good morning/ });
  await hold(page, morning, 80);
  await hold(page, morning, 800);
  const runs = (await calls(page)).filter((c) => c.domain === 'script').map((c) => c.data.entity_id);
  expect(runs).toEqual(['script.morgen', 'script.alles_aus']);
});
