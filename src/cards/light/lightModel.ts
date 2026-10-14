import { type RGB, WARM } from '../../components/light/PendantLamp';
import { type HassEntity, numberAttr } from '../../ha/types';
import { hsvToRgb, kelvinToRgb } from './colors';

// Which of MUI's light tiles an entity gets
export type LightKind = 'socket' | 'switch' | 'dimmer' | 'color';

// Color modes of HA lights (homeassistant/components/light/const.py,
// ColorMode): which can dim, which have a hue, which a white temperature
const DIMMABLE = ['brightness', 'color_temp', 'hs', 'rgb', 'rgbw', 'rgbww', 'xy', 'white'];
const HUE = ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'];

// From MUI's isLight: a switch is a lamp when its name sounds like one
const LIGHT_NAME = /licht|lampe|leuchte|leuchter|beleuchtung|strahler|spot|light|lamp|\bled\b/i;

const modesOf = (entity: HassEntity | undefined): string[] => {
  const modes = entity?.attributes.supported_color_modes;
  return Array.isArray(modes) ? modes.map(String) : [];
};

export interface LightCaps {
  hasHue: boolean;
  hasWhite: boolean;
  // The light's range of white, for the quick whites
  minKelvin: number;
  maxKelvin: number;
}

export const capsOf = (entity: HassEntity | undefined): LightCaps => {
  const modes = modesOf(entity);
  return {
    hasHue: modes.some((mode) => HUE.includes(mode)),
    hasWhite: modes.includes('color_temp') || modes.includes('rgbww'),
    minKelvin: numberAttr(entity, 'min_color_temp_kelvin') ?? 2000,
    maxKelvin: numberAttr(entity, 'max_color_temp_kelvin') ?? 6500,
  };
};

// The tile: `tile:` in the YAML wins (as the tile chosen in MUI's setup);
// lights by what they can, switches by their name
export const kindOf = (entity: HassEntity | undefined, name: string, tile?: string): LightKind => {
  if (tile === 'socket' || tile === 'switch' || tile === 'dimmer' || tile === 'color') return tile;
  if (tile === 'light') return 'switch';
  const domain = entity?.entity_id.split('.')[0];
  if (domain !== 'light') return LIGHT_NAME.test(name) ? 'switch' : 'socket';
  const modes = modesOf(entity);
  const caps = capsOf(entity);
  if (caps.hasHue || caps.hasWhite) return 'color';
  return modes.some((mode) => DIMMABLE.includes(mode)) ? 'dimmer' : 'switch';
};

export const isOn = (entity: HassEntity | undefined) => entity?.state === 'on';

// Brightness 0..100; a light that is on without a brightness counts as full
export const levelOf = (entity: HassEntity | undefined) => {
  if (!isOn(entity)) return 0;
  const brightness = numberAttr(entity, 'brightness');
  return brightness === null ? 100 : Math.max(1, Math.round((brightness / 255) * 100));
};

export interface LightColor {
  hue: number;
  // 0..1
  saturation: number;
  kelvin: number;
  rgb: RGB;
}

// The color the lamp shines in: the hue in a color mode, the white's
// temperature in color_temp, warm white otherwise
export const colorOf = (entity: HassEntity | undefined): LightColor => {
  const hs = entity?.attributes.hs_color;
  const [hue, saturationPct] = Array.isArray(hs) ? hs.map(Number) : [0, 0];
  const saturation = (saturationPct ?? 0) / 100;
  const kelvin = numberAttr(entity, 'color_temp_kelvin') ?? 2700;
  const mode = String(entity?.attributes.color_mode ?? '');
  const rgb =
    HUE.includes(mode) && saturation > 0.05
      ? hsvToRgb(hue ?? 0, saturation)
      : mode === 'color_temp' || numberAttr(entity, 'color_temp_kelvin') !== null
        ? kelvinToRgb(kelvin)
        : WARM;
  return { hue: hue ?? 0, saturation, kelvin, rgb };
};

export interface ServiceCall {
  domain: string;
  service: string;
  data: Record<string, unknown>;
}

const domainOf = (entityId: string) => entityId.split('.')[0];

// Switches, input booleans and lights alike: HA's toggle keeps a light's
// last brightness and color
export const toggleCall = (entityId: string): ServiceCall => ({
  domain: domainOf(entityId) === 'light' ? 'light' : 'homeassistant',
  service: 'toggle',
  data: {},
});

export const levelCall = (percent: number): ServiceCall =>
  percent <= 0
    ? { domain: 'light', service: 'turn_off', data: {} }
    : { domain: 'light', service: 'turn_on', data: { brightness_pct: percent } };

export const hueCall = (hue: number): ServiceCall => ({
  domain: 'light',
  service: 'turn_on',
  data: { hs_color: [hue, 100] },
});

// A white: by its temperature where the light has one, else the color
// without saturation
export const whiteCall = (kelvin: number, caps: LightCaps): ServiceCall => ({
  domain: 'light',
  service: 'turn_on',
  data: caps.hasWhite
    ? { color_temp_kelvin: Math.min(caps.maxKelvin, Math.max(caps.minKelvin, kelvin)) }
    : { hs_color: [0, 0] },
});
