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

// Robot vacuum and lawn mower
test('robot: pause and resume, suction, locate, the mower docks', async ({ page }) => {
  await openDemo(page);
  const sent = (domain: string) =>
    calls(page).then((all) => all.filter((c) => c.domain === domain).map((c) => `${c.service} ${JSON.stringify(c.data)}`));
  const vacuum = card(page, 'vacuum.saugroboter');
  await vacuum.getByRole('button', { name: 'Pause' }).click();
  await expect(vacuum.getByRole('status')).toHaveText('Paused');
  await vacuum.getByRole('button', { name: 'Resume' }).click();
  await expect(vacuum.getByRole('status')).toHaveText('Cleaning');
  await vacuum.getByRole('combobox', { name: 'Suction' }).selectOption('turbo');
  await vacuum.getByRole('button', { name: 'Locate' }).click();
  await vacuum.getByRole('button', { name: 'Spot clean' }).click();
  expect(await sent('vacuum')).toEqual([
    'pause {"entity_id":"vacuum.saugroboter"}',
    'start {"entity_id":"vacuum.saugroboter"}',
    'set_fan_speed {"entity_id":"vacuum.saugroboter","fan_speed":"turbo"}',
    'locate {"entity_id":"vacuum.saugroboter"}',
    'clean_spot {"entity_id":"vacuum.saugroboter"}',
  ]);
  // Docked: no way home to send
  await expect(card(page, 'vacuum.wischroboter').getByRole('button', { name: 'Dock' })).toBeDisabled();

  const mower = card(page, 'lawn_mower.rasen');
  await mower.getByRole('button', { name: 'Dock' }).click();
  await expect(mower.getByRole('status')).toHaveText('Returning to dock');
  await mower.getByRole('button', { name: 'Start' }).click();
  expect(await sent('lawn_mower')).toEqual([
    'dock {"entity_id":"lawn_mower.rasen"}',
    'start_mowing {"entity_id":"lawn_mower.rasen"}',
  ]);
});

// Media player
test('media: play and pause, tracks, volume, mute, source, sound mode and power', async ({ page }) => {
  await openDemo(page);
  const media = (service: string) =>
    calls(page).then((all) => all.filter((c) => c.domain === 'media_player' && c.service === service).map((c) => c.data));
  const speaker = card(page, 'media_player.wohnzimmer');
  await speaker.getByRole('button', { name: 'Pause', exact: true }).click();
  expect(await media('media_pause')).toEqual([{ entity_id: 'media_player.wohnzimmer' }]);
  await expect(speaker.getByRole('status')).toHaveText('Paused · Spotify');
  await speaker.getByRole('button', { name: 'Play', exact: true }).click();
  await speaker.getByRole('button', { name: 'Next track' }).click();
  expect(await media('media_next_track')).toEqual([{ entity_id: 'media_player.wohnzimmer' }]);

  const volume = speaker.getByRole('slider', { name: 'Volume Living room speaker' });
  const box = await volume.boundingBox();
  if (!box) throw new Error('no volume bar');
  await volume.click({ position: { x: box.width * 0.75, y: box.height / 2 } });
  expect(await media('volume_set')).toEqual([{ entity_id: 'media_player.wohnzimmer', volume_level: 0.75 }]);
  await expect(volume).toHaveAttribute('aria-valuenow', '75');
  await speaker.getByRole('button', { name: 'Mute', exact: true }).click();
  expect(await media('volume_mute')).toEqual([{ entity_id: 'media_player.wohnzimmer', is_volume_muted: true }]);
  await expect(speaker.getByRole('button', { name: 'Unmute' })).toHaveAttribute('aria-pressed', 'true');

  // A TV that only steps its volume, and picks its input
  const tv = card(page, 'media_player.fernseher');
  await tv.getByRole('button', { name: 'Volume up' }).click();
  expect(await media('volume_up')).toEqual([{ entity_id: 'media_player.fernseher' }]);
  await tv.getByRole('combobox', { name: 'Source' }).selectOption('HDMI 2');
  expect(await media('select_source')).toEqual([{ entity_id: 'media_player.fernseher', source: 'HDMI 2' }]);

  const receiver = card(page, 'media_player.receiver');
  await receiver.getByRole('combobox', { name: 'Sound mode' }).selectOption('Stereo');
  expect(await media('select_sound_mode')).toEqual([{ entity_id: 'media_player.receiver', sound_mode: 'Stereo' }]);

  // Off it is only the power button
  const kitchen = card(page, 'media_player.kueche');
  await expect(kitchen.getByRole('button', { name: 'Play', exact: true })).toHaveCount(0);
  await kitchen.getByRole('button', { name: 'Turn on' }).click();
  expect(await media('turn_on')).toEqual([{ entity_id: 'media_player.kueche' }]);
  await expect(kitchen.getByRole('button', { name: 'Power Off' })).toHaveAttribute('aria-pressed', 'true');
});

