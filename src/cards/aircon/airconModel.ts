import { type HassEntity, numberAttr, supports } from '../../ha/types';
import { STEP } from '../thermostat/constants';
import type { ServiceCall } from '../thermostat/climateModel';

// What the air conditioner tile shows, read from a HA climate entity.
// Modes, actions and attributes: homeassistant/components/climate/const.py
// (HVACMode, HVACAction, ClimateEntityFeature, ATTR_*); which attributes an
// entity has by its features: climate/__init__.py (capability_attributes,
// state_attributes).

// ClimateEntityFeature (climate/const.py)
export const FEATURE = {
  TARGET_TEMPERATURE: 1,
  TARGET_TEMPERATURE_RANGE: 2,
  FAN_MODE: 8,
  PRESET_MODE: 16,
  SWING_MODE: 32,
  TURN_OFF: 128,
  TURN_ON: 256,
  SWING_HORIZONTAL_MODE: 512,
} as const;

// The modes in the order the tile shows them (HVACMode without off, which
// is the power button); modes HA doesn't know yet come after them
const MODE_ORDER = ['cool', 'heat', 'heat_cool', 'auto', 'dry', 'fan_only'];

// The color of a mode: cold air sky blue, warm air orange, drying teal, the
// fan a neutral grey; heat_cool and auto take the color of what the unit
// does at the moment (cooling, heating), else their own
export type Tone = 'cool' | 'heat' | 'dry' | 'fan' | 'range' | 'auto' | 'off';

const MODE_TONE: Record<string, Tone> = {
  cool: 'cool',
  heat: 'heat',
  dry: 'dry',
  fan_only: 'fan',
  heat_cool: 'range',
  auto: 'auto',
  off: 'off',
};

const ACTION_TONE: Record<string, Tone> = {
  cooling: 'cool',
  heating: 'heat',
  preheating: 'heat',
  drying: 'dry',
  fan: 'fan',
};

// HVACAction (climate/const.py) in which air comes out of the unit
const BLOWING = ['cooling', 'heating', 'preheating', 'drying', 'fan'];

// A list of options with the one set now (fan, swing, preset)
export interface Choice {
  value: string;
  options: string[];
}

export interface TemperatureLimits {
  min: number;
  max: number;
  step: number;
}

export interface AirconView {
  // The hvac_mode (the entity's state)
  mode: string;
  // The hvac_modes for the mode buttons, without off
  modes: string[];
  off: boolean;
  // Off and on: turn_off/turn_on, or hvac_mode off
  canPower: boolean;
  // hvac_action, null when the entity doesn't say
  action: string | null;
  // Air comes out: by hvac_action, else by the mode
  blowing: boolean;
  tone: Tone;
  // One target (temperature) or a range (target_temp_low/high), or none
  // (off, fan only: many units report no target then)
  target: number | null;
  low: number | null;
  high: number | null;
  limits: TemperatureLimits;
  current: number | null;
  humidity: number | null;
  fan: Choice | null;
  swing: Choice | null;
  swingHorizontal: Choice | null;
  preset: Choice | null;
}

const listOf = (entity: HassEntity | undefined, key: string): string[] => {
  const value = entity?.attributes[key];
  return Array.isArray(value) ? value.map(String) : [];
};

const stringAttr = (entity: HassEntity | undefined, key: string) => {
  const value = entity?.attributes[key];
  return typeof value === 'string' ? value : null;
};

// A choice where the feature is supported and HA lists the options
// (capability_attributes only adds them with the feature)
const choiceOf = (
  entity: HassEntity | undefined,
  feature: number,
  current: string,
  list: string,
): Choice | null => {
  const options = listOf(entity, list);
  if (!supports(entity, feature) || options.length < 2) return null;
  return { value: stringAttr(entity, current) ?? '', options };
};

export const sortModes = (modes: string[]) => {
  const rank = (mode: string) => (MODE_ORDER.includes(mode) ? MODE_ORDER.indexOf(mode) : MODE_ORDER.length);
  return modes.filter((mode) => mode !== 'off').sort((a, b) => rank(a) - rank(b));
};

// min_temp/max_temp are always there (capability_attributes; HA's default
// is 7–35 °C, DEFAULT_MIN_TEMP/DEFAULT_MAX_TEMP in climate/const.py); the
// step is target_temp_step where the entity has one, else 0.5 as the
// thermostat tile steps
export const limitsOf = (entity: HassEntity | undefined): TemperatureLimits => {
  const min = numberAttr(entity, 'min_temp') ?? 7;
  const max = numberAttr(entity, 'max_temp') ?? 35;
  const step = numberAttr(entity, 'target_temp_step') ?? STEP;
  return min < max ? { min, max, step } : { min: 7, max: 35, step };
};

