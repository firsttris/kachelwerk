import { type HassEntity, numberAttr } from '../../ha/types';
import { DEFAULT_RANGE, MAX_TEMP, MIN_TEMP, type TemperatureRange } from './constants';

// What MUI's thermostat tile shows, read from a HA climate entity
// (homeassistant/components/climate/const.py: HVACMode, HVACAction,
// PRESET_*; attributes in climate/__init__.py)
export interface ClimateView {
  target: number;
  current: number;
  humidity?: number;
  range: TemperatureRange;
  off: boolean;
  // MUI's manual mode: HA's hvac_mode heat where auto (the week schedule) exists
  manual: boolean;
  canToggleMode: boolean;
  boost: boolean;
  canBoost: boolean;
  // MUI's holiday mode: HA's preset away
  holiday: boolean;
  canComfort: boolean;
  canEco: boolean;
  // The active preset (none, comfort, eco, a week program, …)
  preset: string;
  // hvac_action heating, null when the entity doesn't say
  heating: boolean | null;
}

const listOf = (entity: HassEntity | undefined, key: string): string[] => {
  const value = entity?.attributes[key];
  return Array.isArray(value) ? value.map(String) : [];
};

// The dial's range: HA's min_temp/max_temp within MUI's 5–30 °C where the
// device allows it; "off" is the minimum
export const rangeOf = (entity: HassEntity | undefined): TemperatureRange => {
  const min = numberAttr(entity, 'min_temp');
  const max = numberAttr(entity, 'max_temp');
  const step = numberAttr(entity, 'target_temp_step') ?? undefined;
  if (min === null || max === null || min >= max) return { ...DEFAULT_RANGE, step };
  const low = Math.max(min, Math.min(MIN_TEMP, max));
  const high = Math.min(max, Math.max(MAX_TEMP, low + 1));
  return { min: low, max: high, off: min, step };
};

export const viewOfClimate = (entity: HassEntity | undefined): ClimateView => {
  const range = rangeOf(entity);
  const modes = listOf(entity, 'hvac_modes');
  const presets = listOf(entity, 'preset_modes');
  const preset = String(entity?.attributes.preset_mode ?? '');
  const off = entity?.state === 'off';
  const action = entity?.attributes.hvac_action;
  const humidity = numberAttr(entity, 'current_humidity');
  return {
    target: numberAttr(entity, 'temperature') ?? range.off,
    current: numberAttr(entity, 'current_temperature') ?? Number.NaN,
    humidity: humidity === null ? undefined : Math.round(humidity),
    range,
    off,
    manual: entity?.state === 'heat' && modes.includes('auto'),
    canToggleMode: modes.includes('auto') && modes.includes('heat'),
    boost: preset === 'boost',
    canBoost: presets.includes('boost'),
    holiday: preset === 'away',
    canComfort: presets.includes('comfort'),
    canEco: presets.includes('eco'),
    preset,
    heating: typeof action === 'string' ? action === 'heating' || action === 'preheating' : null,
  };
};

export interface ServiceCall {
  service: string;
  data: Record<string, unknown>;
}

export const temperatureCall = (temperature: number): ServiceCall => ({
  service: 'set_temperature',
  data: { temperature },
});

// Off: HA's hvac_mode off where the entity has it, else the lowest
// temperature (as MUI sends 4.5 °C)
export const powerOffCall = (entity: HassEntity | undefined): ServiceCall =>
  listOf(entity, 'hvac_modes').includes('off')
    ? { service: 'set_hvac_mode', data: { hvac_mode: 'off' } }
    : temperatureCall(rangeOf(entity).off);

export const toggleModeCall = (view: ClimateView): ServiceCall => ({
  service: 'set_hvac_mode',
  data: { hvac_mode: view.manual || view.off ? 'auto' : 'heat' },
});

// Boost ends in the preset "none" where there is one, else in comfort
export const boostCall = (entity: HassEntity | undefined, view: ClimateView): ServiceCall => {
  const presets = listOf(entity, 'preset_modes');
  const back = presets.includes('none') ? 'none' : presets.includes('comfort') ? 'comfort' : presets[0];
  return { service: 'set_preset_mode', data: { preset_mode: view.boost ? back : 'boost' } };
};

export const presetCall = (preset: string): ServiceCall => ({
  service: 'set_preset_mode',
  data: { preset_mode: preset },
});
