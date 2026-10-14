import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import { boostCall, powerOffCall, rangeOf, toggleModeCall, viewOfClimate } from './climateModel';

const climate = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'climate.bad',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

// As homematicip_local reports a radiator thermostat
const hmip = {
  hvac_modes: ['auto', 'heat', 'off'],
  preset_modes: ['boost', 'none', 'week_program_1'],
  preset_mode: 'none',
  min_temp: 4.5,
  max_temp: 30.5,
  target_temp_step: 0.5,
  current_temperature: 20.3,
  temperature: 21,
  current_humidity: 54,
  hvac_action: 'heating',
};

describe('rangeOf', () => {
  it('keeps the dial within 5–30 °C and turns off at the minimum', () => {
    expect(rangeOf(climate('auto', hmip))).toEqual({ min: 5, max: 30, off: 4.5, step: 0.5 });
    expect(rangeOf(climate('heat', { min_temp: 7, max_temp: 25 }))).toEqual({ min: 7, max: 25, off: 7, step: undefined });
  });
});

describe('viewOfClimate', () => {
  it('reads target, actual, humidity and what the thermostat does', () => {
    const view = viewOfClimate(climate('auto', hmip));
    expect(view).toMatchObject({ target: 21, current: 20.3, humidity: 54, manual: false, heating: true });
    expect(view).toMatchObject({ canToggleMode: true, canBoost: true, boost: false, canComfort: false });
  });

  it('takes heat as manual, the preset boost as boost', () => {
    expect(viewOfClimate(climate('heat', hmip)).manual).toBe(true);
    expect(viewOfClimate(climate('auto', { ...hmip, preset_mode: 'boost' })).boost).toBe(true);
  });

  it('knows nothing of heating when HA has no hvac_action', () => {
    expect(viewOfClimate(climate('heat', { temperature: 20 })).heating).toBeNull();
  });
});

describe('service calls', () => {
  it('switches off by the off mode, else at the lowest temperature', () => {
    expect(powerOffCall(climate('auto', hmip))).toEqual({ service: 'set_hvac_mode', data: { hvac_mode: 'off' } });
    expect(powerOffCall(climate('heat', { hvac_modes: ['heat'], min_temp: 7, max_temp: 25 }))).toEqual({
      service: 'set_temperature',
      data: { temperature: 7 },
    });
  });

  it('toggles between auto and heat', () => {
    expect(toggleModeCall(viewOfClimate(climate('auto', hmip))).data).toEqual({ hvac_mode: 'heat' });
    expect(toggleModeCall(viewOfClimate(climate('heat', hmip))).data).toEqual({ hvac_mode: 'auto' });
  });

  it('starts boost and ends it in none', () => {
    const entity = climate('auto', hmip);
    expect(boostCall(entity, viewOfClimate(entity)).data).toEqual({ preset_mode: 'boost' });
    const boosting = climate('auto', { ...hmip, preset_mode: 'boost' });
    expect(boostCall(boosting, viewOfClimate(boosting)).data).toEqual({ preset_mode: 'none' });
  });
});
