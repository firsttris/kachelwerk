import type { HassEntity } from '../src/ha/types';

const entity = (entity_id: string, state: string, attributes: Record<string, unknown>): HassEntity => ({
  entity_id,
  state,
  attributes,
  last_changed: '2026-10-14T12:00:00Z',
  last_updated: '2026-10-14T12:00:00Z',
});

// open, close, stop, set position (15); with tilt 255
const COVER = 15;
const COVER_TILT = 255;
// ClimateEntityFeature: target temperature 1, range 2, fan 8, preset 16,
// swing 32, turn off 128, turn on 256
const AIRCON = 1 | 2 | 8 | 16 | 32 | 128 | 256;
const SPLIT_MODES = ['off', 'heat_cool', 'cool', 'heat', 'dry', 'fan_only'];

// Presence and forecast cards: a state that changed minutes ago, a picture,
// and the sun with today's sunrise and sunset (sun.sun)
const since = (e: HassEntity, minutes: number): HassEntity => {
  const at = new Date(Date.now() - minutes * 60_000).toISOString();
  return { ...e, last_changed: at, last_updated: at };
};
const AVATAR = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fda4af"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="25" r="12" fill="#fff7ed"/><path d="M10 64c2-14 11-21 22-21s20 7 22 21z" fill="#fff7ed"/><path d="M19 26c0-11 6-16 13-16s13 5 13 16c-3-5-7-8-13-8s-10 3-13 8z" fill="#7c2d12"/></svg>')}`;
const today = (hours: number) => {
  const date = new Date();
  date.setHours(Math.floor(hours), (hours % 1) * 60, 0, 0);
  return date.toISOString();
};
const SUN = entity('sun.sun', 'above_horizon', { friendly_name: 'Sonne', next_rising: today(7.5), next_setting: today(18.5) });

