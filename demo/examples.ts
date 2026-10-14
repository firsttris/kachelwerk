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
];
