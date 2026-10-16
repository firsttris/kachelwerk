import { describe, expect, it } from 'vitest';
import type { HassEntity } from '../../ha/types';
import {
  awayCall,
  FEATURE,
  limitsOf,
  modeCall,
  powerCall,
  scaleOf,
  temperatureCall,
  viewOfWaterHeater,
  warmthOf,
  waterColor,
} from './waterHeaterModel';

const heater = (state: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: 'water_heater.boiler',
  state,
  attributes,
  last_changed: '',
  last_updated: '',
});

// As a heat pump water heater reports itself (e.g. through econet or a.o. smith)
const heatPump = {
  operation_list: ['off', 'eco', 'heat_pump', 'high_demand', 'electric'],
  operation_mode: 'heat_pump',
  min_temp: 35,
  max_temp: 65,
  target_temp_step: 1,
  current_temperature: 48.5,
  temperature: 55,
  target_temp_low: null,
  target_temp_high: null,
  away_mode: 'off',
  temperature_unit: '°C',
  supported_features: FEATURE.TARGET_TEMPERATURE | FEATURE.OPERATION_MODE | FEATURE.AWAY_MODE | FEATURE.ON_OFF,
};

describe('viewOfWaterHeater', () => {
  it('reads a heat pump below its target: heating, modes without off, away off', () => {
    const view = viewOfWaterHeater(heater('heat_pump', heatPump));
    expect(view).toMatchObject({
      mode: 'heat_pump',
      modes: ['eco', 'heat_pump', 'high_demand', 'electric'],
      off: false,
      canPower: true,
      heating: true,
      target: 55,
      current: 48.5,
      limits: { min: 35, max: 65, step: 1 },
      unit: '°C',
      away: false,
      hot: true,
    });
    // 10 °C at the bottom of the tank, 65 °C at the top
    expect(view.level).toBeCloseTo(38.5 / 55);
    expect(view.mark).toBeCloseTo(45 / 55);
  });

  it('holds the temperature once the water has reached the target', () => {
    expect(viewOfWaterHeater(heater('eco', { ...heatPump, current_temperature: 55 })).heating).toBe(false);
  });

  it('is off in the operation mode off, and does not heat then', () => {
    const view = viewOfWaterHeater(heater('off', heatPump));
    expect(view).toMatchObject({ off: true, heating: false });
  });

  it('leaves out what the entity does not support', () => {
    const view = viewOfWaterHeater(heater('on', { ...heatPump, supported_features: 0 }));
    expect(view).toMatchObject({ modes: [], canPower: false, target: null, mark: null, away: null, heating: false });
  });

  it('can turn off by the operation mode off without ON_OFF', () => {
    const features = FEATURE.TARGET_TEMPERATURE | FEATURE.OPERATION_MODE;
    expect(viewOfWaterHeater(heater('eco', { ...heatPump, supported_features: features })).canPower).toBe(true);
    const noOff = { ...heatPump, operation_list: ['eco', 'electric'], supported_features: features };
    expect(viewOfWaterHeater(heater('eco', noOff)).canPower).toBe(false);
  });

  it('reads away mode on, and the band of target_temp_low/high', () => {
    const view = viewOfWaterHeater(heater('eco', { ...heatPump, away_mode: 'on', target_temp_low: 45, target_temp_high: 60 }));
    expect(view).toMatchObject({ away: true, low: 45, high: 60 });
  });

  it('takes °F from temperature_unit, with HA defaults and a step of 1', () => {
    const view = viewOfWaterHeater(heater('gas', { temperature_unit: '°F', current_temperature: 100, temperature: 120, supported_features: 1 }));
    expect(view).toMatchObject({ fahrenheit: true, unit: '°F', limits: { min: 110, max: 140, step: 1 }, hot: false });
    expect(view.level).toBeCloseTo(50 / 90);
  });

  it('copes without an entity', () => {
    expect(viewOfWaterHeater(undefined)).toMatchObject({ off: true, current: null, level: null });
  });
});

describe('limitsOf and scaleOf', () => {
  it('steps by 0.5 in °C without target_temp_step and ignores a broken range', () => {
    expect(limitsOf(heater('eco', { min_temp: 70, max_temp: 40 }), false)).toEqual({ min: 43.5, max: 60, step: 0.5 });
  });

  it('keeps the scale within 0..1', () => {
    const scale = scaleOf({ min: 40, max: 60, step: 1 }, false);
    expect(scale(5)).toBe(0);
    expect(scale(80)).toBe(1);
    expect(scale(35)).toBe(0.5);
  });
});

describe('service calls', () => {
  it('sets temperature, operation mode and away mode as water_heater/services.py has them', () => {
    expect(temperatureCall(52)).toEqual({ service: 'set_temperature', data: { temperature: 52 } });
    expect(modeCall('eco')).toEqual({ service: 'set_operation_mode', data: { operation_mode: 'eco' } });
    expect(awayCall(true)).toEqual({ service: 'set_away_mode', data: { away_mode: true } });
  });

  it('turns on and off with turn_on/turn_off where supported', () => {
    const on = heater('eco', heatPump);
    expect(powerCall(on, viewOfWaterHeater(on))).toEqual({ service: 'turn_off', data: {} });
    const off = heater('off', heatPump);
    expect(powerCall(off, viewOfWaterHeater(off))).toEqual({ service: 'turn_on', data: {} });
  });

  it('else by the operation mode: off, and back on with the first listed mode', () => {
    const attributes = { ...heatPump, supported_features: FEATURE.OPERATION_MODE };
    const on = heater('electric', attributes);
    expect(powerCall(on, viewOfWaterHeater(on))).toEqual(modeCall('off'));
    const off = heater('off', attributes);
    expect(powerCall(off, viewOfWaterHeater(off))).toEqual(modeCall('eco'));
  });
});

describe('waterColor', () => {
  it('goes from blue (cold) to red (hot)', () => {
    expect(waterColor(0)).toBe('oklch(0.68 0.18 250.0 / 1.000)');
    expect(waterColor(0.25)).toBe('oklch(0.68 0.18 325.0 / 1.000)');
    expect(waterColor(1, 0.5)).toBe('oklch(0.68 0.18 400.0 / 0.500)');
  });

  it('takes the warmth from °C, also of a heater in °F', () => {
    expect(warmthOf(60)).toBe(1);
    expect(warmthOf(37.5)).toBe(0.5);
    expect(viewOfWaterHeater(heater('gas', { temperature_unit: '°F', current_temperature: 140 })).warmth).toBe(1);
  });
});