// One card per example, in both themes
export const examples: { config: Record<string, unknown> & { type: string; entity: string }; entities: HassEntity[] }[] = [
  {
    config: { type: 'custom:kachelwerk-shutter', entity: 'cover.wohnzimmer', travel_time: 25 },
    entities: [entity('cover.wohnzimmer', 'open', { friendly_name: 'Rollladen Wohnzimmer', current_position: 60, supported_features: COVER })],
  },
  {
    config: { type: 'custom:kachelwerk-shutter', entity: 'cover.kueche' },
    entities: [entity('cover.kueche', 'closed', { friendly_name: 'Rollladen Küche', current_position: 0, supported_features: COVER })],
  },
  {
    config: { type: 'custom:kachelwerk-shutter', entity: 'cover.buero', name: 'Raffstore Büro' },
    entities: [entity('cover.buero', 'open', { friendly_name: 'Raffstore', current_position: 70, current_tilt_position: 50, supported_features: COVER_TILT })],
  },
  {
    config: { type: 'custom:kachelwerk-shutter', entity: 'cover.dach' },
    entities: [entity('cover.dach', 'unavailable', { friendly_name: 'Rollladen Dach', supported_features: COVER })],
  },
  {
    config: { type: 'custom:kachelwerk-light', entity: 'switch.licht_flur' },
    entities: [entity('switch.licht_flur', 'on', { friendly_name: 'Licht Flur' })],
  },
  {
    config: { type: 'custom:kachelwerk-light', entity: 'switch.licht_bad' },
    entities: [entity('switch.licht_bad', 'off', { friendly_name: 'Licht Bad' })],
  },
  {
    config: { type: 'custom:kachelwerk-light', entity: 'switch.server' },
    entities: [entity('switch.server', 'on', { friendly_name: 'Server' })],
  },
  {
    config: { type: 'custom:kachelwerk-light', entity: 'switch.kaffee' },
    entities: [entity('switch.kaffee', 'off', { friendly_name: 'Kaffeemaschine' })],
  },
  {
    config: { type: 'custom:kachelwerk-light', entity: 'light.esstisch' },
    entities: [entity('light.esstisch', 'on', { friendly_name: 'Esstisch', brightness: 153, color_mode: 'brightness', supported_color_modes: ['brightness'] })],
  },
  {
    config: { type: 'custom:kachelwerk-light', entity: 'light.terrasse' },
    entities: [entity('light.terrasse', 'off', { friendly_name: 'LED-Band Terrasse', supported_color_modes: ['brightness'] })],
  },
  {
    config: { type: 'custom:kachelwerk-light', entity: 'light.streifen' },
    entities: [entity('light.streifen', 'on', { friendly_name: 'LED-Streifen', brightness: 204, color_mode: 'hs', hs_color: [275, 90], supported_color_modes: ['hs', 'color_temp'], min_color_temp_kelvin: 2200, max_color_temp_kelvin: 6500 })],
  },
  {
    config: { type: 'custom:kachelwerk-light', entity: 'light.wohnzimmer' },
    entities: [entity('light.wohnzimmer', 'on', { friendly_name: 'Deckenlicht Wohnzimmer', brightness: 230, color_mode: 'color_temp', color_temp_kelvin: 2700, supported_color_modes: ['color_temp'], min_color_temp_kelvin: 2700, max_color_temp_kelvin: 6500 })],
  },
  {
    config: { type: 'custom:kachelwerk-thermostat', entity: 'climate.bad', window_entity: 'binary_sensor.fenster_bad', valve_entity: 'sensor.ventil_bad' },
    entities: [
      entity('climate.bad', 'auto', { friendly_name: 'Thermostat Bad', hvac_modes: ['auto', 'heat', 'off'], preset_modes: ['boost', 'none'], preset_mode: 'none', min_temp: 4.5, max_temp: 30.5, target_temp_step: 0.5, current_temperature: 20.3, temperature: 22, current_humidity: 61, hvac_action: 'heating' }),
      entity('binary_sensor.fenster_bad', 'off', { friendly_name: 'Fenster Bad', device_class: 'window' }),
      entity('sensor.ventil_bad', '38', { unit_of_measurement: '%' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-thermostat', entity: 'climate.wohnraum' },
    entities: [
      entity('climate.wohnraum', 'heat', { friendly_name: 'Wohnraum', hvac_modes: ['auto', 'heat', 'off'], preset_modes: ['boost', 'none'], preset_mode: 'boost', min_temp: 4.5, max_temp: 30.5, target_temp_step: 0.5, current_temperature: 21.4, temperature: 21, current_humidity: 48, hvac_action: 'heating' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-thermostat', entity: 'climate.buero' },
    entities: [
      entity('climate.buero', 'heat', { friendly_name: 'Großes Büro', hvac_modes: ['heat', 'off'], preset_modes: ['comfort', 'eco'], preset_mode: 'comfort', min_temp: 7, max_temp: 25, current_temperature: 21.8, temperature: 21.5, hvac_action: 'idle' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-thermostat', entity: 'climate.dg' },
    entities: [
      entity('climate.dg', 'off', { friendly_name: 'Dachgeschoss', hvac_modes: ['auto', 'heat', 'off'], min_temp: 4.5, max_temp: 30.5, current_temperature: 17.2, temperature: null, hvac_action: 'off' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-aircon', entity: 'climate.klima_wohnzimmer' },
    entities: [
      entity('climate.klima_wohnzimmer', 'cool', { friendly_name: 'Klima Wohnzimmer', hvac_modes: SPLIT_MODES, hvac_action: 'cooling', min_temp: 16, max_temp: 31, target_temp_step: 0.5, current_temperature: 26.4, temperature: 22, target_temp_low: null, target_temp_high: null, current_humidity: 52, fan_modes: ['auto', 'low', 'medium', 'high'], fan_mode: 'auto', swing_modes: ['off', 'vertical', 'horizontal', 'both'], swing_mode: 'vertical', preset_modes: ['none', 'eco', 'boost', 'sleep'], preset_mode: 'none', supported_features: AIRCON }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-aircon', entity: 'climate.klima_schlafzimmer' },
    entities: [
      entity('climate.klima_schlafzimmer', 'heat_cool', { friendly_name: 'Klima Schlafzimmer', hvac_modes: SPLIT_MODES, hvac_action: 'heating', min_temp: 16, max_temp: 31, target_temp_step: 0.5, current_temperature: 19.4, temperature: null, target_temp_low: 20, target_temp_high: 24, fan_modes: ['auto', 'low', 'medium', 'high'], fan_mode: 'low', swing_modes: ['off', 'vertical'], swing_mode: 'off', supported_features: AIRCON & ~16 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-aircon', entity: 'climate.klima_hobbyraum' },
    entities: [
      entity('climate.klima_hobbyraum', 'dry', { friendly_name: 'Klima Hobbyraum', hvac_modes: ['off', 'cool', 'dry', 'fan_only'], hvac_action: 'drying', min_temp: 17, max_temp: 30, target_temp_step: 1, current_temperature: 23.5, temperature: 24, current_humidity: 68, fan_modes: ['low', 'medium', 'high'], fan_mode: 'medium', supported_features: 1 | 8 | 128 | 256 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-aircon', entity: 'climate.klima_gaestezimmer' },
    entities: [
      entity('climate.klima_gaestezimmer', 'off', { friendly_name: 'Klima Gästezimmer', hvac_modes: ['off', 'cool', 'dry', 'fan_only'], hvac_action: 'off', min_temp: 17, max_temp: 30, target_temp_step: 1, current_temperature: 24.8, temperature: null, fan_modes: ['low', 'medium', 'high'], fan_mode: 'low', supported_features: 1 | 8 | 128 | 256 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-window', entity: 'binary_sensor.fenster_bad_og' },
    entities: [entity('binary_sensor.fenster_bad_og', 'on', { friendly_name: 'Fenster Bad OG', device_class: 'window' })],
  },
  {
    config: { type: 'custom:kachelwerk-window', entity: 'binary_sensor.fenster_keller' },
    entities: [entity('binary_sensor.fenster_keller', 'off', { friendly_name: 'Fenster Keller', device_class: 'window' })],
  },
  {
    config: { type: 'custom:kachelwerk-window', entity: 'sensor.griff_kueche' },
    entities: [entity('sensor.griff_kueche', 'tilted', { friendly_name: 'Fenstergriff Küche' })],
  },
  {
    config: { type: 'custom:kachelwerk-window', entity: 'binary_sensor.terrassentuer' },
    entities: [entity('binary_sensor.terrassentuer', 'unavailable', { friendly_name: 'Terrassentür', device_class: 'door' })],
  },
  {
    config: { type: 'custom:kachelwerk-garage', entity: 'cover.garage' },
    entities: [entity('cover.garage', 'closed', { friendly_name: 'Garagentor', device_class: 'garage', current_position: 0, supported_features: 15 })],
  },
  {
    // Open, without a position: no ventilating
    config: { type: 'custom:kachelwerk-garage', entity: 'cover.garage_werkstatt' },
    entities: [entity('cover.garage_werkstatt', 'open', { friendly_name: 'Garagentor Werkstatt', device_class: 'garage', supported_features: 11 })],
  },
  {
    config: { type: 'custom:kachelwerk-lock', entity: 'lock.haustuer' },
    entities: [entity('lock.haustuer', 'locked', { friendly_name: 'Haustür', supported_features: 1 })],
  },
  {
    config: { type: 'custom:kachelwerk-lock', entity: 'lock.keller' },
    entities: [entity('lock.keller', 'unlocked', { friendly_name: 'Kellertür', supported_features: 0 })],
  },
  {
    config: { type: 'custom:kachelwerk-climate-sensor', entity: 'sensor.wz_temperatur', humidity_entity: 'sensor.wz_feuchte' },
    entities: [
      entity('sensor.wz_temperatur', '21.6', { friendly_name: 'Wohnzimmer', unit_of_measurement: '°C', device_class: 'temperature' }),
      entity('sensor.wz_feuchte', '48', { unit_of_measurement: '%', device_class: 'humidity' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-climate-sensor', entity: 'weather.home', name: 'Draußen', rain_entity: 'binary_sensor.regen', illuminance_entity: 'sensor.lux' },
    entities: [
      entity('weather.home', 'rainy', { friendly_name: 'Wetter', temperature: 9.5, humidity: 88, wind_speed: 24, wind_speed_unit: 'km/h' }),
      entity('binary_sensor.regen', 'on', { device_class: 'moisture' }),
      entity('sensor.lux', '3200', { unit_of_measurement: 'lx' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-meter', entity: 'sensor.netz_leistung', energy: 'sensor.netz_bezug', feed_in: 'sensor.netz_einspeisung', name: 'Hausanschluss' },
    entities: [
      entity('sensor.netz_leistung', '-1840', { friendly_name: 'Netz', unit_of_measurement: 'W', device_class: 'power' }),
      entity('sensor.netz_bezug', '23456.7', { unit_of_measurement: 'kWh', device_class: 'energy' }),
      entity('sensor.netz_einspeisung', '8123.4', { unit_of_measurement: 'kWh', device_class: 'energy' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-meter', entity: 'sensor.gaszaehler' },
    entities: [entity('sensor.gaszaehler', '4711.25', { friendly_name: 'Gaszähler', unit_of_measurement: 'm³', device_class: 'gas' })],
  },
  {
    config: { type: 'custom:kachelwerk-detector', entity: 'binary_sensor.rauch_flur', test_entity: 'button.rauch_flur_test' },
    entities: [
      entity('binary_sensor.rauch_flur', 'off', { friendly_name: 'Rauchmelder Flur', device_class: 'smoke' }),
      entity('button.rauch_flur_test', 'unknown', {}),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-detector', entity: 'binary_sensor.rauch_kueche' },
    entities: [entity('binary_sensor.rauch_kueche', 'on', { friendly_name: 'Rauchmelder Küche', device_class: 'smoke' })],
  },
  {
    config: { type: 'custom:kachelwerk-detector', entity: 'binary_sensor.bewegung_flur', illuminance_entity: 'sensor.flur_lux', detection_entity: 'switch.bewegung_aktiv' },
    entities: [
      { ...entity('binary_sensor.bewegung_flur', 'off', { friendly_name: 'Bewegung Flur', device_class: 'motion' }), last_changed: new Date(Date.now() - 7 * 60000).toISOString() },
      entity('sensor.flur_lux', '42', { unit_of_measurement: 'lx' }),
      entity('switch.bewegung_aktiv', 'on', {}),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-detector', entity: 'binary_sensor.praesenz_buero' },
    entities: [entity('binary_sensor.praesenz_buero', 'on', { friendly_name: 'Präsenz Büro', device_class: 'occupancy' })],
  },
  {
    config: { type: 'custom:kachelwerk-detector', entity: 'binary_sensor.wasser_keller' },
    entities: [entity('binary_sensor.wasser_keller', 'off', { friendly_name: 'Wassermelder Keller', device_class: 'moisture' })],
  },
  {
    config: { type: 'custom:kachelwerk-detector', entity: 'siren.alarm' },
    entities: [entity('siren.alarm', 'off', { friendly_name: 'Alarmsirene' })],
  },
  {
    config: { type: 'custom:kachelwerk-floor', entity: 'number.fbh_wohnzimmer', name: 'Wohnzimmer 1' },
    entities: [entity('number.fbh_wohnzimmer', '65', { unit_of_measurement: '%', max: 100 })],
  },
  {
    config: { type: 'custom:kachelwerk-floor', entity: 'number.fbh_flur', name: 'Flur' },
    entities: [entity('number.fbh_flur', '0', { unit_of_measurement: '%', max: 100 })],
  },
  {
    config: { type: 'custom:kachelwerk-floor', entity: 'number.fbh_bad', name: 'Bad' },
    entities: [entity('number.fbh_bad', '100', { unit_of_measurement: '%', max: 100 })],
  },
  {
    config: { type: 'custom:kachelwerk-floor', entity: 'switch.fbh_pumpe' },
    entities: [entity('switch.fbh_pumpe', 'on', { friendly_name: 'Pumpe FBH' })],
  },
  {
    config: { type: 'custom:kachelwerk-sensor', entity: 'sensor.co2_buero' },
    entities: [entity('sensor.co2_buero', '1240', { friendly_name: 'CO₂ Büro', unit_of_measurement: 'ppm', device_class: 'carbon_dioxide' })],
  },
  {
    config: { type: 'custom:kachelwerk-sensor', entity: 'sensor.pm25', pm10_entity: 'sensor.pm10', temperature_entity: 'sensor.wz_temperatur' },
    entities: [
      entity('sensor.pm25', '7.4', { friendly_name: 'Feinstaub', unit_of_measurement: 'µg/m³', device_class: 'pm25' }),
      entity('sensor.pm10', '12.1', { unit_of_measurement: 'µg/m³', device_class: 'pm10' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-sensor', entity: 'sensor.beet' },
    entities: [entity('sensor.beet', '22', { friendly_name: 'Hochbeet', unit_of_measurement: '%', device_class: 'moisture' })],
  },
  {
    config: { type: 'custom:kachelwerk-sensor', entity: 'sensor.pv_leistung' },
    entities: [entity('sensor.pv_leistung', '4218', { friendly_name: 'PV-Leistung', unit_of_measurement: 'W', device_class: 'power' })],
  },
  {
    config: { type: 'custom:kachelwerk-detector', entity: 'binary_sensor.regen_garten', kind: 'rain' },
    entities: [entity('binary_sensor.regen_garten', 'on', { friendly_name: 'Regensensor', device_class: 'moisture' })],
  },
  {
    config: { type: 'custom:kachelwerk-detector', entity: 'binary_sensor.netz' },
    entities: [entity('binary_sensor.netz', 'off', { friendly_name: 'Stromnetz', device_class: 'power' })],
  },
  {
    config: { type: 'custom:kachelwerk-valve', entity: 'switch.beet' },
    entities: [entity('switch.beet', 'on', { friendly_name: 'Bewässerung Beet' })],
  },
  {
    config: { type: 'custom:kachelwerk-valve', entity: 'valve.haupthahn' },
    entities: [entity('valve.haupthahn', 'closed', { friendly_name: 'Haupthahn', supported_features: 11 })],
  },
  {
    config: { type: 'custom:kachelwerk-valve', entity: 'cover.oberlicht' },
    entities: [entity('cover.oberlicht', 'open', { friendly_name: 'Oberlicht', device_class: 'window', current_position: 40, supported_features: 15 })],
  },
  {
    config: { type: 'custom:kachelwerk-buttons', entity: 'event.flur_oben', entities: ['event.flur_unten'] },
    entities: [
      entity('event.flur_oben', '2026-10-14T12:00:00Z', { friendly_name: 'Wandtaster Flur oben' }),
      entity('event.flur_unten', '2026-10-14T12:00:00Z', { friendly_name: 'Wandtaster Flur unten' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-buttons', entity: 'script.gute_nacht', name: 'Szenen', entities: [{ entity: 'script.morgen', hold: 'script.alles_aus' }, 'scene.film', 'button.klingel'] },
    entities: [
      entity('script.gute_nacht', 'off', { friendly_name: 'Gute Nacht' }),
      entity('script.morgen', 'off', { friendly_name: 'Guten Morgen' }),
      entity('script.alles_aus', 'off', { friendly_name: 'Alles aus' }),
      entity('scene.film', 'unknown', { friendly_name: 'Filmabend' }),
      entity('button.klingel', 'unknown', { friendly_name: 'Klingel testen' }),
    ],
  },
  // Robot vacuum and lawn mower. VacuumEntityFeature: pause 4, stop 8,
  // return home 16, fan speed 32, locate 512, clean spot 1024, state 4096,
  // start 8192; LawnMowerEntityFeature: start 1, pause 2, dock 4
  {
    config: { type: 'custom:kachelwerk-robot', entity: 'vacuum.saugroboter', battery_entity: 'sensor.saugroboter_akku' },
    entities: [
      entity('vacuum.saugroboter', 'cleaning', { friendly_name: 'Saugroboter', fan_speed: 'balanced', fan_speed_list: ['quiet', 'balanced', 'turbo', 'max'], supported_features: 4 | 8 | 16 | 32 | 512 | 1024 | 4096 | 8192 }),
      entity('sensor.saugroboter_akku', '64', { friendly_name: 'Saugroboter Akku', device_class: 'battery', unit_of_measurement: '%' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-robot', entity: 'vacuum.wischroboter' },
    entities: [entity('vacuum.wischroboter', 'docked', { friendly_name: 'Wischroboter Küche', battery_level: 100, supported_features: 4 | 16 | 512 | 4096 | 8192 })],
  },
  {
    config: { type: 'custom:kachelwerk-robot', entity: 'lawn_mower.rasen', battery_entity: 'sensor.rasen_akku' },
    entities: [
      entity('lawn_mower.rasen', 'mowing', { friendly_name: 'Mähroboter', supported_features: 1 | 2 | 4 }),
      entity('sensor.rasen_akku', '78', { friendly_name: 'Mähroboter Akku', device_class: 'battery', unit_of_measurement: '%' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-robot', entity: 'lawn_mower.vorgarten', battery_entity: 'sensor.vorgarten_akku' },
    entities: [
      entity('lawn_mower.vorgarten', 'error', { friendly_name: 'Mähroboter Vorgarten', supported_features: 1 | 2 | 4 }),
      entity('sensor.vorgarten_akku', '15', { friendly_name: 'Mähroboter Vorgarten Akku', device_class: 'battery', unit_of_measurement: '%' }),
    ],
  },
  // Water heater: WaterHeaterEntityFeature target temperature 1, operation mode 2, away mode 4, on/off 8
  {
    config: { type: 'custom:kachelwerk-water-heater', entity: 'water_heater.warmwasserspeicher' },
    entities: [
      entity('water_heater.warmwasserspeicher', 'heat_pump', { friendly_name: 'Warmwasserspeicher', operation_list: ['off', 'eco', 'heat_pump', 'high_demand', 'electric'], operation_mode: 'heat_pump', min_temp: 35, max_temp: 65, target_temp_step: 1, current_temperature: 46.5, temperature: 55, target_temp_low: null, target_temp_high: null, away_mode: 'off', temperature_unit: '°C', supported_features: 1 | 2 | 4 | 8 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-water-heater', entity: 'water_heater.boiler_keller' },
    entities: [
      entity('water_heater.boiler_keller', 'electric', { friendly_name: 'Boiler Keller', operation_list: ['off', 'eco', 'electric', 'performance'], operation_mode: 'electric', min_temp: 40, max_temp: 75, target_temp_step: 1, current_temperature: 60, temperature: 60, temperature_unit: '°C', supported_features: 1 | 2 | 8 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-water-heater', entity: 'water_heater.durchlauferhitzer' },
    entities: [
      entity('water_heater.durchlauferhitzer', 'on', { friendly_name: 'Durchlauferhitzer Bad', min_temp: 30, max_temp: 60, target_temp_step: 0.5, current_temperature: 38.5, temperature: 42, temperature_unit: '°C', supported_features: 1 | 8 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-water-heater', entity: 'water_heater.ferienhaus' },
    entities: [
      entity('water_heater.ferienhaus', 'off', { friendly_name: 'Speicher Ferienhaus', operation_list: ['eco', 'gas', 'off'], operation_mode: 'off', min_temp: 40, max_temp: 70, target_temp_step: 1, current_temperature: 17, temperature: 50, away_mode: 'on', temperature_unit: '°C', supported_features: 1 | 2 | 4 }),
    ],
  },
  // Alarm panel. AlarmControlPanelEntityFeature: home 1, away 2, night 4,
  // trigger 8, custom bypass 16, vacation 32
  {
    config: { type: 'custom:kachelwerk-alarm', entity: 'alarm_control_panel.haus' },
    entities: [entity('alarm_control_panel.haus', 'disarmed', { friendly_name: 'Alarmanlage', code_format: 'number', code_arm_required: true, changed_by: null, supported_features: 1 | 2 | 4 | 8 | 32 })],
  },
  {
    config: { type: 'custom:kachelwerk-alarm', entity: 'alarm_control_panel.garage' },
    entities: [entity('alarm_control_panel.garage', 'armed_away', { friendly_name: 'Alarm Garage', code_format: 'number', code_arm_required: false, changed_by: 'Tristan', supported_features: 1 | 2 })],
  },
  {
    config: { type: 'custom:kachelwerk-alarm', entity: 'alarm_control_panel.gartenhaus' },
    entities: [entity('alarm_control_panel.gartenhaus', 'triggered', { friendly_name: 'Alarm Gartenhaus', code_format: 'text', code_arm_required: true, changed_by: null, supported_features: 2 | 8 })],
  },
  {
    config: { type: 'custom:kachelwerk-alarm', entity: 'alarm_control_panel.werkstatt' },
    entities: [entity('alarm_control_panel.werkstatt', 'arming', { friendly_name: 'Alarm Werkstatt', code_format: null, code_arm_required: false, changed_by: null, supported_features: 1 | 2 | 4 })],
  },
  // Fan and humidifier. FanEntityFeature: set speed 1, oscillate 2,
  // direction 4, preset 8, turn off 16, turn on 32; HumidifierEntityFeature:
  // modes 1
  {
    config: { type: 'custom:kachelwerk-fan', entity: 'fan.ventilator_schlafzimmer' },
    entities: [
      entity('fan.ventilator_schlafzimmer', 'on', { friendly_name: 'Ventilator Schlafzimmer', percentage: 66, percentage_step: 100 / 3, preset_mode: null, preset_modes: ['auto', 'sleep', 'nature'], oscillating: true, supported_features: 1 | 2 | 8 | 16 | 32 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-fan', entity: 'fan.deckenventilator' },
    entities: [
      entity('fan.deckenventilator', 'on', { friendly_name: 'Deckenventilator', percentage: 50, percentage_step: 100 / 6, direction: 'forward', supported_features: 1 | 4 | 16 | 32 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-fan', entity: 'fan.luftreiniger' },
    entities: [
      entity('fan.luftreiniger', 'off', { friendly_name: 'Luftreiniger', percentage: null, preset_mode: null, preset_modes: ['auto', 'sleep', 'turbo'], supported_features: 8 | 16 | 32 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-fan', entity: 'fan.abluft_bad' },
    entities: [entity('fan.abluft_bad', 'on', { friendly_name: 'Abluft Bad', supported_features: 16 | 32 })],
  },
  {
    config: { type: 'custom:kachelwerk-humidifier', entity: 'humidifier.schlafzimmer' },
    entities: [
      entity('humidifier.schlafzimmer', 'on', { friendly_name: 'Befeuchter Schlafzimmer', device_class: 'humidifier', humidity: 50, current_humidity: 38, min_humidity: 30, max_humidity: 80, action: 'humidifying', mode: 'normal', available_modes: ['normal', 'eco', 'sleep', 'baby'], supported_features: 1 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-humidifier', entity: 'humidifier.keller' },
    entities: [
      entity('humidifier.keller', 'on', { friendly_name: 'Entfeuchter Keller', device_class: 'dehumidifier', humidity: 55, current_humidity: 68, min_humidity: 35, max_humidity: 85, target_humidity_step: 5, action: 'drying', mode: 'auto', available_modes: ['auto', 'boost', 'sleep'], supported_features: 1 }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-humidifier', entity: 'humidifier.kinderzimmer' },
    entities: [
      entity('humidifier.kinderzimmer', 'off', { friendly_name: 'Befeuchter Kinderzimmer', device_class: 'humidifier', humidity: 45, current_humidity: 41, min_humidity: 30, max_humidity: 70, action: 'off', supported_features: 0 }),
    ],
  },
  // Presence and forecast cards
  {
    config: { type: 'custom:kachelwerk-presence', entity: 'person.anna', name: 'Familie', entities: ['person.ben', 'person.clara', 'person.tom'] },
    entities: [
      since(entity('person.anna', 'home', { friendly_name: 'Anna', entity_picture: AVATAR }), 95),
      since(entity('person.ben', 'Arbeit', { friendly_name: 'Ben', in_zones: ['zone.arbeit'] }), 260),
      since(entity('person.clara', 'not_home', { friendly_name: 'Clara' }), 25),
      since(entity('person.tom', 'home', { friendly_name: 'Tom' }), 1500),
      entity('zone.arbeit', '1', { friendly_name: 'Arbeit' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-presence', entity: 'person.oma', name: 'Gäste', entities: ['person.opa'] },
    entities: [
      since(entity('person.oma', 'home', { friendly_name: 'Oma' }), 40),
      since(entity('person.opa', 'not_home', { friendly_name: 'Opa' }), 180),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-forecast', entity: 'weather.zuhause' },
    entities: [
      // WeatherEntityFeature: daily 1, hourly 2, twice daily 4
      entity('weather.zuhause', 'partlycloudy', { friendly_name: 'Wetter', temperature: 15.4, temperature_unit: '°C', humidity: 72, precipitation_unit: 'mm', wind_speed: 14, wind_speed_unit: 'km/h', supported_features: 1 | 2 }),
      SUN,
    ],
  },
  {
    config: { type: 'custom:kachelwerk-forecast', entity: 'weather.zugspitze', forecast_type: 'twice_daily' },
    entities: [
      entity('weather.zugspitze', 'snowy', { friendly_name: 'Zugspitze', temperature: -4.5, temperature_unit: '°C', precipitation_unit: 'mm', supported_features: 4 }),
      SUN,
    ],
  },
];

// Media player: MediaPlayerEntityFeature (media_player/const.py): pause 1,
// seek 2, volume set 4, mute 8, previous 16, next 32, turn on 128, turn off
// 256, volume step 1024, source 2048, stop 4096, play 16384, sound mode 65536
const SPEAKER = 1 | 2 | 4 | 8 | 16 | 32 | 2048 | 4096 | 16384;
// Covers drawn here, so the demo needs no network: a dusk and a night sea
const art = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${svg}</svg>`)}`;
const DUSK = art(
  '<defs><linearGradient id="s" x2="0" y2="1"><stop offset="0" stop-color="#3b0764"/><stop offset=".55" stop-color="#db2777"/><stop offset="1" stop-color="#fb923c"/></linearGradient></defs><rect width="120" height="120" fill="url(#s)"/><circle cx="60" cy="74" r="26" fill="#fde68a"/><g fill="#3b0764"><rect y="80" width="120" height="3" opacity=".5"/><rect y="88" width="120" height="4" opacity=".6"/><rect y="97" width="120" height="23"/></g>',
);
const SEA = art(
  '<defs><linearGradient id="n" x2="0" y2="1"><stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs><rect width="120" height="120" fill="url(#n)"/><circle cx="84" cy="34" r="12" fill="#e0f2fe"/><path d="M0 86c20-8 40 8 60 0s40 8 60 0v34H0z" fill="#164e63"/><path d="M0 98c20-6 40 6 60 0s40 6 60 0v22H0z" fill="#083344"/>',
);
// Where the track is now, so its line moves on while the demo runs
const now = new Date().toISOString();

examples.push(
  {
    config: { type: 'custom:kachelwerk-media', entity: 'media_player.wohnzimmer' },
    entities: [
      entity('media_player.wohnzimmer', 'playing', { friendly_name: 'Lautsprecher Wohnzimmer', device_class: 'speaker', supported_features: SPEAKER, volume_level: 0.34, is_volume_muted: false, media_title: 'Night Drive', media_artist: 'Neon Harbor', media_album_name: 'Coastlines', media_duration: 252, media_position: 71, media_position_updated_at: now, entity_picture: DUSK, app_name: 'Spotify' }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-media', entity: 'media_player.fernseher' },
    entities: [
      entity('media_player.fernseher', 'paused', { friendly_name: 'Fernseher', device_class: 'tv', supported_features: 1 | 8 | 128 | 256 | 1024 | 2048 | 16384, volume_level: 0.18, is_volume_muted: false, media_title: 'The Long Tide', media_series_title: 'Harbor Lights', media_season: '2', media_episode: '5', media_duration: 2700, media_position: 1210, media_position_updated_at: now, entity_picture: SEA, source: 'HDMI 1', source_list: ['HDMI 1', 'HDMI 2', 'TV', 'USB'] }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-media', entity: 'media_player.receiver' },
    entities: [
      entity('media_player.receiver', 'on', { friendly_name: 'AV-Receiver', device_class: 'receiver', supported_features: 4 | 8 | 128 | 256 | 2048 | 65536, volume_level: 0.45, is_volume_muted: true, source: 'Blu-ray', source_list: ['TV', 'Blu-ray', 'Phono', 'Bluetooth'], sound_mode: 'Movie', sound_mode_list: ['Movie', 'Music', 'Stereo', 'Direct'] }),
    ],
  },
  {
    config: { type: 'custom:kachelwerk-media', entity: 'media_player.kueche' },
    entities: [entity('media_player.kueche', 'off', { friendly_name: 'Radio Küche', device_class: 'speaker', supported_features: SPEAKER | 128 | 256 })],
  },
);
