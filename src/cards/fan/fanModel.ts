import { type HassEntity, numberAttr, supports } from '../../ha/types';
import type { Choice } from '../aircon/airconModel';
import type { ServiceCall } from '../thermostat/climateModel';

// What the fan tile shows, read from a HA fan entity. Features, attributes
// and directions: homeassistant/components/fan/const.py (FanEntityFeature,
// ATTR_*, DIRECTION_*); which attributes an entity has by its features:
// fan/__init__.py (capability_attributes, state_attributes); the services
// and the features they need: fan/services.py.

// FanEntityFeature (fan/const.py)
export const FAN_FEATURE = {
  SET_SPEED: 1,
  OSCILLATE: 2,
  DIRECTION: 4,
  PRESET_MODE: 8,
  TURN_OFF: 16,
  TURN_ON: 32,
} as const;

export type Direction = 'forward' | 'reverse';

export interface FanView {
  on: boolean;
  // turn_on and turn_off each need their feature (fan/services.py)
  canOn: boolean;
  canOff: boolean;
  // The speed in percent while the fan supports SET_SPEED, else null; 0
  // while it is off (some fans keep reporting their last speed)
  percentage: number | null;
  // speed_count: HA reports percentage_step = 100 / speed_count
  speeds: number;
  // The speed as a step, 1..speeds (0 off)
  speed: number;
  // preset_modes with the one set now ('' without a preset)
  preset: Choice | null;
  // null where the fan can't oscillate (no OSCILLATE feature)
  oscillating: boolean | null;
  // null where the fan has no direction (no DIRECTION feature)
  direction: Direction | null;
  // How fast the blades turn, 0 (still) to 1 (full speed)
  spin: number;
}

const stringAttr = (entity: HassEntity | undefined, key: string) => {
  const value = entity?.attributes[key];
  return typeof value === 'string' ? value : null;
};

const listOf = (entity: HassEntity | undefined, key: string): string[] => {
  const value = entity?.attributes[key];
  return Array.isArray(value) ? value.map(String) : [];
};

// speed_count from percentage_step (100 / speed_count in FanEntity); HA's
// default is 100 speeds
export const speedsOf = (entity: HassEntity | undefined) => {
  const step = numberAttr(entity, 'percentage_step');
  if (step === null || step <= 0 || step > 100) return 100;
  return Math.max(1, Math.round(100 / step));
};

// The percentage of speed i out of count, as HA computes it:
// ranged_value_to_percentage((1, count), i) = i * 100 // count
// (homeassistant/util/percentage.py, util/scaling.py)
export const percentageOf = (speed: number, count: number) =>
  Math.floor((Math.max(0, Math.min(count, speed)) * 100) / count);

// The step of a percentage: math.ceil(percentage_to_ranged_value(...)) as
// FanEntity._async_adjust_speed does
export const speedOf = (percentage: number, count: number) =>
  Math.min(count, Math.ceil(Math.round((percentage * count) / 100 * 1000) / 1000));

// A value along the bar, snapped to the fan's speeds
export const snapPercentage = (value: number, count: number) => percentageOf(Math.round((value * count) / 100), count);

export const viewOfFan = (entity: HassEntity | undefined): FanView => {
  const on = entity?.state === 'on';
  const speeds = speedsOf(entity);
  const reported = numberAttr(entity, 'percentage');
  const percentage = supports(entity, FAN_FEATURE.SET_SPEED) ? (on ? Math.max(0, Math.min(100, reported ?? 0)) : 0) : null;
  // preset_modes come with SET_SPEED or PRESET_MODE (capability_attributes),
  // set_preset_mode needs one of them
  const presets = listOf(entity, 'preset_modes');
  const canPreset = supports(entity, FAN_FEATURE.SET_SPEED) || supports(entity, FAN_FEATURE.PRESET_MODE);
  const direction = stringAttr(entity, 'direction');
  const oscillating = entity?.attributes.oscillating;
  // A fan on a preset or without speeds turns at a middle pace
  const spin = !on ? 0 : percentage ? percentage / 100 : 0.55;
  return {
    on,
    canOn: supports(entity, FAN_FEATURE.TURN_ON),
    canOff: supports(entity, FAN_FEATURE.TURN_OFF),
    percentage,
    speeds,
    speed: percentage === null ? 0 : speedOf(percentage, speeds),
    preset: canPreset && presets.length > 0 ? { value: (on && stringAttr(entity, 'preset_mode')) || '', options: presets } : null,
    oscillating: supports(entity, FAN_FEATURE.OSCILLATE) ? oscillating === true : null,
    direction: supports(entity, FAN_FEATURE.DIRECTION) ? (direction === 'reverse' ? 'reverse' : 'forward') : null,
    spin,
  };
};

// On and off: turn_on, turn_off (fan/services.py; toggle needs both)
export const powerCall = (view: FanView): ServiceCall => ({ service: view.on ? 'turn_off' : 'turn_on', data: {} });

// 0 turns the fan off (FanEntity.async_set_percentage)
export const percentageCall = (percentage: number): ServiceCall => ({
  service: 'set_percentage',
  data: { percentage: Math.round(percentage) },
});

export const presetCall = (preset: string): ServiceCall => ({ service: 'set_preset_mode', data: { preset_mode: preset } });

export const oscillateCall = (oscillating: boolean): ServiceCall => ({ service: 'oscillate', data: { oscillating } });

export const directionCall = (direction: Direction): ServiceCall => ({ service: 'set_direction', data: { direction } });
