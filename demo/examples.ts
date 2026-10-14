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
];
