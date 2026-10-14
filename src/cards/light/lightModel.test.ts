import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { hsvToRgb, kelvinToRgb } from './colors';
import { capsOf, colorOf, kindOf, levelCall, levelOf, toggleCall, whiteCall } from './lightModel';

const entity = (entity_id: string, state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id,
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

describe('kindOf', () => {
  it('picks the tile by what a light can', () => {
    expect(kindOf(entity('light.a', 'on', { supported_color_modes: ['onoff'] }), 'A')).toBe('switch');
    expect(kindOf(entity('light.a', 'on', { supported_color_modes: ['brightness'] }), 'A')).toBe('dimmer');
    expect(kindOf(entity('light.a', 'on', { supported_color_modes: ['color_temp'] }), 'A')).toBe('color');
    expect(kindOf(entity('light.a', 'on', { supported_color_modes: ['hs', 'color_temp'] }), 'A')).toBe('color');
  });

  it('takes a switch for a lamp by its name, as MUI', () => {
    expect(kindOf(entity('switch.a', 'on'), 'Licht Küche')).toBe('switch');
    expect(kindOf(entity('switch.a', 'on'), 'Kaffeemaschine')).toBe('socket');
  });

  it('knows a lamp by its entity when the card shortens the name', () => {
    expect(kindOf(entity('switch.a', 'on', { friendly_name: 'Licht Wohnzimmer' }), 'Wohnzimmer')).toBe('switch');
    expect(kindOf(entity('switch.lichtschaltaktor_eg_licht_eg_kuche', 'on'), 'Küche')).toBe('switch');
  });

  it('follows tile: in the YAML', () => {
    expect(kindOf(entity('switch.a', 'on'), 'Kaffeemaschine', 'light')).toBe('switch');
    expect(kindOf(entity('switch.a', 'on'), 'Licht', 'socket')).toBe('socket');
  });
});

describe('levelOf', () => {
  it('reads the brightness in percent', () => {
    expect(levelOf(entity('light.a', 'on', { brightness: 255 }))).toBe(100);
    expect(levelOf(entity('light.a', 'on', { brightness: 128 }))).toBe(50);
    expect(levelOf(entity('light.a', 'on', { brightness: 1 }))).toBe(1);
    expect(levelOf(entity('light.a', 'on'))).toBe(100);
    expect(levelOf(entity('light.a', 'off', { brightness: 128 }))).toBe(0);
  });
});

describe('colorOf', () => {
  it('shines in the hue, the white or warm white', () => {
    expect(colorOf(entity('light.a', 'on', { color_mode: 'hs', hs_color: [120, 100] })).rgb).toEqual(hsvToRgb(120, 1));
    expect(colorOf(entity('light.a', 'on', { color_mode: 'color_temp', color_temp_kelvin: 4000 })).rgb).toEqual(
      kelvinToRgb(4000),
    );
    expect(colorOf(entity('light.a', 'on', { color_mode: 'brightness' })).rgb).toEqual([251, 191, 36]);
  });
});

describe('service calls', () => {
  it('toggles lights and anything else', () => {
    expect(toggleCall('light.a')).toEqual({ domain: 'light', service: 'toggle', data: {} });
    expect(toggleCall('switch.a')).toEqual({ domain: 'homeassistant', service: 'toggle', data: {} });
  });

  it('dims or switches off', () => {
    expect(levelCall(40)).toEqual({ domain: 'light', service: 'turn_on', data: { brightness_pct: 40 } });
    expect(levelCall(0).service).toBe('turn_off');
  });

  it('keeps a white within the light’s range', () => {
    const caps = capsOf(entity('light.a', 'on', { supported_color_modes: ['color_temp'], min_color_temp_kelvin: 2700, max_color_temp_kelvin: 5000 }));
    expect(whiteCall(6500, caps).data).toEqual({ color_temp_kelvin: 5000 });
    expect(whiteCall(4000, capsOf(entity('light.a', 'on', { supported_color_modes: ['hs'] }))).data).toEqual({
      hs_color: [0, 0],
    });
  });
});