// Water heater
test('water heater: target, operation mode, away mode and power', async ({ page }) => {
  await openDemo(page);
  const sent = (service: string) =>
    calls(page).then((all) => all.filter((c) => c.domain === 'water_heater' && c.service === service).map((c) => c.data));
  const tank = card(page, 'water_heater.warmwasserspeicher');
  const plus = tank.getByRole('button', { name: 'Increase Temperature' });
  await plus.click();
  await plus.click();
  await page.waitForTimeout(900);
  expect(await sent('set_temperature')).toEqual([{ entity_id: 'water_heater.warmwasserspeicher', temperature: 57 }]);

  const eco = tank.getByRole('button', { name: 'Eco', exact: true });
  await eco.click();
  await expect(eco).toHaveAttribute('aria-pressed', 'true');
  expect(await sent('set_operation_mode')).toEqual([{ entity_id: 'water_heater.warmwasserspeicher', operation_mode: 'eco' }]);

  const away = tank.getByRole('button', { name: 'Away', exact: true });
  await away.click();
  await expect(away).toHaveAttribute('aria-pressed', 'true');
  expect(await sent('set_away_mode')).toEqual([{ entity_id: 'water_heater.warmwasserspeicher', away_mode: true }]);

  await tank.getByRole('button', { name: 'Power Off' }).click();
  expect(await sent('turn_off')).toEqual([{ entity_id: 'water_heater.warmwasserspeicher' }]);
  await expect(tank.getByRole('status').first()).toHaveText('Off');

  // Without turn_on/turn_off: back on with the first listed mode
  const holiday = card(page, 'water_heater.ferienhaus');
  await expect(holiday.getByRole('meter')).toHaveAttribute('aria-valuetext', '17 °C');
  await holiday.getByRole('button', { name: 'Turn on' }).click();
  expect(await sent('set_operation_mode')).toContainEqual({ entity_id: 'water_heater.ferienhaus', operation_mode: 'eco' });
  await expect(holiday.getByRole('button', { name: 'Eco', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

// Alarm panel
test('alarm: the code typed on the keypad arms, shown as dots; the alarm by hand is held', async ({ page }) => {
  await openDemo(page);
  const alarm = (service: string) =>
    calls(page).then((all) => all.filter((c) => c.service === service).map((c) => c.data));
  const house = card(page, 'alarm_control_panel.haus');
  // Arming needs the code (code_arm_required): the tap opens the pad, nothing is sent yet
  await house.getByRole('button', { name: 'Arm away' }).click();
  expect(await alarm('alarm_arm_away')).toEqual([]);
  for (const digit of ['1', '2', '3', '4']) await house.getByRole('button', { name: digit, exact: true }).click();
  // Four dots, no digits
  await expect(house.getByRole('status', { name: '4 characters entered' })).toHaveText('');
  await house.getByRole('button', { name: 'Confirm' }).click();
  expect(await alarm('alarm_arm_away')).toEqual([{ entity_id: 'alarm_control_panel.haus', code: '1234' }]);
  await expect(house.getByRole('status').first()).toHaveText('Arming …');
  await expect(house.getByRole('button', { name: 'Confirm' })).toHaveCount(0);

  // The alarm by hand has to be held
  const trigger = house.getByRole('button', { name: 'Trigger alarm' });
  await trigger.click();
  expect(await alarm('alarm_trigger')).toEqual([]);
  await hold(page, trigger, 1000);
  expect(await alarm('alarm_trigger')).toEqual([{ entity_id: 'alarm_control_panel.haus' }]);
});

test('alarm: disarming asks for the code, triggered the field is open', async ({ page }) => {
  await openDemo(page);
  const alarm = (service: string) =>
    calls(page).then((all) => all.filter((c) => c.service === service).map((c) => c.data));
  // code_arm_required false: arming goes at once, disarming asks for the code
  const garage = card(page, 'alarm_control_panel.garage');
  await garage.getByRole('button', { name: 'Arm home' }).click();
  expect(await alarm('alarm_arm_home')).toEqual([{ entity_id: 'alarm_control_panel.garage' }]);
  await garage.getByRole('button', { name: 'Disarm' }).click();
  await garage.getByRole('button', { name: '0', exact: true }).click();
  await garage.getByRole('button', { name: 'Delete' }).click();
  await garage.getByRole('button', { name: '7', exact: true }).click();
  await garage.getByRole('button', { name: 'Confirm' }).click();
  expect(await alarm('alarm_disarm')).toEqual([{ entity_id: 'alarm_control_panel.garage', code: '7' }]);

  // Triggered with a text code: the field is there right away
  const shed = card(page, 'alarm_control_panel.gartenhaus');
  await shed.getByRole('textbox', { name: 'Code' }).fill('geheim');
  await shed.getByRole('textbox', { name: 'Code' }).press('Enter');
  expect(await alarm('alarm_disarm')).toContainEqual({ entity_id: 'alarm_control_panel.gartenhaus', code: 'geheim' });
  await expect(shed.getByRole('status').first()).toHaveText('Disarmed');
});

// Fan and humidifier
test('fan: speed snaps to its steps, preset, oscillation, direction, power', async ({ page }) => {
  await openDemo(page);
  const fanCalls = (service: string) =>
    calls(page).then((all) => all.filter((c) => c.domain === 'fan' && c.service === service).map((c) => c.data));
  const bedroom = card(page, 'fan.ventilator_schlafzimmer');
  const bar = bedroom.getByRole('slider', { name: 'Speed Bedroom fan' });
  await bar.scrollIntoViewIfNeeded();
  const box = await bar.boundingBox();
  if (!box) throw new Error('bar not visible');
  // A tap at 40 % lands on the first of three speeds (33, as HA computes it)
  await page.mouse.click(box.x + box.width * 0.4, box.y + box.height / 2);
  expect(await fanCalls('set_percentage')).toEqual([{ entity_id: 'fan.ventilator_schlafzimmer', percentage: 33 }]);
  await expect(bedroom.getByRole('status')).toHaveText('Speed 1 of 3');

  await bedroom.getByRole('combobox', { name: 'Preset' }).selectOption('sleep');
  expect(await fanCalls('set_preset_mode')).toEqual([{ entity_id: 'fan.ventilator_schlafzimmer', preset_mode: 'sleep' }]);
  const oscillate = bedroom.getByRole('button', { name: /^Oscillate/ });
  await oscillate.click();
  expect(await fanCalls('oscillate')).toEqual([{ entity_id: 'fan.ventilator_schlafzimmer', oscillating: false }]);
  await expect(oscillate).toHaveAttribute('aria-pressed', 'false');

  const ceiling = card(page, 'fan.deckenventilator');
  await ceiling.getByRole('button', { name: 'Direction: Forward' }).click();
  expect(await fanCalls('set_direction')).toEqual([{ entity_id: 'fan.deckenventilator', direction: 'reverse' }]);
  await expect(ceiling.getByRole('button', { name: 'Direction: Reverse' })).toBeVisible();

  const purifier = card(page, 'fan.luftreiniger');
  await purifier.getByRole('button', { name: 'Turn on' }).click();
  expect(await fanCalls('turn_on')).toEqual([{ entity_id: 'fan.luftreiniger' }]);
  await expect(purifier.getByRole('button', { name: 'Power Off' })).toHaveAttribute('aria-pressed', 'true');
});

test('humidifier: quick steps are sent once, mode, power', async ({ page }) => {
  await openDemo(page);
  const humidifierCalls = (service: string) =>
    calls(page).then((all) => all.filter((c) => c.domain === 'humidifier' && c.service === service).map((c) => c.data));
  const bedroom = card(page, 'humidifier.schlafzimmer');
  const plus = bedroom.getByRole('button', { name: 'Increase humidity' });
  await plus.click();
  await plus.click();
  await page.waitForTimeout(900);
  expect(await humidifierCalls('set_humidity')).toEqual([{ entity_id: 'humidifier.schlafzimmer', humidity: 52 }]);
  await bedroom.getByRole('combobox', { name: 'Mode' }).selectOption('sleep');
  expect(await humidifierCalls('set_mode')).toEqual([{ entity_id: 'humidifier.schlafzimmer', mode: 'sleep' }]);

  // target_humidity_step 5
  const basement = card(page, 'humidifier.keller');
  await basement.getByRole('button', { name: 'Decrease humidity' }).click();
  await page.waitForTimeout(900);
  expect(await humidifierCalls('set_humidity')).toContainEqual({ entity_id: 'humidifier.keller', humidity: 50 });

  const nursery = card(page, 'humidifier.kinderzimmer');
  await nursery.getByRole('button', { name: 'Turn on' }).click();
  expect(await humidifierCalls('turn_on')).toEqual([{ entity_id: 'humidifier.kinderzimmer' }]);
  await expect(nursery.getByRole('status').first()).toHaveText('Humidifying');
});

// Presence and forecast cards
test('presence: who is home, and a tap opens the person', async ({ page }) => {
  await openDemo(page);
  await page.evaluate(() =>
    document.addEventListener('hass-more-info', (e) => {
      (window as unknown as { moreInfo: string }).moreInfo = (e as CustomEvent).detail.entityId;
    }),
  );
  const family = card(page, 'person.anna');
  await expect(family.getByRole('status')).toHaveText('2 of 4 home');
  // The zone's friendly name, from zone.arbeit
  const ben = family.getByRole('button', { name: /^Ben, Work, for \d+ hr$/ });
  await ben.click();
  expect(await page.evaluate(() => (window as unknown as { moreInfo: string }).moreInfo)).toBe('person.ben');
  await page.evaluate(() =>
    (window as unknown as { kachelwerk: { set: (id: string, state: string) => void } }).kachelwerk.set('person.clara', 'home'),
  );
  await expect(family.getByRole('status')).toHaveText('3 of 4 home');
  await expect(family.getByRole('button', { name: 'Clara, Home, just now' })).toBeVisible();
});

test('forecast: the days, then the hours through weather/subscribe_forecast', async ({ page }) => {
  await openDemo(page);
  const weather = card(page, 'weather.zuhause');
  const strip = weather.getByRole('list', { name: 'Forecast' });
  await expect(strip.getByRole('listitem')).toHaveCount(7);
  await expect(strip.getByRole('listitem').first()).toContainText('Today');
  await expect(weather.getByRole('img', { name: 'Partly cloudy, 15.4 °C' })).toBeVisible();
  const hours = weather.getByRole('button', { name: 'Hours' });
  await hours.click();
  await expect(hours).toHaveAttribute('aria-pressed', 'true');
  await expect(strip.getByRole('listitem')).toHaveCount(24);
  await expect(strip.getByRole('listitem').first()).toContainText('Now');
  const subscriptions = await page.evaluate(() => (window as unknown as { subscriptions: unknown[] }).subscriptions);
  expect(subscriptions).toContainEqual({ type: 'weather/subscribe_forecast', entity_id: 'weather.zuhause', forecast_type: 'hourly' });
  // twice_daily only: no switch, days and nights
  const mountain = card(page, 'weather.zugspitze');
  await expect(mountain.getByRole('button', { name: 'Days' })).toHaveCount(0);
  await expect(mountain.getByRole('listitem').nth(1)).toContainText('Night');
});
