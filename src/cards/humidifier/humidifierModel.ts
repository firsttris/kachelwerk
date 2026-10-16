import { type HassEntity, numberAttr, supports } from '../../ha/types';
import type { Choice } from '../aircon/airconModel';
import type { ServiceCall } from '../thermostat/climateModel';

// What the humidifier tile shows, read from a HA humidifier entity.
// Actions, device classes, features and attributes:
// homeassistant/components/humidifier/const.py (HumidifierAction,
// HumidifierDeviceClass, HumidifierEntityFeature, ATTR_*, DEFAULT_MIN/
// MAX_HUMIDITY); which attributes an entity has: humidifier/__init__.py
// (capability_attributes, state_attributes); the services:
// humidifier/services.py.

// HumidifierEntityFeature (humidifier/const.py)
export const HUMIDIFIER_FEATURE = { MODES: 1 } as const;

export type HumidifierKind = 'humidifier' | 'dehumidifier';

// The color of what the device does: mist sky blue, drying teal (as the
// air conditioner's dry mode), idle and off grey
export type HumidifierTone = 'humidify' | 'dry' | 'idle' | 'off';

export interface HumidityLimits {
  min: number;
  max: number;
  step: number;
}

export interface HumidifierView {
  on: boolean;
  kind: HumidifierKind;
  // HumidifierAction, null when the entity doesn't report one
  action: string | null;
  // Mist rises (humidifying) or water collects (drying)
  working: boolean;
  tone: HumidifierTone;
  // The target (humidity); null when the entity has none
  target: number | null;
  current: number | null;
  limits: HumidityLimits;
  // available_modes with the one set now (MODES feature)
  mode: Choice | null;
}

const stringAttr = (entity: HassEntity | undefined, key: string) => {
  const value = entity?.attributes[key];
  return typeof value === 'string' ? value : null;
};

// min_humidity/max_humidity are always there (capability_attributes,
// default 0–100); the step is target_humidity_step where the entity has
// one, else 1 as set_humidity takes whole percents (Coerce(int) in
// humidifier/services.py)
export const limitsOf = (entity: HassEntity | undefined): HumidityLimits => {
  const min = numberAttr(entity, 'min_humidity') ?? 0;
  const max = numberAttr(entity, 'max_humidity') ?? 100;
  const own = numberAttr(entity, 'target_humidity_step');
  const step = own !== null && own >= 1 ? own : 1;
  return min < max ? { min, max, step } : { min: 0, max: 100, step };
};

const ACTION_TONE: Record<string, HumidifierTone> = {
  humidifying: 'humidify',
  drying: 'dry',
  idle: 'idle',
  off: 'off',
};

export const viewOfHumidifier = (entity: HassEntity | undefined): HumidifierView => {
  const on = entity?.state === 'on';
  const kind: HumidifierKind = entity?.attributes.device_class === 'dehumidifier' ? 'dehumidifier' : 'humidifier';
  // HA reports action off while the device is off (state_attributes)
  const action = on ? stringAttr(entity, 'action') : stringAttr(entity, 'action') && 'off';
  // Without an action: on means working, as its device class does
  const tone: HumidifierTone = !on
    ? 'off'
    : action === null
      ? kind === 'dehumidifier'
        ? 'dry'
        : 'humidify'
      : (ACTION_TONE[action] ?? 'idle');
  const modes = entity?.attributes.available_modes;
  const options = Array.isArray(modes) ? modes.map(String) : [];
  return {
    on,
    kind,
    action,
    working: tone === 'humidify' || tone === 'dry',
    tone,
    target: numberAttr(entity, 'humidity'),
    current: numberAttr(entity, 'current_humidity'),
    limits: limitsOf(entity),
    mode:
      supports(entity, HUMIDIFIER_FEATURE.MODES) && options.length > 0
        ? { value: stringAttr(entity, 'mode') ?? '', options }
        : null,
  };
};

// turn_on/turn_off have no feature (humidifier/services.py)
export const powerCall = (view: HumidifierView): ServiceCall => ({ service: view.on ? 'turn_off' : 'turn_on', data: {} });

// Whole percents within min/max: HA refuses others (humidity_out_of_range)
export const humidityCall = (humidity: number, limits: HumidityLimits): ServiceCall => ({
  service: 'set_humidity',
  data: { humidity: Math.round(Math.max(limits.min, Math.min(limits.max, humidity))) },
});

export const modeCall = (mode: string): ServiceCall => ({ service: 'set_mode', data: { mode } });
