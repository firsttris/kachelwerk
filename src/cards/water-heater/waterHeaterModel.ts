import { type HassEntity, numberAttr, supports } from '../../ha/types';
import type { ServiceCall } from '../thermostat/climateModel';

// What the water heater tile shows, read from a HA water_heater entity.
// States, attributes and features: homeassistant/components/water_heater/
// const.py (STATE_*, WaterHeaterEntityFeature, WaterHeater*Attribute);
// which attributes an entity has by its features: water_heater/__init__.py
// (capability_attributes, state_attributes); the services and the feature
// each needs: water_heater/services.py.

// WaterHeaterEntityFeature (water_heater/const.py)
export const FEATURE = {
  TARGET_TEMPERATURE: 1,
  OPERATION_MODE: 2,
  AWAY_MODE: 4,
  ON_OFF: 8,
} as const;

export interface TemperatureLimits {
  min: number;
  max: number;
  step: number;
}

export interface WaterHeaterView {
  // The current operation: the entity's state (WaterHeaterEntity.state is
  // current_operation), e.g. eco, heat_pump, off
  mode: string;
  // The operation_list for the mode buttons, without off (the power button),
  // in the integration's order
  modes: string[];
  off: boolean;
  // Off and on: turn_on/turn_off (ON_OFF), or the operation mode off
  canPower: boolean;
  // The water is below the target while the heater is on; HA reports no
  // action for water heaters, so this is as far as the card can tell
  heating: boolean;
  // The target (temperature), only where it can be set (TARGET_TEMPERATURE)
  target: number | null;
  // A band some heaters report (target_temp_low/high); set_temperature only
  // takes one temperature, so it is shown, not set
  low: number | null;
  high: number | null;
  current: number | null;
  limits: TemperatureLimits;
  // temperature_unit (HA's unit system, state_attributes)
  unit: string;
  fahrenheit: boolean;
  // away_mode on/off, null without AWAY_MODE
  away: boolean | null;
  // Where the water's temperature and the target are on the tank's scale, 0..1
  level: number | null;
  // How warm the water feels, 0 (15 °C, cold tap water) to 1 (60 °C), for
  // its color
  warmth: number | null;
  mark: number | null;
  // Hot enough to steam (45 °C / 113 °F and more)
  hot: boolean;
}

const listOf = (entity: HassEntity | undefined, key: string): string[] => {
  const value = entity?.attributes[key];
  return Array.isArray(value) ? value.map(String) : [];
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

// min_temp/max_temp are always there (capability_attributes); HA's default
// is 110–140 °F (DEFAULT_MIN_TEMP/DEFAULT_MAX_TEMP in water_heater/
// __init__.py). The step is target_temp_step where the entity has one, else
// 0.5 in °C and 1 in °F, as HA's more-info dialog steps.
export const limitsOf = (entity: HassEntity | undefined, fahrenheit: boolean): TemperatureLimits => {
  const fallback = fahrenheit ? { min: 110, max: 140 } : { min: 43.5, max: 60 };
  const min = numberAttr(entity, 'min_temp') ?? fallback.min;
  const max = numberAttr(entity, 'max_temp') ?? fallback.max;
  const step = numberAttr(entity, 'target_temp_step') ?? (fahrenheit ? 1 : 0.5);
  return min < max ? { min, max, step } : { ...fallback, step };
};

// The tank's scale: from cold tap water (10 °C / 50 °F, or the minimum if it
// is lower) to the maximum, so a cold tank shows nearly empty
export const scaleOf = (limits: TemperatureLimits, fahrenheit: boolean) => {
  const bottom = Math.min(limits.min, fahrenheit ? 50 : 10);
  return (value: number) => clamp((value - bottom) / (limits.max - bottom));
};

// How warm water feels, by °C: 15 (cold tap water) is 0, 60 is 1
export const warmthOf = (celsius: number) => clamp((celsius - 15) / 45);

export const viewOfWaterHeater =(entity: HassEntity | undefined): WaterHeaterView => {
  const mode = entity?.state ?? 'off';
  const unit = typeof entity?.attributes.temperature_unit === 'string' ? entity.attributes.temperature_unit : '°C';
  const fahrenheit = unit === '°F';
  const limits = limitsOf(entity, fahrenheit);
  const scale = scaleOf(limits, fahrenheit);
  // operation_list is only there with OPERATION_MODE (capability_attributes)
  const operations = supports(entity, FEATURE.OPERATION_MODE) ? listOf(entity, 'operation_list') : [];
  const off = mode === 'off';
  const current = numberAttr(entity, 'current_temperature');
  const target = supports(entity, FEATURE.TARGET_TEMPERATURE) ? numberAttr(entity, 'temperature') : null;
  const awayMode = entity?.attributes.away_mode;
  return {
    mode,
    modes: operations.filter((operation) => operation !== 'off'),
    off,
    canPower: supports(entity, FEATURE.ON_OFF) || operations.includes('off'),
    heating: !off && current !== null && target !== null && current < target,
    target,
    low: numberAttr(entity, 'target_temp_low'),
    high: numberAttr(entity, 'target_temp_high'),
    current,
    limits,
    unit,
    fahrenheit,
    // STATE_ON/STATE_OFF (state_attributes)
    away: supports(entity, FEATURE.AWAY_MODE) ? awayMode === 'on' || awayMode === true : null,
    level: current === null ? null : scale(current),
    warmth: current === null ? null : warmthOf(fahrenheit ? ((current - 32) * 5) / 9 : current),
    mark: target === null ? null : scale(target),
    hot: current !== null && current >= (fahrenheit ? 113 : 45),
  };
};

// set_temperature as the climate one (temperature); water_heater's schema
// in services.py takes the same field
export { temperatureCall } from '../thermostat/climateModel';

export const modeCall = (mode: string): ServiceCall => ({
  service: 'set_operation_mode',
  data: { operation_mode: mode },
});

export const awayCall = (away: boolean): ServiceCall => ({ service: 'set_away_mode', data: { away_mode: away } });

// On and off: turn_on/turn_off where the entity supports them (ON_OFF in
// services.py), else the operation mode off, and to turn on the first other
// mode of the operation_list (HA has no fallback of its own for water heaters)
export const powerCall = (entity: HassEntity | undefined, view: WaterHeaterView): ServiceCall => {
  if (supports(entity, FEATURE.ON_OFF)) return { service: view.off ? 'turn_on' : 'turn_off', data: {} };
  return modeCall(view.off ? (view.modes[0] ?? 'off') : 'off');
};

// The water's color by its warmth: cold blue over violet to hot orange (in
// OKLCH as the floor heating's water, so the way never turns green); warm
// water soon looks warm, so the hue moves fast at first
export const waterColor = (warmth: number, alpha = 1) =>
  `oklch(0.68 0.18 ${(250 + 150 * Math.sqrt(clamp(warmth))).toFixed(1)} / ${clamp(alpha).toFixed(3)})`;