export const toneOf = (mode: string, action: string | null): Tone => {
  const own = MODE_TONE[mode] ?? 'auto';
  if (own === 'off') return 'off';
  // heat_cool and auto: the color of the air that comes out
  if ((own === 'range' || own === 'auto') && action) return ACTION_TONE[action] ?? own;
  return own;
};

export const viewOfAircon = (entity: HassEntity | undefined): AirconView => {
  const mode = entity?.state ?? 'off';
  const modes = listOf(entity, 'hvac_modes');
  const off = mode === 'off';
  const action = stringAttr(entity, 'hvac_action');
  const low = numberAttr(entity, 'target_temp_low');
  const high = numberAttr(entity, 'target_temp_high');
  // The range where the entity supports it and reports both ends; HA keeps
  // temperature for the single target (state_attributes)
  const range = supports(entity, FEATURE.TARGET_TEMPERATURE_RANGE) && low !== null && high !== null;
  const target = numberAttr(entity, 'temperature');
  const single = target !== null && (!range || mode !== 'heat_cool');
  return {
    mode,
    modes: sortModes(modes),
    off,
    canPower:
      modes.includes('off') || supports(entity, FEATURE.TURN_ON) || supports(entity, FEATURE.TURN_OFF),
    action,
    blowing: !off && (action === null ? true : BLOWING.includes(action)),
    tone: toneOf(mode, action),
    target: single ? target : null,
    low: !single && range ? low : null,
    high: !single && range ? high : null,
    limits: limitsOf(entity),
    current: numberAttr(entity, 'current_temperature'),
    humidity: numberAttr(entity, 'current_humidity'),
    fan: choiceOf(entity, FEATURE.FAN_MODE, 'fan_mode', 'fan_modes'),
    swing: choiceOf(entity, FEATURE.SWING_MODE, 'swing_mode', 'swing_modes'),
    swingHorizontal: choiceOf(entity, FEATURE.SWING_HORIZONTAL_MODE, 'swing_horizontal_mode', 'swing_horizontal_modes'),
    preset: choiceOf(entity, FEATURE.PRESET_MODE, 'preset_mode', 'preset_modes'),
  };
};

// How fast the air flows: by the fan's speed (FAN_* in climate/const.py),
// 1 is the normal pace
const FAN_PACE: Record<string, number> = {
  low: 0.7,
  quiet: 0.6,
  silent: 0.6,
  medium: 1,
  middle: 1,
  high: 1.4,
  top: 1.6,
  turbo: 1.6,
  strong: 1.4,
};

export const paceOf = (fan: Choice | null) => FAN_PACE[fan?.value ?? ''] ?? 1;

// Swing on: the louvre sways (SWING_* in climate/const.py: on, both,
// vertical, horizontal; anything but off)
export const swinging = (swing: Choice | null) => !!swing && swing.value !== '' && swing.value !== 'off';

export const modeCall = (mode: string): ServiceCall => ({ service: 'set_hvac_mode', data: { hvac_mode: mode } });

// On: turn_on where the entity supports it (the unit comes back in its last
// mode), else the first of heat_cool, heat, cool as HA's own fallback does
// (ClimateEntity.async_turn_on in climate/__init__.py). Off: turn_off, else
// hvac_mode off.
export const powerCall = (entity: HassEntity | undefined, view: AirconView): ServiceCall => {
  if (!view.off) return supports(entity, FEATURE.TURN_OFF) ? { service: 'turn_off', data: {} } : modeCall('off');
  if (supports(entity, FEATURE.TURN_ON)) return { service: 'turn_on', data: {} };
  const modes = listOf(entity, 'hvac_modes');
  const on = ['heat_cool', 'heat', 'cool'].find((mode) => modes.includes(mode)) ?? view.modes[0] ?? 'cool';
  return modeCall(on);
};

// HA wants both ends together (Inclusive in climate/services.py) and the
// low one not above the high one
export const rangeCall = (low: number, high: number): ServiceCall => ({
  service: 'set_temperature',
  data: { target_temp_low: Math.min(low, high), target_temp_high: Math.max(low, high) },
});

export const choiceCall = (kind: 'fan' | 'swing' | 'swingHorizontal' | 'preset', value: string): ServiceCall =>
  ({
    fan: { service: 'set_fan_mode', data: { fan_mode: value } },
    swing: { service: 'set_swing_mode', data: { swing_mode: value } },
    swingHorizontal: { service: 'set_swing_horizontal_mode', data: { swing_horizontal_mode: value } },
    preset: { service: 'set_preset_mode', data: { preset_mode: value } },
  })[kind];
